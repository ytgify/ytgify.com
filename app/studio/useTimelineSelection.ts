import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { STUDIO_MAX_EXPORT_DURATION_SECONDS } from '@/lib/studio/constants';
import type { StudioTrimSelection, StudioVideoMetadata } from '@/lib/studio/types';

type TimelineDragMode = 'start' | 'end' | 'range';

export function useTimelineSelection(
  videoRef: RefObject<HTMLVideoElement | null>,
  metadata: StudioVideoMetadata,
  trim: StudioTrimSelection,
  onTrimChange: (startTime: number, endTime: number) => void,
) {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ mode: TimelineDragMode; offset: number } | null>(null);
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

  useEffect(() => seekPreviewToSelection(), [seekPreviewToSelection]);

  const clampTime = useCallback(
    (value: number) => (Number.isFinite(value) ? Math.max(0, Math.min(value, metadata.duration)) : 0),
    [metadata.duration],
  );

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const bounds = timelineRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width <= 0 || metadata.duration <= 0) return trim.startTime;
      const ratio = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      return clampTime(ratio * metadata.duration);
    },
    [clampTime, metadata.duration, trim.startTime],
  );

  const applyDrag = useCallback(
    (clientX: number, mode: TimelineDragMode, offset: number) => {
      const pointerTime = timeFromClientX(clientX);
      if (mode === 'start') {
        onTrimChange(clampTime(Math.min(pointerTime, trim.endTime - 0.5)), trim.endTime);
        return;
      }
      if (mode === 'end') {
        const maxEnd = Math.min(metadata.duration, trim.startTime + STUDIO_MAX_EXPORT_DURATION_SECONDS);
        onTrimChange(trim.startTime, Math.max(trim.startTime + 0.5, Math.min(pointerTime, maxEnd)));
        return;
      }
      const nextStart = Math.max(0, Math.min(pointerTime - offset, Math.max(0, metadata.duration - trim.duration)));
      onTrimChange(nextStart, nextStart + trim.duration);
    },
    [clampTime, metadata.duration, onTrimChange, timeFromClientX, trim.duration, trim.endTime, trim.startTime],
  );

  const beginDrag = useCallback(
    (event: ReactPointerEvent, mode: TimelineDragMode) => {
      event.preventDefault();
      event.stopPropagation();
      const pointerTime = timeFromClientX(event.clientX);
      const railClick = event.currentTarget === timelineRef.current;
      const offset =
        mode === 'range'
          ? railClick
            ? trim.duration / 2
            : Math.max(0, Math.min(trim.duration, pointerTime - trim.startTime))
          : 0;
      dragRef.current = { mode, offset };
      applyDrag(event.clientX, mode, offset);
    },
    [applyDrag, timeFromClientX, trim.duration, trim.startTime],
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
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [applyDrag]);

  return {
    timelineRef,
    beginDrag,
    previewStart,
    previewEnd,
    seekPreviewToSelection,
    startPercent: metadata.duration > 0 ? (trim.startTime / metadata.duration) * 100 : 0,
    widthPercent: metadata.duration > 0 ? (trim.duration / metadata.duration) * 100 : 0,
  };
}

export type TimelineSelectionController = ReturnType<typeof useTimelineSelection>;
