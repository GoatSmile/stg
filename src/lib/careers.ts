// Pure helpers for the careers feed (the second live feed — HR lens).
//
// Open roles + days-open come from STG's PUBLIC SuccessFactors careers site
// (careers.st-group.com): each posting's URL encodes city + postal code, and the
// detail page carries a posting date. A scheduled scraper writes one snapshot
// per crawl to Supabase (EU); diffing snapshots over time yields hiring velocity.
// No network or DB here — fetching lives in the route + the scraper script.

export type CareerSite = {
  siteId: string;
  label: string;
  lat: number;
  lng: number;
  openPositions: number;
  oldestDaysOpen: number;
};

export type CareerSnapshot = {
  asOf: string;
  source: string;
  totalOpen: number;
  crawledAt: string | null;
  sites: CareerSite[];
};

/** The single oldest open role across all sites (the "ageing vacancy" signal). */
export function oldestDaysOpen(sites: CareerSite[]): number {
  return sites.reduce((max, s) => Math.max(max, s.oldestDaysOpen), 0);
}

/** The site staffing up hardest right now (most open roles). */
export function topHiringSite(sites: CareerSite[]): CareerSite | null {
  return sites.reduce<CareerSite | null>(
    (top, s) => (top === null || s.openPositions > top.openPositions ? s : top),
    null,
  );
}

/**
 * Hiring velocity = the change in total open roles between the two most recent
 * snapshots. Returns null until at least two snapshots exist (history accrues
 * once the scraper has run on more than one day) — we never fake a trend.
 */
export function hiringVelocity(
  latest: CareerSnapshot,
  previous: CareerSnapshot | null,
): { deltaOpen: number; fromAsOf: string } | null {
  if (!previous) return null;
  return { deltaOpen: latest.totalOpen - previous.totalOpen, fromAsOf: previous.asOf };
}
