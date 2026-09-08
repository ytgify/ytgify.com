'use client';
/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type PointerEvent } from 'react';
import type { Geometry } from '@/lib/media/gif/geometry';

export default function ResizeControls({
  value,
  onChange,
  width,
  height,
  url,
  disabled,
}: {
  value: Geometry;
  onChange: (value: Geometry) => void;
  width: number;
  height: number;
  url: string;
  disabled: boolean;
}) {
  const [locked, setLocked] = useState(true);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const update = (key: keyof Geometry, next: number) => {
    const changed = { ...value, [key]: next };
    if (locked && key === 'width')
      changed.height = Math.max(1, Math.round((next * value.cropHeight) / value.cropWidth));
    if (locked && key === 'height')
      changed.width = Math.max(1, Math.round((next * value.cropWidth) / value.cropHeight));
    if (locked && (key === 'cropWidth' || key === 'cropHeight'))
      changed.height = Math.max(1, Math.round((changed.width * changed.cropHeight) / changed.cropWidth));
    onChange(changed);
  };
  const point = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(width - 1, Math.floor(((event.clientX - box.left) * width) / box.width))),
      y: Math.max(0, Math.min(height - 1, Math.floor(((event.clientY - box.top) * height) / box.height))),
    };
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!origin.current || disabled) return;
    const current = point(event);
    const cropWidth = Math.abs(current.x - origin.current.x) + 1;
    const cropHeight = Math.abs(current.y - origin.current.y) + 1;
    onChange({
      ...value,
      left: Math.min(current.x, origin.current.x),
      top: Math.min(current.y, origin.current.y),
      cropWidth,
      cropHeight,
      height: locked ? Math.max(1, Math.round((value.width * cropHeight) / cropWidth)) : value.height,
    });
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-300">
        Drag a region to crop, or enter exact coordinates below. Resize uses crisp nearest-neighbor sampling.
      </p>
      <div
        className="relative max-w-lg overflow-hidden rounded-lg bg-gray-800"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <img src={url} alt="GIF crop reference" className="h-full w-full" draggable={false} />
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={(event) => {
            if (disabled) return;
            origin.current = point(event);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={move}
          onPointerUp={(event) => {
            move(event);
            origin.current = null;
          }}
          onPointerCancel={() => {
            origin.current = null;
          }}
        >
          <rect
            x={value.left}
            y={value.top}
            width={value.cropWidth}
            height={value.cropHeight}
            fill="rgba(79,209,197,0.15)"
            stroke="#4fd1c5"
            strokeWidth={Math.max(1, width / 180)}
          />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {(
          [
            ['left', 'Crop left'],
            ['top', 'Crop top'],
            ['cropWidth', 'Crop width'],
            ['cropHeight', 'Crop height'],
            ['width', 'Output width'],
            ['height', 'Output height'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <input
              type="number"
              min={key === 'left' || key === 'top' ? 0 : 1}
              step="1"
              value={Number.isFinite(value[key]) ? value[key] : ''}
              onChange={(event) => update(key, Number(event.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2"
            />
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={locked} onChange={(event) => setLocked(event.target.checked)} />
        Lock crop aspect ratio
      </label>
      <label className="block text-sm">
        Fit mode
        <select
          value={value.fit}
          onChange={(event) => onChange({ ...value, fit: event.target.value as Geometry['fit'] })}
          className="ml-3 rounded border border-gray-600 bg-gray-900 p-2"
        >
          <option value="stretch">Fill dimensions</option>
          <option value="contain">Fit with transparent padding</option>
        </select>
      </label>
    </div>
  );
}
