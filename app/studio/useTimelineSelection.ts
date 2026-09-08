import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { STUDIO_MAX_EXPORT_DURATION_SECONDS } from '@/lib/studio/constants';
import type { StudioTrimSelection, StudioVideoMetadata } from '@/lib/studio/types';
import { timelineWindow } from '@/lib/studio/timeline';

type TimelineDragMode = 'start' | 'end' | 'range';

export function useTimelineSelection(
  videoRef: RefObject<HTMLVideoElement | null>,
  metadata: StudioVideoMetadata,
  trim: StudioTrimSelection,
  onTrimChange: (startTime: number, endTime: number) => void,
) {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ mode: TimelineDragMode; offset: number } | null>(null);
  const [dragWindow, setDragWindow] = useState<ReturnType<typeof timelineWindow> | null>(null);
  const timelineView = dragWindow ?? timelineWindow(trim.startTime, trim.endTime, metadata.duration);
  const previewStart = Number.isFinite(trim.startTime) ? trim.startTime : 0;
  const previewEnd = Number.isFinite(trim.endTime) ? trim.endTime : previewStart;

  const seekPreviewToSelection = useCallback(() => {
    const video = videoRef.current;
    // iOS can stall permanently if a metadata-only video is seeked before
    // decoding its first frame. Cue it when loadeddata arrives instead.
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    try {
      video.currentTime = previewStart;
    } catch {
      // Browser metadata can lag behind React state during source changes.
    }
  }, [previewStart, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    seekPreviewToSelection();
    video?.addEventListener('loadeddata', seekPreviewToSelection);
    return () => video?.removeEventListener('loadeddata', seekPreviewToSelection);
  }, [seekPreviewToSelection, videoRef]);

  const clampTime = useCallback(
    (value: number) => (Number.isFinite(value) ? Math.max(0, Math.min(value, metadata.duration)) : 0),
    [metadata.duration],
  );

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const bounds = timelineRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width <= 0 || metadata.duration <= 0) return trim.startTime;
      const ratio = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      return clampTime(timelineView.start + ratio * timelineView.span);
    },
    [clampTime, metadata.duration, trim.startTime, timelineView.start, timelineView.span],
  );

  const applyDrag = useCallback(
    (clientX: number, mode: TimelineDragMode, offset: number) => {
      const pointerTime = timeFromClientX(clientX) - offset;
      if (mode === 'start') {
        onTrimChange(
          clampTime(
            Math.max(trim.endTime - STUDIO_MAX_EXPORT_DURATION_SECONDS, Math.min(pointerTime, trim.endTime - 0.1)),
          ),
          trim.endTime,
        );
        return;
      }
      if (mode === 'end') {
        const maxEnd = Math.min(metadata.duration, trim.startTime + STUDIO_MAX_EXPORT_DURATION_SECONDS);
        onTrimChange(trim.startTime, Math.max(trim.startTime + 0.1, Math.min(pointerTime, maxEnd)));
        return;
      }
      const nextStart = Math.max(0, Math.min(pointerTime, Math.max(0, metadata.duration - trim.duration)));
      onTrimChange(nextStart, nextStart + trim.duration);
    },
    [clampTime, metadata.duration, onTrimChange, timeFromClientX, trim.duration, trim.endTime, trim.startTime],
  );

  const beginDrag = useCallback(
    (event: ReactPointerEvent, mode: TimelineDragMode) => {
      event.preventDefault();
      event.stopPropagation();
      setDragWindow(timelineView);
      const pointerTime = timeFromClientX(event.clientX);
      const railClick = event.currentTarget === timelineRef.current;
      const offset =
        mode === 'range'
          ? railClick
            ? trim.duration / 2
            : Math.max(0, Math.min(trim.duration, pointerTime - trim.startTime))
          : pointerTime - (mode === 'start' ? trim.startTime : trim.endTime);
      dragRef.current = { mode, offset };
      applyDrag(event.clientX, mode, offset);
    },
    [applyDrag, timeFromClientX, trim.duration, trim.startTime, trim.endTime, timelineView],
  );

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      event.preventDefault();
      applyDrag(event.clientX, drag.mode, drag.offset);
    };
    const stop = () => {
      dragRef.current = null;
      setDragWindow(null);
    };
    globalThis.addEventListener('pointermove', move);
    globalThis.addEventListener('pointerup', stop);
    globalThis.addEventListener('pointercancel', stop);
    return () => {
      globalThis.removeEventListener('pointermove', move);
      globalThis.removeEventListener('pointerup', stop);
      globalThis.removeEventListener('pointercancel', stop);
    };
  }, [applyDrag]);

  return {
    timelineRef,
    beginDrag,
    previewStart,
    previewEnd,
    seekPreviewToSelection,
    timelineView,
    startPercent: timelineView.span > 0 ? ((trim.startTime - timelineView.start) / timelineView.span) * 100 : 0,
    widthPercent: timelineView.span > 0 ? (trim.duration / timelineView.span) * 100 : 0,
  };
}

export type TimelineSelectionController = ReturnType<typeof useTimelineSelection>;
