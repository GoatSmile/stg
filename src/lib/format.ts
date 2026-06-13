/** Marker radius from employee count (sqrt scale so area ≈ headcount). */
export function radiusFromEmployees(n?: number): number {
  if (!n) return 5;
  return Math.max(5, Math.min(26, Math.sqrt(n) * 0.55));
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
