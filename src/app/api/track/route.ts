import { NextResponse } from "next/server";

// Writes one engagement event to the private Supabase log (service-role key,
// server-only). Country comes from Vercel's geo header. This is fire-and-forget:
// it ALWAYS returns 204 and never throws — tracking must never break or block the
// page. Only authenticated visits reach here (the gate cookie rides along).

export const runtime = "nodejs";
export const maxDuration = 10;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = "varsel_usage_events";

const ok = () => new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  try {
    if (!SUPABASE_URL || !SERVICE_KEY) return ok();
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const event = String(b.event ?? "");
    if (event !== "view" && event !== "dwell") return ok();

    const str = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : null);
    const dwell =
      typeof b.dwellMs === "number" && Number.isFinite(b.dwellMs)
        ? Math.max(0, Math.min(86_400_000, Math.round(b.dwellMs)))
        : null;

    const row = {
      event,
      path: str(b.path, 200),
      recipient: str(b.recipient, 40),
      session: str(b.session, 64),
      device: str(b.device, 16),
      referrer: str(b.referrer, 200),
      dwell_ms: dwell,
      country: req.headers.get("x-vercel-ip-country"),
    };

    await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "content-type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(4000),
    }).catch(() => {});
  } catch {
    /* swallow — never surface to the client */
  }
  return ok();
}
