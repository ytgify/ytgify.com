'use client';
import { formatMediaSize } from '@/lib/media/file-size';
import { trackToolEvent } from '@/lib/media/analytics';
import type { GifTool } from './catalog';
import type { GifJobResult } from '@/lib/media/jobs/protocol';
import GifPreview from './GifPreview';

export default function ResultPanel({
  result,
  originalSize,
  url,
  tool,
}: {
  result: GifJobResult;
  originalSize: number;
  url: string;
  tool: GifTool;
}) {
  if (!url || !result.bytes) return null;
  const size = result.bytes.length;
  return (
    <div className="space-y-4">
      <GifPreview key={url} url={url} label="Output" />
      <p>
        {result.width} × {result.height} · {result.mime === 'image/gif' ? `${result.frameCount} frames · ` : ''}{' '}
        {formatMediaSize(size)} · {(result.duration / 1000).toFixed(2)} seconds
        {result.mime === 'image/gif' ? ' per cycle' : ''}
      </p>
      <p className="text-sm text-gray-300">
        {size < originalSize
          ? `${((1 - size / originalSize) * 100).toFixed(1)}% smaller than the original.`
          : size === originalSize
            ? 'Original size retained.'
            : `${((size / originalSize - 1) * 100).toFixed(1)}% larger than the original.`}
      </p>
      {result.targetMet !== undefined ? (
        <p className={result.targetMet ? 'text-[#9ff3ea]' : 'text-amber-200'}>
          {result.targetMet
            ? 'Target met.'
            : 'Target not met. This is the smallest acceptable result found; try a higher target or allow smaller dimensions.'}
        </p>
      ) : null}
      <a
        onClick={() => trackToolEvent(tool, 'download')}
        download={'ytgify-output.gif'}
        href={url}
        className="inline-block rounded-xl bg-[#9ff3ea] px-6 py-3 font-semibold text-gray-950"
      >
        Download GIF
      </a>
    </div>
  );
}
