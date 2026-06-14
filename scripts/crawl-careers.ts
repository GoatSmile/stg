/**
 * crawl-careers.ts — refresh the careers feed (the HR lens "live" data).
 *
 * Fetches STG's PUBLIC SuccessFactors careers listings, aggregates open roles by
 * strategic site, writes one snapshot row to Supabase (varsel_careers_snapshots),
 * and refreshes the cached JSON used as the offline fallback. Diffing snapshots
 * over time yields real days-open and hiring velocity (the HR lens shows velocity
 * only once ≥2 snapshots exist — we never fake a trend).
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node --experimental-strip-types scripts/crawl-careers.ts [--dry-run]
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️  COLLECTION POLICY — READ BEFORE SCHEDULING.
 * The rich job data (title, location, posting date, job family) is only served by
 * the RMK search API at POST /services/recruiting/v1/jobs — and robots.txt
 * DISALLOWS /services/. The repo's committed snapshot came from a ONE-TIME,
 * owner-authorised manual pull (2026-06-14). Do NOT wire this to a daily
 * cron/Action against /services/ — that would breach robots on the very company
 * we're pitching. If/when automation is wanted, do it "some other way" (a
 * robots-allowed source, or an arrangement with STG) — see
 * docs/careers-scrape-decision.md. The parser below matches the real payload as
 * pulled on 2026-06-14; the Supabase write + cache refresh are verified.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JOBS_URL = process.env.CAREERS_JOBS_URL ?? "https://careers.st-group.com/services/recruiting/v1/jobs";
const USER_AGENT = "VarselResearch/1.0 (+https://valent.dk; one-time research pull; contact nt@valent.dk)";
const CACHE_PATH = join(process.cwd(), "src/data/feeds/careers.json");
const STANDING_DAYS = 365; // older than this = a continuously-reposted standing req, not an ageing vacancy

type Site = { siteId: string; label: string; lat: number; lng: number };
type Job = { id: string; title: string; location: string; family: string; postedAt: Date | null };
type SnapshotSite = Site & { openPositions: number; oldestDaysOpen: number };

// Strategic STG sites we place on the map. A posting matches a site if its
// location/title contains one of `match`. US retail superstores / cigar bars and
// smaller sales offices don't match any site — they're counted in totalOpen but
// bucketed as "other" (otherOpen = totalOpen − Σ sites), never pretended to be the strategy.
const SITES: (Site & { match: string[] })[] = [
  { siteId: "sales-pt", label: "Carnaxide / Lisbon", lat: 38.72, lng: -9.24, match: ["carnaxide", "lisbon", "2790", "2794"] },
  { siteId: "fac-dr", label: "Dominican Republic", lat: 19.45, lng: -70.7, match: ["santiago", "dominican", "san pedro de macoris", "macoris", "51000", "21000"] },
  { siteId: "office-bethlehem", label: "Bethlehem, PA", lat: 40.63, lng: -75.38, match: ["bethlehem", "18015", "18017"] },
  { siteId: "leaf-lk", label: "Sri Lanka — Biyagama", lat: 6.95, lng: 79.96, match: ["biyagama", "colombo", "sri lanka", "11672"] },
  { siteId: "hq-gentofte", label: "Copenhagen / Gentofte", lat: 55.756, lng: 12.547, match: ["gentofte", "copenhagen", "2820"] },
  { siteId: "office-richmond", label: "Richmond, VA", lat: 37.54, lng: -77.44, match: ["richmond", "23223"] },
  { siteId: "sales-es", label: "Madrid", lat: 40.46, lng: -3.69, match: ["madrid", "28050"] },
  { siteId: "sales-de", label: "Bremen", lat: 53.083, lng: 8.802, match: ["bremen", "28217"] },
  { siteId: "fac-ni", label: "Nicaragua — Estelí", lat: 13.09, lng: -86.35, match: ["esteli", "estelí", "nicaragua", "31000"] },
  { siteId: "fac-id", label: "Indonesia — Semarang", lat: -6.97, lng: 110.42, match: ["semarang", "pasuruan", "pandaan", "indonesia", "67156"] },
  { siteId: "fac-be", label: "Belgium — Lummen/Westerlo", lat: 50.99, lng: 5.2, match: ["lummen", "westerlo", "belgium", "3560"] },
  { siteId: "fac-hn", label: "Honduras — Danlí", lat: 14.02, lng: -86.58, match: ["danli", "danlí", "honduras"] },
];

/** "M/D/YY" (the RMK `unifiedStandardStart` field) → Date, or null. */
function parseStart(s: string | undefined): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2})/.exec(s ?? "");
  if (!m) return null;
  const d = new Date(2000 + Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Map one RMK result row → typed Job. The payload is { jobSearchResult: [{ response: {...} }], totalJobs }. */
function toJob(r: Record<string, unknown>): Job {
  const loc = Array.isArray(r.jobLocationShort) ? (r.jobLocationShort as string[]).join(" ") : "";
  return {
    id: String(r.id ?? ""),
    title: String(r.unifiedStandardTitle ?? r.urlTitle ?? ""),
    location: `${loc} ${String(r.unifiedUrlTitle ?? "")}`,
    family: String(r.custJobFamily ?? ""),
    postedAt: parseStart(r.unifiedStandardStart as string | undefined),
  };
}

/** Evergreen "talent pool" posts are not real vacancies — excluded from the count + days-open. */
function isEvergreen(j: Job): boolean {
  const t = j.title.toLowerCase();
  return t.includes("talent pool") || t.includes("join our");
}

function siteOf(j: Job): string | null {
  const hay = j.location.toLowerCase();
  return SITES.find((s) => s.match.some((m) => hay.includes(m)))?.siteId ?? null;
}

function daysSince(d: Date | null, now: number): number {
  return d ? Math.max(0, Math.round((now - d.getTime()) / 86_400_000)) : 0;
}

/** POST-paginate the RMK search API and dedupe by job id. */
async function fetchAllJobs(): Promise<Job[]> {
  const byId = new Map<string, Job>();
  for (let page = 0; page < 12; page++) {
    const res = await fetch(JOBS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json", "User-Agent": USER_AGENT },
      body: JSON.stringify({ keywords: "", locale: "en_US", location: "", pageNumber: page, sortBy: "recent" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`careers feed responded ${res.status}`);
    const data = (await res.json()) as { jobSearchResult?: { response: Record<string, unknown> }[] };
    const rows = data.jobSearchResult ?? [];
    if (!rows.length) break;
    for (const row of rows) {
      const j = toJob(row.response);
      if (j.id && j.title) byId.set(j.id, j);
    }
  }
  return [...byId.values()];
}

function aggregate(jobs: Job[], now: number): { sites: SnapshotSite[]; totalOpen: number } {
  const real = jobs.filter((j) => !isEvergreen(j));
  const sites = SITES.map(({ match: _match, ...site }) => {
    const hits = real.filter((j) => siteOf(j) === site.siteId);
    const oldest = hits.reduce((mx, j) => {
      const d = daysSince(j.postedAt, now);
      return d > STANDING_DAYS ? mx : Math.max(mx, d); // standing reqs don't count as ageing vacancies
    }, 0);
    return { ...site, openPositions: hits.length, oldestDaysOpen: oldest };
  }).sort((a, b) => b.openPositions - a.openPositions || b.oldestDaysOpen - a.oldestDaysOpen);
  return { sites, totalOpen: real.length };
}

async function main() {
  const now = Date.now();
  const asOf = new Date(now).toISOString().slice(0, 10);

  console.log(`[careers] POST ${JOBS_URL}`);
  const jobs = await fetchAllJobs();
  const { sites, totalOpen } = aggregate(jobs, now);
  const strategic = sites.reduce((s, x) => s + x.openPositions, 0);
  const snapshot = {
    asOf,
    source: "careers.st-group.com (SAP SuccessFactors)",
    totalOpen,
    crawledAt: new Date(now).toISOString(),
    sites,
  };
  console.log(`[careers] ${totalOpen} real vacancies — ${strategic} strategic / ${totalOpen - strategic} other (US retail/bars)`);

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
      Prefer: "return=minimal,resolution=merge-duplicates",
    },
    body: JSON.stringify({ as_of: asOf, source: snapshot.source, total_open: totalOpen, sites, crawled_at: snapshot.crawledAt }),
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
