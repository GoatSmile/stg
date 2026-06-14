import { NextResponse } from "next/server";
import { parseEcbRates, crossRatesDkk } from "@/lib/fx";
import cached from "@/data/feeds/ecb-fx.json";

// The fetch must run server-side; route handlers are dynamic by default.
export const runtime = "nodejs";

const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

export async function GET() {
  try {
    const res = await fetch(ECB_URL, {
      // Cache the ECB response for 30 min so we stay polite to their endpoint
      // while the feed still reads as "live, refreshed this afternoon".
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`ECB responded ${res.status}`);
    const xml = await res.text();
    const { date, rates } = parseEcbRates(xml);
    if (!date || !rates.DKK || !rates.USD) throw new Error("unexpected ECB payload");
    return NextResponse.json({
      live: true,
      asOf: date,
      fetchedAt: new Date().toISOString(),
      source: "ECB eurofxref-daily",
      sourceUrl: ECB_URL,
      rates,
      cross: crossRatesDkk(rates),
    });
  } catch {
    // Offline-safe: serve the committed snapshot, labeled honestly as cached.
    return NextResponse.json({
      live: false,
      fallback: true,
      asOf: cached.asOf,
      fetchedAt: null,
      source: cached.source,
      sourceUrl: ECB_URL,
      rates: cached.rates,
      cross: cached.cross,
    });
  }
}
