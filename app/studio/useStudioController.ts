'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  studioDurationBucket,
  studioFileSizeBucket,
  studioFileTypeBucket,
  studioSourceBucket,
  trackStudioEvent,
} from '@/lib/studio/analytics';
import { STUDIO_CAPTION_MAX_LENGTH } from '@/lib/studio/constants';
import { validateVideoDuration, validateVideoFile } from '@/lib/studio/file-validation';
import { calculateExportBudget } from '@/lib/studio/export-budget';
import { exportStudioGif } from '@/lib/studio/gif-exporter';
import { applyDurationPreset, makeTrimSelection } from '@/lib/studio/presets';
import type {
  StudioCaptionSettings,
  StudioError,
  StudioExportProgress,
  StudioExportResult,
  StudioOutputSettings,
  StudioStatus,
  StudioTrimSelection,
  StudioVideoMetadata,
} from '@/lib/studio/types';
import { defaultCaptions, defaultSettings, type StudioWizardStep } from './studio-config';
import {
  getEstimatedSize,
  getOutputSummary,
  isValidExport,
  trackExportFailed,
  trackExportStarted,
  trackExportSucceeded,
} from './studio-controller-helpers';
import { mapExportError } from './studio-errors';
import { useObjectUrls } from './useObjectUrls';

