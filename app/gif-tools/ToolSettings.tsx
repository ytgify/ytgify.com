'use client';
import { gifTools, type GifTool } from './catalog';
import type { useGifTool } from './useGifTool';
import ResizeControls from './ResizeControls';
export default function ToolSettings({
  tool,
  controller,
}: {
  tool: GifTool;
  controller: ReturnType<typeof useGifTool>;
}) {
  const {
    job,
    setResult,
    target,
    setTarget,
    allowResize,
    allowFrameReduction,
    setAllowFrameReduction,
    setAllowResize,
    cycles,
    setCycles,
    background,
    setBackground,
    geometry,
    setGeometry,
    metadata,
    source,
    process,
  } = controller;
  if (!metadata) return null;
  return (
    <fieldset disabled={job.busy} onChange={() => setResult(null)} className="space-y-4 disabled:opacity-60">
      <legend className="mb-3 font-semibold">Output settings</legend>
      {tool === 'gif-compressor' ? (
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
          <div className="flex gap-3">
            {[1, 5, 10].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setTarget(value);
                  setResult(null);
                }}
                className="rounded border border-gray-600 px-3 py-2 text-sm"
              >
                {value} MB
              </button>
            ))}
          </div>
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
            1 MB is 1,000,000 bytes. A target is a request, not a guarantee. We keep the original if no smaller
            candidate passes the quality check.
          </p>
        </>
      ) : tool === 'resize-gif' ? (
        <ResizeControls
          value={geometry}
          onChange={(value) => {
            setGeometry(value);
            setResult(null);
          }}
          width={metadata.width}
          height={metadata.height}
          url={source}
          disabled={job.busy}
        />
      ) : (
        <>
          <label className="block text-sm">
            Animation cycles
            <select
              value={cycles}
              onChange={(event) => setCycles(Number(event.target.value))}
              className="ml-3 rounded border border-gray-600 bg-gray-900 p-2"
            >
              {[1, 2, 3].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm">
            Transparency background
            <input type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
          </label>
          <p className="text-sm text-gray-400">
            MP4 has no transparency or infinite loops. Dimensions are padded to even values, at least 16 × 16. H.264
            encoding must be available in your browser.
          </p>
        </>
      )}
      <button type="button" onClick={process} className="rounded-xl bg-[#9ff3ea] px-6 py-3 font-semibold text-gray-950">
        {gifTools[tool].action}
      </button>
    </fieldset>
  );
}
