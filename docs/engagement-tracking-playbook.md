# Engagement tracking playbook (DocSend-style, cookieless)

A reusable recipe for tracking **who opened a link you sent, how long they
stayed, which pages they read, and whether they forwarded it** — without
cookies, a consent banner, or a paid tool. Built for Next.js (App Router) +
Supabase + Vercel. First shipped in the STG/Varsel prototype; this doc is the
generalised version to drop into `valent.dk` or any future project.

> **TL;DR:** one Supabase table, one client component, one API route, one
> owner-only dashboard page. ~150 lines total. Free. Cookieless. Per-recipient
> tags ride in an opaque `?v=<code>` link that vanishes from the address bar.

---

## 1. What you get

- **Per-recipient engagement.** Send `you.com/?v=11` to one person, `?v=12` to
  another. The dashboard shows each separately — opens, sessions, time-on-app,
  last seen.
- **Opaque, self-erasing tags.** `?v=11` is a meaningless code (not a name), and
  the tracker strips it from the address bar a beat after load — the recipient
  sees a clean URL with nothing that reads as "tracking."
- **Owner-only name map.** A `RECIPIENT_MAP` env var turns `11` into "Yulia (11)"
  on your dashboard. Only the code ever travels in a URL or lands in the DB.
- **Forwarding heuristic.** More than one session — or opens from more than one
  country — under the same tag flags a likely forward.
