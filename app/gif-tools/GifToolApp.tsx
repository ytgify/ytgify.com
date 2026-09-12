'use client';
import { useRef } from 'react';
import { formatMediaSize } from '@/lib/media/file-size';

import { trackToolEvent } from '@/lib/media/analytics';
import { gifTools, type GifTool } from './catalog';
import { useGifTool } from './useGifTool';
import ToolSettings from './ToolSettings';
import GifPreview from './GifPreview';
import ResultPanel from './ResultPanel';

export default function GifToolApp({ tool }: { tool: GifTool }) {
  const controller = useGifTool(tool);
  const picker = useRef<HTMLInputElement>(null);
  const { job, file, source, metadata, result, outputUrl, resultHeading, choose } = controller;
  return (
    <section
      aria-label={gifTools[tool].title}
      className="my-8 space-y-6 rounded-2xl border border-gray-700 bg-gray-950 p-5 sm:p-8"
    >
      <div>
        <button
          type="button"
          onClick={() => picker.current?.click()}
          className="rounded-lg bg-[#9ff3ea] px-4 py-3 font-semibold text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ff3ea]"
        >
          Choose a GIF
        </button>
        <input
          ref={picker}
          type="file"
          accept="image/gif,.gif"
          aria-label="Choose a GIF"
          hidden
          onChange={(event) => {
            const next = event.target.files?.[0];
            event.target.value = '';
            if (next) choose(next);
          }}
        />
      </div>
      {metadata && source && file ? (
        <>
          <p className="break-all text-sm text-gray-300">Loaded GIF: {file.name}</p>
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
