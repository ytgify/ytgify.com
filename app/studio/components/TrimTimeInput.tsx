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
  const [notice, setNotice] = useState<{ message: string; value: number } | null>(null);
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
          setNotice(null);
        }}
        onBlur={(event) => {
          const parsed = parseTimeInput(event.target.value);
          setDraft(null);
          setError(parsed === null);
          if (parsed !== null) {
            const bounded = Math.max(clock ? 0 : 0.1, Math.min(parsed, max));
            setNotice(
              bounded !== parsed
                ? { message: `Adjusted to ${bounded.toFixed(1)}s to fit the available clip.`, value: bounded }
                : null,
            );
            onChange(bounded);
          }
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
            : `Seconds · up to ${max.toFixed(1)}`}
      </span>
      {notice && Math.abs(value - notice.value) < 0.05 ? (
        <span role="status" className="block text-xs font-normal text-amber-200">
          {notice.message}
        </span>
      ) : null}
    </label>
  );
}
