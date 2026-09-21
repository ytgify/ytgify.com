'use client';
/* Native images preserve animated local blob playback; Next image optimization would change that behavior. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react';

function localBlobUrl(url: string) {
  // Preview sources are object URLs created in useGifTool; reject every external URL scheme.
  return url.startsWith('blob:') ? url : undefined;
}

export default function GifPreview({ url, label }: { url: string; label: string }) {
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(true);
  const previewUrl = localBlobUrl(url);
  const freeze = () => {
    if (!image.current || !canvas.current) return;
    canvas.current.width = image.current.naturalWidth;
    canvas.current.height = image.current.naturalHeight;
    canvas.current.getContext('2d')?.drawImage(image.current, 0, 0);
  };
  if (!previewUrl) return null;
  return (
    <figure className="min-w-0 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <figcaption className="flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-gray-400">
          Preview
        </span>
      </figcaption>
      <div className="gif-preview-stage flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] p-4">
        <img
          ref={image}
          src={previewUrl}
          alt={`${label} animation`}
          className={`max-h-64 max-w-full object-contain ${playing ? '' : 'hidden'}`}
          onLoad={freeze}
        />
        <canvas
          ref={canvas}
          aria-label={`${label} paused frame`}
          className={`max-h-64 max-w-full object-contain ${playing ? 'hidden' : ''}`}
        />
      </div>
      <button
        type="button"
        className="text-sm font-semibold text-[#9ff3ea] underline decoration-[#9ff3ea]/40 underline-offset-4"
        onClick={() => {
          if (playing) freeze();
          setPlaying(!playing);
        }}
      >
        {playing ? 'Pause' : 'Play'} {label.toLowerCase()}
      </button>
    </figure>
  );
}
