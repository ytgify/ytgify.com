import { AlertCircle, ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { STUDIO_CAPTION_MAX_LENGTH } from '@/lib/studio/constants';
import { getCaptionLayout } from '@/lib/studio/captions';
import type { StudioCaptionSettings, StudioError, StudioVideoMetadata } from '@/lib/studio/types';

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

export function OptionSection({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
        <span className="text-[#4fd1c5]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  );
}

export function OptionButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[86px] rounded-xl border px-4 py-3 text-left transition-colors ${
        active
          ? 'border-[#E91E8C] bg-[#E91E8C]/15 text-white'
          : 'border-gray-800 bg-gray-900/70 text-gray-300 hover:border-gray-600 hover:text-white'
      }`}
    >
      <span className="block text-sm font-bold">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-gray-400">{description}</span>
    </button>
  );
}

export function TimeInput({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-300">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        step={0.1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none transition-colors focus:border-[#E91E8C]"
      />
    </label>
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
        className="mt-2 w-full accent-[#E91E8C]"
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

export function CaptionOverlay({
  placement,
  metadata,
  captions,
  children,
}: {
  placement: 'top' | 'bottom';
  metadata: StudioVideoMetadata;
  captions: StudioCaptionSettings;
  children: string;
}) {
  if (!children.trim()) return null;
  const layout = getCaptionLayout(metadata.width, metadata.height, captions);

  return (
    <div
      className="pointer-events-none absolute left-1/2 max-w-[86%] -translate-x-1/2 text-center font-black uppercase [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]"
      style={{
        [placement]: `${layout.verticalPadding}px`,
        color: layout.fillStyle,
        fontSize: `${layout.fontSize}px`,
        lineHeight: `${layout.lineHeight}px`,
        WebkitTextStroke: `${layout.strokeWidth}px ${layout.strokeStyle}`,
      }}
    >
      {children}
    </div>
  );
}

export function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-3">
      <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
      <dd className="mt-1 font-semibold text-gray-100">{value}</dd>
    </div>
  );
}

export function InfoPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/70 p-3">
      <span className="text-[#4fd1c5]">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase text-gray-500">{label}</span>
        <span className="font-semibold text-gray-100">{value}</span>
      </span>
    </div>
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
