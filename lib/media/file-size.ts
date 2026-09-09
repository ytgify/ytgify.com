// Decimal units match the compressor's target sizes and upload limit.
export function formatMediaSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (Math.round(value * 10) / 10 >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  return `${value.toLocaleString('en-US', { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${units[unit]}`;
}