export function useStudioController() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const exportRunRef = useRef(0);
  const [status, setStatus] = useState<StudioStatus>('idle');
  const [step, setStep] = useState<StudioWizardStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<StudioVideoMetadata | null>(null);
  const [trim, setTrim] = useState<StudioTrimSelection | null>(null);
  const [settings, setSettings] = useState<StudioOutputSettings>(defaultSettings);
  const [captions, setCaptions] = useState<StudioCaptionSettings>(defaultCaptions);
  const [progress, setProgress] = useState<StudioExportProgress | null>(null);
  const [result, setResult] = useState<StudioExportResult | null>(null);
  const [error, setError] = useState<StudioError | null>(null);
  const [nextTool, setNextTool] = useState('');
  const abortOnUnmount = useCallback(() => abortRef.current?.abort(), []);
  const { createResultUrl, createVideoUrl, revokeResultUrl, revokeVideoUrl } = useObjectUrls(abortOnUnmount);

  useEffect(() => {
    trackStudioEvent('studio_page_view', {
      source_page:
        typeof document === 'undefined' ? 'unknown' : studioSourceBucket(document.referrer, window.location.hostname),
    });
  }, []);

  const setStudioError = useCallback((studioError: StudioError, nextStep: StudioWizardStep = 'upload') => {
    setError(studioError);
    setStatus('error');
    setStep(nextStep);
  }, []);

  useEffect(() => {
    if (status !== 'loading-video' || !videoUrl) return undefined;
    const timeoutId = window.setTimeout(() => {
      trackStudioEvent('studio_upload_failed', {
        error_code: 'decode_failed',
        file_type: studioFileTypeBucket(metadata?.type || ''),
      });
      setStudioError({
        code: 'decode_failed',
        message: 'The browser could not read that video.',
        action: 'Try another browser-decodable MP4, MOV, or WebM file.',
      });
    }, 8000);
    return () => window.clearTimeout(timeoutId);
  }, [metadata?.type, setStudioError, status, videoUrl]);

  const resetStudio = useCallback(() => {
    exportRunRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    revokeVideoUrl();
    revokeResultUrl();
    setStatus('idle');
    setStep('upload');
    setVideoUrl(null);
    setMetadata(null);
    setTrim(null);
    setSettings(defaultSettings);
    setCaptions(defaultCaptions);
    setProgress(null);
    setResult(null);
    setError(null);
    setNextTool('');
    if (inputRef.current) inputRef.current.value = '';
  }, [revokeResultUrl, revokeVideoUrl]);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateVideoFile(file);
      trackStudioEvent('studio_upload_started', {
        file_type: studioFileTypeBucket(file.type),
        file_size_bucket: studioFileSizeBucket(file.size),
      });
      if (validationError) {
        trackStudioEvent('studio_upload_failed', {
          error_code: validationError.code,
          file_type: studioFileTypeBucket(file.type),
        });
        setStudioError(validationError);
        return;
      }
      revokeResultUrl();
      setError(null);
      setResult(null);
      setProgress(null);
      setMetadata({ duration: 0, width: 0, height: 0, type: file.type || 'unknown', size: file.size });
      setTrim(null);
      setStep('upload');
      setStatus('loading-video');
      setVideoUrl(createVideoUrl(file));
    },
    [createVideoUrl, revokeResultUrl, setStudioError],
  );

  const handleMetadataLoaded = useCallback(() => {
    const video = videoRef.current;
    if (!video || !metadata || status !== 'loading-video' || metadata.duration > 0) return;
    const durationError = validateVideoDuration(video.duration);
    if (durationError) {
      trackStudioEvent('studio_upload_failed', {
        error_code: durationError.code,
        file_type: studioFileTypeBucket(metadata.type),
      });
      setStudioError(durationError);
      return;
    }
    setMetadata({ ...metadata, duration: video.duration, width: video.videoWidth, height: video.videoHeight });
    setTrim(makeTrimSelection(0, Math.min(5, video.duration), video.duration));
    setStep('capture');
    setStatus('editing');
    trackStudioEvent('studio_upload_loaded', {
      file_type: studioFileTypeBucket(metadata.type),
      source_duration_bucket: studioDurationBucket(video.duration),
    });
  }, [metadata, setStudioError, status]);

  const handleDecodeError = useCallback(() => {
    const decodeError: StudioError = {
      code: 'decode_failed',
      message: 'The browser could not decode that video.',
      action: 'Try a different MP4, MOV, or WebM file.',
    };
    trackStudioEvent('studio_upload_failed', {
      error_code: decodeError.code,
      file_type: studioFileTypeBucket(metadata?.type || ''),
    });
    setStudioError(decodeError);
  }, [metadata?.type, setStudioError]);

  const updateTrim = useCallback(
    (startTime: number, endTime: number) => {
      if (!metadata) return;
      const nextTrim = makeTrimSelection(startTime, endTime, metadata.duration);
      setTrim(nextTrim);
      trackStudioEvent('studio_trim_changed', { output_duration: nextTrim.duration });
    },
    [metadata],
  );

  const applyPreset = useCallback(
    (duration: number) => {
      if (!metadata || !trim) return;
      const nextTrim = applyDurationPreset(duration, trim, metadata.duration);
      updateTrim(nextTrim.startTime, nextTrim.endTime);
    },
    [metadata, trim, updateTrim],
  );

  const updateCaption = useCallback((placement: keyof StudioCaptionSettings, value: string) => {
    const nextValue = value.slice(0, STUDIO_CAPTION_MAX_LENGTH);
    setCaptions((current) => {
      if (nextValue.trim()) trackStudioEvent('studio_caption_added', { captions_enabled: true });
      return { ...current, [placement]: nextValue };
    });
  }, []);

  const updateCaptionSetting = useCallback(
    <Key extends keyof StudioCaptionSettings>(key: Key, value: StudioCaptionSettings[Key]) => {
      setCaptions((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const exportBudget = metadata && trim ? calculateExportBudget(metadata, trim, settings) : null;
  const canExport = isValidExport(status, metadata, trim) && Boolean(exportBudget?.allowed);
  const exportGif = useCallback(
    async (captionOverride?: StudioCaptionSettings) => {
      if (!videoRef.current || !metadata || !trim || !canExport || abortRef.current) return;
      const exportCaptions = captionOverride || captions;
      const hasCaptionText = Boolean(exportCaptions.topText.trim() || exportCaptions.bottomText.trim());
      const controller = new AbortController();
      const runId = exportRunRef.current + 1;
      exportRunRef.current = runId;
      abortRef.current = controller;
      setStep('processing');
      setStatus('exporting');
      setProgress({ stage: 'preparing', percentage: 0, message: 'Preparing export' });
      setError(null);
      trackExportStarted(metadata, trim, settings, hasCaptionText);
      try {
        const exported = await exportStudioGif({
          video: videoRef.current,
          metadata,
          trim,
          settings,
          captions: exportCaptions,
          signal: controller.signal,
          onProgress: setProgress,
        });
        if (runId !== exportRunRef.current) return;
        const nextResult = { ...exported, url: createResultUrl(exported.blob) };
        setResult(nextResult);
        setStep('success');
        setStatus('complete');
        trackExportSucceeded(exported, settings, hasCaptionText);
      } catch (exportError) {
        if (runId !== exportRunRef.current) return;
        const code = exportError instanceof Error ? exportError.message : 'encoding_failed';
        if (code === 'cancelled') {
          setProgress(null);
          setError(null);
          setStep('text');
          setStatus('editing');
          return;
        }
        const studioError = mapExportError(code);
        trackExportFailed(studioError, trim, settings, hasCaptionText);
        setStudioError(studioError, 'processing');
      } finally {
        if (runId === exportRunRef.current) abortRef.current = null;
      }
    },
    [canExport, captions, createResultUrl, metadata, setStudioError, settings, trim],
  );

  const outputSummary = getOutputSummary(metadata, trim, settings);
  const estimatedSize = getEstimatedSize(trim, settings);
  const displayStep = status === 'complete' ? 'success' : step;

  return {
    inputRef,
    videoRef,
    status,
    displayStep,
    isDragging,
    videoUrl,
    metadata,
    trim,
    settings,
    captions,
    progress,
    result,
    error,
    nextTool,
    canExport,
    exportBudget,
    outputSummary,
    estimatedSize,
    setIsDragging,
    setSettings,
    setNextTool,
    resetStudio,
    handleFile,
    handleMetadataLoaded,
    handleDecodeError,
    updateTrim,
    applyPreset,
    updateCaption,
    updateCaptionSetting,
    goToText: () => setStep('text'),
    goToCapture: () => setStep('capture'),
    exportGif,
    exportWithoutText: () => void exportGif(defaultCaptions),
    exportWithText: () => void exportGif(),
    processingBack: () => {
      abortRef.current?.abort();
      if (status !== 'exporting') {
        setError(null);
        setStatus('editing');
        setStep('text');
      }
    },
    successBack: () => {
      setStatus('editing');
      setStep('capture');
    },
  };
}

export type StudioController = ReturnType<typeof useStudioController>;
