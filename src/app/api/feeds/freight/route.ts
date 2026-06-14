import { NextResponse } from "next/server";
import { parseFred, pressureFor, noteFor, type FreightState } from "@/lib/freight";
import cached from "@/data/feeds/freight.json";

export const runtime = "nodejs";

const SERIES = "DCOILBRENTEU";
const SOURCE = "FRED · Brent crude";
const SOURCE_URL = "https://fred.stlouisfed.org/series/DCOILBRENTEU";

function fromCache() {
  const c = cached as unknown as FreightState & { asOf: string };
  const pressure = pressureFor(c.changePct);
  return {
    live: false,
    fallback: true,
    asOf: c.asOf,
    fetchedAt: null,
    source: SOURCE,
    sourceUrl: SOURCE_URL,
    series: c.series,
    unit: c.unit,
    date: c.date,
    value: c.value,
    priorDate: c.priorDate,
    priorValue: c.priorValue,
    changePct: c.changePct,
    pressure,
    note: noteFor(pressure),
  };
}

export async function GET() {
  const key = process.env.FRED_API_KEY;
  if (key) {
    try {
      const url =
        `https://api.stlouisfed.org/fred/series/observations?series_id=${SERIES}` +
        `&api_key=${key}&file_type=json&sort_order=desc&limit=45`;
      // FRED updates daily — a 6-hour cache is plenty; 4s timeout keeps the demo snappy.
      const res = await fetch(url, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error(`FRED responded ${res.status}`);
      const p = parseFred(await res.json());
      if (!p) throw new Error("unexpected FRED payload");
      const pressure = pressureFor(p.changePct);
      return NextResponse.json({
        live: true,
        asOf: new Date().toISOString().slice(0, 10),
        fetchedAt: new Date().toISOString(),
        source: SOURCE,
        sourceUrl: SOURCE_URL,
        series: "Brent crude",
        unit: "USD/bbl",
        ...p,
        pressure,
        note: noteFor(pressure),
      });
    } catch {
      // fall through to the cached snapshot
    }
  }
  return NextResponse.json(fromCache());
}
