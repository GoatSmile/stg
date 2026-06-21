// Pure helpers for the Open-Meteo weather feed (Procurement lens — leaf regions).
//
// Open-Meteo is free + keyless (non-commercial). We pull current conditions + a
// 7-day forecast for STG's leaf-growing origins and derive a transparent crop-risk
// signal (drought / heat / wet) from the forecast. No network here — the fetch +
// offline fallback live in the route. The weather values are live; the risk LABEL
// is a simple, stated rule on those values (not a proprietary model).

export type RegionMeta = { id: string; label: string; lat: number; lng: number; makes: string };

/** STG's primary leaf-growing origins (stg-facts §4.3). */
export const LEAF_REGIONS: RegionMeta[] = [
  { id: "proc-dr", label: "Dominican Republic", lat: 19.45, lng: -70.7, makes: "Wrapper/binder + handmade" },
  { id: "proc-hn", label: "Honduras — Danlí", lat: 14.02, lng: -86.58, makes: "Handmade filler/binder" },
  { id: "proc-ni", label: "Nicaragua — Estelí", lat: 13.09, lng: -86.35, makes: "Handmade filler" },
  { id: "proc-id", label: "Indonesia — Semarang", lat: -6.97, lng: 110.42, makes: "Machine-rolled wrapper/binder" },
  { id: "proc-lk", label: "Sri Lanka — Biyagama", lat: 6.95, lng: 79.96, makes: "Wrapper/binder leaf" },
];

export type RegionWeather = RegionMeta & {
  tempC: number;
  precipMm: number;
  humidity: number;
  weekPrecipMm: number;
  maxTempC: number;
  // How many days of forecast actually came back. 0 means the daily block was
  // missing — a partial payload the route must reject (else weekPrecipMm coerces
  // to 0 and fabricates a "dry/high" drought alarm under a live badge).
  forecastDays?: number;
};

export type WeatherRisk = {
  level: "low" | "elevated" | "high";
  kind: "dry" | "wet" | "heat" | "normal";
  note: string;
};

/** A transparent crop-risk rule on the 7-day forecast — stated, not a black box. */
export function riskFor(w: { weekPrecipMm: number; maxTempC: number }): WeatherRisk {
  if (w.weekPrecipMm < 5) return { level: "high", kind: "dry", note: "near-zero rain in the 7-day forecast" };
  if (w.maxTempC >= 35) return { level: "elevated", kind: "heat", note: "heat stress in the forecast" };
  if (w.weekPrecipMm > 120) return { level: "elevated", kind: "wet", note: "heavy rain — curing/harvest risk" };
  return { level: "low", kind: "normal", note: "within normal range" };
}

type OMCurrent = { temperature_2m?: number; precipitation?: number; relative_humidity_2m?: number };
type OMDaily = { precipitation_sum?: number[]; temperature_2m_max?: number[] };
type OMLoc = { current?: OMCurrent; daily?: OMDaily };

/** Open-Meteo returns an array for multi-location requests, an object for one. Zip onto our regions. */
export function parseOpenMeteo(payload: unknown, regions: RegionMeta[]): RegionWeather[] {
  const arr: OMLoc[] = Array.isArray(payload) ? (payload as OMLoc[]) : [payload as OMLoc];
  return regions.map((r, i) => {
    const cur = arr[i]?.current ?? {};
    const daily = arr[i]?.daily ?? {};
    const precip = daily.precipitation_sum ?? [];
    const maxes = daily.temperature_2m_max ?? [];
    const week = precip.reduce((a, b) => a + (b || 0), 0);
    const maxT = maxes.reduce((m, b) => Math.max(m, b || 0), cur.temperature_2m ?? 0);
    return {
      ...r,
      tempC: cur.temperature_2m ?? 0,
      precipMm: cur.precipitation ?? 0,
      humidity: cur.relative_humidity_2m ?? 0,
      weekPrecipMm: Math.round(week),
      maxTempC: Math.round(maxT),
      forecastDays: Math.min(precip.length, maxes.length),
    };
  });
}
