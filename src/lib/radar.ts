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
export type RadarBrand = { brand: string; owner: string; isStg?: boolean };
export type RadarPrice = {
  market: string;
  brand: string;
  priceLocal: string;
  priceDkk: number;
  strengthMg: string;
  rank: number;
  flavours: string | number;
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

export function isStgBrand(brand: string): boolean {
  return pouchRadar.brands.find((b) => b.brand === brand)?.isStg ?? false;
}

/** Events newest-first. */
export const eventsByDate: RadarEvent[] = [...pouchRadar.events].sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
);
