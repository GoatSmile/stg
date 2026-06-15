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
  // Real open vacancies (evergreen "talent pool" posts excluded).
  totalOpen: number;
  crawledAt: string | null;
  // Strategic STG sites only — production / leaf / HQ / delivery offices.
  sites: CareerSite[];
};

/**
 * One open role, exactly as stored in Supabase (the single source of truth —
 * no copy in any JSON). `siteId` is the strategic-site key it maps to, or null
 * for the US retail/cigar-bar postings. Title + family + days-open come from the
 * SuccessFactors `/services` pull; the full `description` + `applyUrl` come from
 * STG's robots-allowed `jobs.xml` feed. Served live by /api/feeds/careers?roles=1.
 */
export type CareerRole = {
  gid: string;
  siteId: string | null;
  title: string;
  family?: string;
  daysOpen?: number | null;
  location?: string;
  applyUrl?: string;
  description?: string;
};

/** The single oldest open role across all sites (the "ageing vacancy" signal). */
export function oldestDaysOpen(sites: CareerSite[]): number {
  return sites.reduce((max, s) => Math.max(max, s.oldestDaysOpen), 0);
}

/** Open roles at the strategic sites we map (production / leaf / HQ / delivery). */
export function strategicOpen(sites: CareerSite[]): number {
  return sites.reduce((sum, s) => sum + s.openPositions, 0);
}

/**
 * Roles NOT at a strategic site — US retail superstores / cigar bars + smaller
 * sales offices. Derived (totalOpen − strategic) so it holds on both the live
 * and cached paths without storing a separate column. The honest "we count all
 * the roles, but don't pretend retail associates are the strategy" split.
 */
export function otherOpen(snap: CareerSnapshot): number {
  return Math.max(0, snap.totalOpen - strategicOpen(snap.sites));
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
