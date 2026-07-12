import { CheckCircle2, ChevronLeft, Download, RotateCcw } from 'lucide-react';
import { trackStudioEvent, studioFileSizeBucket } from '@/lib/studio/analytics';
import { formatFileSize } from '@/lib/studio/file-validation';
import { formatTime } from '@/lib/studio/presets';
import type { StudioExportResult } from '@/lib/studio/types';
import { MetadataItem, WizardHeader } from './shared';

export function SuccessScreen({
  result,
  nextTool,
  setNextTool,
  onBack,
  onReset,
}: {
  result: StudioExportResult;
  nextTool: string;
  setNextTool: (value: string) => void;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <WizardHeader eyebrow="Success" title="GIF Created Successfully!" helper="Your GIF is ready!" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {/* The final animated GIF is already encoded in a local blob URL; image optimization cannot improve it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.url}
            alt="Generated GIF preview"
            className="w-full rounded-xl border border-gray-800 bg-black"
          />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <MetadataItem label="Size" value={formatFileSize(result.fileSize)} />
            <MetadataItem label="Dimensions" value={`${result.width}x${result.height}`} />
            <MetadataItem label="Duration" value={formatTime(result.duration)} />
            <MetadataItem label="Frames" value={String(result.frameCount)} />
            <MetadataItem label="Encoder" value="gifenc" />
          </dl>
        </div>
        <section className="rounded-xl border border-gray-800 bg-black/10 p-4">
          <div className="mb-4 flex items-center gap-2 text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="text-lg font-bold">GIF ready</h2>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex w-full items-center justify-center gap-2 border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Edit clip
            </button>
            <a
              href={result.url}
              download="ytgify-video-to-gif.gif"
              onClick={() =>
                trackStudioEvent('studio_download_clicked', {
                  output_file_size_bucket: studioFileSizeBucket(result.fileSize),
                })
              }
              className="inline-flex w-full items-center justify-center gap-2 bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80]"
            >
              <Download className="h-4 w-4" />
              Download GIF
            </a>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex w-full items-center justify-center gap-2 border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Make another
            </button>
          </div>
          <label className="mt-5 block text-sm font-semibold text-gray-300">
            What should YTgify add next?
            <select
              value={nextTool}
              onChange={(event) => {
                setNextTool(event.target.value);
                if (event.target.value) {
                  trackStudioEvent('studio_next_tool_selected', { next_tool: event.target.value });
                }
              }}
              className="mt-2 w-full border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-[#E91E8C]"
            >
              <option value="">Choose one</option>
              <option value="gif_optimizer">GIF optimizer</option>
              <option value="captioned_gif_maker">Captioned GIF maker</option>
              <option value="screen_to_gif">Screen to GIF</option>
              <option value="share_links">Share links</option>
            </select>
          </label>
        </section>
      </div>
    </div>
  );
}
