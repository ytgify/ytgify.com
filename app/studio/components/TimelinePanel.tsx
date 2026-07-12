import { STUDIO_MAX_EXPORT_DURATION_SECONDS, STUDIO_PRESET_DURATIONS } from '@/lib/studio/constants';
import type { StudioTrimSelection, StudioVideoMetadata } from '@/lib/studio/types';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { RangeInput, TimeInput } from './shared';

interface TimelinePanelProps {
  metadata: StudioVideoMetadata;
  trim: StudioTrimSelection;
  timelineRef: RefObject<HTMLDivElement | null>;
  startPercent: number;
  widthPercent: number;
  beginDrag: (event: ReactPointerEvent, mode: 'start' | 'end' | 'range') => void;
  onTrimChange: (startTime: number, endTime: number) => void;
  onPreset: (duration: number) => void;
}

export function TimelinePanel({
  metadata,
  trim,
  timelineRef,
  startPercent,
  widthPercent,
  beginDrag,
  onTrimChange,
  onPreset,
}: TimelinePanelProps) {
  const maxDuration = Math.min(STUDIO_MAX_EXPORT_DURATION_SECONDS, metadata.duration - trim.startTime);

  return (
    <section className="space-y-4 rounded-xl border border-gray-800 bg-black/10 p-4" aria-label="Timeline">
      <div
        ref={timelineRef}
        className="relative h-12 touch-none rounded-lg bg-gray-900"
        data-testid="studio-timeline"
        onPointerDown={(event) => beginDrag(event, 'range')}
      >
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-gray-800" />
        <button
          type="button"
          aria-label="Selected clip range"
          data-testid="timeline-selection"
          className="absolute top-1/2 h-6 -translate-y-1/2 cursor-grab rounded-md border border-[#4fd1c5] bg-[#4fd1c5]/30 active:cursor-grabbing"
          style={{ left: `${startPercent}%`, width: `${Math.min(100 - startPercent, widthPercent)}%` }}
          onPointerDown={(event) => beginDrag(event, 'range')}
        />
        <button
          type="button"
          aria-label="Drag clip start"
          data-testid="timeline-start-handle"
          className="absolute top-1/2 h-9 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize border border-[#4fd1c5] bg-[#0a0a0a]"
          style={{ left: `${startPercent}%` }}
          onPointerDown={(event) => beginDrag(event, 'start')}
        />
        <button
          type="button"
          aria-label="Drag clip end"
          data-testid="timeline-end-handle"
          className="absolute top-1/2 h-9 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize border border-[#4fd1c5] bg-[#0a0a0a]"
          style={{ left: `${Math.min(100, startPercent + widthPercent)}%` }}
          onPointerDown={(event) => beginDrag(event, 'end')}
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
            className="rounded-lg border border-gray-700 px-3 py-2 text-sm font-semibold text-gray-200 transition-colors hover:border-[#4fd1c5] hover:text-white"
          >
            {duration}s
          </button>
        ))}
      </div>
    </section>
  );
}
