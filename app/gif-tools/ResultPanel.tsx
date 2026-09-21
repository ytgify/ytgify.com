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
    <div className="space-y-5 rounded-2xl border border-[#9ff3ea]/20 bg-[#9ff3ea]/[0.045] p-5 sm:p-6">
      <GifPreview key={url} url={url} label="Output" />
      <div className="grid gap-3 text-center sm:grid-cols-3">
        <p className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
          <span className="block text-xs uppercase tracking-wider text-gray-500">Size</span>
          <span className="mt-1 block font-black text-white">{formatMediaSize(size)}</span>
        </p>
        <p className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
          <span className="block text-xs uppercase tracking-wider text-gray-500">Dimensions</span>
          <span className="mt-1 block font-black text-white">
            {result.width} × {result.height}
          </span>
        </p>
        <p className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
          <span className="block text-xs uppercase tracking-wider text-gray-500">Animation</span>
          <span className="mt-1 block font-black text-white">
            {result.mime === 'image/gif' ? `${result.frameCount} frames` : `${(result.duration / 1000).toFixed(2)}s`}
          </span>
        </p>
      </div>
      <p className="text-center text-xs text-gray-400">
        {formatMediaSize(size)} · {(result.duration / 1000).toFixed(2)} seconds
        {result.mime === 'image/gif' ? ' per cycle' : ''}
      </p>
      <p className="text-sm font-semibold text-gray-300">
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
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#9ff3ea] px-6 py-3 font-black text-gray-950 transition-transform hover:-translate-y-0.5 sm:w-auto"
      >
        Download GIF
      </a>
    </div>
  );
}
