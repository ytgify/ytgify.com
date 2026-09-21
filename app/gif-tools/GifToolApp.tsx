'use client';
import { useRef } from 'react';
import { formatMediaSize } from '@/lib/media/file-size';
import { GIF_PROCESSING_SAFETY_TIMEOUT_SECONDS } from '@/lib/media/gif/processing-policy';

import { trackToolEvent } from '@/lib/media/analytics';
import { gifTools, type GifTool } from './catalog';
import { useGifTool } from './useGifTool';
import ToolSettings from './ToolSettings';
import GifPreview from './GifPreview';
import ResultPanel from './ResultPanel';

function SourcePicker({
  picker,
  choose,
}: {
  picker: React.RefObject<HTMLInputElement | null>;
  choose: (file: File) => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.035] p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div>
        <p className="font-bold text-white">Start with an animated GIF</p>
        <p className="mt-1 text-sm leading-6 text-gray-400">Your file is read locally and never leaves this browser.</p>
      </div>
      <button
        type="button"
        onClick={() => picker.current?.click()}
        className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff3f8e] to-[#9d54df] px-5 py-3 font-bold text-white shadow-[0_12px_30px_rgba(233,30,140,0.25)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ff3ea] sm:mt-0"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          +
        </span>
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
  );
}

export default function GifToolApp({ tool }: { tool: GifTool }) {
  const controller = useGifTool(tool);
  const picker = useRef<HTMLInputElement>(null);
  const { job, file, source, sourceNotice, metadata, result, outputUrl, resultHeading, choose } = controller;
  return (
    <section
      aria-label={gifTools[tool].title}
      data-testid="gif-compressor-workspace"
      className="relative my-10 space-y-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#101116]/95 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff4f9a] to-transparent"
      />
      <SourcePicker picker={picker} choose={choose} />
      {file && sourceNotice ? (
        <p
          aria-live="polite"
          data-testid="source-size-notice"
          className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100"
        >
          {sourceNotice}
        </p>
      ) : null}
      {metadata && source && file ? (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 break-all text-sm font-semibold text-white">Loaded GIF: {file.name}</p>
            <p className="flex-shrink-0 text-sm text-gray-400">
              {metadata.width} × {metadata.height} · {metadata.frameCount} frames ·{' '}
              {(metadata.duration / 1000).toFixed(2)} seconds per cycle · {formatMediaSize(file.size)}
            </p>
          </div>
          {metadata.normalizedTiming ? (
            <p className="text-sm text-amber-200">
              Missing or very short frame delays are interpreted as 100 ms. New encodings use that timing; an unchanged
              original keeps its original bytes.
            </p>
          ) : null}
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
            <GifPreview key={source} url={source} label="Original" />
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 sm:p-6">
              <ToolSettings tool={tool} controller={controller} />
            </div>
          </div>
        </>
      ) : null}
      <p
        data-testid="processing-expectations"
        className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs leading-5 text-gray-400"
      >
        Processing speed depends on your device and browser. Progress and cancellation remain available while work runs.
        A job that reaches {GIF_PROCESSING_SAFETY_TIMEOUT_SECONDS} seconds stops so you can try a smaller GIF or a
        higher target.
      </p>
      {job.busy ? (
        <div className="space-y-3 rounded-2xl border border-[#9ff3ea]/20 bg-[#9ff3ea]/5 p-4">
          <progress
            aria-label="Processing progress"
            max="100"
            value={job.progress.value}
            className="h-2 w-full accent-[#9ff3ea]"
          />
          <button
            type="button"
            onClick={() => {
              job.cancel();
              trackToolEvent(tool, 'cancel');
            }}
            className="rounded-lg border border-gray-500 px-4 py-2 text-sm font-semibold"
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
          <h2 ref={resultHeading} tabIndex={-1} className="mb-4 text-2xl font-black tracking-tight">
            Result
          </h2>
          <ResultPanel result={result} originalSize={file.size} url={outputUrl} tool={tool} />
        </div>
      ) : null}
    </section>
  );
}
