/**
 * pull-jobs.ts — the single pull path for the HR-lens careers data.
 *
 * Replaces the old crawl-careers.ts + enrich-roles.ts pair. One run:
 *   1. fetch STG's jobs.xml  → every open posting with its FULL description,
 *      canonical apply URL, g:id and employer;
 *   2. (optional, --services) enrich each with department (job family) + days-open;
 *   3. map each to a strategic site (or the US-retail bucket);
 *   4. write the roles + totals + per-site aggregate to Supabase — the SINGLE
 *      source of truth (the app reads everything live from there, no JSON copy of
 *      the roles); and refresh the aggregate-only offline KPI fallback.
 *
 *   # robots-allowed refresh (descriptions/links/employer; no dept/days):
 *   node --experimental-strip-types scripts/pull-jobs.ts            # dry-run unless creds present
 *   node --experimental-strip-types scripts/pull-jobs.ts --dry-run  # print, never write
 *   # full refresh incl. dept + days-open (owner-authorised, manual only — see policy):
 *   node --experimental-strip-types scripts/pull-jobs.ts --services
 *   # creds: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, taken from .env.local if present.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * COLLECTION POLICY. jobs.xml is STG's Google-Jobs / Indeed syndication feed and
 * robots.txt ALLOWS it — so it is the automatable source and the default here.
 * Department + days-open are ONLY served by the RMK search API at
 * POST /services/recruiting/v1/jobs, which robots.txt DISALLOWS. The --services
 * pass therefore stays a ONE-TIME, owner-authorised MANUAL step — never wire it to
 * a cron/Action against /services/. A scheduled refresh must run jobs.xml-only
 * (and would need to preserve existing dept/days for unchanged gids rather than
 * wipe them). See docs/careers-scrape-decision.md.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const WITH_SERVICES = process.argv.includes("--services");
const ORIGIN = "https://careers.st-group.com";
const FEED_URL = process.env.CAREERS_FEED_URL ?? `${ORIGIN}/jobs.xml`;
const SERVICES_URL = process.env.CAREERS_JOBS_URL ?? `${ORIGIN}/services/recruiting/v1/jobs`;
const FEED_UA = "VarselResearch/1.0 (+https://valent.dk; robots-allowed jobs.xml syndication feed; contact nazar@valent.dk)";
const SERVICES_UA = "VarselResearch/1.0 (+https://valent.dk; one-time owner-authorised research pull; contact nazar@valent.dk)";
const CACHE_PATH = join(process.cwd(), "src/data/feeds/careers.json");
const TABLE = "varsel_careers_snapshots";
const STANDING_DAYS = 365; // older than this = a continuously-reposted standing req, not an ageing vacancy

// Load .env.local (so the script "just works" locally) without clobbering real env.
(function loadEnv() {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#") && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
})();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type Role = {
  gid: string;
  siteId: string | null;
  title: string;
  family: string;
  daysOpen: number | null;
  location: string;
  applyUrl: string;
  description: string;
};
type SnapshotSite = { siteId: string; label: string; lat: number; lng: number; openPositions: number; oldestDaysOpen: number };

// Strategic STG sites placed on the map. A posting matches a site if its location
// contains one of `match`. US retail superstores / cigar bars don't match any site
// (siteId null) — counted in totalOpen, shown under the "US retail & bars" marker.
const SITES: { siteId: string; label: string; lat: number; lng: number; match: string[] }[] = [
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
const siteOf = (loc: string): string | null => {
  const h = loc.toLowerCase();
  return SITES.find((s) => s.match.some((m) => h.includes(m)))?.siteId ?? null;
};

// ── HTML entity decode + description cleaner (jobs.xml CDATA holds encoded HTML) ──
const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", eacute: "é", uuml: "ü",
  ouml: "ö", auml: "ä", aring: "å", oslash: "ø", aelig: "æ", deg: "°", bull: "•", middot: "·",
};
const decodeEntities = (s: string): string =>
  s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => (n in NAMED ? NAMED[n] : m));
function cleanDescription(raw: string): string {
  const html = decodeEntities(raw);
  const text = decodeEntities(
    html.replace(/<\s*li[^>]*>/gi, "\n• ")
      .replace(/<\s*(p|br|div|h[1-6]|tr|ul|ol)[^>]*>/gi, "\n")
      .replace(/<\/\s*(p|div|h[1-6]|li|ul|ol)\s*>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  );
  return text.replace(/ /g, " ").split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
const isEvergreen = (title: string) => /talent pool|join our/i.test(title);
const baseTitle = (t: string) => t.replace(/\s*\(([^()]*,[^()]*,[^()]*)\)\s*$/, "").trim();

// ── jobs.xml (robots-allowed) — the complete set, with full descriptions ──
type Feed = { gid: string; rawTitle: string; title: string; location: string; applyUrl: string; description: string };
async function fetchFeed(): Promise<Feed[]> {
  const xml = await (await fetch(FEED_URL, { headers: { "User-Agent": FEED_UA }, signal: AbortSignal.timeout(20000) })).text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const b = m[1];
    const pick = (t: string) => {
      const r = b.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`));
      return r ? r[1].replace(/^<!\[CDATA\[|\]\]>$/g, "") : "";
    };
    const rawTitle = decodeEntities(pick("title")).trim();
    return {
      gid: pick("g:id").trim(),
      rawTitle,
      title: baseTitle(rawTitle),
      location: decodeEntities(pick("g:location")).trim(),
      applyUrl: decodeEntities(pick("link")).trim(),
      description: cleanDescription(pick("description")),
    };
  });
}

// ── /services RMK search API (robots-DISALLOWED, manual-only) — dept + days-open ──
type Svc = { sid: string; title: string; location: string; family: string; daysOpen: number | null };
function parseStart(s: string | undefined, now: number): number | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2})/.exec(s ?? "");
  if (!m) return null;
  const d = new Date(2000 + Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  return Number.isNaN(d.getTime()) ? null : Math.max(0, Math.round((now - d.getTime()) / 86_400_000));
}
async function fetchServices(now: number): Promise<Svc[]> {
  // /services paginates flakily (sortBy:recent shifts rows between requests), so
  // collect via repeated passes, union by id, until the set stops growing.
  const byId = new Map<string, Svc>();
  let stable = 0;
  for (let pass = 0; pass < 8 && stable < 2; pass++) {
    const before = byId.size;
    for (let page = 0; page < 12; page++) {
      const res = await fetch(SERVICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json", "User-Agent": SERVICES_UA },
        body: JSON.stringify({ keywords: "", locale: "en_US", location: "", pageNumber: page, sortBy: "recent" }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`/services responded ${res.status}`);
      const data = (await res.json()) as { jobSearchResult?: { response: Record<string, unknown> }[] };
      const rows = data.jobSearchResult ?? [];
      if (!rows.length) break;
      for (const { response: r } of rows) {
        const sid = String(r.id ?? "");
        if (!sid) continue;
        const loc = Array.isArray(r.jobLocationShort) ? (r.jobLocationShort as string[]).join(" ") : "";
        byId.set(sid, {
          sid,
          title: String(r.unifiedStandardTitle ?? r.urlTitle ?? ""),
          location: `${loc} ${String(r.unifiedUrlTitle ?? "")}`.trim(),
          family: String(r.custJobFamily ?? ""),
          daysOpen: parseStart(r.unifiedStandardStart as string | undefined, now),
        });
      }
    }
    stable = byId.size === before ? stable + 1 : 0;
  }
  return [...byId.values()];
}

// ── match a feed item to a /services row (different id systems → title + city) ──
const norm = (t: string) => baseTitle(t).toLowerCase().replace(/[–—]/g, "-").replace(/&amp;|&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
const toks = (t: string) => new Set(norm(t).split(" ").filter((w) => w.length > 2));
const cityTok = (loc: string) => loc.toLowerCase().split(",")[0].replace(/[^a-z ]/g, "").trim();
function jaccard(a: string, b: string): number {
  const A = toks(a), B = toks(b);
  let i = 0;
  for (const x of A) if (B.has(x)) i++;
  return i / (A.size + B.size - i || 1);
}
function buildRoles(feed: Feed[], svc: Svc[]): Role[] {
  const used = new Set<string>();
  const matchSvc = (f: Feed): Svc | undefined => {
    if (!svc.length) return undefined;
    const fn = norm(f.rawTitle), fc = cityTok(f.location);
    const sameCity = svc.filter((s) => {
      const sc = cityTok(s.location);
      return sc === fc || s.location.toLowerCase().includes(fc) || f.location.toLowerCase().includes(sc);
    });
    const pool = sameCity.length ? sameCity : svc;
    let hit =
      pool.find((s) => !used.has(s.sid) && norm(s.title) === fn) ??
      pool.find((s) => !used.has(s.sid) && (norm(s.title).includes(fn) || fn.includes(norm(s.title))));
    if (!hit) {
      const r = pool.filter((s) => !used.has(s.sid)).map((s) => [jaccard(s.title, f.rawTitle), s] as const).sort((a, b) => b[0] - a[0])[0];
      if (r && r[0] >= 0.6) hit = r[1];
    }
    if (hit) used.add(hit.sid);
    return hit;
  };
  const roles = feed
    .filter((f) => !isEvergreen(f.rawTitle))
    .map((f): Role => {
      const s = matchSvc(f);
      return {
        gid: f.gid,
        siteId: siteOf(f.location),
        title: f.title,
        family: s?.family ?? "",
        daysOpen: s?.daysOpen ?? null,
        location: f.location,
        applyUrl: f.applyUrl,
        description: f.description,
      };
    });
  roles.sort((a, b) => (a.siteId ?? "zzz").localeCompare(b.siteId ?? "zzz") || a.title.localeCompare(b.title));
  return roles;
}

function aggregate(roles: Role[]): { sites: SnapshotSite[]; totalOpen: number } {
  const sites = SITES.map(({ match: _m, ...site }) => {
    const hits = roles.filter((r) => r.siteId === site.siteId);
    const oldest = hits.reduce((mx, r) => (r.daysOpen != null && r.daysOpen <= STANDING_DAYS ? Math.max(mx, r.daysOpen) : mx), 0);
    return { ...site, openPositions: hits.length, oldestDaysOpen: oldest };
  }).sort((a, b) => b.openPositions - a.openPositions || b.oldestDaysOpen - a.oldestDaysOpen);
  return { sites, totalOpen: roles.length };
}

async function main() {
  const now = Date.now();
  const asOf = new Date(now).toISOString().slice(0, 10);
  const crawledAt = new Date(now).toISOString();

  console.log(`[pull] GET ${FEED_URL} (robots-allowed)`);
  const feed = await fetchFeed();
  let svc: Svc[] = [];
  if (WITH_SERVICES) {
    console.log(`[pull] --services: POST ${SERVICES_URL} (robots-DISALLOWED — owner-authorised manual pull)`);
    svc = await fetchServices(now);
  }
  const roles = buildRoles(feed, svc);
  const { sites, totalOpen } = aggregate(roles);
  const strategic = sites.reduce((s, x) => s + x.openPositions, 0);
  console.log(`[pull] feed items: ${feed.length} | real roles: ${totalOpen} | with desc: ${roles.filter((r) => r.description).length} | with dept: ${roles.filter((r) => r.family).length} | with days: ${roles.filter((r) => r.daysOpen != null).length}`);
  console.log(`[pull] ${strategic} strategic / ${totalOpen - strategic} US retail-bars`);

  const cache = {
    _note: "Cached careers snapshot — offline-safe fallback for /api/feeds/careers (aggregate KPIs only). Mirrors the latest Supabase row; auto-generated by scripts/pull-jobs.ts. Roles are LIVE-ONLY (no copy here) — the DB is their single source.",
    asOf, source: "careers.st-group.com (SAP SuccessFactors)", totalOpen, crawledAt, sites,
  };

  if (DRY_RUN) {
    console.log(JSON.stringify({ ...cache, sampleRole: roles[0] }, null, 2));
    return;
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.log("[pull] no SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — dry output only (set them in .env.local to write).");
    console.log(JSON.stringify({ ...cache, sampleRole: roles[0] }, null, 2));
    return;
  }

  // Upsert the snapshot row by as_of (one row per crawl date → velocity history).
  const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };
  const body = JSON.stringify({ as_of: asOf, source: cache.source, total_open: totalOpen, sites, roles, crawled_at: crawledAt });
  const existing = (await (await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id&as_of=eq.${asOf}`, { headers })).json()) as { id: number }[];
  const res = existing.length
    ? await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?as_of=eq.${asOf}`, { method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body })
    : await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body });
  if (!res.ok) throw new Error(`Supabase write failed: ${res.status} ${await res.text()}`);

  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
  console.log(`[pull] wrote ${totalOpen} roles + aggregate to ${TABLE} (${existing.length ? "updated" : "inserted"} as_of=${asOf}) + refreshed ${CACHE_PATH}`);
}

main().catch((e) => {
  console.error("[pull] failed:", e.message);
  process.exit(1);
});
