import { STUDIO_MAX_EXPORT_DURATION_SECONDS } from '@/lib/studio/constants';
import { formatClock } from '@/lib/studio/timeline';
import type { StudioTrimSelection, StudioVideoMetadata } from '@/lib/studio/types';
import type { TimelineSelectionController } from '../useTimelineSelection';

export function TimelineTrack({
  timeline,
  trim,
  metadata,
  onTrimChange,
}: {
  timeline: TimelineSelectionController;
  trim: StudioTrimSelection;
  metadata: StudioVideoMetadata;
  onTrimChange: (start: number, end: number) => void;
}) {
  const { timelineRef, beginDrag, startPercent, widthPercent, timelineView } = timeline;
  const adjust = (mode: 'start' | 'end' | 'range', direction: number) => {
    const delta = direction * 0.1;
    if (mode === 'start')
      onTrimChange(
        Math.max(
          0,
          trim.endTime - STUDIO_MAX_EXPORT_DURATION_SECONDS,
          Math.min(trim.endTime - 0.1, trim.startTime + delta),
        ),
        trim.endTime,
      );
    else if (mode === 'end')
      onTrimChange(
        trim.startTime,
        Math.min(
          metadata.duration,
          trim.startTime + STUDIO_MAX_EXPORT_DURATION_SECONDS,
          Math.max(trim.startTime + 0.1, trim.endTime + delta),
        ),
      );
    else {
      const start = Math.max(0, Math.min(metadata.duration - trim.duration, trim.startTime + delta));
      onTrimChange(start, start + trim.duration);
    }
  };
  return (
    <div>
      <div
        ref={timelineRef}
        className="relative h-36 touch-none rounded-lg bg-gray-900"
        data-testid="studio-timeline"
        onPointerDown={(event) => beginDrag(event, 'range')}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 rounded bg-gray-800" />
        <div
          className="pointer-events-none absolute top-11 h-4 border-l border-[#4fd1c5]/60"
          style={{ left: `${startPercent}%` }}
        />
        <div
          className="pointer-events-none absolute bottom-11 h-4 border-l border-[#4fd1c5]/60"
          style={{ left: `${startPercent + widthPercent}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-6 -translate-y-1/2 rounded border border-[#4fd1c5] bg-[#4fd1c5]/30"
          style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
        />
        {(['start', 'range', 'end'] as const).map((mode) => {
          const percent = startPercent + (mode === 'end' ? widthPercent : mode === 'range' ? widthPercent / 2 : 0);
          return (
            <button
              key={mode}
              type="button"
              aria-label={mode === 'range' ? 'Selected clip range' : `Drag clip ${mode}`}
              data-testid={mode === 'range' ? 'timeline-selection' : `timeline-${mode}-handle`}
              className={`absolute h-11 w-11 rounded-md border text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E91E8C] ${mode === 'range' ? 'top-1/2 -translate-y-1/2 cursor-grab border-transparent text-white' : `${mode === 'start' ? 'top-0' : 'bottom-0'} cursor-ew-resize border-[#4fd1c5] bg-gray-950 text-[#9ff3ea]`}`}
              style={{ left: `clamp(0px, calc(${percent}% - 22px), calc(100% - 44px))` }}
              onPointerDown={(event) => beginDrag(event, mode)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  adjust(mode, event.key === 'ArrowLeft' ? -1 : 1);
                }
              }}
            >
              {mode === 'range' ? '↔' : mode === 'start' ? 'Start' : 'End'}
            </button>
          );
        })}
      </div>
      <div
        className="mt-2 flex justify-between text-xs tabular-nums text-gray-400"
        aria-label="Visible timeline window"
      >
        <span>{formatClock(timelineView.start)}</span>
        <span>{formatClock(timelineView.start + timelineView.span)}</span>
      </div>
    </div>
  );
}
