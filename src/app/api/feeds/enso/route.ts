import { NextResponse } from "next/server";
import { parseOni, noteFor, type EnsoState } from "@/lib/enso";
import cached from "@/data/feeds/enso.json";

export const runtime = "nodejs";

// NOAA Climate Prediction Center — Oceanic Niño Index (free, keyless ascii table).
const ONI_URL = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt";
const SOURCE = "NOAA CPC (ONI)";

export async function GET() {
  try {
    // ONI updates monthly — a 6-hour cache is plenty; 4s timeout keeps the demo snappy.
    const res = await fetch(ONI_URL, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`NOAA responded ${res.status}`);
    const state = parseOni(await res.text());
    if (!state) throw new Error("unexpected ONI payload");
    return NextResponse.json({
      live: true,
      asOf: new Date().toISOString().slice(0, 10),
      fetchedAt: new Date().toISOString(),
      source: SOURCE,
      sourceUrl: ONI_URL,
      ...state,
    });
  } catch {
    const c = cached as unknown as EnsoState & { asOf: string };
    return NextResponse.json({
      live: false,
      fallback: true,
      asOf: c.asOf,
      fetchedAt: null,
      source: SOURCE,
      sourceUrl: ONI_URL,
      season: c.season,
      oni: c.oni,
      phase: c.phase,
      note: noteFor(c.phase),
    });
  }
}
