import { NextResponse } from "next/server";
import { hiringVelocity, type CareerSnapshot } from "@/lib/careers";
import cached from "@/data/feeds/careers.json";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TABLE = "varsel_careers_snapshots";

type Row = {
  as_of: string;
  source: string;
  total_open: number;
  sites: CareerSnapshot["sites"];
  crawled_at: string;
};

function toSnapshot(r: Row): CareerSnapshot {
  return { asOf: r.as_of, source: r.source, totalOpen: r.total_open, crawledAt: r.crawled_at, sites: r.sites };
}

export async function GET() {
  const cachedSnap = cached as unknown as CareerSnapshot;

  // Offline-safe: no DB configured → serve the committed snapshot, labeled cached.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ live: false, fallback: true, ...cachedSnap, velocity: null });
  }

  try {
    // Read the two most recent snapshots so we can derive hiring velocity.
    const url =
      `${SUPABASE_URL}/rest/v1/${TABLE}` +
      `?select=as_of,source,total_open,sites,crawled_at&order=as_of.desc,crawled_at.desc&limit=2`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
    const rows = (await res.json()) as Row[];
    if (!rows.length) throw new Error("no snapshots yet");
    const latest = toSnapshot(rows[0]);
    const previous = rows[1] ? toSnapshot(rows[1]) : null;
    return NextResponse.json({ live: true, ...latest, velocity: hiringVelocity(latest, previous) });
  } catch {
    return NextResponse.json({ live: false, fallback: true, ...cachedSnap, velocity: null });
  }
}
