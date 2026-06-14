# STG / Varsel

Pitch prototype targeting Scandinavian Tobacco Group (STG) — built by
Jensen Production / valent.dk as a consulting calling card. **Varsel** (Danish:
a warning / advance notice / forecast) is a regulation→P&L early-warning room:
it turns a live tobacco/nicotine regulatory event into a DKK EBITDA/volume/margin
band on STG's own footprint (a scenario range, not a point estimate). First recipient is
**Yulia Lyusina, SVP Strategy, Transformation & Sustainability** (warm intro via
the owner's wife in STG HR), designed to be forwarded up to the **CFO**
(Marianne Rørslev Bock) and CEO (Niels Frederiksen). Delivered as a ~3-min
video + forwardable link, not a deck. **This is a demo, not a production
system** — every engineering decision below follows from that.

Read first: `docs/ceo-play.md` (the live strategy + the pivot), then
`docs/prototype-spec.md` (what we're building) and `docs/ceo-research-digest.md`
(sourced facts — cite from here, don't re-research). `docs/research-brief.md`
holds the STG/regulation/vendor facts; `docs/ideas.md` is the **parked** HR
track (reference only).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui
- shadcn style is `radix-nova` (same as jensen-fms — do NOT re-init with
  newer CLI defaults; `base-nova` won't compose with `asChild` patterns)
- Deploy: Vercel, push-to-`main` → prod at `https://stg-azure.vercel.app`. SSO/password
  gating is the intent but is currently **off (on hold per owner)** — prod is public, so
  gate it before the link goes out.
- **JSON-first, one DB table.** All data is versioned JSON in `/src/data/`: the STG
  segment model (from published disclosures), the curated regulatory corpus,
  golden AI responses, and cached Pouch Radar crawler output. **Supabase (EU) is
  now wired** for the one feature that needs history — the careers feed's daily
  snapshots: project **"Valent - proposals"** / eu-west-3, ref `nphebbjrdtaldrgqlssn`,
  table `public.varsel_careers_snapshots`, public-read RLS + service-role writes.
  Migrated 2026-06-14 out of the shared jensen-fms "Jensen" project
  (`jzlphajunfrqvpogzsiz`) into this dedicated project — isolation is now by separate
  project, not just the `varsel_` prefix. Everything else stays versioned JSON; add
  further tables only when a feature genuinely needs persistence, and ask first.
- Claude API server-side only (`/api/ai/*` routes, `ANTHROPIC_API_KEY` in
  `.env.local` — never `NEXT_PUBLIC_`). Default model: latest Sonnet-class
  for live demo latency; check `/model` pricing before switching.

## Demo-first engineering principles — do not silently change these

- **Live AI, honest AI.** The impact estimate calls Claude for real. Every live
  call ships with a cached golden response in `/src/data/golden/`, served when
  `DEMO_MODE=offline` (set in `.env.local`). Conference/client wifi is not a
  dependency we accept. Never present a cached response as live — the presenter
  says "offline mode" out loud.
- **Citation rails + abstention (the credibility spine).** Every number the AI
  emits about a regulation carries an inline source reference to the curated
  corpus. If a rate is not in a cited source, the model returns "not stated in
  source — needs human lookup," NEVER a guess. A wrong euro figure repeated to a
  CEO kills the pitch. Show the rails in the demo — they build trust.
- **Public data only, honestly labeled.** No real STG internal data in this repo,
  ever, until a signed DPA exists. The segment model is built from STG's
  *published* disclosures + public regulatory texts, and the UI says so (a
  visible "built on public data, zero STG data" banner). Real people's names
  (the CEO, CFO, IR head, analysts) may appear in `/docs` for strategy context
  but be deliberate about them in app UI — the app is about *numbers and
  regulations*, not individuals.
- **Honest denominator.** STG does not publish a France-specific MRC line or a
  standalone pouch DKK figure. Any such number is an *analyst derivation from
  published splits* — label it as such, make the estimation step visible and
  editable. Never present a derived figure as "STG's own number." (Real volumes
  behind a DPA = the paid expansion, not a v1 claim.)
- **Assumptions are first-class.** Elasticity and pass-through are editable
  sliders with their source studies shown. Bands, not point estimates. The CFO
  co-owns the model instead of contesting it.
- **No earnings-language feature.** Under EU MAR / selective-disclosure, we never
  generate investor-facing copy. Outputs are framed as internal decision-support
  / scenario prep only.
- **Every page must survive unattended viewing and forwarding.** The link is the
  go-to-market. No lorem ipsum, no dead buttons, no console errors on the happy
  path. A half-built feature is hidden behind a flag, not shipped half-built.
- **Wow over rigor, but never fake.** Skipping auth, hardcoding a scenario:
  fine, note it in "Demo shortcuts" below. Faking precision we don't have, or a
  capability we can't deliver: never — this demo's credibility IS the pitch.

## Conventions (inherited from jensen-fms, still binding here)

- **Git: commit on `main`, push to `origin` every time.** No PRs, no feature
  branches. Solo-dev shop; speed beats process.
- Plan-then-build: before writing code, list files you intend to create/modify
  and wait for confirmation.
- Server-render initial page; client components only for interactive state
  (the elasticity sliders are the main interactive surface).
- shadcn/ui components by default; custom only when shadcn lacks it.
- Sentence case in UI text — never Title Case. ALL-CAPS eyebrow micro-labels
  via CSS (`uppercase tracking-wide text-xs`) are the accepted exception;
  keep the underlying string sentence case.
- Money: display DKK explicitly (e.g. `DKK 620m`, or `1.234,56 kr.` Danish
  locale where precise) — and a band (low/base/high), never a naked point.
- Time estimates quoted as `~X human-dev-min (Y min wait)`.
- UI language: English (STG corporate + investor language).
- `tsc --noEmit` + `next build` before declaring a phase done, then smoke-test
  new routes in the browser/Preview — builds pass on RSC boundary violations
  that only explode at runtime (lesson inherited from jensen-fms fa1dbed).

## Repo layout

- `/docs` — strategy, spec, research, demo script. The docs are deliverables
  here, same rank as code.
- `/src/data` — STG segment model, curated regulatory corpus (each datum dated +
  source-linked), golden AI responses, cached radar output. Versioned, reviewed
  like code.
- `/src/app` — routes per spec: `/` (Pulse map platform — the home), `/impact`
  (Impact Room), `/radar` (Pouch Radar), `/transparency` (honest-data contract).

## Demo shortcuts (running log — add as they're taken)

- **Two lenses are stubs.** Supply / ESG ship a real KPI rail + a few markers + a
  `·soon` tag (provably-coming, not empty). Regulatory, HR, Finance (live ECB FX),
  Sales (Pouch Radar), and Procurement (live Open-Meteo weather) are built out. Expand
  per `docs/map-platform.md` §4.
- **Three live feeds wired; other markers are static snapshots.** `/api/feeds/fx`
  (ECB FX → Finance), `/api/feeds/careers` (SuccessFactors → Supabase → HR), and
  `/api/feeds/weather` (Open-Meteo → Procurement) read live with offline-safe cached
  fallbacks; other lens `asOf`/marker values remain hardcoded snapshots in `src/data/`.
  The careers feed now holds **real data** — a one-time, owner-authorised pull (2026-06-14)
  of STG's SuccessFactors RMK API (`/services/recruiting/v1/jobs`) found **60 real open
  vacancies** (3 evergreen "talent pool" posts excluded), 29 at strategic sites + 31 US
  retail/bars; the illustrative `49` seed is gone (Supabase + `careers.json` + HR markers
  rewritten). `scripts/crawl-careers.ts` parses the real payload but stays **manual-only**:
  the rich API is robots-disallowed, so per owner decision it is **not** wired to a daily
  job against `/services/` ("automate some other way" later) — see
  `docs/careers-scrape-decision.md` (now RESOLVED). Freight / commodity-prices etc. are
  designed, not yet wired.
- **Illustrative data is asterisked, not hidden.** Figures STG doesn't publish
  (per-site turnover, retirement-risk, derived DKK bands) are fabricated-plausible
  and marked `*`; what's real vs derived vs fabricated lives in `docs/stg-facts.md`.
- **`.claude/launch.json` is local-only** (gitignored): `npm run dev` on :3000 for
  the preview workflow; recreate it if a fresh clone needs the preview server.
- **Live AI defaults to offline.** `/api/ai/impact` calls Claude only when
  `ANTHROPIC_API_KEY` is set and `DEMO_MODE` ≠ `offline`; otherwise (and on any
  error) it serves the cached golden, labeled "offline" in the UI — so the demo
  never depends on wifi. Model `claude-sonnet-4-6` is one constant in the route.

## Out of scope for the demo

- Auth/RLS/multi-tenancy (Vercel SSO is the intended gate — currently off per owner; see Stack)
- Real STG volume/SKU data integration — that's the paid, post-DPA phase. v1
  models the *shape* of impact on published segments so the "plug in your real
  numbers" story is honest.
- Automated regulatory-feed scrapers for the Impact Room — v1 is a curated,
  manually-refreshed dated corpus. Live TRIS/EUR-Lex ingestion is post-pilot.
  (The Pouch Radar crawler is in scope — it's public e-commerce exhaust, proven
  feasible, and is the live-data wow.)
- Mobile-first polish (demo runs on a laptop/projector; don't ship broken
  mobile, but don't gold-plate it)
- Automated test suite (manual smoke-test discipline instead — demo with a
  shelf life, not a product. Revisit if it graduates to a pilot)

## Escalation

Strategy and scope questions (which surface to cut, whether to add Supabase,
the worked-example market, anything touching how the pitch lands) go to the
owner — often decided in a separate planning chat. Tactical implementation
stays here. Anything involving contact with STG, real STG data, or claims
repeated to the client: owner decides, always.

## Status & handoff

- **Surface C scaffold shipped — `922e93c` (2026-06-13).** Varsel Pulse runs: a
  department-switchable D3 world map with the **Regulatory** (default) and **HR**
  lenses built out fully and five lenses stubbed; the `/transparency` page; and
  provenance flags throughout. Built on the jensen-fms radix-nova stack
  (Next 16.2.5 / React 19 / Tailwind 4). `tsc` clean + `next build` green (6 static
  pages, no RSC trap); verified in-browser — lens switch re-skins KPIs + markers,
  marker click opens the detail card. The CEO play (Varsel) superseded the parked
  HR/"Broen" track June 2026 (`docs/ceo-play.md`); re-architecture in
  `docs/map-platform.md`, data-of-record in `docs/stg-facts.md`.
- **Surface A — Impact Room shipped — `c1c164d` (2026-06-13).** The regulation→DKK
  band drill-down (worked example: EU-ETD on the cigar/pipe core). Pure
  contribution-margin model in `src/lib/impact-model.ts` (band = min/max over the
  elasticity × pass-through grid — brackets the base, can't invert); editable
  assumption sliders recompute the band live; citation chips, visible abstention,
  a "proposed — in Council" status (never "enacted"), and the "illustrative — not
  STG's own figure" tag are the credibility rails. Default band ≈ DKK 45–95m at
  risk/yr. Static model only — the live AI route + golden responses are Phase 3.
- **Phase 3 — live Impact AI shipped — `d88e42d` (2026-06-14).** `/api/ai/impact`
  is a server-only Claude call (`claude-sonnet-4-6`, per the live-latency choice)
  that writes the CFO narrative + cited line-items; the DKK band stays the local
  deterministic model (the AI never produces the number). Citation enforcement is
  **code** in `src/lib/citation-rail.ts` — value-match, not key-exists (a
  hallucinated figure under a real source is abstained), run on live and golden
  alike. `DEMO_MODE=offline` / no `ANTHROPIC_API_KEY` → the pre-reviewed golden in
  `src/data/golden/` (France-MRC abstention pinned); the route never throws to the
  client. Offline path verified in-browser (4 cited + 2 abstained, honest
  live/offline badge); live path wired (drop a key in `.env.local` to exercise).
- **First live feed shipped — `c94fe38` (2026-06-14).** `/api/feeds/fx` fetches
  ECB `eurofxref-daily.xml` live (30-min cache, 4s timeout) → USD/DKK · EUR/DKK ·
  GBP/DKK + a first-order USD sales-exposure line on the Finance lens (now out of
  stub). Offline-safe: a committed snapshot is served and labeled "cached" on any
  failure — never faked live. Pure parse/cross-rate in `src/lib/fx.ts`
  (node-verified). No DB — FX history → Supabase is the trigger.
- **Careers feed + Supabase shipped — `db08466` (2026-06-14).** `/api/feeds/careers`
  reads daily open-role snapshots from Supabase (EU, `varsel_careers_snapshots`,
  public-read RLS, seeded real 2026-06-13 data) → open roles, oldest vacancy,
  staffing-up site, and hiring velocity (null until ≥2 crawls — no faked trend) on
  the HR lens, with a cached fallback. The scheduled scraper is
  `scripts/crawl-careers.ts` (validate its `parseJobs` against the live site on the
  first real run). Verified reading live from Supabase in-browser.
- **Surface B — Pouch Radar shipped — `2ef485b` (2026-06-14).** The Sales-lens
  drill-down (`/radar`, static / SSR-safe): XQS vs VELO vs ZYN price/strength/rank
  bars across SE/UK/DK + a launch & compliance feed with source chips. v1 is a
  curated snapshot — structure/shares sourced, per-can prices/ranks illustrative* —
  with the crawler (`scripts/crawl-radar.ts`) built and **ToS-gated** (build-plan
  §4). Sales lens un-stubbed; Sweden/UK markers deep-link to it (`Marker.radar`).
- **Careers DB moved to its own Supabase project — (2026-06-14; infra + gitignored env + this doc, no app-code change).**
  `varsel_careers_snapshots` migrated from the shared "Jensen" project
  (`jzlphajunfrqvpogzsiz`, eu-west-1) to a dedicated **"Valent - proposals"** project
  (`nphebbjrdtaldrgqlssn`, eu-west-3) — table + RLS policy + the seeded 2026-06-13 row,
  verified jsonb-identical, then the source table dropped from "Jensen" (its 54
  jensen-fms tables untouched; confirmed 55→54). Local `.env.local` **and Vercel prod
  env** both re-pointed + redeployed — verified reading live (`live:true`, real
  `crawledAt`) from the new project. Exposed secret key **rotated** (old key confirmed
  revoked/401); the new `sb_secret_…` lives where the scraper runs. Site gating (Vercel
  SSO/password) is **on hold** per owner — prod is currently public. (The 2026-06-14 real
  careers pull below has since written a live row to this project via the MCP; running
  `crawl-careers.ts` with the service key to exercise its own write path is the only minor
  unexercised bit, and it stays manual-only.)
- **Procurement weather lens shipped — `fda757a` (2026-06-14).** Un-stubbed Procurement
  with a live **Open-Meteo** leaf-region feed: pure lib (`src/lib/weather.ts` — 5 origins
  + a transparent stated crop-risk rule: dry <5mm / heat ≥35°C / wet >120mm on the 7-day
  forecast), `/api/feeds/weather` (30-min cache, 4s timeout, offline-safe cached
  fallback), and `WeatherStrip` wired into the dashboard via `lens.feed === "weather"`.
  `tsc` clean + `next build` green; verified in-browser (live badge; DR dry/high, Sri
  Lanka wet/elevated). Free + keyless, no ToS gate. **Supply / ESG are now the only stubs.**
- **Real careers data + STG-brand restyle shipped — (2026-06-14).** A four-part pass:
  (1) **Careers feed is now real.** A one-time owner-authorised pull of STG's
  SuccessFactors RMK API (`POST /services/recruiting/v1/jobs`) found **60 open vacancies**
  (29 strategic + 31 US retail/bars; 3 evergreen "talent pool" posts + one >365-day standing
  req handled honestly). `careers.json`, the Supabase row (illustrative `49` seed **deleted**
  so hiring-velocity reads "accruing", not a fake +11), the HR markers/KPIs, and
  `crawl-careers.ts`'s parser were all rewritten to the real payload. The careers-scrape
  decision is **RESOLVED**: scraper stays **manual-only**, never automated against the
  robots-disallowed `/services/` ("automate some other way" later). (2) **"Jensen" removed
  from client-facing surfaces** — footer + README → "Nazar Taras / valent.dk", crawler UA
  email → `valent.dk`; internal `jensen-fms` dev-doc lineage kept per owner. (3) **Map
  zoom-to-fit** — `PulseMap` now `fitExtent`s the projection to the union of all sites +
  markers (deterministic at module load, stable across lenses), cropping the dead
  ocean/Antarctica a whole-world fit wasted; viewBox tightened to `960×340`. (4) **STG
  warm-heritage restyle** — re-skinned in STG's own brand language (pulled from
  st-group.com): claret `#950b31` as the single signal colour, warm ivory/parchment grounds
  + espresso ink (`globals.css` token rework, light + dark + map tokens), **Fraunces** serif
  for the masthead + section headings (Geist kept for all data/UI). Provenance/data colours
  kept deliberately distinct from the brand; STG's **lion logo not used** (honest note on
  `/transparency`). `tsc` clean + `next build` green (10 pages); verified in-browser across
  Pulse / HR / Impact / Radar + dark mode, no console errors.
- **Next (video deferred per owner):** build out the last two stub lenses —
  **Supply, then ESG** (same pattern: real KPI rail + markers + a live feed where one
  exists). Optional: leaf-price (FRED/USDA) + water-stress (WRI Aqueduct) overlays on
  Procurement. The ~3-min video +
  forwardable link (GTM in `docs/outreach.md` + `docs/demo-script.md`; open decisions in
  `docs/ceo-play.md` §8) is parked, not dropped.
- When phases ship, log them here (jensen-fms-style: what shipped, commit range,
  what's next) so a fresh session can pick up cold from this file + git history —
  and reconcile the Stack / Demo-shortcuts state above (stub count, live-feed count,
  versions) so the top of this file never contradicts the log.
