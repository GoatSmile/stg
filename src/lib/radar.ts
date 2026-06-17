import data from "@/data/radar/pouch-radar.json";

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
  // illustrative* (no ToS-permitted price source yet)
  priceLocal: string;
  priceDkk: number;
  rank: number;
  // real, sourced product specs
  strengthMg: string; // display range, e.g. "6–17 mg"
  repStrengthMg: number; // representative SKU strength, mg/pouch — for the strength bar + price-per-mg
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
 * Illustrative* price-per-mg = price/can ÷ (pouches/can × mg/pouch), in DKK per mg of nicotine.
 * The strength + pack count are REAL; the price is an illustrative placeholder, so the ratio is
 * illustrative until a real price source lands. Returns null if the inputs can't form a ratio.
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
