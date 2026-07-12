import { Loader2, Upload } from 'lucide-react';
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

      <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-3 sm:p-4">
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
        className={`rounded-2xl border border-dashed p-6 text-center transition-colors sm:p-10 ${
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E91E8C]/30 bg-[#E91E8C]/15 text-[#ff5fb2]">
            {status === 'loading-video' ? <Loader2 className="h-7 w-7 animate-spin" /> : <Upload className="h-7 w-7" />}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {status === 'loading-video' ? 'Reading your video…' : 'Drop a video here'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">or choose a file from your device</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#E91E8C] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_34px_rgba(233,30,140,0.24)] transition-colors hover:bg-[#d51a80]"
          >
            <Upload className="h-4 w-4" />
            Choose video
          </button>
          <p className="mt-5 text-xs leading-5 text-gray-500">
            MP4, MOV, or WebM · up to {formatFileSize(STUDIO_MAX_FILE_SIZE_BYTES)} ·{' '}
            {Math.round(STUDIO_MAX_SOURCE_DURATION_SECONDS / 60)} minutes max
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-600">
            Use media you own. Codec support varies by browser; H.264 MP4 or WebM works best.
          </p>
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
