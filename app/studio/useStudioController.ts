'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  studioDurationBucket,
  studioEntryPoint,
  studioFileSizeBucket,
  studioFileTypeBucket,
  studioSourceBucket,
  trackStudioEvent,
} from '@/lib/studio/analytics';
import { chooseSettingsForTarget, estimateGifSize } from '@/lib/studio/size-target';
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
  getOutputSummary,
  isValidExport,
  trackExportFailed,
  trackExportStarted,
  trackExportSucceeded,
} from './studio-controller-helpers';
import { mapExportError } from './studio-errors';
import { useObjectUrls } from './useObjectUrls';
import { useStudioCaptions } from './useStudioCaptions';

export function useStudioController() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const exportRunRef = useRef(0);
  const pageViewReported = useRef(false);
  const [status, setStatus] = useState<StudioStatus>('idle');
  const [step, setStep] = useState<StudioWizardStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<StudioVideoMetadata | null>(null);
  const [trim, setTrim] = useState<StudioTrimSelection | null>(null);
  const [requestedSettings, setSettings] = useState<StudioOutputSettings>(defaultSettings);
  const { captions, resetCaptions, updateCaption, updateCaptionSetting } = useStudioCaptions();
  const [progress, setProgress] = useState<StudioExportProgress | null>(null);
  const [result, setResult] = useState<StudioExportResult | null>(null);
  const [error, setError] = useState<StudioError | null>(null);
  const [nextTool, setNextTool] = useState('');
  const abortOnUnmount = useCallback(() => abortRef.current?.abort(), []);
  const { createResultUrl, createVideoUrl, revokeResultUrl, revokeVideoUrl } = useObjectUrls(abortOnUnmount);
  const settings = chooseSettingsForTarget(metadata, trim, requestedSettings);

  useEffect(() => {
    if (pageViewReported.current) return;
    pageViewReported.current = true;
    trackStudioEvent('studio_page_view', {
      source_page:
        studioEntryPoint(window.location.search) !== 'unknown'
          ? 'internal'
          : studioSourceBucket(document.referrer, window.location.hostname),
      entry_point: typeof window === 'undefined' ? 'direct' : studioEntryPoint(window.location.search),
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
    resetCaptions();
    setProgress(null);
    setResult(null);
    setError(null);
    setNextTool('');
    if (inputRef.current) inputRef.current.value = '';
  }, [resetCaptions, revokeResultUrl, revokeVideoUrl]);

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
      resetCaptions();
      setError(null);
      setResult(null);
      setProgress(null);
      setMetadata({ duration: 0, width: 0, height: 0, type: file.type || 'unknown', size: file.size });
      setTrim(null);
      setStep('upload');
      setStatus('loading-video');
      setVideoUrl(createVideoUrl(file));
    },
    [createVideoUrl, resetCaptions, revokeResultUrl, setStudioError],
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
  const sizeEstimate = metadata?.duration && trim ? estimateGifSize(metadata, trim, settings) : null;
  const estimatedSize = sizeEstimate
    ? `${(sizeEstimate.low / 1048576).toFixed(1)}–${(sizeEstimate.high / 1048576).toFixed(1)}`
    : '0';
  const displayStep = status === 'complete' ? 'success' : step;
  const updateSettings = useCallback(
    (nextSettings: StudioOutputSettings) => {
      if (nextSettings.sizeTarget !== requestedSettings.sizeTarget) {
        trackStudioEvent('studio_size_target_selected', { size_target: nextSettings.sizeTarget });
      }
      setSettings(nextSettings);
    },
    [requestedSettings.sizeTarget],
  );

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
    setSettings: updateSettings,
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
