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
    targetInput,
    targetError,
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
    <fieldset disabled={job.busy} onChange={() => setResult(null)} className="space-y-5 disabled:opacity-60">
      <legend className="mb-4 text-lg font-black">Tune the output</legend>
      <>
        <label className="block text-sm font-semibold text-gray-200">
          Target size
          <span className="ml-1 font-normal text-gray-500">(MB)</span>
          <input
            ref={targetInput}
            type="number"
            aria-label="Target size (MB)"
            min="0.000001"
            max="25"
            step="any"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            aria-invalid={targetError ? true : undefined}
            aria-describedby={targetError ? 'gif-target-error' : undefined}
            className="mt-2 block w-full rounded-xl border border-white/15 bg-[#0b0c10] px-3 py-2.5 text-base font-semibold text-white outline-none transition-colors focus:border-[#9ff3ea]"
          />
        </label>
        {targetError ? (
          <p id="gif-target-error" role="alert" className="text-sm text-red-300">
            {targetError}
          </p>
        ) : null}
        <div className="grid grid-cols-3 gap-2">
          {[...(file && file.size < 1_000_000 ? [0.01, 0.025, 0.1] : []), 1, 5, 10].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={target.trim() !== '' && Number(target) === value}
              onClick={() => {
                setTarget(String(value));
                setResult(null);
              }}
              className="rounded-lg border border-white/10 bg-white/[0.035] px-2 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-white/25 aria-pressed:border-[#9ff3ea] aria-pressed:bg-[#9ff3ea] aria-pressed:text-gray-950"
            >
              {formatMediaSize(value * 1_000_000)}
            </button>
          ))}
        </div>
        {file && file.size <= Number(target) * 1_000_000 ? (
          <p className="text-sm text-amber-200">
            Your GIF is already below this target ({formatMediaSize(file.size)}). Choose a target below its original
            size to try to make it smaller.
          </p>
        ) : null}
        <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-sm leading-5 text-gray-300">
          <input
            className="mt-0.5 accent-[#ff4f9a]"
            type="checkbox"
            checked={allowResize}
            onChange={(event) => setAllowResize(event.target.checked)}
          />
          Allow smaller dimensions (75% or 50%)
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-sm leading-5 text-gray-300">
          <input
            className="mt-0.5 accent-[#ff4f9a]"
            type="checkbox"
            checked={allowFrameReduction}
            onChange={(event) => setAllowFrameReduction(event.target.checked)}
          />
          Allow lower frame rate (keeps total duration)
        </label>
        <p className="text-xs leading-5 text-gray-500">
          Choose a target, then click Compress GIF to apply it. We keep the original if no smaller candidate passes the
          quality check.
        </p>
      </>
      <button
        type="button"
        onClick={process}
        className="w-full rounded-xl bg-[#9ff3ea] px-6 py-3.5 font-black text-gray-950 shadow-[0_12px_30px_rgba(159,243,234,0.16)] transition-transform hover:-translate-y-0.5"
      >
        {gifTools[tool].action}
      </button>
    </fieldset>
  );
}