- **Page-level depth.** Which pages got read, and for how long.
- **Country-level geo** (from the host's edge header) and device class.
- **Cookieless → no consent banner.** Tags live in `sessionStorage`, not cookies.

---

## 2. Architecture

```
  recipient opens  you.com/?v=11
        │
        ▼
  [UsageTracker]  (client component, mounted in layout)
     • reads ?v= once → sessionStorage → strips it from the URL
     • on each page: sends a "view"  (navigator.sendBeacon)
     • on leave/nav/hide: sends a "dwell" with time-on-page
        │  POST /api/track  (cookieless body; cookies ride along if gated)
        ▼
  [/api/track]  (server route, service-role key)
     • validates, adds country from the edge geo header
     • inserts one row → Supabase           ── always returns 204, never throws
        │
        ▼
  [varsel_usage_events]  (Supabase, RLS on, no policies → service key only)
        ▲
        │  read with service-role key
  [/usage?key=ADMIN_KEY]  (owner-only dashboard, 404s without the key)
```

Four files + one table. Each piece is below, copy-paste ready.

---

## 3. Prerequisites

- **Next.js App Router** (Next 14/15/16). Pages/Server components both fine.
- **A Supabase project** (any region; pick EU for GDPR comfort).
- **Vercel** for hosting — needed only for the free `x-vercel-ip-country` geo
  header and the optional Web Analytics. Other hosts work; see §11 for the geo
  header swap.

---

## 4. Step 1 — the table

Run once in the Supabase SQL editor (or via migration). **RLS is on with *no*
policies** — that means anon/public keys can't read or write it at all; only the
**service-role key** (server-side) can. That's the privacy lock.

```sql
create table if not exists public.varsel_usage_events (
  id        bigint generated always as identity primary key,
  ts        timestamptz not null default now(),
  event     text not null,          -- 'view' | 'dwell'
  path      text,                   -- e.g. '/impact'
  recipient text,                   -- the opaque ?v= code, or null (untagged)
  session   text,                   -- per-tab uuid (cookieless)
  device    text,                   -- 'desktop' | 'mobile'
  country   text,                   -- ISO-2 from the edge geo header
  referrer  text,
  dwell_ms  integer                 -- time on page (dwell events)
);
alter table public.varsel_usage_events enable row level security;
create index if not exists varsel_usage_events_ts_idx        on public.varsel_usage_events (ts desc);
create index if not exists varsel_usage_events_recipient_idx on public.varsel_usage_events (recipient);
```

> **Rename per project:** change the table name (`varsel_usage_events` →
> `<app>_usage_events`) and update it in the two server files below.

---

## 5. Step 2 — environment variables

| Var | Where | What |
|---|---|---|
| `SUPABASE_URL` | server | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | server **only** | the service-role key. **Never** `NEXT_PUBLIC_`. This is the one that reads/writes the RLS-locked table. |
| `ADMIN_KEY` | server | any secret string — guards the `/usage` dashboard. |
| `RECIPIENT_MAP` | server | optional JSON, e.g. `{"11":"Yulia","12":"CFO"}`. Maps codes → names on the dashboard. |

Set them in `.env.local` for dev **and** in the host's env for prod.

> ⚠️ **The two gotchas that cost us an hour (see §10):** the **service-role**
> key is different from the **anon** key — a project that only ever used the anon
> key (e.g. for public reads) will *not* have the service key in prod, and both
> the write and the dashboard silently no-op without it. And **changing any host
> env var requires a redeploy** to take effect.

---

## 6. Step 3 — the write endpoint

`src/app/api/track/route.ts` — fire-and-forget, always 204, never throws (tracking
must never break or block the page).

```ts
import { NextResponse } from "next/server";

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
      country: req.headers.get("x-vercel-ip-country"), // host-specific — see §11
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
```

No Supabase SDK needed — it's a plain REST POST with the service key. The input is
length-capped and the event type is allow-listed, so the public endpoint can't be
used to write arbitrary junk.

---

## 7. Step 4 — the client tracker

`src/components/UsageTracker.tsx` — captures the tag, strips it from the URL, logs
a `view` per page and a `dwell` on leave. **Use `sendBeacon`, not `fetch`** (see
§10 — privacy browsers drop the fetch).

```tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function recipient(): string | null {
  try { return sessionStorage.getItem("varsel_v"); } catch { return null; }
}

// Read ?v= once, stash it, then strip it from the address bar so the recipient
// sees a clean URL. Other params (?event=, ?lens=, etc.) are preserved.
function captureTag() {
  try {
    const url = new URL(window.location.href);
    const v = url.searchParams.get("v");
    if (!v) return;
    sessionStorage.setItem("varsel_v", v.slice(0, 40));
    url.searchParams.delete("v");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  } catch { /* ignore */ }
}

function sessionId(): string {
  try {
    let s = sessionStorage.getItem("varsel_s");
    if (!s) {
      s = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("varsel_s", s);
    }
    return s;
  } catch { return "na"; }
}

function device(): "mobile" | "desktop" {
  try {
    const uaMobile = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile;
    if (typeof uaMobile === "boolean") return uaMobile ? "mobile" : "desktop";
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
  } catch { return "desktop"; }
}

function send(event: "view" | "dwell", path: string, dwellMs: number, beacon: boolean) {
  try {
    const body = JSON.stringify({
      event, path, dwellMs,
      recipient: recipient(),
      session: sessionId(),
      device: device(),
      referrer: document.referrer || null,
    });
    if (beacon && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* never surface */ }
}

export function UsageTracker() {
  const pathname = usePathname();
  const curPath = useRef("");
  const enteredAt = useRef(0);

  useEffect(() => { captureTag(); }, []);

  useEffect(() => {
    const now = Date.now();
    if (curPath.current && enteredAt.current) {
      send("dwell", curPath.current, now - enteredAt.current, true);
    }
    curPath.current = pathname;
    enteredAt.current = now;
    // Prefer sendBeacon for the view too. A keepalive fetch to /api/track gets
    // dropped by privacy browsers/shields (Brave) that let the beacon through —
    // observed as dwells landing but views never arriving, which zeroes "Opens".
    send("view", pathname, 0, true);

    const flush = () => {
      if (curPath.current && enteredAt.current) {
        send("dwell", curPath.current, Date.now() - enteredAt.current, true);
        enteredAt.current = Date.now();
      }
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  return null;
}
```

> **Rename per project:** the `sessionStorage` keys `varsel_v` / `varsel_s`.

### 7.1 — Exclude your own visits (owner opt-out)

Without this, **your own visits and any real untagged visitor land in the same
`(untagged)` bucket** — you can't tell them apart. Fix: a persistent per-browser
opt-out. Visit `?notrack=1` once on each of your devices; from then on the tracker
sends nothing from that browser (`localStorage` persists across sessions, unlike
the `?v=` tag). Add these to `UsageTracker.tsx`:

```ts
const NOTRACK_KEY = "varsel_notrack";

// ?notrack=1 sets a persistent opt-out for this browser; ?notrack=0 clears it.
function syncNotrackFlag() {
  try {
    const url = new URL(window.location.href);
    const nt = url.searchParams.get("notrack");
    if (nt === null) return;
    if (nt === "0") localStorage.removeItem(NOTRACK_KEY);
    else localStorage.setItem(NOTRACK_KEY, "1");
    url.searchParams.delete("notrack");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  } catch { /* ignore */ }
}
function isOptedOut(): boolean {
  try { return localStorage.getItem(NOTRACK_KEY) === "1"; } catch { return false; }
}
```

Then call `syncNotrackFlag()` in the mount effect (before the first send), and
guard `send()` with `if (isOptedOut()) return;` as its first line. After this,
`(untagged)` means only *real external* visitors who arrived without a tag — not
you. (Per-browser, so set it on each device; doesn't clean rows already logged.)

---

## 8. Step 5 — mount it

In `src/app/layout.tsx`, drop both components at the end of `<body>`:

```tsx
import { Analytics } from "@vercel/analytics/next"; // optional, see §9
import { UsageTracker } from "@/components/UsageTracker";

// ... inside <body>, after your app shell:
        <UsageTracker />
        <Analytics />
```

---

## 9. Step 6 — the owner-only dashboard

`src/app/usage/page.tsx`. 404s unless `?key=` matches `ADMIN_KEY` (the page does
not exist without it — important if your app has a *shared* password that the
recipients also know). Reads the table with the service-role key. The "no data"
banner is split into an honest **DB-error** state vs a **connected-but-empty**
state (see §10).

```tsx
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY;
const TABLE = "varsel_usage_events";

let RECIPIENT_MAP: Record<string, string> = {};
try { RECIPIENT_MAP = JSON.parse(process.env.RECIPIENT_MAP || "{}"); } catch { RECIPIENT_MAP = {}; }
const label = (code: string) => (RECIPIENT_MAP[code] ? `${RECIPIENT_MAP[code]} (${code})` : code);

type Ev = {
  ts: string; event: string; path: string | null; recipient: string | null;
  session: string | null; device: string | null; country: string | null; dwell_ms: number | null;
};

function fmtDuration(ms: number): string {
  if (ms < 1000) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
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
    } catch { dbError = true; }
  } else { dbError = true; }

  // Aggregate per recipient + per path.
  const byRec = new Map<string, { recipient: string; opens: number; sessions: Set<string>; countries: Set<string>; dwellMs: number; last: string }>();
  const byPath = new Map<string, { views: number; dwellMs: number }>();
  for (const e of events) {
    const rk = e.recipient ?? "(untagged)";
    const a = byRec.get(rk) ?? { recipient: rk, opens: 0, sessions: new Set(), countries: new Set(), dwellMs: 0, last: e.ts };
    if (e.event === "view") a.opens++;
    if (e.session) a.sessions.add(e.session);
    if (e.country) a.countries.add(e.country);
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
    <div>
      <h1>Usage — {events.length} events</h1>

      {dbError ? (
        <p style={{ color: "crimson" }}>
          Can&apos;t read the log — DB unreachable, or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_URL missing
          in this environment. While this shows, /api/track can&apos;t write either.
        </p>
      ) : events.length === 0 ? (
        <p>Database connected — no events yet. Send a ?v=&lt;code&gt; link to start tracking.</p>
      ) : null}

      {/* Render recipients (label(r.recipient), opens, sessions.size, countries, fmtDuration(dwellMs),
          fmtWhen(last), and a "forwarded?" flag = sessions.size > 1 || countries.size > 1) and the
          paths table. Full markup in the STG repo's src/app/usage/page.tsx. */}
    </div>
  );
}
```

The forwarding flag is just `sessions.size > 1 || countries.size > 1` under one
tag. (The STG version has the full styled tables — copy that file directly and
restyle.)

---

## 10. Hard-won lessons (read before you ship)

1. **Service-role key, not anon key.** RLS-on-no-policies means *only* the
   service key touches the table. If a project previously used only the anon key
   (e.g. public reads), the service key won't be in prod — and both the write
   and the dashboard silently fail. Symptom: dashboard shows a DB-error, table
   stays empty. Fix: add `SUPABASE_SERVICE_ROLE_KEY` to the host env.

2. **Host env changes need a redeploy.** Setting/changing `RECIPIENT_MAP`,
   `ADMIN_KEY`, etc. in the Vercel dashboard does **not** update the running
   deployment. Redeploy after any env change.

3. **`sendBeacon`, not `fetch`.** A `keepalive` fetch to `/api/track` gets
   dropped by Brave / privacy shields / ad-blockers while `sendBeacon` slips
   through. Symptom: `dwell` events land but `view` events don't, so "Opens"
   reads 0. Send *both* event types via `sendBeacon`. (The endpoint name itself —
   `/api/track` — wasn't blocked for us; only the fetch method mattered. If you
   want belt-and-suspenders, name it something neutral like `/api/e`.)

4. **Honest empty-state.** Distinguish "DB read failed" from "connected but no
   events yet." Conflating them hides a misconfiguration (a missing key) as a
   benign "no traffic yet."

5. **The forwarding nuance.** Because `?v=` is *stripped* after capture: a
   recipient who forwards the **original** link (the email, with `?v=` still in
   it) propagates the tag → shows as a 2nd session under that code = "forwarded."
   One who copies the **clean** address-bar URL forwards untagged → "(untagged)."
   Both are useful; just know `(untagged)` is often real forwarded traffic.

6. **Lag is by design, not caching.** `dwell` (the time) only fires when someone
   *leaves* a page; the dashboard is fresh-per-load but doesn't auto-refresh
   (reload to update). Don't chase a "caching bug" that isn't one.

7. **Re-opening your own tagged link trips the forward heuristic** (2 sessions
   under one code). Normal during testing — don't be fooled.

---

## 11. Adapting to a new project

- **Rename:** table `varsel_usage_events`, `sessionStorage` keys `varsel_v` /
  `varsel_s`, and the `TABLE` const in both server files.
- **Non-Vercel host:** swap the geo header. Netlify: `x-nf-geo` (JSON, decode it);
  Cloudflare: `cf-ipcountry`. Or drop `country` entirely (the rest still works).
- **No password gate:** nothing changes — the tracker and `/api/track` don't
  depend on a gate. (If you *do* have one, allow-list `/api/track` or rely on the
  auth cookie riding along with the same-origin beacon, and allow-list any
  analytics path like `/_vercel`.)
- **No `RECIPIENT_MAP`:** the dashboard just shows raw codes. Fine.
- **Want raw breadth too?** Add Vercel Web Analytics (`@vercel/analytics`) for
  cookieless aggregate visits/countries/devices alongside this per-recipient log.
  Toggle it on in the Vercel dashboard → Analytics.

---

## 12. Privacy posture (what you can honestly say)

- **Cookieless** — tags and session ids live in `sessionStorage`, which is not a
  cookie, so no consent banner is legally required in most reads of GDPR/ePrivacy
  for first-party, non-cross-site measurement. (Take your own legal view.)
- **Country-level geo only**, from the edge header — no IP stored, no GPS, no
  device fingerprinting.
- **You control the identity map.** Only an opaque code travels; names live in a
  server-side env var you hold.
- **Owner-only dashboard**, gated by a secret key, served with the service key.
- Keep the per-recipient log in an **EU region** if your recipients are EU.

---

## 13. Cost

Free at this scale. Supabase free tier (the table is tiny) + Vercel Hobby/Pro
(the route is a normal serverless function). Vercel Web Analytics has a free
allowance. No third-party tracker, no DocSend subscription.

---

## 14. One link that unlocks AND tags (signed `?k=` tokens)

If the demo sits behind a shared-password gate (STG/Varsel's `src/proxy.ts`), emailing
a link **and** a password on the next line is a strong spam/phishing signal — an owner
cold email to a CEO landed in Gmail junk exactly that way (`.../?v=10` + `Password: …`).
This add-on collapses **access + recipient tag into one forwardable link** with no
password line: `/?k=<code>~<sig>`. Requires the password gate from the host app (this is
the one part that isn't in this generic recipe); everything else reuses §7's `?v=` tracker.

**How it works**
- `<sig>` = `HMAC-SHA256(ACCESS_TOKEN_SECRET, <code>)`, base64url, first 27 chars (~160 bits).
  Stateless — no token store; any code the owner signs is valid.
- The proxy verifies `?k=`: on success it **sets the gate cookie (unlock)** and **307s to
  `/?v=<code>`**, handing the code to the existing `?v=` tracker (§7). Invalid/missing → the
  normal password `/gate`.
- One secret both signs (the generator) and verifies (the proxy), so they can't drift.

**Token helpers** — `src/lib/gate.ts`. Web Crypto, so the Edge proxy and the Node
generator share one implementation:

```ts
function b64url(bytes: Uint8Array): string {
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function sign(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return b64url(new Uint8Array(mac)).slice(0, 27);
}
export async function makeAccessToken(secret: string, code: string) {
  return `${code}~${await sign(secret, code)}`;
}
export async function verifyAccessToken(secret: string, token: string): Promise<string | null> {
  const sep = token.lastIndexOf("~"); if (sep <= 0) return null;
  const code = token.slice(0, sep), sig = token.slice(sep + 1);
  const expected = await sign(secret, code);
  if (sig.length !== expected.length) return null;               // constant-time compare
  let diff = 0; for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? code : null;
}
```

**Proxy handoff** — `src/proxy.ts`, before the gate-cookie check (`pw` = `SITE_PASSWORD`):

```ts
const k = req.nextUrl.searchParams.get("k");
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
if (k && accessSecret) {
  const code = await verifyAccessToken(accessSecret, k);
  if (code) {
    const dest = req.nextUrl.clone();
    dest.searchParams.delete("k");
    dest.searchParams.set("v", code);                 // hand off to the ?v= tracker (§7)
    const res = NextResponse.redirect(dest);
    res.cookies.set(GATE_COOKIE, await gateToken(pw), {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }
}
```

**Generate the links** — `scripts/make-access-links.ts` + `npm run access:links` prints one
link per `RECIPIENT_MAP` entry. Self-contained `node:crypto` (its `digest("base64url")` is
byte-identical to the Web Crypto `b64url` above — verified), so it needs no import from
`src`. Run it with the secret + map in the env:

```bash
node --env-file=.env.local --experimental-strip-types scripts/make-access-links.ts
# or point at whichever domain is live:
BASE_URL='https://stg.valent.dk' npm run access:links
```

**Env:** `ACCESS_TOKEN_SECRET` (server-only, never `NEXT_PUBLIC_`). The **same value** must be
in the host env (where the proxy verifies) and wherever you generate links (where they're
signed), or prod links won't verify. It gates a public-data demo, so a short *random* secret
is fine — but not a guessable one: a leaked link lets a weak secret be brute-forced offline.
**Changing the secret invalidates every link already sent**, so pick it once.

**Ops notes**
- **Test a link yourself with `&notrack=1`** (§7.1) so your own click isn't logged under that
  recipient.
- **Host env change needs a redeploy** (§10.2). If `ACCESS_TOKEN_SECRET` isn't in prod, `?k=`
  links silently fall back to the password page.
- **Host the demo on your own domain, not `*.vercel.app`** — a free-host link from a young
  sending domain reads as phishing no matter how clean the token is. (STG: `stg.valent.dk` via a
  Vercel custom domain — add the domain in Vercel, then a CNAME `stg` → the `…vercel-dns-*.com`
  value it gives you.)
- **Forwarding:** because the proxy sets the cookie and redirects to `/?v=<code>`, a forwarded
  *original* `?k=` link still unlocks and tags as the original recipient — extra opens show under
  them (consistent with §10.5). The `code` is visible in the token, but it's opaque (a number) and
  not a secret; the secret is only in the signature + the env.
