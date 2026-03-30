/**
 * Full format: RWF 450,000
 * Mirrors _rwf() in the Flutter app.
 */
export function rwf(value: number): string {
  const formatted = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `RWF ${formatted}`;
}

/**
 * Compact format: RWF 450k / RWF 1.2M
 * Mirrors _rwfCompact() in the Flutter app.
 */
export function rwfCompact(value: number): string {
  if (value >= 1_000_000) {
    return `RWF ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `RWF ${(value / 1_000).toFixed(0)}k`;
  }
  return rwf(value);
}
