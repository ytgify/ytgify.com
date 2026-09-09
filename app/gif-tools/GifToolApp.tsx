'use client';
import { formatMediaSize } from '@/lib/media/file-size';

import { trackToolEvent } from '@/lib/media/analytics';
import { gifTools, type GifTool } from './catalog';
import { useGifTool } from './useGifTool';
import ToolSettings from './ToolSettings';
import GifPreview from './GifPreview';
import ResultPanel from './ResultPanel';

export default function GifToolApp({ tool }: { tool: GifTool }) {
  const controller = useGifTool(tool);
  const { job, file, source, metadata, result, outputUrl, resultHeading, choose } = controller;
  return (
    <section
      aria-label={gifTools[tool].title}
      className="my-8 space-y-6 rounded-2xl border border-gray-700 bg-gray-950 p-5 sm:p-8"
    >
      <label className="block font-semibold">
        Choose a GIF
        <input
          type="file"
          accept="image/gif,.gif"
          className="mt-3 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#9ff3ea] file:px-4 file:py-3 file:font-semibold file:text-gray-950"
          onChange={(event) => {
            const next = event.target.files?.[0];
            event.target.value = '';
            if (next) choose(next);
          }}
        />
      </label>
      {metadata && source && file ? (
        <>
          <p className="text-sm text-gray-300">
            {metadata.width} × {metadata.height} · {metadata.frameCount} frames ·{' '}
            {(metadata.duration / 1000).toFixed(2)} seconds per cycle · {formatMediaSize(file.size)}
          </p>
          {metadata.normalizedTiming ? (
            <p className="text-sm text-amber-200">
              Missing or very short frame delays are interpreted as 100 ms. New encodings use that timing; an unchanged
              original keeps its original bytes.
            </p>
          ) : null}
          <GifPreview key={source} url={source} label="Original" />
          <ToolSettings tool={tool} controller={controller} />
        </>
      ) : null}
      {job.busy ? (
        <div className="space-y-3">
          <progress aria-label="Processing progress" max="100" value={job.progress.value} className="w-full" />
          <button
            type="button"
            onClick={() => {
              job.cancel();
              trackToolEvent(tool, 'cancel');
            }}
            className="rounded border border-gray-500 px-4 py-2"
          >
            Cancel processing
          </button>
        </div>
      ) : null}
      <p role="status" className="text-sm text-gray-300">
        {job.busy
          ? job.progress.stage
          : result
            ? 'Your file is ready.'
            : job.progress.stage.startsWith('Cancelled')
              ? job.progress.stage
              : ''}
      </p>
      {job.error ? (
        <p role="alert" className="text-red-300">
          {job.error}
        </p>
      ) : null}
      {result?.bytes && file ? (
        <div>
          <h2 ref={resultHeading} tabIndex={-1} className="mb-4 text-xl font-bold">
            Result
          </h2>
          <ResultPanel result={result} originalSize={file.size} url={outputUrl} tool={tool} />
        </div>
      ) : null}
    </section>
  );
}
