'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  AlertCircle,
  Captions,
  CheckCircle2,
  ChevronLeft,
  Download,
  Gauge,
  ImageIcon,
  Loader2,
  RotateCcw,
  Scissors,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  STUDIO_CAPTION_MAX_LENGTH,
  STUDIO_DEFAULT_FPS,
  STUDIO_DEFAULT_RESOLUTION,
  STUDIO_FPS_OPTIONS,
  STUDIO_MAX_FILE_SIZE_BYTES,
  STUDIO_MAX_EXPORT_DURATION_SECONDS,
  STUDIO_MAX_SOURCE_DURATION_SECONDS,
  STUDIO_PRESET_DURATIONS,
  STUDIO_RESOLUTION_OPTIONS,
} from '@/lib/studio/constants';
import { trackStudioEvent, studioDurationBucket, studioFileSizeBucket } from '@/lib/studio/analytics';
import { getCaptionLayout } from '@/lib/studio/captions';
import { formatFileSize, validateVideoDuration, validateVideoFile } from '@/lib/studio/file-validation';
import { exportStudioGif } from '@/lib/studio/gif-exporter';
import { applyDurationPreset, formatTime, makeTrimSelection } from '@/lib/studio/presets';
import type {
  StudioCaptionSettings,
  StudioCaptionColor,
  StudioCaptionSize,
  StudioEncoderMode,
  StudioError,
  StudioExportProgress,
  StudioExportResult,
  StudioFps,
  StudioOutputSettings,
  StudioResolution,
  StudioStatus,
  StudioTrimSelection,
  StudioVideoMetadata,
} from '@/lib/studio/types';

type StudioWizardStep = 'upload' | 'capture' | 'text' | 'processing' | 'success';

const defaultCaptions: StudioCaptionSettings = {
  topText: '',
  bottomText: '',
  size: 'standard',
  color: 'white',
};

const defaultSettings: StudioOutputSettings = {
  fps: STUDIO_DEFAULT_FPS,
  resolution: STUDIO_DEFAULT_RESOLUTION,
  encoder: 'fast',
};

const resolutionDetails: Record<StudioResolution, { name: string; description: string; multiplier: number }> = {
  240: { name: '240p Mini', description: 'Quick to share', multiplier: 0.5 },
  360: { name: '360p Compact', description: 'Ideal for email', multiplier: 0.7 },
  480: { name: '480p HD', description: 'Best quality', multiplier: 1 },
};

const fpsDetails: Record<StudioFps, { label: string; description: string }> = {
  5: { label: '5 fps', description: 'Smaller file - Classic GIF feel' },
  10: { label: '10 fps', description: 'Balanced - Recommended' },
  15: { label: '15 fps', description: 'Smoother - Larger file' },
};

const encoderDetails: Record<StudioEncoderMode, { label: string; description: string; summary: string }> = {
  fast: {
    label: 'Fast',
    description: 'Reliable gifenc export',
    summary: 'fast encoder',
  },
  quality: {
    label: 'Best quality',
    description: 'gifski with fast fallback',
    summary: 'best-quality encoder',
  },
};

const captionSizeDetails: Record<StudioCaptionSize, { label: string; description: string }> = {
  standard: { label: 'Standard', description: 'Classic caption scale' },
  large: { label: 'Large', description: 'More emphasis' },
};

const captionColorDetails: Record<StudioCaptionColor, { label: string; description: string }> = {
  white: { label: 'White', description: 'High contrast' },
  yellow: { label: 'Yellow', description: 'Warm highlight' },
};

const highCostFrameThreshold = 75;

const wizardSteps: Array<{ id: StudioWizardStep; label: string }> = [
  { id: 'upload', label: 'Upload' },
  { id: 'capture', label: 'Capture' },
  { id: 'text', label: 'Text' },
  { id: 'processing', label: 'Processing' },
  { id: 'success', label: 'Success' },
];

