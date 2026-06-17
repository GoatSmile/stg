import data from "@/data/radar/pouch-radar.json";
import xqsGrid from "@/data/radar/xqs-skus.json";

// Pouch Radar (Surface B) — the Sales-lens drill-down. v1 reads a curated, dated
// snapshot (no request-time scraping); the live crawler is gated on a ToS read.

export type RadarMarket = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  currency: string;
  xqsShare?: string;
  shareFlag?: string;
  note: string;
};
export type RadarBrand = { brand: string; owner: string; isStg?: boolean; tracked?: boolean };
export type SpecConfidence = "HIGH" | "MED" | "LOW";
export type RadarPrice = {
  market: string;
  brand: string;
  // real per-can list price (owner-cleared one-time snapshot, 2026-06-17)
  priceLocal: string;
  priceDkk: number; // single-can list price in DKK (ECB cross-rate); multibuy is cheaper
  pricedSku: string; // the exact SKU the price is for (so price-per-mg is self-documenting)
  priceSource: string;
  priceConfidence: SpecConfidence;
  priceVerified: boolean; // true = independently cross-verified vs a 2nd shop (UK/DK); false = sourced, re-verify pending (SE)
  priceNote?: string; // honest caveat, e.g. a price at the low end of the observed range
  rank: number; // row ordering only — not surfaced as a bestseller claim (never separately sourced)
  // real, sourced product specs
  strengthMg: string; // display range, e.g. "6–17 mg"
  repStrengthMg: number; // representative/priced-SKU strength, mg/pouch — drives the strength bar + price-per-mg
  packCount: number; // pouches per can
  flavourCount: number | null; // null where a precise count isn't sourced (e.g. DK post-cap)
  flavourStyle: string;
  specSource: string;
  specConfidence: SpecConfidence;
};
export type RadarEventType = "compliance" | "launch" | "share" | "distribution";
export type RadarEvent = {
  date: string;
  market: string;
  type: RadarEventType;
  text: string;
  sourceRef: string;
};
export type RadarSource = { name: string; url: string; use: string; tos: string };

export type PouchRadar = {
  asOf: string;
  crawledAt: string | null;
  specsProvenance: string;
  pricesProvenance: string;
  sources: RadarSource[];
  markets: RadarMarket[];
  brands: RadarBrand[];
  prices: RadarPrice[];
  events: RadarEvent[];
};

export const pouchRadar = data as unknown as PouchRadar;

/** Price points for one market, cheapest-rank-first. */
export function pricesForMarket(code: string): RadarPrice[] {
  return pouchRadar.prices.filter((p) => p.market === code).sort((a, b) => a.rank - b.rank);
}

/** Max DKK price across the whole snapshot — used to scale the price bars consistently. */
export function maxPriceDkk(): number {
  return pouchRadar.prices.reduce((m, p) => Math.max(m, p.priceDkk), 0);
}

/** Max representative strength across the snapshot — scales the (real) strength bars consistently. */
export function maxRepStrengthMg(): number {
  return pouchRadar.prices.reduce((m, p) => Math.max(m, p.repStrengthMg), 0);
}

/**
 * Real price-per-mg = price/can ÷ (pouches/can × mg/pouch of the priced SKU), in DKK per mg of
 * nicotine. Price, pack count and strength are all real/sourced (owner-cleared snapshot), so the
 * ratio is a real derived metric — a value-per-nicotine view no competitor dashboard shows.
 * Returns null if the inputs can't form a ratio.
 */
export function pricePerMg(p: RadarPrice): number | null {
  const totalMg = p.packCount * p.repStrengthMg;
  if (!totalMg) return null;
  return p.priceDkk / totalMg;
}

export function isStgBrand(brand: string): boolean {
  return pouchRadar.brands.find((b) => b.brand === brand)?.isStg ?? false;
}

/** Brands shown in the board (tracked !== false) vs. known-but-not-yet-tracked. */
export const trackedBrands: RadarBrand[] = pouchRadar.brands.filter((b) => b.tracked !== false);
export const untrackedBrands: RadarBrand[] = pouchRadar.brands.filter((b) => b.tracked === false);

/** "Brand (Owner)" label, e.g. "XQS (STG)". */
export function brandWithOwner(b: RadarBrand): string {
  return `${b.brand} (${b.owner})`;
}

/** Events newest-first. */
export const eventsByDate: RadarEvent[] = [...pouchRadar.events].sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
);

// ─────────────────────────────────────────────────────────────────────────────
// XQS SKU regulatory-exposure (Radar P2) — feeds the Impact Room's dk-cap
// `affectedShare`. Captured by the owner-cleared 2026-06-17 snapshot; the grid
// of record is src/data/radar/xqs-skus.json (this is the single source — the
// Impact Room reads the summary below, it never re-hardcodes the numbers).

export type XqsFlavourCategory = "tobacco" | "menthol-mint" | "fruit-fusion" | "other";
export type XqsSku = { sku: string; mg: number; flavour: string; flavourCategory: XqsFlavourCategory };
export type XqsMarketGrid = {
  code: string;
  name: string;
  exposure: { nicotineSkus: number; flavourCap_delisted: number; flavourCap_delistedShare: number };
  skus: XqsSku[];
};

const grid = xqsGrid as unknown as { asOf: string; source: string; markets: XqsMarketGrid[] };
export const xqsGridAsOf: string = grid.asOf;
export const xqsGridSource: string = grid.source;

/** One market's flavour-cap exposure, summarised for the Impact Room card. */
export type XqsFlavourCapExposure = {
  code: string;
  name: string;
  delisted: number; // nicotine SKUs delisted by a tobacco/menthol-only rule
  total: number; // total nicotine SKUs
  share: number; // delisted / total, 0..1
  examples: string[]; // a few distinct delisted flavours, for a concrete "e.g. …"
};

function summariseFlavourCap(m: XqsMarketGrid): XqsFlavourCapExposure {
  const delistedFlavours = m.skus
    .filter((s) => s.mg > 0 && (s.flavourCategory === "fruit-fusion" || s.flavourCategory === "other"))
    .map((s) => s.flavour);
  const examples = [...new Set(delistedFlavours)].slice(0, 3);
  return {
    code: m.code,
    name: m.name,
    delisted: m.exposure.flavourCap_delisted,
    total: m.exposure.nicotineSkus,
    share: m.exposure.flavourCap_delistedShare,
    examples,
  };
}

/** Flavour-cap exposure per market, broad-range first (SE, UK) then the pre-trimmed DK shelf. */
export const xqsFlavourCapExposure: XqsFlavourCapExposure[] = grid.markets.map(summariseFlavourCap);

export function flavourCapExposureFor(code: string): XqsFlavourCapExposure | undefined {
  return xqsFlavourCapExposure.find((e) => e.code === code);
}
