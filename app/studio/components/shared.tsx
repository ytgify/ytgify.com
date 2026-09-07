import { AlertCircle, ChevronLeft } from 'lucide-react';
import { STUDIO_CAPTION_MAX_LENGTH } from '@/lib/studio/constants';
import type { StudioError } from '@/lib/studio/types';

export function WizardHeader({
  eyebrow,
  title,
  helper,
  onBack,
}: {
  eyebrow: string;
  title: string;
  helper: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase text-[#4fd1c5]">{eyebrow}</p>
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400 sm:text-base">{helper}</p>
      </div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-700 text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}

export function RangeInput({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-300">
      {label}
      <input
        type="range"
        min={min}
        max={Math.max(min, max)}
        step={0.1}
        value={Math.min(value, Math.max(min, max))}
        aria-label={label}
        className="mt-2 h-11 w-full accent-[#E91E8C]"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function CaptionInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-4 block text-sm font-semibold text-gray-300 last:mb-0">
      {label}
      <input
        type="text"
        maxLength={STUDIO_CAPTION_MAX_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#E91E8C]"
        placeholder="Optional caption"
      />
      <span className="mt-1 block text-xs text-gray-500">
        {value.length}/{STUDIO_CAPTION_MAX_LENGTH}
      </span>
    </label>
  );
}

export function ErrorNotice({ error, onReset }: { error: StudioError; onReset: () => void }) {
  return (
    <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
        <div>
          <p className="font-semibold text-red-100">{error.message}</p>
          <p className="mt-1 text-sm leading-6 text-red-200/80">{error.action}</p>
          <button
            type="button"
            onClick={onReset}
            className="mt-3 text-sm font-semibold text-white underline underline-offset-4"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}
