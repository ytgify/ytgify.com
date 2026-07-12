import { useEffect } from 'react';
import type { StudioCaptionSettings, StudioTrimSelection, StudioVideoMetadata } from '@/lib/studio/types';
import { CaptionEditor } from './CaptionEditor';
import { CaptionOverlay, WizardHeader } from './shared';

export function TextScreen({
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
  onCaptionSettingChange: <Key extends keyof StudioCaptionSettings>(
    key: Key,
    value: StudioCaptionSettings[Key],
  ) => void;
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
          className="relative mx-auto w-full overflow-hidden rounded-xl border border-gray-800 bg-black"
          style={{ aspectRatio: `${metadata.width || 16} / ${metadata.height || 9}` }}
          data-testid="caption-preview-frame"
        >
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            className="absolute inset-0 h-full w-full object-contain"
          />
          <CaptionOverlay placement="top" metadata={metadata} captions={captions}>
            {captions.topText}
          </CaptionOverlay>
          <CaptionOverlay placement="bottom" metadata={metadata} captions={captions}>
            {captions.bottomText}
          </CaptionOverlay>
        </div>

        <CaptionEditor
          captions={captions}
          onCaptionChange={onCaptionChange}
          onCaptionSettingChange={onCaptionSettingChange}
          onSkip={onSkip}
          onCreate={onCreate}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
