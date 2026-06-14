/**
 * crawl-careers.ts — refresh the careers feed (the HR lens "live" data).
 *
 * Fetches STG's PUBLIC SuccessFactors careers listings, aggregates open roles by
 * site, writes one snapshot row to Supabase (varsel_careers_snapshots), and
 * refreshes the cached JSON used as the offline fallback. Run it on a schedule
 * (cron / GitHub Action); each run is one dated snapshot, so diffing snapshots
 * over time yields real days-open and hiring velocity.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node --experimental-strip-types scripts/crawl-careers.ts [--dry-run]
 *
 * ⚠️  HONESTY NOTE: this script was authored in a sandbox with no outbound
 * network, so `parseJobs` is written from the documented SuccessFactors shape
 * (city + postal in each posting URL; a posting date on the detail page) and MUST
 * be validated against the live site on first run — set CAREERS_JOBS_URL and
 * adjust the field mapping to match. The Supabase write + cache refresh are real.
 * Check robots.txt / ToS before scheduling automated collection.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JOBS_URL = process.env.CAREERS_JOBS_URL ?? "https://careers.st-group.com/api/jobs";
const CACHE_PATH = join(process.cwd(), "src/data/feeds/careers.json");

type Site = { siteId: string; label: string; lat: number; lng: number };
type Job = { title: string; city: string; postalCode?: string; postedAt: string };
type SnapshotSite = Site & { openPositions: number; oldestDaysOpen: number };

// The footprint we map jobs onto. A posting matches a site if its city/postal
// matches `match`. Mirrors src/data/feeds/careers.json (kept in sync by hand).
const SITES: (Site & { match: string[] })[] = [
  { siteId: "fac-dr", label: "Dominican Republic", lat: 19.45, lng: -70.7, match: ["santiago", "dominican"] },
  { siteId: "sales-pt", label: "Carnaxide / Lisbon", lat: 38.72, lng: -9.24, match: ["lisbon", "carnaxide", "2790"] },
  { siteId: "office-bethlehem", label: "Bethlehem, PA", lat: 40.63, lng: -75.38, match: ["bethlehem", "18017"] },
  { siteId: "sales-es", label: "Madrid", lat: 40.46, lng: -3.69, match: ["madrid", "280"] },
  { siteId: "office-richmond", label: "Richmond, VA", lat: 37.54, lng: -77.44, match: ["richmond", "232"] },
  { siteId: "leaf-lk", label: "Sri Lanka — Biyagama", lat: 6.95, lng: 79.96, match: ["biyagama", "colombo", "sri lanka"] },
  { siteId: "fac-ni", label: "Nicaragua — Estelí", lat: 13.09, lng: -86.35, match: ["esteli", "nicaragua"] },
  { siteId: "hq-gentofte", label: "Copenhagen / Gentofte", lat: 55.756, lng: 12.547, match: ["gentofte", "copenhagen", "2820"] },
  { siteId: "fac-id", label: "Indonesia — Semarang", lat: -6.97, lng: 110.42, match: ["semarang", "pasuruan", "indonesia"] },
  { siteId: "fac-be", label: "Belgium — Lummen/Westerlo", lat: 50.99, lng: 5.2, match: ["lummen", "westerlo", "belgium"] },
  { siteId: "sales-de", label: "Bremen", lat: 53.083, lng: 8.802, match: ["bremen"] },
  { siteId: "fac-hn", label: "Honduras — Danlí", lat: 14.02, lng: -86.58, match: ["danli", "honduras"] },
];

/** ADJUST THIS to the live SuccessFactors payload. Maps the raw feed → typed jobs. */
function parseJobs(raw: unknown): Job[] {
  // Common SuccessFactors Career Site Builder shape: { jobs: [{ title, location, postingDate, ... }] }.
  const arr = Array.isArray(raw) ? raw : ((raw as { jobs?: unknown[] })?.jobs ?? []);
  return (arr as Record<string, string>[])
    .map((j) => ({
      title: j.title ?? j.jobTitle ?? "",
      city: (j.city ?? j.location ?? "").toString(),
      postalCode: j.postalCode ?? j.postal ?? undefined,
      postedAt: j.postingDate ?? j.postedDate ?? j.startDate ?? "",
    }))
    .filter((j) => j.title);
}

function daysSince(iso: string, now: number): number {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : Math.max(0, Math.round((now - t) / 86_400_000));
}

function aggregate(jobs: Job[], now: number): SnapshotSite[] {
  return SITES.map(({ match, ...site }) => {
    const hits = jobs.filter((j) => {
      const hay = `${j.city} ${j.postalCode ?? ""}`.toLowerCase();
      return match.some((m) => hay.includes(m));
    });
    const oldest = hits.reduce((mx, j) => Math.max(mx, daysSince(j.postedAt, now)), 0);
    return { ...site, openPositions: hits.length, oldestDaysOpen: oldest };
  }).sort((a, b) => b.openPositions - a.openPositions);
}

async function main() {
  const now = Date.now();
  const asOf = new Date(now).toISOString().slice(0, 10);

  console.log(`[careers] fetching ${JOBS_URL}`);
  const res = await fetch(JOBS_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`careers feed responded ${res.status}`);
  const jobs = parseJobs(await res.json());
  const sites = aggregate(jobs, now);
  const snapshot = {
    asOf,
    source: "careers.st-group.com (SAP SuccessFactors)",
    totalOpen: jobs.length,
    crawledAt: new Date(now).toISOString(),
    sites,
  };
  console.log(`[careers] ${jobs.length} roles across ${sites.filter((s) => s.openPositions).length} sites`);

  if (DRY_RUN) {
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }

  // 1) Persist to Supabase (service role bypasses the public-read RLS).
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to write");
  const post = await fetch(`${SUPABASE_URL}/rest/v1/varsel_careers_snapshots`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ as_of: asOf, source: snapshot.source, total_open: snapshot.totalOpen, sites }),
  });
  if (!post.ok) throw new Error(`Supabase insert failed: ${post.status} ${await post.text()}`);

  // 2) Refresh the offline-safe cached snapshot committed to the repo.
  writeFileSync(CACHE_PATH, JSON.stringify({ _note: "Cached careers snapshot — offline fallback for /api/feeds/careers.", ...snapshot }, null, 2) + "\n");
  console.log(`[careers] wrote snapshot to Supabase + ${CACHE_PATH}`);
}

main().catch((e) => {
  console.error("[careers] failed:", e.message);
  process.exit(1);
});
