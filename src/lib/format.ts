/** Marker radius from employee count (sqrt scale so area ≈ headcount). */
export function radiusFromEmployees(n?: number): number {
  if (!n) return 5;
  return Math.max(5, Math.min(26, Math.sqrt(n) * 0.55));
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
