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

- Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- shadcn style is `radix-nova` (same as jensen-fms — do NOT re-init with
  newer CLI defaults; `base-nova` won't compose with `asChild` patterns)
- Deploy: Vercel, push-to-`main` → prod, gated behind Vercel SSO until we
  deliberately share a link
- **No database in v0.** All data is versioned JSON in `/src/data/`: the STG
  segment model (from published disclosures), the curated regulatory corpus,
  golden AI responses, and cached Pouch Radar crawler output. Add Supabase
  (EU region) only when a feature genuinely needs persistence (e.g. radar
  history) — and ask first; it adds a moving part to the demo.
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

- **Five lenses are stubs.** Sales / Finance / Procurement / Supply / ESG ship a
  real KPI rail + a few markers + a `·soon` tag (provably-coming, not empty).
  Only Regulatory + HR are built out. Expand per `docs/map-platform.md` §4.
- **Static dated JSON, no live feeds yet.** Lens `asOf` and all marker values are
  hardcoded snapshots in `src/data/`; the "agents fetch it live" story (ECB FX,
  careers feed, weather…) is designed but not wired. First real feed is the next
  build step. No DB yet (Supabase deferred to first scheduled feed).
- **Illustrative data is asterisked, not hidden.** Figures STG doesn't publish
  (per-site turnover, retirement-risk, derived DKK bands) are fabricated-plausible
  and marked `*`; what's real vs derived vs fabricated lives in `docs/stg-facts.md`.
- **`.claude/launch.json` is local-only** (gitignored): `npm run dev` on :3000 for
  the preview workflow; recreate it if a fresh clone needs the preview server.

## Out of scope for the demo

- Auth/RLS/multi-tenancy (Vercel SSO is the only gate)
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
- **Next:** Phase 3 — make the Impact number live (`/api/ai/impact`: a server-only
  Claude call with a golden offline fallback and citation enforcement at the route
  layer) and wire the first **live public feed** (ECB FX or the SuccessFactors
  careers feed) to prove "agents fetch it live" → then Surface B (Pouch Radar /
  Sales lens). Add Supabase (EU) when the first scheduled feed needs history. Then
  the ~3-min video + forwardable link (GTM in `docs/outreach.md` +
  `docs/demo-script.md`; open decisions in `docs/ceo-play.md` §8).
- When phases ship, log them here (jensen-fms-style: what shipped, commit range,
  what's next) so a fresh session can pick up cold from this file + git history.
