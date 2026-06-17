/** Marker radius from employee count (sqrt scale so area ≈ headcount). */
export function radiusFromEmployees(n?: number): number {
  if (!n) return 5;
  return Math.max(5, Math.min(26, Math.sqrt(n) * 0.55));
}

/** Marker radius from open-position count (sqrt scale; min 5 so a site always shows). */
export function radiusFromCount(n?: number): number {
  if (!Number.isFinite(n)) return 5;
  return Math.max(5, Math.min(26, Math.sqrt(Math.max(n as number, 0)) * 4.5));
}

/** Compact integer for a marker badge that must fit inside a dot: 1626 → "1.6k", 95 → "95". */
export function compactCount(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}k`;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** DKK from a millions value: 74 → "DKK 74m", 1230 → "DKK 1.23bn". */
export function dkkM(millions: number): string {
  const v = Math.round(millions);
  if (Math.abs(v) >= 1000) {
    return `DKK ${(v / 1000).toLocaleString("en", { maximumFractionDigits: 2 })}bn`;
  }
  return `DKK ${v.toLocaleString("en")}m`;
}

/** A fraction as a percent string: 0.15 → "15%", 0.305 → "31%". */
export function pct(fraction: number, digits = 0): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}
