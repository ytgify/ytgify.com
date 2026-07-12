import { Captions, Gauge, ImageIcon, Scissors } from 'lucide-react';
import type { RefObject } from 'react';
import { STUDIO_FPS_OPTIONS, STUDIO_RESOLUTION_OPTIONS } from '@/lib/studio/constants';
import type { StudioExportBudget } from '@/lib/studio/export-budget';
import { formatTime } from '@/lib/studio/presets';
import type { StudioOutputSettings, StudioTrimSelection, StudioVideoMetadata } from '@/lib/studio/types';
import { fpsDetails, highCostFrameThreshold, resolutionDetails } from '../studio-config';
import { useTimelineSelection } from '../useTimelineSelection';
import { InfoPill, MetadataItem, OptionButton, OptionSection, WizardHeader } from './shared';
import { TimelinePanel } from './TimelinePanel';

interface CaptureScreenProps {
  videoUrl: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  metadata: StudioVideoMetadata;
  trim: StudioTrimSelection;
  settings: StudioOutputSettings;
  outputSummary: string | null;
  estimatedSize: string;
  exportBudget: StudioExportBudget;
  onTrimChange: (startTime: number, endTime: number) => void;
  onPreset: (duration: number) => void;
  onSettingsChange: (settings: StudioOutputSettings) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function CaptureScreen(props: CaptureScreenProps) {
  const { videoUrl, videoRef, metadata, trim, settings, outputSummary, estimatedSize, exportBudget } = props;
  const { timelineRef, beginDrag, previewStart, previewEnd, seekPreviewToSelection, startPercent, widthPercent } =
    useTimelineSelection(videoRef, metadata, trim, props.onTrimChange);
  const frameCount = exportBudget.frameCount;

  return (
    <div className="space-y-6">
      <WizardHeader
        eyebrow="Capture"
        title="Select Your Perfect Moment"
        helper="Choose the start time and duration for your clip"
        onBack={props.onBack}
      />
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        className="aspect-video w-full rounded-xl border border-gray-800 bg-black object-contain"
        onPlay={() => {
          const video = videoRef.current;
          if (video && (video.currentTime < previewStart || video.currentTime >= previewEnd)) {
            seekPreviewToSelection();
          }
        }}
        onTimeUpdate={() => {
          const video = videoRef.current;
          if (video && video.currentTime >= previewEnd) {
            video.pause();
            seekPreviewToSelection();
          }
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
      <TimelinePanel
        metadata={metadata}
        trim={trim}
        timelineRef={timelineRef}
        startPercent={startPercent}
        widthPercent={widthPercent}
        beginDrag={beginDrag}
        onTrimChange={props.onTrimChange}
        onPreset={props.onPreset}
      />
      <OutputOptions settings={settings} onChange={props.onSettingsChange} />
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <InfoPill icon={<Scissors className="h-5 w-5" />} label="Duration" value={formatTime(trim.duration)} />
        <InfoPill icon={<ImageIcon className="h-5 w-5" />} label="Frames" value={`~${frameCount}`} />
        <InfoPill icon={<Gauge className="h-5 w-5" />} label="Est. Size" value={`~${estimatedSize} MB`} />
      </div>
      {!exportBudget.allowed ? (
        <div
          role="alert"
          className="rounded-xl border border-red-400/40 bg-red-950/20 p-4 text-sm leading-6 text-red-100"
        >
          This combination needs about {exportBudget.estimatedMegabytes}
          {' MB '}just for video frames, above Studio&apos;s reliable browser budget. Lower the duration, frame rate, or
          resolution to continue.
        </div>
      ) : frameCount >= highCostFrameThreshold ? (
        <div
          role="status"
          className="rounded-xl border border-amber-400/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100"
        >
          Large export: {frameCount} frames at {settings.resolution}p can take longer and use more memory in this
          browser tab.
        </div>
      ) : null}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={props.onContinue}
          disabled={!exportBudget.allowed}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Captions className="h-4 w-4" />
          Continue to Customize
        </button>
      </div>
    </div>
  );
}

function OutputOptions({
  settings,
  onChange,
}: {
  settings: StudioOutputSettings;
  onChange: (value: StudioOutputSettings) => void;
}) {
  return (
    <>
      <OptionSection icon={<ImageIcon className="h-4 w-4" />} label="Resolution">
        {STUDIO_RESOLUTION_OPTIONS.map((resolution) => (
          <OptionButton
            key={resolution}
            active={settings.resolution === resolution}
            title={resolutionDetails[resolution].name}
            description={resolutionDetails[resolution].description}
            onClick={() => onChange({ ...settings, resolution })}
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
            onClick={() => onChange({ ...settings, fps })}
          />
        ))}
      </OptionSection>
    </>
  );
}
