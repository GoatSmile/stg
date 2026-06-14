// Pure helpers for the ECB daily FX feed (the first live public feed).
// ECB publishes EUR-based reference rates as a small, stable XML document; we
// parse it with a regex (no XML dependency) and derive DKK cross-rates. The
// feed proves the "agents fetch public data on a schedule" story on the Finance
// lens. No network here — fetching + the offline fallback live in the route.

/** EUR-based reference rates, e.g. { EUR: 1, USD: 1.0856, DKK: 7.459 }. */
export type EcbRates = Record<string, number>;

/** Parse the ECB eurofxref-daily.xml body. Returns the publication date + EUR-based rates. */
export function parseEcbRates(xml: string): { date: string; rates: EcbRates } {
  const date = xml.match(/time="(\d{4}-\d{2}-\d{2})"/)?.[1] ?? "";
  const rates: EcbRates = { EUR: 1 };
  const re = /currency="([A-Z]{3})"\s+rate="([\d.]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    rates[m[1]] = parseFloat(m[2]);
  }
  return { date, rates };
}

export type DkkCrossRates = {
  usdDkk: number; // how many DKK per 1 USD
  eurDkk: number; // the ERM-II peg, ≈ 7.46
  gbpDkk: number;
};

/** Convert EUR-based rates into DKK cross-rates (X→DKK = EUR→DKK ÷ EUR→X). */
export function crossRatesDkk(rates: EcbRates): DkkCrossRates {
  const eurDkk = rates.DKK ?? NaN;
  const toDkk = (ccy: string) => (rates[ccy] ? eurDkk / rates[ccy] : NaN);
  return { usdDkk: toDkk("USD"), eurDkk, gbpDkk: toDkk("GBP") };
}

/**
 * First-order translation sensitivity: how much group net sales (in DKK) move
 * for a given % move in USD/DKK, applied to the USD-denominated sales base.
 * Pre-hedging, illustrative — STG's US net sales were DKK 4,230m in FY2025.
 */
export function usdSalesSensitivityDkkM(movePct: number, usdSalesDkkM = 4230): number {
  return usdSalesDkkM * movePct;
}
