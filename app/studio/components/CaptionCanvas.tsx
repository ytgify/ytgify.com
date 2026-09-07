import { useEffect, useRef } from 'react';
import { renderCaptions } from '@/lib/studio/captions';
import { calculateOutputDimensions } from '@/lib/studio/resolution';
import type { StudioCaptionSettings, StudioResolution, StudioVideoMetadata } from '@/lib/studio/types';

export function CaptionCanvas({
  metadata,
  resolution,
  captions,
}: {
  metadata: StudioVideoMetadata;
  resolution: StudioResolution;
  captions: StudioCaptionSettings;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = calculateOutputDimensions(metadata.width, metadata.height, resolution);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let active = true;
    const draw = () => {
      if (!active) return;
      ctx.clearRect(0, 0, width, height);
      renderCaptions(ctx, captions, width, height);
    };
    draw();
    void document.fonts.ready.then(draw);
    return () => {
      active = false;
    };
  }, [captions, width, height]);
  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      aria-label="Caption preview"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
