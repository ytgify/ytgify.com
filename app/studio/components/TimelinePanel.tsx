import { STUDIO_MAX_EXPORT_DURATION_SECONDS, STUDIO_PRESET_DURATIONS } from '@/lib/studio/constants';
import { formatClock } from '@/lib/studio/timeline';
import type { StudioTrimSelection, StudioVideoMetadata } from '@/lib/studio/types';
import type { TimelineSelectionController } from '../useTimelineSelection';
import { Disclosure } from './Disclosure';
import { RangeInput } from './shared';
import { TrimTimeInput } from './TrimTimeInput';
import { TimelineTrack } from './TimelineTrack';

interface TimelinePanelProps {
  metadata: StudioVideoMetadata;
  trim: StudioTrimSelection;
  timeline: TimelineSelectionController;
  onTrimChange: (startTime: number, endTime: number) => void;
  onPreset: (duration: number) => void;
}

export function TimelinePanel({ metadata, trim, timeline, onTrimChange, onPreset }: TimelinePanelProps) {
  const maxDuration = Math.min(STUDIO_MAX_EXPORT_DURATION_SECONDS, metadata.duration - trim.startTime);
  const moveClip = (delta: number) => {
    const start = Math.max(0, Math.min(trim.startTime + delta, metadata.duration - trim.duration));
    onTrimChange(start, start + trim.duration);
  };
  return (
    <section className="space-y-4 rounded-xl border border-gray-800 bg-black/10 p-4" aria-label="Timeline">
      <div className="grid grid-cols-2 gap-3">
        <TrimTimeInput
          label="Start time"
          value={trim.startTime}
          max={Math.max(0, metadata.duration - trim.duration)}
          clock
          onChange={(value) => onTrimChange(value, value + trim.duration)}
        />
        <TrimTimeInput
          label="Duration"
          value={trim.duration}
          max={maxDuration}
          onChange={(value) => onTrimChange(trim.startTime, trim.startTime + value)}
        />
      </div>
      <Disclosure title="Fine-tune timing">
        {metadata.duration > 30 ? (
          <div className="space-y-2 border-b border-gray-800 pb-4">
            <RangeInput
              label="Find a moment in the full video"
              min={0}
              max={metadata.duration - trim.duration}
              value={trim.startTime}
              onChange={(value) => onTrimChange(value, value + trim.duration)}
            />
            <div className="flex justify-between text-xs tabular-nums text-gray-400">
              <span>00:00.0</span>
              <span>{formatClock(metadata.duration)}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={trim.startTime <= 0}
                onClick={() => moveClip(-30)}
                className="min-h-11 flex-1 rounded-lg border border-gray-700 px-2 text-sm disabled:opacity-40"
              >
                30s earlier
              </button>
              <button
                type="button"
                disabled={trim.endTime >= metadata.duration}
                onClick={() => moveClip(30)}
                className="min-h-11 flex-1 rounded-lg border border-gray-700 px-2 text-sm disabled:opacity-40"
              >
                30s later
              </button>
            </div>
          </div>
        ) : null}
        <div>
          <p className="text-sm font-semibold text-gray-200">
            {metadata.duration > 30 ? 'Fine-tune this moment' : 'Adjust your clip'}
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-400">
            Drag Start or End, or use the arrow keys for 0.1s adjustments.
          </p>
        </div>
        <TimelineTrack timeline={timeline} trim={trim} metadata={metadata} onTrimChange={onTrimChange} />
      </Disclosure>
      <div className="flex flex-wrap gap-2" aria-label="Clip duration presets">
        {STUDIO_PRESET_DURATIONS.map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => onPreset(duration)}
            className="min-h-11 min-w-11 rounded-lg border border-gray-700 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-[#4fd1c5]"
          >
            {duration}s
          </button>
        ))}
      </div>
    </section>
  );
}
