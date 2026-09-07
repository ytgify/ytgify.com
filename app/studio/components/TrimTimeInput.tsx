import { useId, useState } from 'react';
import { formatClock, parseTimeInput } from '@/lib/studio/timeline';

export function TrimTimeInput({
  label,
  value,
  max,
  clock = false,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  clock?: boolean;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const formatted = clock ? formatClock(value) : value.toFixed(1);
  return (
    <label className="block min-w-0 text-sm font-semibold text-gray-300">
      {label}
      <input
        type="text"
        aria-label={label}
        inputMode={clock ? 'text' : 'decimal'}
        value={draft ?? formatted}
        aria-describedby={id}
        aria-invalid={error}
        onChange={(event) => {
          setDraft(event.target.value);
          setError(false);
        }}
        onBlur={(event) => {
          const parsed = parseTimeInput(event.target.value);
          setDraft(null);
          setError(parsed === null);
          if (parsed !== null) onChange(Math.max(clock ? 0 : 0.1, Math.min(parsed, max)));
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') {
            setDraft(null);
            setError(false);
          }
        }}
        className="mt-2 min-h-12 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base tabular-nums text-white outline-none focus:border-[#4fd1c5]"
      />
      <span id={id} className={`mt-1 block text-xs font-normal ${error ? 'text-amber-200' : 'text-gray-400'}`}>
        {error
          ? 'Invalid time. Previous value restored.'
          : clock
            ? 'Minutes:seconds, or seconds'
            : 'Seconds · up to 10'}
      </span>
    </label>
  );
}
