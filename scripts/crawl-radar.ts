/**
 * crawl-radar.ts — refresh the Pouch Radar snapshot (Sales lens drill-down).
 *
 * Collects per-market pouch price + online bestseller rank for XQS vs ZYN vs VELO
 * from public e-commerce, and writes src/data/radar/pouch-radar.json (committed,
 * served at request time — never crawled live in the app). Run on a schedule.
 *
 *   node --experimental-strip-types scripts/crawl-radar.ts [--dry-run]
 *
 * ⚠️  GATE (build-plan §4): DO NOT enable automated collection until a per-retailer
 * Terms-of-Service read confirms it is permitted. robots.txt permission ≠ ToS
 * permission (post Ryanair v PR Aviation, a site's ToS can contractually restrict
 * scraping of even public price data). If a retailer's ToS prohibits it, use the
 * Haypp Media & Insights PAID feed or a manually-sourced snapshot instead. Prefer
 * sitemap-diffing over HTML scraping; rate-limit politely; identify the agent.
 *
 * This scaffold was authored without network access, so `fetchMarket` is a stub to
 * implement against the chosen, ToS-cleared source. The file-write is real.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const OUT = join(process.cwd(), "src/data/radar/pouch-radar.json");
const USER_AGENT = "VarselRadar/0.1 (+https://valent.dk; contact nt@jensenproduction.dk)";

const MARKETS = [
  { code: "SE", name: "Sweden", lat: 59.33, lng: 18.07, currency: "SEK" },
  { code: "UK", name: "United Kingdom", lat: 51.51, lng: -0.13, currency: "GBP" },
  { code: "DK", name: "Denmark", lat: 55.68, lng: 12.57, currency: "DKK" },
];
const BRANDS = ["XQS", "VELO", "ZYN", "Nordic Spirit"];

type PricePoint = {
  market: string;
  brand: string;
  priceLocal: string;
  priceDkk: number;
  strengthMg: string;
  rank: number;
  flavours: string | number;
};

/**
 * IMPLEMENT per the ToS-cleared source (Haypp paid feed / sitemap diff).
 * Must respect rate limits and send the User-Agent above. Returns one price point
 * per brand present in the market, ranked by online bestseller position.
 */
async function fetchMarket(_marketCode: string): Promise<PricePoint[]> {
  throw new Error(
    "fetchMarket is a stub — implement against a ToS-cleared source before scheduling (see the GATE note above).",
  );
}

async function main() {
  const asOf = new Date().toISOString().slice(0, 10);
  const prices: PricePoint[] = [];
  for (const m of MARKETS) {
    // Polite: one market at a time; a real run would also sleep between requests.
    prices.push(...(await fetchMarket(m.code)));
  }
  const snapshot = {
    asOf,
    crawledAt: new Date().toISOString(),
    pricesProvenance: "agent",
    markets: MARKETS,
    brands: BRANDS.map((b) => ({ brand: b, owner: b === "XQS" ? "STG" : "—", isStg: b === "XQS" })),
    prices,
  };
  if (DRY_RUN) {
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`[radar] wrote ${prices.length} price points to ${OUT}`);
}

main().catch((e) => {
  console.error("[radar] failed:", e.message);
  process.exit(1);
});
