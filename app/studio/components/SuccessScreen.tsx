import { formatFileSize } from '@/lib/studio/file-validation';
import { sizeTargetOutcome } from '@/lib/studio/size-target';
import { trackStudioEvent } from '@/lib/studio/analytics';
import type { StudioExportResult } from '@/lib/studio/types';
import { Disclosure } from './Disclosure';
import { DownloadLink } from './DownloadLink';

export function SuccessScreen({
  result,
  nextTool,
  setNextTool,
  onBack,
  onReset,
  onSmaller,
}: {
  result: StudioExportResult;
  nextTool: string;
  setNextTool: (value: string) => void;
  onBack: () => void;
  onReset: () => void;
  onSmaller: () => void;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">GIF ready</h1>
      {/* Encoded local GIF, not a remote image to optimize. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={result.url}
        alt="Generated GIF preview"
        className="mx-auto max-h-64 w-auto max-w-full rounded-xl border border-gray-800 object-contain"
      />
      <p className="text-center text-sm text-gray-300">
        {formatFileSize(result.fileSize)} · {result.width}x{result.height} · {result.duration.toFixed(1)}s
      </p>
      <DownloadLink result={result} />
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onSmaller}
          className="min-h-11 rounded-xl border border-gray-700 px-3 text-sm font-semibold"
        >
          Make smaller
        </button>
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 rounded-xl border border-gray-700 px-3 text-sm font-semibold"
        >
          Edit clip
        </button>
      </div>
      {result.sizeTarget !== 'auto' ? (
        <p role="status" className="text-sm text-gray-400">
          {sizeTargetOutcome(result.fileSize, result.sizeTarget) === 'met'
            ? `This GIF meets your ${result.sizeTarget} MB target.`
            : `This GIF exceeds your ${result.sizeTarget} MB target. Choose Make smaller or shorten the clip.`}
        </p>
      ) : null}
      <button type="button" onClick={onReset} className="min-h-11 w-full text-sm font-semibold text-[#9ff3ea]">
        Make another
      </button>
      <Disclosure title="GIF details & feedback">
        <p className="text-sm text-gray-400">Frames: {result.frameCount}</p>
        <label className="block text-sm text-gray-300">
          What should YTgify add next?
          <select
            value={nextTool}
            onChange={(event) => {
              setNextTool(event.target.value);
              if (event.target.value) trackStudioEvent('studio_next_tool_selected', { next_tool: event.target.value });
            }}
            className="mt-2 min-h-11 w-full rounded-lg border border-gray-700 bg-gray-900 px-3"
          >
            <option value="">Choose one</option>
            <option value="gif_optimizer">GIF optimizer</option>
            <option value="captioned_gif_maker">Captioned GIF maker</option>
            <option value="screen_to_gif">Screen to GIF</option>
            <option value="share_links">Share links</option>
          </select>
        </label>
      </Disclosure>
    </div>
  );
}
