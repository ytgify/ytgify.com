import type { StudioCaptionSettings } from './types';

const MAX_LINES = 2;
const captionColors: Record<StudioCaptionSettings['color'], string> = {
  white: '#ffffff',
  yellow: '#ffe45c',
};
const captionSizeRatios: Record<StudioCaptionSettings['size'], number> = {
  standard: 0.075,
  large: 0.095,
};

export interface CaptionLayout {
  fontSize: number;
  lineHeight: number;
  horizontalPadding: number;
  verticalPadding: number;
  maxTextWidth: number;
  fillStyle: string;
  strokeStyle: string;
  strokeWidth: number;
}

export function hasCaptions(captions: StudioCaptionSettings): boolean {
  return Boolean(captions.topText.trim() || captions.bottomText.trim());
}

export function renderCaptions(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  captions: StudioCaptionSettings,
  width: number,
  height: number,
): void {
  const layout = getCaptionLayout(width, height, captions);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${layout.fontSize}px Inter, Arial, sans-serif`;
  ctx.lineJoin = 'round';
  ctx.fillStyle = layout.fillStyle;
  ctx.strokeStyle = layout.strokeStyle;
  ctx.lineWidth = layout.strokeWidth;

  drawCaptionBlock(
    ctx,
    captions.topText,
    width / 2,
    layout.verticalPadding + layout.lineHeight / 2,
    layout.maxTextWidth,
    layout.lineHeight,
    'top',
  );
  drawCaptionBlock(
    ctx,
    captions.bottomText,
    width / 2,
    height - layout.verticalPadding - layout.lineHeight / 2,
    layout.maxTextWidth,
    layout.lineHeight,
    'bottom',
  );

  ctx.restore();
}

export function getCaptionLayout(width: number, height: number, captions: StudioCaptionSettings): CaptionLayout {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const fontSize = Math.max(18, Math.round(safeHeight * captionSizeRatios[captions.size]));
  const lineHeight = Math.round(fontSize * 1.16);
  const horizontalPadding = Math.round(safeWidth * 0.07);
  const verticalPadding = Math.round(safeHeight * 0.08);

  return {
    fontSize,
    lineHeight,
    horizontalPadding,
    verticalPadding,
    maxTextWidth: safeWidth - horizontalPadding * 2,
    fillStyle: captionColors[captions.color],
    strokeStyle: '#000000',
    strokeWidth: Math.max(4, Math.round(fontSize * 0.16)),
  };
}

function drawCaptionBlock(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  placement: 'top' | 'bottom',
): void {
  const lines = wrapCaptionText(ctx, text.trim(), maxWidth);
  if (lines.length === 0) return;

  const blockHeight = (lines.length - 1) * lineHeight;
  const firstY = placement === 'top' ? y : y - blockHeight;

  lines.forEach((line, index) => {
    const lineY = firstY + index * lineHeight;
    ctx.strokeText(line, x, lineY, maxWidth);
    ctx.fillText(line, x, lineY, maxWidth);
  });
}

function wrapCaptionText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  if (!text) return [];

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
      continue;
    }

    lines.push(current);
    current = word;

    if (lines.length === MAX_LINES) break;
  }

  if (current && lines.length < MAX_LINES) {
    lines.push(current);
  }

  if (lines.length === MAX_LINES && words.join(' ') !== lines.join(' ')) {
    const last = lines[MAX_LINES - 1];
    lines[MAX_LINES - 1] = last.length > 1 ? `${last.replace(/\s+\S+$/, '') || last.slice(0, -1)}...` : last;
  }

  return lines;
}
