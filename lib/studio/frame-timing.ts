/**
 * Sample evenly across the trim; GIF delays are integer centiseconds, supplied in milliseconds.
 * Spreading a fractional final interval across the frames avoids a near-zero tail delay.
 */
export function createFrameTiming(duration: number, fps: number): { time: number; delay: number }[] {
  const count = Math.max(1, Math.ceil(duration * fps));
  return Array.from({ length: count }, (_, index) => {
    // Round cumulative boundaries, not each interval, so rounding cannot accumulate.
    const start = Math.round((index * duration * 100) / count);
    const end = Math.round(((index + 1) * duration * 100) / count);
    return { time: (index * duration) / count, delay: (end - start) * 10 };
  });
}
