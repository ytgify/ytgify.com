'use client';
import { formatMediaSize } from '@/lib/media/file-size';
import { gifTools, type GifTool } from './catalog';
import type { useGifTool } from './useGifTool';
export default function ToolSettings({
  tool,
  controller,
}: {
  tool: GifTool;
  controller: ReturnType<typeof useGifTool>;
}) {
  const {
    job,
    file,
    setResult,
    target,
    setTarget,
    allowResize,
    allowFrameReduction,
    setAllowFrameReduction,
    setAllowResize,
    metadata,
    process,
  } = controller;
  if (!metadata) return null;
  return (
    <fieldset disabled={job.busy} onChange={() => setResult(null)} className="space-y-4 disabled:opacity-60">
      <legend className="mb-3 font-semibold">Output settings</legend>
      <>
        <label className="block text-sm">
          Target size (MB)
          <input
            type="number"
            min="0.000001"
            max="25"
            step="any"
            value={target}
            onChange={(event) => setTarget(Number(event.target.value))}
            className="ml-3 w-28 rounded border border-gray-600 bg-gray-900 p-2"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          {[...(file && file.size < 1_000_000 ? [0.01, 0.025, 0.1] : []), 1, 5, 10].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={target === value}
              onClick={() => {
                setTarget(value);
                setResult(null);
              }}
              className="rounded border border-gray-600 px-3 py-2 text-sm aria-pressed:border-[#9ff3ea] aria-pressed:bg-[#9ff3ea] aria-pressed:font-semibold aria-pressed:text-gray-950"
            >
              {formatMediaSize(value * 1_000_000)}
            </button>
          ))}
        </div>
        {file && file.size <= target * 1_000_000 ? (
          <p className="text-sm text-amber-200">
            Your GIF is already below this target ({formatMediaSize(file.size)}). Choose a target below its original
            size to try to make it smaller.
          </p>
        ) : null}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allowResize} onChange={(event) => setAllowResize(event.target.checked)} />
          Allow smaller dimensions (75% or 50%)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowFrameReduction}
            onChange={(event) => setAllowFrameReduction(event.target.checked)}
          />
          Allow lower frame rate (keeps total duration)
        </label>
        <p className="text-sm text-gray-400">
          Choose a target, then click Compress GIF to apply it. We keep the original if no smaller candidate passes the
          quality check.
        </p>
      </>
      <button type="button" onClick={process} className="rounded-xl bg-[#9ff3ea] px-6 py-3 font-semibold text-gray-950">
        {gifTools[tool].action}
      </button>
    </fieldset>
  );
}
