/**
 * enrich-roles.ts — attach real job descriptions + apply links to the HR-lens roles.
 *
 * Reads the existing per-site roles in src/data/layers/hr.json (title / family /
 * days-open, produced by crawl-careers.ts) and enriches each with the real prose
 * description + canonical apply URL pulled from STG's job syndication feed. Then,
 * if Supabase service creds are present, mirrors the enriched roles into the
 * varsel_careers_snapshots.roles column (the "store the full desc in DB" record).
 *
 *   node --experimental-strip-types scripts/enrich-roles.ts [--dry-run]
 *   # to also persist to the DB:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node --experimental-strip-types scripts/enrich-roles.ts
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SOURCE — and why this one is clean. The rich search API (POST /services/...)
 * is robots-DISALLOWED and carries no description, so it stays manual-only (see
 * crawl-careers.ts). This script instead reads /jobs.xml — STG's Google-Jobs /
 * Indeed syndication feed — which robots.txt ALLOWS (only /services/, /apply*,
 * /talentcommunity etc. are disallowed) and which carries the full description,
 * canonical link, location and a stable g:id per posting. Being robots-allowed,
 * it is the candidate for the "automate some other way" refresh noted in
 * docs/careers-scrape-decision.md.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const ORIGIN = "https://careers.st-group.com";
const FEED_URL = process.env.CAREERS_FEED_URL ?? `${ORIGIN}/jobs.xml`;
const UA = "VarselResearch/1.0 (+https://valent.dk; robots-allowed jobs.xml syndication feed; contact nazar@valent.dk)";
const HR_PATH = join(process.cwd(), "src/data/layers/hr.json");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Location tokens per strategic site, to disambiguate identically-titled roles
// posted at more than one location (mirrors crawl-careers.ts SITES).
const SITE_TOKENS: Record<string, string[]> = {
  "sales-pt": ["carnaxide", "lisbon", "2790", "2794"],
  "fac-dr": ["santiago", "dominican", "macoris", "21000", " do"],
  "office-bethlehem": ["bethlehem", "18015", "18017"],
  "leaf-lk": ["biyagama", "colombo", "sri lanka", "11672", " lk"],
  "hq-gentofte": ["gentofte", "copenhagen", "2820", " dk"],
  "office-richmond": ["richmond", "23223"],
  "sales-es": ["madrid", "28050", " es"],
  "sales-de": ["bremen", "28217", " de"],
  "fac-ni": ["esteli", "estelí", "nicaragua", "31000", " ni"],
  "fac-id": ["semarang", "indonesia", "67156", " id"],
  "fac-be": ["lummen", "westerlo", "belgium", "3560", " be"],
  "fac-hn": ["danli", "danlí", "honduras", " hn"],
};

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", eacute: "é", uuml: "ü",
  ouml: "ö", auml: "ä", aring: "å", oslash: "ø", aelig: "æ", deg: "°", bull: "•", middot: "·",
};
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => (n in NAMED ? NAMED[n] : m));
}

/** The CDATA holds HTML-encoded HTML → decode to real HTML, then HTML → readable text. */
function cleanDescription(raw: string): string {
  const html = decodeEntities(raw);
  const text = decodeEntities(
    html
      .replace(/<\s*li[^>]*>/gi, "\n• ")
      .replace(/<\s*(p|br|div|h[1-6]|tr|ul|ol)[^>]*>/gi, "\n")
      .replace(/<\/\s*(p|div|h[1-6]|li|ul|ol)\s*>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  );
  return text
    .replace(/ /g, " ")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const norm = (t: string) =>
  decodeEntities(t).toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();

type FeedItem = { title: string; link: string; gid: string; location: string; desc: string };

function parseFeed(xml: string): FeedItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const b = m[1];
    const pick = (t: string) => {
      const r = b.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`));
      return r ? r[1].replace(/^<!\[CDATA\[|\]\]>$/g, "") : "";
    };
    return {
      title: decodeEntities(pick("title")).trim(),
      link: decodeEntities(pick("link")).trim(),
      gid: pick("g:id").trim(),
      location: decodeEntities(pick("g:location")).trim(),
      desc: cleanDescription(pick("description")),
    };
  });
}

function findItem(items: FeedItem[], title: string, siteId: string): FeedItem | undefined {
  const target = norm(title);
  const cands = items.filter((it) => {
    const ft = norm(it.title);
    return ft === target || ft.startsWith(target + " (");
  });
  if (cands.length <= 1) return cands[0];
  const toks = SITE_TOKENS[siteId] ?? [];
  return cands.find((c) => toks.some((t) => c.location.toLowerCase().includes(t.trim()))) ?? cands[0];
}

async function main() {
  const xml = await (await fetch(FEED_URL, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) })).text();
  const items = parseFeed(xml);

  const hr = JSON.parse(readFileSync(HR_PATH, "utf8"));
  let total = 0;
  let enriched = 0;
  const unmatched: string[] = [];
  const dbRoles: Record<string, unknown>[] = [];

  for (const marker of hr.markers) {
    for (const role of marker.roles ?? []) {
      total++;
      const it = findItem(items, role.title, marker.siteId);
      if (it && it.desc) {
        enriched++;
        role.description = it.desc;
        role.applyUrl = it.link;
        if (it.gid) role.gid = it.gid;
        dbRoles.push({ siteId: marker.siteId, ...role });
      } else {
        unmatched.push(`${marker.label} :: ${role.title}`);
      }
    }
  }

  console.log(`[enrich] feed items: ${items.length}`);
  console.log(`[enrich] roles: ${total} | enriched: ${enriched} | unmatched: ${unmatched.length}`);
  if (unmatched.length) console.log("[enrich] UNMATCHED:\n  " + unmatched.join("\n  "));

  if (DRY_RUN) return;

  writeFileSync(HR_PATH, JSON.stringify(hr, null, 2) + "\n");
  console.log(`[enrich] wrote ${HR_PATH}`);

  // Mirror the enriched roles into the DB (the "store the full desc in DB" record).
  if (SUPABASE_URL && SERVICE_KEY) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/varsel_careers_snapshots?as_of=eq.${hr.asOf}`, {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ roles: dbRoles }),
    });
    if (!res.ok) throw new Error(`Supabase roles PATCH failed: ${res.status} ${await res.text()}`);
    console.log(`[enrich] wrote ${dbRoles.length} roles to varsel_careers_snapshots.roles (as_of=${hr.asOf})`);
  } else {
    console.log("[enrich] DB write skipped — set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to persist roles to the DB.");
  }
}

main().catch((e) => {
  console.error("[enrich] failed:", e.message);
  process.exit(1);
});
