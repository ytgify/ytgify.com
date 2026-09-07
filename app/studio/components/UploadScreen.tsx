import { Loader2, ShieldCheck, Upload } from 'lucide-react';
import { STUDIO_MAX_FILE_SIZE_BYTES, STUDIO_MAX_SOURCE_DURATION_SECONDS } from '@/lib/studio/constants';
import { formatFileSize } from '@/lib/studio/file-validation';
import type { StudioError, StudioStatus, StudioVideoMetadata } from '@/lib/studio/types';
import { ErrorNotice } from './shared';
import { UploadHero } from './UploadHero';
import { WizardProgress } from './WizardFrame';

export function UploadScreen({
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
      <UploadHero />

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
        className={`rounded-2xl border border-dashed p-5 text-center transition-colors sm:p-8 ${
          isDragging
            ? 'border-[#4fd1c5] bg-[#4fd1c5]/10'
            : 'border-gray-700 bg-gradient-to-b from-gray-950/90 to-[#0d1118] hover:border-gray-500'
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

        <div className="mx-auto flex max-w-xl flex-col items-center">
          <h2 className="text-xl font-bold text-white sm:text-2xl" aria-live="polite">
            {status === 'loading-video' ? 'Reading your video…' : 'Choose a video from your device'}
          </h2>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E91E8C] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_34px_rgba(233,30,140,0.24)] transition-colors hover:bg-[#d51a80] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4fd1c5] sm:w-auto"
          >
            {status === 'loading-video' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            Choose video
          </button>
          <p className="mt-3 hidden text-sm text-gray-400 sm:block">You can also drop a file here.</p>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm leading-5 text-[#9ff3ea]">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Your video stays on your device.
          </p>
          <p className="mt-3 text-xs leading-5 text-gray-400">
            MP4, MOV, or WebM · up to {formatFileSize(STUDIO_MAX_FILE_SIZE_BYTES)} ·{' '}
            {Math.round(STUDIO_MAX_SOURCE_DURATION_SECONDS / 60)} minutes max
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-400">
            Use media you own. Codec support varies by browser; H.264 MP4 or WebM works best.
          </p>
        </div>

        {error ? <ErrorNotice error={error} onReset={onReset} /> : null}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-3 sm:p-4">
        <WizardProgress currentStep="upload" />
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
