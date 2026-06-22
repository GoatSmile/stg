import { notFound } from "next/navigation";

// Owner-only usage dashboard. Guarded by ADMIN_KEY — the shared demo password is
// NOT enough here, because the recipients have it. Reachable only at
// /usage?key=<ADMIN_KEY>; if ADMIN_KEY is unset or the key is wrong, the page
// does not exist (404). Reads the private event log with the service-role key.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY;
const TABLE = "varsel_usage_events";

// Optional owner-only map from opaque link codes to readable names, so only the
// code ever travels in a URL (e.g. RECIPIENT_MAP={"13":"Yulia","14":"CFO"}).
let RECIPIENT_MAP: Record<string, string> = {};
try {
  RECIPIENT_MAP = JSON.parse(process.env.RECIPIENT_MAP || "{}");
} catch {
  RECIPIENT_MAP = {};
}
const label = (code: string) => (RECIPIENT_MAP[code] ? `${RECIPIENT_MAP[code]} (${code})` : code);

type Ev = {
  ts: string;
  event: string;
  path: string | null;
  recipient: string | null;
  session: string | null;
  device: string | null;
  country: string | null;
  dwell_ms: number | null;
};

function fmtDuration(ms: number): string {
  if (ms < 1000) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { timeZone: "Europe/Copenhagen", dateStyle: "medium", timeStyle: "short" });
}

export default async function Usage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const sp = await searchParams;
  if (!ADMIN_KEY || sp.key !== ADMIN_KEY) notFound();

  let events: Ev[] = [];
  let dbError = false;
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=*&order=ts.desc&limit=2000`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      events = (await res.json()) as Ev[];
    } catch {
      dbError = true;
    }
  } else {
    dbError = true;
  }

  // Per-recipient summary.
  type Agg = {
    recipient: string;
    opens: number;
    sessions: Set<string>;
    countries: Set<string>;
    devices: Set<string>;
    dwellMs: number;
    last: string;
  };
  const byRec = new Map<string, Agg>();
  const byPath = new Map<string, { views: number; dwellMs: number }>();
  for (const e of events) {
    const rk = e.recipient ?? "(untagged)";
    const a =
      byRec.get(rk) ??
      { recipient: rk, opens: 0, sessions: new Set(), countries: new Set(), devices: new Set(), dwellMs: 0, last: e.ts };
    if (e.event === "view") a.opens++;
    if (e.session) a.sessions.add(e.session);
    if (e.country) a.countries.add(e.country);
    if (e.device) a.devices.add(e.device);
    if (e.dwell_ms) a.dwellMs += e.dwell_ms;
    if (e.ts > a.last) a.last = e.ts;
    byRec.set(rk, a);

    if (e.path) {
      const p = byPath.get(e.path) ?? { views: 0, dwellMs: 0 };
      if (e.event === "view") p.views++;
      if (e.dwell_ms) p.dwellMs += e.dwell_ms;
      byPath.set(e.path, p);
    }
  }
  const recipients = [...byRec.values()].sort((x, y) => y.last.localeCompare(x.last));
  const paths = [...byPath.entries()].sort((a, b) => b[1].dwellMs - a[1].dwellMs).slice(0, 15);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-medium">Usage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Private engagement log — who opened the demo, how long, which pages, and whether it was
          forwarded. {events.length} events. Per-recipient tags come from <code>?v=</code> links.
        </p>
      </header>

      {dbError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          Can&apos;t read the engagement log — the database is unreachable, or{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> / <code>SUPABASE_URL</code> is missing or invalid in
          this environment. While this shows, <code>/api/track</code> can&apos;t write either — it needs
          the same service-role key (the table has RLS on with no policies, so the anon key can&apos;t reach it).
        </p>
      ) : events.length === 0 ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          Database connected — no events yet. No one has opened a tagged link.
          Send a <code>?v=&lt;code&gt;</code> link (e.g. <code>?v=11</code>) to start tracking.
        </p>
      ) : null}

      <section>
        <h2 className="mb-2 font-heading text-lg">By recipient</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1.5 pr-3">Recipient (from link)</th>
                <th className="py-1.5 pr-3">Opens</th>
                <th className="py-1.5 pr-3">Sessions</th>
                <th className="py-1.5 pr-3">Countries</th>
                <th className="py-1.5 pr-3">Time on app</th>
                <th className="py-1.5 pr-3">Last seen</th>
                <th className="py-1.5 pr-3">Forwarded?</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => {
                const forwarded = r.countries.size > 1 || r.sessions.size > 1;
                return (
                  <tr key={r.recipient} className="border-b border-border/50">
                    <td className="py-1.5 pr-3 font-medium">{label(r.recipient)}</td>
                    <td className="py-1.5 pr-3">{r.opens}</td>
                    <td className="py-1.5 pr-3">{r.sessions.size}</td>
                    <td className="py-1.5 pr-3">{[...r.countries].join(", ") || "—"}</td>
                    <td className="py-1.5 pr-3">{fmtDuration(r.dwellMs)}</td>
                    <td className="py-1.5 pr-3">{fmtWhen(r.last)}</td>
                    <td className="py-1.5 pr-3">
                      {forwarded ? (
                        <span className="text-primary">
                          likely ({r.sessions.size} sessions{r.countries.size > 1 ? `, ${r.countries.size} countries` : ""})
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
              {!recipients.length && (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={7}>
                    No events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          &quot;Forwarded?&quot; is a heuristic — more than one session, or opens from more than one country,
          under the same link tag, suggests the link was passed on. Country-level only, no fingerprinting.
        </p>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-lg">Most-engaged pages</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1.5 pr-3">Page</th>
                <th className="py-1.5 pr-3">Views</th>
                <th className="py-1.5 pr-3">Total time</th>
              </tr>
            </thead>
            <tbody>
              {paths.map(([p, v]) => (
                <tr key={p} className="border-b border-border/50">
                  <td className="py-1.5 pr-3 font-mono text-xs">{p}</td>
                  <td className="py-1.5 pr-3">{v.views}</td>
                  <td className="py-1.5 pr-3">{fmtDuration(v.dwellMs)}</td>
                </tr>
              ))}
              {!paths.length && (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={3}>
                    No page views yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-lg">Recent activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1.5 pr-3">When</th>
                <th className="py-1.5 pr-3">Recipient</th>
                <th className="py-1.5 pr-3">Event</th>
                <th className="py-1.5 pr-3">Page</th>
                <th className="py-1.5 pr-3">Time</th>
                <th className="py-1.5 pr-3">Country</th>
                <th className="py-1.5 pr-3">Device</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 60).map((e, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 pr-3 whitespace-nowrap">{fmtWhen(e.ts)}</td>
                  <td className="py-1.5 pr-3">{e.recipient ? label(e.recipient) : "(untagged)"}</td>
                  <td className="py-1.5 pr-3">{e.event}</td>
                  <td className="py-1.5 pr-3 font-mono text-xs">{e.path ?? "—"}</td>
                  <td className="py-1.5 pr-3">{e.dwell_ms ? fmtDuration(e.dwell_ms) : "—"}</td>
                  <td className="py-1.5 pr-3">{e.country ?? "—"}</td>
                  <td className="py-1.5 pr-3">{e.device ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
