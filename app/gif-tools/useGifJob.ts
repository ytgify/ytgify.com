'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GifJobResult, GifOperation, GifReply } from '@/lib/media/jobs/protocol';

export function useGifJob() {
  const worker = useRef<Worker | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ value: 0, stage: '' });
  const [error, setError] = useState('');
  const finish = useCallback(() => {
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const cancel = useCallback(() => {
    generation.current++;
    finish();
    setBusy(false);
    setProgress({ value: 0, stage: 'Cancelled. You can try again.' });
  }, [finish]);
  useEffect(
    () => () => {
      generation.current++;
      finish();
    },
    [finish],
  );

  const run = useCallback(
    async (file: File, operation: GifOperation, onResult: (result: GifJobResult) => void) => {
      const id = ++generation.current;
      finish();
      setError('');
      setBusy(true);
      setProgress({ value: 0, stage: 'Reading GIF' });
      try {
        if (file.size > 25_000_000) throw new Error('Choose a GIF smaller than 25 MB.');
        if (typeof Worker === 'undefined')
          throw new Error('This browser does not support background processing. Try a recent desktop browser.');
        const bytes = await file.arrayBuffer();
        if (id !== generation.current) return;
        const active = new Worker(new URL('../../lib/media/jobs/gif.worker.ts', import.meta.url), { type: 'module' });
        worker.current = active;
        const fail = (message: string) => {
          if (id !== generation.current) return;
          generation.current++;
          finish();
          setBusy(false);
          setError(message);
        };
        timer.current = setTimeout(
          () => fail('Processing took too long. Choose a smaller GIF or a higher target.'),
          60_000,
        );
        active.onmessage = (event: MessageEvent<GifReply>) => {
          if (id !== generation.current || event.data.id !== id) return;
          const message = event.data;
          if (message.kind === 'progress') setProgress({ value: message.value, stage: message.stage });
          else if (message.kind === 'error') fail(message.message);
          else {
            finish();
            setBusy(false);
            onResult(message.result);
          }
        };
        active.onerror = () => fail('Background processing failed. Choose another file or retry.');
        active.postMessage({ id, bytes, operation }, [bytes]);
      } catch (caught) {
        if (id !== generation.current) return;
        finish();
        setBusy(false);
        setError(caught instanceof Error ? caught.message : 'Unable to read that GIF.');
      }
    },
    [finish],
  );
  return { run, cancel, busy, progress, error };
}
