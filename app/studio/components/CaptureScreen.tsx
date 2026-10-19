import { useState, type RefObject } from 'react';
import type { StudioExportBudget } from '@/lib/studio/export-budget';
import { formatClock } from '@/lib/studio/timeline';
import { estimateGifSize } from '@/lib/studio/size-target';
import type { StudioOutputSettings, StudioTrimSelection, StudioVideoMetadata } from '@/lib/studio/types';
import { useCaptionPreview } from '../useCaptionPreview';
import { useTimelineSelection } from '../useTimelineSelection';
import { TimelinePanel } from './TimelinePanel';
import { CaptionEditor, type CaptionEditorProps } from './CaptionEditor';
import { CaptionCanvas } from './CaptionCanvas';
import { OutputSettings } from './OutputSettings';

interface CaptureScreenProps extends CaptionEditorProps {
  videoUrl: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  metadata: StudioVideoMetadata;
  trim: StudioTrimSelection;
  settings: StudioOutputSettings;
  estimatedSize: string;
  exportBudget: StudioExportBudget;
  onTrimChange: (startTime: number, endTime: number) => void;
  onPreset: (duration: number) => void;
  onSettingsChange: (settings: StudioOutputSettings) => void;
  onCreate: () => void;
  notice: string;
}

export function CaptureScreen(props: CaptureScreenProps) {
  const { videoUrl, videoRef, metadata, trim, settings, estimatedSize, exportBudget, captions } = props;
  const {
    active: previewActive,
    previewRef,
    returnButtonRef,
    show: showPreview,
    back: returnToEditor,
  } = useCaptionPreview();
  const [typing, setTyping] = useState(false);
  const timeline = useTimelineSelection(videoRef, metadata, trim, props.onTrimChange);
  const { previewStart, previewEnd, seekPreviewToSelection } = timeline;
  return (
    <div
      className="space-y-4"
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) setTyping(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setTyping(false);
      }}
      onClickCapture={(event) => {
        // Restore the sticky bar after activation, so it cannot cover the pointer's release target.
        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)) setTyping(false);
      }}
    >
      <h1 className="text-xl font-bold sm:text-2xl">Select Your Perfect Moment</h1>
      <div aria-label="Source video" className="min-w-0 text-xs text-gray-400">
        <p className="truncate font-medium text-gray-200" title={metadata.name}>
          {metadata.name || 'Selected video'}
        </p>
        <p>
          {formatClock(metadata.duration)} · {metadata.width} × {metadata.height}
        </p>
      </div>
      <CaptionEditor
        onPreview={showPreview}
        captions={captions}
        onCaptionChange={props.onCaptionChange}
        onCaptionSettingChange={props.onCaptionSettingChange}
      />
      <div
        ref={previewRef}
        className="space-y-2"
        onKeyDown={(event) => {
          if (previewActive && event.key === 'Escape') returnToEditor();
        }}
      >
        {previewActive ? (
          <button
            ref={returnButtonRef}
            type="button"
            onClick={returnToEditor}
            className="min-h-11 w-full rounded-lg border border-[#4fd1c5] px-3 py-2 text-sm"
          >
            Return to caption editing
          </button>
        ) : null}
        <div
          className="relative mx-auto overflow-hidden rounded-xl border border-gray-800 bg-black"
          style={{
            aspectRatio: `${metadata.width} / ${metadata.height}`,
            width: `min(100%, ${(300 * metadata.width) / metadata.height}px)`,
          }}
          data-testid="caption-preview-frame"
        >
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            className="h-full w-full object-contain"
            onPlay={() => {
              const video = videoRef.current;
              if (video && (video.currentTime < previewStart || video.currentTime >= previewEnd))
                seekPreviewToSelection();
            }}
            onTimeUpdate={() => {
              const video = videoRef.current;
              if (video && video.currentTime >= previewEnd) {
                video.pause();
                seekPreviewToSelection();
              }
            }}
          />
          <CaptionCanvas metadata={metadata} resolution={settings.resolution} captions={captions} />
        </div>
      </div>
      <p className="text-xs leading-5 text-gray-400">
        Preview cued to {formatClock(trim.startTime)} - {formatClock(trim.endTime)}.
      </p>
      <TimelinePanel
        metadata={metadata}
        trim={trim}
        timeline={timeline}
        onTrimChange={props.onTrimChange}
        onPreset={props.onPreset}
      />
      {props.notice ? (
        <p role="status" className="text-sm text-[#9ff3ea]">
          {props.notice}
        </p>
      ) : null}
      <OutputSettings
        metadata={metadata}
        settings={settings}
        estimatedSize={estimatedSize}
        onChange={props.onSettingsChange}
      />
      <p className="text-xs leading-5 text-gray-400" data-testid="size-estimate-explanation">
        Conservative planning estimate, not a predicted file size. Simple clips can be much smaller; motion, detail, and
        captions change compression. Check the actual size after export.
      </p>
      {settings.sizeTarget !== 'auto' &&
      estimateGifSize(metadata, trim, settings).high > settings.sizeTarget * 1048576 ? (
        <p role="status" className="text-sm text-amber-200">
          Even the smallest settings may exceed your target. Shorten the clip.
        </p>
      ) : null}
      {!exportBudget.allowed ? (
        <div
          role="alert"
          className="rounded-xl border border-red-400/40 bg-red-950/20 p-4 text-sm leading-6 text-red-100"
        >
          {`This combination needs about ${exportBudget.estimatedMegabytes} MB just for video frames, above this converter's reliable browser budget. Lower the duration, frame rate, or resolution to continue.`}
        </div>
      ) : null}
      <div
        data-testid="create-bar"
        className={`${typing || previewActive ? 'static' : 'sticky bottom-0'} z-10 flex items-center justify-between gap-3 border-t border-gray-800 bg-gray-950 px-1 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]`}
      >
        <div className="text-sm">
          <span className="font-semibold">~{estimatedSize} MB</span>
          <span className="block text-xs text-gray-400">{trim.duration.toFixed(1)}s GIF · planning estimate</span>
        </div>
        <button
          type="button"
          onClick={props.onCreate}
          disabled={!exportBudget.allowed}
          className="min-h-12 shrink-0 rounded-xl bg-[#E91E8C] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Create GIF
        </button>
      </div>
    </div>
  );
}
