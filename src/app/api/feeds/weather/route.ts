import { NextResponse } from "next/server";
import { LEAF_REGIONS, parseOpenMeteo, riskFor, type RegionWeather } from "@/lib/weather";
import cached from "@/data/feeds/weather.json";

export const runtime = "nodejs";

const LATS = LEAF_REGIONS.map((r) => r.lat).join(",");
const LNGS = LEAF_REGIONS.map((r) => r.lng).join(",");
const OPEN_METEO =
  `https://api.open-meteo.com/v1/forecast?latitude=${LATS}&longitude=${LNGS}` +
  `&current=temperature_2m,precipitation,relative_humidity_2m` +
  `&daily=precipitation_sum,temperature_2m_max&forecast_days=7&timezone=auto`;

function withRisk(regions: RegionWeather[]) {
  return regions.map((w) => ({ ...w, risk: riskFor(w) }));
}

export async function GET() {
  try {
    const res = await fetch(OPEN_METEO, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);
    const regions = parseOpenMeteo(await res.json(), LEAF_REGIONS);
    if (!regions.length || regions.every((r) => r.tempC === 0 && r.maxTempC === 0)) {
      throw new Error("unexpected Open-Meteo payload");
    }
    return NextResponse.json({
      live: true,
      asOf: new Date().toISOString().slice(0, 10),
      fetchedAt: new Date().toISOString(),
      source: "Open-Meteo",
      sourceUrl: "https://open-meteo.com",
      regions: withRisk(regions),
    });
  } catch {
    const c = cached as unknown as { asOf: string; source: string; regions: RegionWeather[] };
    return NextResponse.json({
      live: false,
      fallback: true,
      asOf: c.asOf,
      fetchedAt: null,
      source: c.source,
      sourceUrl: "https://open-meteo.com",
      regions: withRisk(c.regions),
    });
  }
}
