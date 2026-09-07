export function formatClock(seconds: number): string {
  const tenths = Math.round(Math.max(0, Number.isFinite(seconds) ? seconds : 0) * 10);
  return `${Math.floor(tenths / 600)
    .toString()
    .padStart(2, '0')}:${((tenths % 600) / 10).toFixed(1).padStart(4, '0')}`;
}

export function parseTimeInput(text: string): number | null {
  const value = text.trim();
  if (/^\d+(?:\.\d+)?$/.test(value)) return Number.isFinite(Number(value)) ? Number(value) : null;
  const match = /^(\d+):([0-5]?\d(?:\.\d+)?)$/.exec(value);
  if (!match) return null;
  const seconds = Number(match[1]) * 60 + Number(match[2]);
  return Number.isFinite(seconds) ? seconds : null;
}

export function timelineWindow(start: number, end: number, duration: number) {
  const span = Math.min(30, duration);
  const windowStart = Math.max(0, Math.min((start + end - span) / 2, duration - span));
  return { start: windowStart, span };
}
