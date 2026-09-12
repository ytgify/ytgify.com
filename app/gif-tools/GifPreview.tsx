'use client';
/* Native images preserve animated local blob playback; Next image optimization would change that behavior. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react';

function localBlobUrl(url: string) {
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
    <figure className="min-w-0 space-y-3">
      <figcaption className="text-sm font-semibold">{label}</figcaption>
      <div className="flex min-h-32 items-center justify-center overflow-hidden rounded-xl bg-gray-800 p-3">
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
        className="text-sm text-[#9ff3ea] underline"
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
