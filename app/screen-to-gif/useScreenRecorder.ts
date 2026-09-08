'use client';
import { finalizeRecording } from '@/lib/media/finalize-recording';
import { waitForCaptureFrame } from '@/lib/media/capture-ready';
import { trackToolEvent } from '@/lib/media/analytics';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useScreenRecorder() {
  const [status, setStatus] = useState<'idle' | 'choosing' | 'recording' | 'finalizing' | 'ready'>('idle');
  useEffect(() => {
    trackToolEvent('screen-to-gif', 'view');
  }, []);
  const [elapsed, setElapsed] = useState(0);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const preparation = useRef<AbortController | null>(null);
  const release = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  }, []);
  const stop = useCallback(() => {
    if (recorder.current?.state === 'recording') recorder.current.stop();
    release();
  }, [release]);
  useEffect(
    () => () => {
      generation.current++;
      preparation.current?.abort();
      stop();
    },
    [stop],
  );
  const start = async () => {
    const id = ++generation.current;
    preparation.current?.abort();
    trackToolEvent('screen-to-gif', 'start');
    setError('');
    setFile(null);
    setStatus('choosing');
    try {
      if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === 'undefined')
        throw new Error(
          'Screen recording is unavailable in this browser. Use a recent desktop browser, or upload a recording to Video to GIF.',
        );
      const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      if (!mimeType) throw new Error('This browser cannot record a supported video format.');
      const captured = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 15, max: 30 } },
        audio: false,
      });
      if (id !== generation.current) {
        captured.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = captured;
      await waitForCaptureFrame(captured);
      if (id !== generation.current) return;
      const active = new MediaRecorder(captured, { mimeType, videoBitsPerSecond: 2_000_000 });
      recorder.current = active;
      const chunks: Blob[] = [];
      let size = 0;
      active.ondataavailable = (event) => {
        if (event.data.size) {
          chunks.push(event.data);
          size += event.data.size;
          if (size >= 25_000_000) stop();
        }
      };
      active.onerror = () => {
        generation.current++;
        stop();
        setStatus('idle');
        setError('Recording failed. Choose a different source and retry.');
      };
      active.onstop = async () => {
        release();
        if (id !== generation.current) return;
        const blob = new Blob(chunks, { type: active.mimeType });
        if (!blob.size || blob.size > 25_000_000) {
          setStatus('idle');
          setError('The recording was empty or too large. Try a shorter capture.');
          return;
        }
        setStatus('finalizing');
        const controller = new AbortController();
        preparation.current = controller;
        try {
          const prepared = await finalizeRecording(blob, controller.signal);
          if (id !== generation.current) return;
          setFile(prepared);
          setStatus('ready');
          trackToolEvent('screen-to-gif', 'success');
        } catch {
          if (id !== generation.current) return;
          setStatus('idle');
          setError('The recording could not be prepared for editing. Try another short capture.');
          trackToolEvent('screen-to-gif', 'error');
        }
      };
      captured.getVideoTracks().forEach((track) => track.addEventListener('ended', stop, { once: true }));
      active.start(250);
      setElapsed(0);
      const began = performance.now();
      ticker.current = setInterval(() => setElapsed(Math.min(30, Math.floor((performance.now() - began) / 1000))), 250);
      setStatus('recording');
      timer.current = setTimeout(stop, 30_000);
    } catch (caught) {
      if (id !== generation.current) return;
      trackToolEvent('screen-to-gif', 'error');
      release();
      setStatus('idle');
      setError(
        caught instanceof DOMException && caught.name === 'InvalidStateError'
          ? 'Bring this tab to the front, then start screen recording again.'
          : caught instanceof DOMException && caught.name === 'NotAllowedError'
            ? 'Screen sharing was cancelled or denied. You can try again.'
            : caught instanceof Error
              ? caught.message
              : 'Unable to start recording.',
      );
    }
  };
  return { start, stop, status, error, file, elapsed };
}