export default function StudioApp() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const exportRunRef = useRef(0);
  const videoUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
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
  const [nextTool, setNextTool] = useState<string>('');

  useEffect(() => {
    trackStudioEvent('studio_page_view', {
      source_page: typeof document === 'undefined' ? 'unknown' : document.referrer || 'direct',
    });
  }, []);

  const revokeVideoUrl = useCallback(() => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }
  }, []);

  const revokeResultUrl = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeVideoUrl();
      revokeResultUrl();
    };
  }, [revokeResultUrl, revokeVideoUrl]);

  const hasValidTrim =
    Boolean(trim) &&
    Number.isFinite(trim?.startTime) &&
    Number.isFinite(trim?.endTime) &&
    Number.isFinite(trim?.duration) &&
    (trim?.duration || 0) > 0 &&
    (trim?.duration || 0) <= STUDIO_MAX_EXPORT_DURATION_SECONDS;
  const canExport = status === 'editing' && Boolean(metadata) && hasValidTrim;

  const outputSummary = useMemo(() => {
    if (!metadata || !trim) return null;
    return `${formatTime(trim.duration)} at ${settings.fps} FPS, max ${settings.resolution}p, ${encoderDetails[settings.encoder].summary}`;
  }, [metadata, settings.encoder, settings.fps, settings.resolution, trim]);

  const estimatedSize = useMemo(() => {
    if (!trim) return '0.0';
    return (trim.duration * settings.fps * 0.05 * resolutionDetails[settings.resolution].multiplier).toFixed(1);
  }, [settings.fps, settings.resolution, trim]);

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
        file_type: metadata?.type || 'unknown',
      });
      setStudioError({
        code: 'decode_failed',
        message: 'The browser could not read that video.',
        action: 'Try another browser-decodable MP4, MOV, or WebM file.',
      });
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [metadata?.type, setStudioError, status, videoUrl]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateVideoFile(file);
    trackStudioEvent('studio_upload_started', {
      file_type: file.type || 'unknown',
      file_size_bucket: studioFileSizeBucket(file.size),
    });

    if (validationError) {
      trackStudioEvent('studio_upload_failed', {
        error_code: validationError.code,
        file_type: file.type || 'unknown',
      });
      setStudioError(validationError);
      return;
    }

    revokeVideoUrl();
    revokeResultUrl();

    setError(null);
    setResult(null);
    setProgress(null);
    setMetadata({
      duration: 0,
      width: 0,
      height: 0,
      type: file.type || 'unknown',
      size: file.size,
    });
    setTrim(null);
    setStep('upload');
    setStatus('loading-video');
    const nextVideoUrl = URL.createObjectURL(file);
    videoUrlRef.current = nextVideoUrl;
    setVideoUrl(nextVideoUrl);
  }, [revokeResultUrl, revokeVideoUrl, setStudioError]);

  const handleMetadataLoaded = useCallback(() => {
    const video = videoRef.current;
    if (!video || !metadata) return;
    if (status !== 'loading-video' || metadata.duration > 0) return;

    const durationError = validateVideoDuration(video.duration);
    if (durationError) {
      trackStudioEvent('studio_upload_failed', {
        error_code: durationError.code,
        file_type: metadata.type,
      });
      setStudioError(durationError);
      return;
    }

    const loadedMetadata: StudioVideoMetadata = {
      ...metadata,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    };
    const initialTrim = makeTrimSelection(0, Math.min(5, video.duration), video.duration);

    setMetadata(loadedMetadata);
    setTrim(initialTrim);
    setStep('capture');
    setStatus('editing');
    trackStudioEvent('studio_upload_loaded', {
      file_type: metadata.type,
      source_duration_bucket: studioDurationBucket(video.duration),
    });
  }, [metadata, setStudioError, status]);

  const updateTrim = useCallback((startTime: number, endTime: number) => {
    if (!metadata) return;
    const nextTrim = makeTrimSelection(startTime, endTime, metadata.duration);
    setTrim(nextTrim);
    trackStudioEvent('studio_trim_changed', {
      output_duration: nextTrim.duration,
    });
  }, [metadata]);

  const updateCaption = useCallback((placement: keyof StudioCaptionSettings, value: string) => {
    const nextValue = value.slice(0, STUDIO_CAPTION_MAX_LENGTH);
    setCaptions((current) => {
      const next = { ...current, [placement]: nextValue };
      if (nextValue.trim()) {
        trackStudioEvent('studio_caption_added', {
          captions_enabled: true,
        });
      }
      return next;
    });
  }, []);

  const updateCaptionSetting = useCallback(<Key extends keyof StudioCaptionSettings>(key: Key, value: StudioCaptionSettings[Key]) => {
    setCaptions((current) => ({ ...current, [key]: value }));
  }, []);

  const exportGif = useCallback(async (captionOverride?: StudioCaptionSettings) => {
    if (!videoRef.current || !metadata || !trim || !canExport || abortRef.current) return;
    const exportCaptions = captionOverride || captions;
    const exportHasCaptionText = exportCaptions.topText.trim() || exportCaptions.bottomText.trim();

    const controller = new AbortController();
    const runId = exportRunRef.current + 1;
    exportRunRef.current = runId;
    abortRef.current = controller;
    setStep('processing');
    setStatus('exporting');
    setProgress({ stage: 'preparing', percentage: 0, message: 'Preparing export' });
    setError(null);
    trackStudioEvent('studio_export_started', {
      source_duration_bucket: studioDurationBucket(metadata.duration),
      output_duration: trim.duration,
      output_fps: settings.fps,
      output_resolution: settings.resolution,
      output_encoder: settings.encoder,
      captions_enabled: Boolean(exportHasCaptionText),
    });

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
      revokeResultUrl();
      const url = URL.createObjectURL(exported.blob);
      resultUrlRef.current = url;
      const nextResult = { ...exported, url };
      setResult(nextResult);
      setStep('success');
      setStatus('complete');
      trackStudioEvent('studio_export_succeeded', {
        output_duration: exported.duration,
        output_fps: settings.fps,
        output_resolution: settings.resolution,
        output_encoder: exported.encoder,
        output_encoder_fallback: Boolean(exported.encoderFallback),
        captions_enabled: Boolean(exportHasCaptionText),
        output_file_size_bucket: studioFileSizeBucket(exported.fileSize),
      });
    } catch (exportError) {
      const code = exportError instanceof Error ? exportError.message : 'encoding_failed';
      if (runId !== exportRunRef.current) return;
      if (code === 'cancelled') {
        setProgress(null);
        setError(null);
        setStep('text');
        setStatus('editing');
        return;
      }

      const studioError = mapExportError(code);
      trackStudioEvent('studio_export_failed', {
        error_code: studioError.code,
        output_duration: trim.duration,
        output_fps: settings.fps,
        output_resolution: settings.resolution,
        output_encoder: settings.encoder,
        captions_enabled: Boolean(exportHasCaptionText),
      });
      setStudioError(studioError, 'processing');
    } finally {
      if (runId === exportRunRef.current) {
        abortRef.current = null;
      }
    }
  }, [canExport, captions, metadata, revokeResultUrl, setStudioError, settings, trim]);

  const applyPreset = useCallback((duration: number) => {
    if (!metadata || !trim) return;
    const nextTrim = applyDurationPreset(duration, trim, metadata.duration);
    updateTrim(nextTrim.startTime, nextTrim.endTime);
  }, [metadata, trim, updateTrim]);

  const displayStep = status === 'complete' ? 'success' : step;

  return (
    <main className="min-h-screen bg-[#0a0a0a] grid-pattern text-white">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 py-6 sm:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-gray-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-sm font-semibold text-gray-400 transition-colors hover:text-white">
            YTgify
          </Link>
          <nav aria-label="Studio navigation" className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-400">
            <a href="#wizard" className="transition-colors hover:text-white">Studio</a>
            <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
          </nav>
        </header>

        <section id="wizard" className="mx-auto w-full max-w-[920px]">
          {displayStep === 'upload' ? (
            <UploadScreen
              status={status}
              error={error}
              isDragging={isDragging}
              inputRef={inputRef}
              videoUrl={videoUrl}
              videoRef={videoRef}
              metadata={metadata}
              onFile={handleFile}
              onMetadataLoaded={handleMetadataLoaded}
              onDecodeError={() => {
                const decodeError: StudioError = {
                  code: 'decode_failed',
                  message: 'The browser could not decode that video.',
                  action: 'Try a different MP4, MOV, or WebM file.',
                };
                trackStudioEvent('studio_upload_failed', {
                  error_code: decodeError.code,
                  file_type: metadata?.type || 'unknown',
                });
                setStudioError(decodeError);
              }}
              onReset={resetStudio}
              setIsDragging={setIsDragging}
            />
          ) : null}

          {displayStep !== 'upload' && metadata && trim && videoUrl ? (
            <WizardFrame currentStep={displayStep} onReset={resetStudio}>
              {displayStep === 'capture' ? (
                <CaptureScreen
                  videoUrl={videoUrl}
                  videoRef={videoRef}
                  metadata={metadata}
                  trim={trim}
                  settings={settings}
                  outputSummary={outputSummary}
                  estimatedSize={estimatedSize}
                  onTrimChange={updateTrim}
                  onPreset={applyPreset}
                  onSettingsChange={setSettings}
                  onBack={resetStudio}
                  onContinue={() => setStep('text')}
                />
              ) : null}

              {displayStep === 'text' ? (
                <TextScreen
                  videoUrl={videoUrl}
                  videoRef={videoRef}
                  metadata={metadata}
                  trim={trim}
                  captions={captions}
                  onCaptionChange={updateCaption}
                  onCaptionSettingChange={updateCaptionSetting}
                  onBack={() => setStep('capture')}
                  onSkip={() => {
                    void exportGif(defaultCaptions);
                  }}
                  onCreate={() => void exportGif()}
                  disabled={!canExport}
                />
              ) : null}

              {displayStep === 'processing' ? (
                <ProcessingScreen
                  progress={progress}
                  error={status === 'error' ? error : null}
                  onBack={() => {
                    abortRef.current?.abort();
                    if (status !== 'exporting') {
                      setError(null);
                      setStatus('editing');
                      setStep('text');
                    }
                  }}
                />
              ) : null}

              {displayStep === 'success' && result ? (
                <SuccessScreen
                  result={result}
                  nextTool={nextTool}
                  setNextTool={setNextTool}
                  onBack={() => {
                    setStatus('editing');
                    setStep('capture');
                  }}
                  onReset={resetStudio}
                />
              ) : null}
            </WizardFrame>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function UploadScreen({
  status,
  error,
  isDragging,
  inputRef,
  videoUrl,
  videoRef,
  metadata,
  onFile,
  onMetadataLoaded,
  onDecodeError,
  onReset,
  setIsDragging,
}: {
  status: StudioStatus;
  error: StudioError | null;
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  videoUrl: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  metadata: StudioVideoMetadata | null;
  onFile: (file: File) => void;
  onMetadataLoaded: () => void;
  onDecodeError: () => void;
  onReset: () => void;
  setIsDragging: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase text-[#4fd1c5]">Private local tool</p>
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Video to GIF Studio</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300">
          Upload a local clip and walk through the same guided GIF flow as the extension: choose the moment, customize text, export, and download.
        </p>
      </div>

      <div className="border border-gray-800 bg-gray-950/80 p-4">
        <WizardProgress currentStep="upload" />
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) onFile(file);
        }}
        className={`border p-5 transition-colors sm:p-6 ${
          isDragging ? 'border-[#4fd1c5] bg-[#4fd1c5]/10' : 'border-gray-800 bg-gray-950/80'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
          className="sr-only"
          aria-label="Upload video"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
          }}
        />

        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center bg-[#E91E8C]/15 text-[#ff5fb2]">
              {status === 'loading-video' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upload video</h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                MP4, MOV, or WebM up to {formatFileSize(STUDIO_MAX_FILE_SIZE_BYTES)} and {Math.round(STUDIO_MAX_SOURCE_DURATION_SECONDS / 60)} minutes.
                Runs in your browser.
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-500">Use videos you own or have permission to edit.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80]"
          >
            <Upload className="h-4 w-4" />
            Upload video
          </button>
        </div>

        {error ? <ErrorNotice error={error} onReset={onReset} /> : null}
      </div>

      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          preload="metadata"
          className="sr-only"
          onLoadedMetadata={onMetadataLoaded}
          onError={onDecodeError}
          data-source-type={metadata?.type || 'unknown'}
        />
      ) : null}
    </div>
  );
}

function WizardFrame({
  currentStep,
  onReset,
  children,
}: {
  currentStep: StudioWizardStep;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border border-gray-800 bg-gray-950/80">
      <div className="flex flex-col gap-4 border-b border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <WizardProgress currentStep={currentStep} />
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 border border-gray-700 px-3 py-2 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Start over
        </button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function WizardProgress({ currentStep }: { currentStep: StudioWizardStep }) {
  const currentIndex = wizardSteps.findIndex((item) => item.id === currentStep);

  return (
    <ol aria-label="Studio wizard progress" className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-400 sm:grid-cols-5 sm:min-w-[520px]">
      {wizardSteps.map((item, index) => {
        const isComplete = currentIndex > index;
        const isCurrent = currentIndex === index;
        return (
          <li
            key={item.id}
            aria-current={isCurrent ? 'step' : undefined}
            className={`flex items-center gap-2 border px-3 py-2 ${
              isCurrent
                ? 'border-[#E91E8C] bg-[#E91E8C]/15 text-white'
                : isComplete
                  ? 'border-[#4fd1c5]/60 bg-[#4fd1c5]/10 text-[#9ff3ea]'
                  : 'border-gray-800 text-gray-500'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center border border-current text-[11px]">{isComplete ? '✓' : index + 1}</span>
            <span>{item.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function CaptureScreen({
  videoUrl,
  videoRef,
  metadata,
  trim,
  settings,
  outputSummary,
  estimatedSize,
  onTrimChange,
  onPreset,
  onSettingsChange,
  onBack,
  onContinue,
}: {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  metadata: StudioVideoMetadata;
  trim: StudioTrimSelection;
  settings: StudioOutputSettings;
  outputSummary: string | null;
  estimatedSize: string;
  onTrimChange: (startTime: number, endTime: number) => void;
  onPreset: (duration: number) => void;
  onSettingsChange: (settings: StudioOutputSettings) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  type TimelineDragMode = 'start' | 'end' | 'range';
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const timelineDragRef = useRef<{ mode: TimelineDragMode; offset: number } | null>(null);
  const maxDuration = Math.min(STUDIO_MAX_EXPORT_DURATION_SECONDS, metadata.duration - trim.startTime);
  const timelineStartPercent = metadata.duration > 0 ? (trim.startTime / metadata.duration) * 100 : 0;
  const timelineWidthPercent = metadata.duration > 0 ? (trim.duration / metadata.duration) * 100 : 0;
  const frameCount = Math.round(trim.duration * settings.fps);
  const isHighCostExport = frameCount >= highCostFrameThreshold;
  const previewStart = Number.isFinite(trim.startTime) ? trim.startTime : 0;
  const previewEnd = Number.isFinite(trim.endTime) ? trim.endTime : previewStart;

  const seekPreviewToSelection = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = previewStart;
    } catch {
      // Browser metadata can lag behind React state during source changes.
    }
  }, [previewStart, videoRef]);

  useEffect(() => {
    seekPreviewToSelection();
  }, [seekPreviewToSelection]);

  const clampTimelineTime = useCallback((value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(value, metadata.duration));
  }, [metadata.duration]);

  const timeFromClientX = useCallback((clientX: number) => {
    const bounds = timelineRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width <= 0 || metadata.duration <= 0) return trim.startTime;
    const ratio = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    return clampTimelineTime(ratio * metadata.duration);
  }, [clampTimelineTime, metadata.duration, trim.startTime]);

  const applyTimelineDrag = useCallback((clientX: number, mode: TimelineDragMode, offset: number) => {
    const pointerTime = timeFromClientX(clientX);
    const minDuration = 0.5;

    if (mode === 'start') {
      const nextStart = Math.min(pointerTime, trim.endTime - minDuration);
      onTrimChange(clampTimelineTime(nextStart), trim.endTime);
      return;
    }

    if (mode === 'end') {
      const maxEnd = Math.min(metadata.duration, trim.startTime + STUDIO_MAX_EXPORT_DURATION_SECONDS);
      const nextEnd = Math.max(trim.startTime + minDuration, Math.min(pointerTime, maxEnd));
      onTrimChange(trim.startTime, nextEnd);
      return;
    }

    const nextStart = Math.max(0, Math.min(pointerTime - offset, Math.max(0, metadata.duration - trim.duration)));
    onTrimChange(nextStart, nextStart + trim.duration);
  }, [clampTimelineTime, metadata.duration, onTrimChange, timeFromClientX, trim.duration, trim.endTime, trim.startTime]);

  const beginTimelineDrag = useCallback((event: ReactPointerEvent, mode: TimelineDragMode) => {
    event.preventDefault();
    event.stopPropagation();
    const pointerTime = timeFromClientX(event.clientX);
    const isRailClick = event.currentTarget === timelineRef.current;
    const offset = mode === 'range'
      ? isRailClick
        ? trim.duration / 2
        : Math.max(0, Math.min(trim.duration, pointerTime - trim.startTime))
      : 0;
    timelineDragRef.current = { mode, offset };
    applyTimelineDrag(event.clientX, mode, offset);
  }, [applyTimelineDrag, timeFromClientX, trim.duration, trim.startTime]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = timelineDragRef.current;
      if (!drag) return;
      event.preventDefault();
      applyTimelineDrag(event.clientX, drag.mode, drag.offset);
    };

    const handlePointerUp = () => {
      timelineDragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [applyTimelineDrag]);

  return (
    <div className="space-y-6">
      <WizardHeader
        eyebrow="Capture"
        title="Select Your Perfect Moment"
        helper="Choose the start time and duration for your clip"
        onBack={onBack}
      />

      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        className="aspect-video w-full bg-black object-contain"
        onPlay={() => {
          const video = videoRef.current;
          if (!video) return;
          if (video.currentTime < previewStart || video.currentTime >= previewEnd) {
            seekPreviewToSelection();
          }
        }}
        onTimeUpdate={() => {
          const video = videoRef.current;
          if (!video || video.currentTime < previewEnd) return;
          video.pause();
          seekPreviewToSelection();
        }}
      />
      <p className="text-sm leading-6 text-gray-400">
        Preview cued to {formatTime(trim.startTime)} - {formatTime(trim.endTime)}.
      </p>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <MetadataItem label="Duration" value={formatTime(metadata.duration)} />
        <MetadataItem label="Source" value={`${metadata.width}x${metadata.height}`} />
        <MetadataItem label="Type" value={metadata.type || 'unknown'} />
        <MetadataItem label="Selected" value={outputSummary || 'Ready'} />
      </dl>

      <section className="space-y-4 border border-gray-800 p-4" aria-label="Timeline">
        <div
          ref={timelineRef}
          className="relative h-12 touch-none bg-gray-900"
          data-testid="studio-timeline"
          onPointerDown={(event) => beginTimelineDrag(event, 'range')}
        >
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-gray-800" />
          <button
            type="button"
            aria-label="Selected clip range"
            data-testid="timeline-selection"
            className="absolute top-1/2 h-6 -translate-y-1/2 cursor-grab border border-[#4fd1c5] bg-[#4fd1c5]/30 active:cursor-grabbing"
            style={{ left: `${timelineStartPercent}%`, width: `${Math.min(100 - timelineStartPercent, timelineWidthPercent)}%` }}
            onPointerDown={(event) => beginTimelineDrag(event, 'range')}
          />
          <button
            type="button"
            aria-label="Drag clip start"
            data-testid="timeline-start-handle"
            className="absolute top-1/2 h-9 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize border border-[#4fd1c5] bg-[#0a0a0a]"
            style={{ left: `${timelineStartPercent}%` }}
            onPointerDown={(event) => beginTimelineDrag(event, 'start')}
          />
          <button
            type="button"
            aria-label="Drag clip end"
            data-testid="timeline-end-handle"
            className="absolute top-1/2 h-9 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize border border-[#4fd1c5] bg-[#0a0a0a]"
            style={{ left: `${Math.min(100, timelineStartPercent + timelineWidthPercent)}%` }}
            onPointerDown={(event) => beginTimelineDrag(event, 'end')}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TimeInput
            label="Start time"
            value={trim.startTime}
            max={Math.max(0, metadata.duration - 0.1)}
            onChange={(value) => onTrimChange(value, value + trim.duration)}
          />
          <TimeInput
            label="Duration"
            value={trim.duration}
            max={maxDuration}
            onChange={(value) => onTrimChange(trim.startTime, trim.startTime + value)}
          />
        </div>
        <div className="space-y-3">
          <RangeInput
            label="Clip start time"
            min={0}
            max={Math.max(0, metadata.duration - trim.duration)}
            value={trim.startTime}
            onChange={(value) => onTrimChange(value, value + trim.duration)}
          />
          <RangeInput
            label="Clip duration"
            min={0.5}
            max={maxDuration}
            value={trim.duration}
            onChange={(value) => onTrimChange(trim.startTime, trim.startTime + value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STUDIO_PRESET_DURATIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => onPreset(duration)}
              className="border border-gray-700 px-3 py-2 text-sm font-semibold text-gray-200 transition-colors hover:border-[#4fd1c5] hover:text-white"
            >
              {duration}s
            </button>
          ))}
        </div>
      </section>

      <OptionSection icon={<ImageIcon className="h-4 w-4" />} label="Resolution">
        {STUDIO_RESOLUTION_OPTIONS.map((resolution) => (
          <OptionButton
            key={resolution}
            active={settings.resolution === resolution}
            title={resolutionDetails[resolution].name}
            description={resolutionDetails[resolution].description}
            onClick={() => onSettingsChange({ ...settings, resolution })}
          />
        ))}
      </OptionSection>

      <OptionSection icon={<Gauge className="h-4 w-4" />} label="Frame Rate">
        {STUDIO_FPS_OPTIONS.map((fps) => (
          <OptionButton
            key={fps}
            active={settings.fps === fps}
            title={fpsDetails[fps].label}
            description={fpsDetails[fps].description}
            onClick={() => onSettingsChange({ ...settings, fps })}
          />
        ))}
      </OptionSection>

      <OptionSection icon={<Sparkles className="h-4 w-4" />} label="Encoding">
        {(Object.keys(encoderDetails) as StudioEncoderMode[]).map((encoder) => (
          <OptionButton
            key={encoder}
            active={settings.encoder === encoder}
            title={encoderDetails[encoder].label}
            description={encoderDetails[encoder].description}
            onClick={() => onSettingsChange({ ...settings, encoder })}
          />
        ))}
      </OptionSection>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <InfoPill icon={<Scissors className="h-5 w-5" />} label="Duration" value={formatTime(trim.duration)} />
        <InfoPill icon={<ImageIcon className="h-5 w-5" />} label="Frames" value={`~${frameCount}`} />
        <InfoPill icon={<Gauge className="h-5 w-5" />} label="Est. Size" value={`~${estimatedSize} MB`} />
      </div>

      {isHighCostExport ? (
        <div role="status" className="border border-amber-400/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100">
          Large export: {frameCount} frames at {settings.resolution}p can take longer and use more memory in this browser tab.
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80]"
        >
          <Captions className="h-4 w-4" />
          Continue to Customize
        </button>
      </div>
    </div>
  );
}

function TextScreen({
  videoUrl,
  videoRef,
  metadata,
  trim,
  captions,
  onCaptionChange,
  onCaptionSettingChange,
  onBack,
  onSkip,
  onCreate,
  disabled,
}: {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  metadata: StudioVideoMetadata;
  trim: StudioTrimSelection;
  captions: StudioCaptionSettings;
  onCaptionChange: (placement: keyof StudioCaptionSettings, value: string) => void;
  onCaptionSettingChange: <Key extends keyof StudioCaptionSettings>(key: Key, value: StudioCaptionSettings[Key]) => void;
  onBack: () => void;
  onSkip: () => void;
  onCreate: () => void;
  disabled: boolean;
}) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const seekTime = Number.isFinite(trim.startTime) ? trim.startTime : 0;
    const showSelectedFrame = () => {
      try {
        video.pause();
        video.currentTime = seekTime;
      } catch {
        // Seeking is best-effort until browser metadata is ready.
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      showSelectedFrame();
      return undefined;
    }

    video.addEventListener('loadedmetadata', showSelectedFrame, { once: true });
    return () => video.removeEventListener('loadedmetadata', showSelectedFrame);
  }, [trim.startTime, videoRef]);

  return (
    <div className="space-y-6">
      <WizardHeader
        eyebrow="Text"
        title="Make It Memorable"
        helper="Add captions, reactions, or context to your GIF"
        onBack={onBack}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="relative mx-auto w-full overflow-hidden bg-black"
          style={{ aspectRatio: `${metadata.width || 16} / ${metadata.height || 9}` }}
          data-testid="caption-preview-frame"
        >
          <video ref={videoRef} src={videoUrl} controls playsInline className="absolute inset-0 h-full w-full object-contain" />
          <CaptionOverlay placement="top" metadata={metadata} captions={captions}>{captions.topText}</CaptionOverlay>
          <CaptionOverlay placement="bottom" metadata={metadata} captions={captions}>{captions.bottomText}</CaptionOverlay>
        </div>

        <section className="border border-gray-800 p-4">
          <h3 className="mb-4 text-lg font-bold text-white">Captions</h3>
          <CaptionInput label="Top text" value={captions.topText} onChange={(value) => onCaptionChange('topText', value)} />
          <CaptionInput label="Bottom text" value={captions.bottomText} onChange={(value) => onCaptionChange('bottomText', value)} />
          <OptionSection icon={<Captions className="h-4 w-4" />} label="Caption Size">
            {(Object.keys(captionSizeDetails) as StudioCaptionSize[]).map((size) => (
              <OptionButton
                key={size}
                active={captions.size === size}
                title={captionSizeDetails[size].label}
                description={captionSizeDetails[size].description}
                onClick={() => onCaptionSettingChange('size', size)}
              />
            ))}
          </OptionSection>
          <div className="mt-4">
            <OptionSection icon={<Sparkles className="h-4 w-4" />} label="Caption Color">
              {(Object.keys(captionColorDetails) as StudioCaptionColor[]).map((color) => (
                <OptionButton
                  key={color}
                  active={captions.color === color}
                  title={captionColorDetails[color].label}
                  description={captionColorDetails[color].description}
                  onClick={() => onCaptionSettingChange('color', color)}
                />
              ))}
            </OptionSection>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled}
              className="inline-flex items-center justify-center gap-2 border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create without text
            </button>
            <button
              type="button"
              onClick={onCreate}
              disabled={disabled}
              className="inline-flex items-center justify-center gap-2 bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Create GIF
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProcessingScreen({
  progress,
  error,
  onBack,
}: {
  progress: StudioExportProgress | null;
  error: StudioError | null;
  onBack: () => void;
}) {
  const stages = [
    { key: 'capturing', name: 'Capturing Frames' },
    { key: 'captions', name: 'Applying Captions' },
    { key: 'encoding', name: 'Encoding GIF' },
    { key: 'finalizing', name: 'Finalizing' },
  ];
  const currentStage = progress?.stage || 'preparing';
  const currentIndex = currentStage === 'preparing' ? 0 : Math.max(0, stages.findIndex((stage) => stage.key === currentStage));
  const isError = Boolean(error);
  const helper = isError
    ? [error?.message, error?.action].filter(Boolean).join(' ') || 'Try again with a shorter clip.'
    : progress?.message || 'Initializing...';

  return (
    <div className="space-y-6">
      <WizardHeader
        eyebrow="Processing"
        title={isError ? 'GIF Creation Failed' : 'Creating Your GIF'}
        helper={helper}
        onBack={onBack}
      />

      <section className="border border-gray-800 p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white">{isError ? 'Error occurred' : `Stage ${Math.min(currentIndex + 1, 4)} of 4`}</h3>
          <span className="text-sm font-semibold text-gray-400">{progress?.percentage || 0}%</span>
        </div>
        <div className="mb-5 h-2 bg-gray-800">
          <div className={`h-full ${isError ? 'bg-red-400' : 'bg-[#4fd1c5]'}`} style={{ width: `${progress?.percentage || 0}%` }} />
        </div>
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const completed = !isError && index < currentIndex;
            const current = !isError && index === currentIndex;
            const failed = isError && index === currentIndex;
            return (
              <div
                key={stage.key}
                className={`flex items-center gap-3 border px-4 py-3 ${
                  failed
                    ? 'border-red-500/50 bg-red-950/30 text-red-100'
                    : completed
                      ? 'border-[#4fd1c5]/50 bg-[#4fd1c5]/10 text-[#9ff3ea]'
                      : current
                        ? 'border-[#E91E8C]/70 bg-[#E91E8C]/10 text-white'
                        : 'border-gray-800 text-gray-500'
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center border border-current text-xs">{failed ? '!' : completed ? '✓' : current ? '●' : '○'}</span>
                <span className="font-semibold">{stage.name}</span>
              </div>
            );
          })}
        </div>
        {progress?.frameIndex && progress.totalFrames ? (
          <p className="mt-4 text-sm text-gray-400">
            Frame {progress.frameIndex}/{progress.totalFrames}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function SuccessScreen({
  result,
  nextTool,
  setNextTool,
  onBack,
  onReset,
}: {
  result: StudioExportResult;
  nextTool: string;
  setNextTool: (value: string) => void;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <WizardHeader eyebrow="Success" title="GIF Created Successfully!" helper="Your GIF is ready!" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {/* The final animated GIF is already encoded in a local blob URL; image optimization cannot improve it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Generated GIF preview" className="w-full border border-gray-800 bg-black" />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <MetadataItem label="Size" value={formatFileSize(result.fileSize)} />
            <MetadataItem label="Dimensions" value={`${result.width}x${result.height}`} />
            <MetadataItem label="Duration" value={formatTime(result.duration)} />
            <MetadataItem label="Frames" value={String(result.frameCount)} />
            <MetadataItem label="Encoder" value={encoderResultLabel(result)} />
          </dl>
        </div>
        <section className="border border-gray-800 p-4">
          <div className="mb-4 flex items-center gap-2 text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="text-lg font-bold">GIF ready</h2>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex w-full items-center justify-center gap-2 border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Edit clip
            </button>
            <a
              href={result.url}
              download="ytgify-studio.gif"
              onClick={() => trackStudioEvent('studio_download_clicked', { output_file_size_bucket: studioFileSizeBucket(result.fileSize) })}
              className="inline-flex w-full items-center justify-center gap-2 bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80]"
            >
              <Download className="h-4 w-4" />
              Download GIF
            </a>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex w-full items-center justify-center gap-2 border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Make another
            </button>
          </div>
          <label className="mt-5 block text-sm font-semibold text-gray-300">
            What should Studio add next?
            <select
              value={nextTool}
              onChange={(event) => {
                setNextTool(event.target.value);
                if (event.target.value) {
                  trackStudioEvent('studio_next_tool_selected', { next_tool: event.target.value });
                }
              }}
              className="mt-2 w-full border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-[#E91E8C]"
            >
              <option value="">Choose one</option>
              <option value="gif_optimizer">GIF optimizer</option>
              <option value="captioned_gif_maker">Captioned GIF maker</option>
              <option value="screen_to_gif">Screen to GIF</option>
              <option value="share_links">Share links</option>
            </select>
          </label>
        </section>
      </div>
    </div>
  );
}

function encoderResultLabel(result: StudioExportResult): string {
  if (result.encoder === 'gifski') return 'gifski';
  return result.encoderFallback ? 'gifenc fallback' : 'gifenc';
}

function WizardHeader({
  eyebrow,
  title,
  helper,
  onBack,
}: {
  eyebrow: string;
  title: string;
  helper: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase text-[#4fd1c5]">{eyebrow}</p>
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400 sm:text-base">{helper}</p>
      </div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center border border-gray-700 text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}

function OptionSection({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
        <span className="text-[#4fd1c5]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  );
}

function OptionButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[86px] border px-4 py-3 text-left transition-colors ${
        active
          ? 'border-[#E91E8C] bg-[#E91E8C]/15 text-white'
          : 'border-gray-800 bg-gray-900/70 text-gray-300 hover:border-gray-600 hover:text-white'
      }`}
    >
      <span className="block text-sm font-bold">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-gray-400">{description}</span>
    </button>
  );
}

function TimeInput({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm font-semibold text-gray-300">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        step={0.1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none transition-colors focus:border-[#E91E8C]"
      />
    </label>
  );
}

function RangeInput({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-300">
      {label}
      <input
        type="range"
        min={min}
        max={Math.max(min, max)}
        step={0.1}
        value={Math.min(value, Math.max(min, max))}
        aria-label={label}
        className="mt-2 w-full accent-[#E91E8C]"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function CaptionInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mb-4 block text-sm font-semibold text-gray-300 last:mb-0">
      {label}
      <input
        type="text"
        maxLength={STUDIO_CAPTION_MAX_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#E91E8C]"
        placeholder="Optional caption"
      />
      <span className="mt-1 block text-xs text-gray-500">{value.length}/{STUDIO_CAPTION_MAX_LENGTH}</span>
    </label>
  );
}

function CaptionOverlay({
  placement,
  metadata,
  captions,
  children,
}: {
  placement: 'top' | 'bottom';
  metadata: StudioVideoMetadata;
  captions: StudioCaptionSettings;
  children: string;
}) {
  if (!children.trim()) return null;
  const layout = getCaptionLayout(metadata.width, metadata.height, captions);

  return (
    <div
      className="pointer-events-none absolute left-1/2 max-w-[86%] -translate-x-1/2 text-center font-black uppercase [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]"
      style={{
        [placement]: `${layout.verticalPadding}px`,
        color: layout.fillStyle,
        fontSize: `${layout.fontSize}px`,
        lineHeight: `${layout.lineHeight}px`,
        WebkitTextStroke: `${layout.strokeWidth}px ${layout.strokeStyle}`,
      }}
    >
      {children}
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-800 bg-gray-900/70 p-3">
      <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
      <dd className="mt-1 font-semibold text-gray-100">{value}</dd>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border border-gray-800 bg-gray-900/70 p-3">
      <span className="text-[#4fd1c5]">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase text-gray-500">{label}</span>
        <span className="font-semibold text-gray-100">{value}</span>
      </span>
    </div>
  );
}

function ErrorNotice({ error, onReset }: { error: StudioError; onReset: () => void }) {
  return (
    <div className="mt-5 border border-red-500/30 bg-red-950/30 p-4">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
        <div>
          <p className="font-semibold text-red-100">{error.message}</p>
          <p className="mt-1 text-sm leading-6 text-red-200/80">{error.action}</p>
          <button type="button" onClick={onReset} className="mt-3 text-sm font-semibold text-white underline underline-offset-4">
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}

function mapExportError(code: string): StudioError {
  if (code === 'cancelled') {
    return {
      code: 'cancelled',
      message: 'The export was cancelled.',
      action: 'Choose a clip and try again when ready.',
    };
  }

  if (code === 'canvas_failed') {
    return {
      code: 'canvas_failed',
      message: 'Studio could not create a canvas for this export.',
      action: 'Try a shorter clip or restart the browser tab.',
    };
  }

  if (code === 'extraction_timeout') {
    return {
      code: 'extraction_timeout',
      message: 'Frame extraction took too long.',
      action: 'Shorten the clip or lower the output resolution.',
    };
  }

  if (code === 'decode_failed') {
    return {
      code: 'decode_failed',
      message: 'Studio could not decode that frame.',
      action: 'Try a different browser-decodable video or choose another clip range.',
    };
  }

  return {
    code: 'encoding_failed',
    message: 'Studio could not encode that GIF.',
    action: 'Try a shorter clip, lower FPS, or lower resolution.',
  };
}
