# Varsel — detailed development plan

*The end-to-end engineering plan. This is the plan-then-build artifact
(CLAUDE.md convention) — no app code is written until the owner green-lights.
Strategy: [ceo-play.md](ceo-play.md). Surfaces: [mockups/](mockups/). Facts to
cite: [ceo-research-digest.md](ceo-research-digest.md),
[research-brief.md](research-brief.md).*

---

## 0. Goal & definition of done

**Done = a recordable demo:** a deployed link (behind Vercel SSO) where the
three surfaces work end-to-end on real public data + a live Claude call with a
golden offline fallback, polished enough to screen-record the
[demo-script.md](demo-script.md) without a single stall, dead button, or
unsourced number. Not a product — a credible, honest, forwardable demo.

**Three non-negotiable credibility markers must be visible throughout:**
1. "built on public data · zero STG data" banner.
2. Citation chips on every regulatory number + visible abstention when a source
   is silent.
3. "live" vs "illustrative" labels (Radar is live; Impact bands are modeled).

## 1. Architecture

- **Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui** (style
  `radix-nova` — do NOT re-init; copy components.json + the registry approach
  from jensen-fms). Server-render by default; client components only for the
  interactive surfaces (map, sliders).
- **No database in v0.** All data is versioned JSON in `/src/data/` (see §2).
  Pouch Radar crawler output is cached JSON committed to the repo / written at
  build time — never fetched at request time (keeps the demo instant and
  offline-safe).
- **Claude server-side only** via `/src/app/api/ai/impact/route.ts`.
  `ANTHROPIC_API_KEY` in `.env.local`, never `NEXT_PUBLIC_`. Latest Sonnet-class
  for latency. Structured-output tool call (see §5).
- **`DEMO_MODE=offline`** (env) short-circuits the AI route to the matching
  golden response in `/src/data/golden/` — the presenter says "offline mode"
  out loud. Conference wifi is never a dependency.
- **Deploy:** Vercel, push-to-`main` → prod, gated behind Vercel SSO until the
  link is deliberately shared.
- **No auth, no RLS, no multi-tenancy** in v0 (Vercel SSO is the only gate).

```
/src
  /app
    layout.tsx                 # shell, public-data banner, nav
    page.tsx                   # Surface C — Global Pulse map (RSC + client map island)
    /impact/page.tsx           # Surface A — Impact Room
    /radar/page.tsx            # Surface B — Pouch Radar
    /api/ai/impact/route.ts    # live Claude call (server-only) + offline golden
  /components
    /map        (PulseMap.tsx — client, D3 + world-atlas)
    /impact     (ScenarioControls.tsx, ImpactBand.tsx, CitationChip.tsx, Abstain.tsx)
    /radar      (PriceChart.tsx, LaunchFeed.tsx)
    /ui         (shadcn components, radix-nova)
  /lib
    model.ts                   # the impact calculation (pure, unit-testable)
    corpus.ts                  # typed loaders + validators for /src/data
    format.ts                  # DKK / band formatting (Danish locale helpers)
  /data
    segment-model.json
    operations.json
    regulatory-corpus.json
    elasticity-priors.json
    /golden/*.json
    /radar/*.json
```

## 2. Data model (`/src/data`) — build this first, it's the spine

Each file is typed (a matching `type` in `/src/lib/corpus.ts`) and validated at
load (zod or hand-rolled guards) so a malformed datum fails the build, not the
demo.

- **`segment-model.json`** — STG's published FY2025 splits as the P&L
  denominator: divisions (EUB 3,270m, NABROW 3,017m, NAOR 2,749m), categories
  (handmade 3,164m, MRC+smoking 4,542m, pouches 428m, other 902m), geography
  (Americas 4,538m, Europe 3,934m, RoW 564m; US 4,230m = 46.8%), EBIT b.s.i.
  1,342m. Every field carries `source` + `asOf`. Derived fields (e.g. France
  MRC ~620m) carry `derived: true` + the derivation note.
- **`operations.json`** — the map: sites `[{type, label, country, city, lat,
  lng, employees?, makes?, source, approx?}]`. Types: manufacturing, leaf,
  pouch, retail, hq. ~12 sites + 15 superstores (geo from the research digest;
  Richmond VA is CLOSED — do not include).
- **`regulatory-corpus.json`** — the curated, dated, sourced events:
  `[{id, title, jurisdiction, instrument, sourceUrl, asOf, status, summary,
  knownRates: [{claim, value, sourceRef}], exposureFootprint: [...], appliesFrom}]`.
  Start with 5: EU ETD revision (COM(2025)580, applies 2028, pouch minima phase
  2030–2032), France ban (in force Apr 2026), Denmark 9mg+flavour, Spain 0.99mg
  proposal, US handmade tariffs (flag EO-14389 flux). This file is the citation
  source of truth — the AI may only cite from here.
- **`elasticity-priors.json`** — `[{category, low, base, high, source}]`
  (e.g. premium cigarettes −1.0…−1.2; pass-through 80–100%; IARC 2011). Powers
  the sliders' default ranges and the source chip.
- **`golden/*.json`** — one cached Claude response per pre-modeled scenario,
  keyed by `{eventId + assumptionHash}` for the demo's default slider positions.
- **`radar/*.json`** — cached crawler output (prices, launches, ranks). See §6.

## 3. Phase plan (each phase independently demoable; smoke-test before moving on)

> Estimates are `~human-dev-min (wall-clock wait while I build)`. After each
> phase: `tsc --noEmit` + `next build` + click every new route in Preview
> (RSC boundary violations pass the build and only explode at runtime —
> jensen-fms lesson fa1dbed).

### Phase 0 — scaffold + data spine  (~90 min build)
- `create-next-app` (TS, App Router, Tailwind), port shadcn radix-nova config
  from jensen-fms (do not re-init fresh).
- Layout shell: top bar with the **public-data banner**, nav (Pulse / Impact /
  Radar), footer with "as of" date.
- Write `segment-model.json` + `operations.json` + `/lib/corpus.ts` loaders &
  validators + `/lib/format.ts` (DKK band formatting).
- **Acceptance:** app boots, banner shows, data validates at build.

### Phase 1 — Surface C, the Global Pulse map  (~120 min)
- `PulseMap.tsx` (client island): D3 `geoNaturalEarth1` + `world-atlas@2`
  countries, markers from `operations.json` (colour by type, radius by
  employees), pulsing threat markers from `regulatory-corpus.json`.
- KPI rail (RSC) from `segment-model.json`. Threat chips → click locates marker
  and (Phase 2+) deep-links to `/impact?event=eu-etd`.
- The five CEO questions as the framing rail.
- **Acceptance:** map renders with real geo, threats locate on click, KPIs
  correct. This alone is a forwardable artifact.

### Phase 2 — Surface A, the Impact Room (static model)  (~150 min)
- `/lib/model.ts`: the pure impact function (effUp = price×passthrough;
  vol = elasticity×effUp; absorbed = price×(1−passthrough);
  EBITDA = base×(CM×vol − absorbed); band = recompute at elasticity ±0.30).
  **Unit-tested** (this is the one place a Vitest file earns its keep — the math
  is repeated to a CEO).
- `ScenarioControls.tsx` (sliders), `ImpactBand.tsx` (figure + band bar),
  `CitationChip.tsx`, `Abstain.tsx` (the "not stated in source" cell).
- Event selector wired to `regulatory-corpus.json`; deep-link from the map.
- **Acceptance:** sliders recompute the band live; every number sourced or
  abstained; honest-denominator note visible.

### Phase 3 — the live AI moment  (~120 min)
- `/api/ai/impact/route.ts`: server-only Claude call. Input = a corpus event +
  current assumptions. **Structured output** (a tool/JSON schema): the model
  returns `{narrative, lineItems:[{claim, value, sourceRef|abstain}], band}`.
- **Citation enforcement at the route layer:** reject/abstain any `lineItem`
  whose `sourceRef` isn't present in `regulatory-corpus.json` — the rails are
  code, not vibes. Prompt instructs: cite from the provided corpus only; if a
  rate isn't there, return `abstain: true` with a reason. Never invent.
- Golden response captured to `/src/data/golden/` for `DEMO_MODE=offline`.
- The demo uses "paste a snippet of a corpus-known text → cited impact" — NOT
  live-parse of an arbitrary URL (hallucination trap; descoped to post-pilot).
- **Acceptance:** live call returns cited structured impact; offline mode serves
  the golden response identically; an out-of-corpus claim abstains.

### Phase 4 — Surface B, the Pouch Radar  (~120 min crawler + UI)
- Crawler (a `/scripts/crawl-radar.ts` run locally / on a schedule, NOT at
  request time): Haypp group sitemaps (robots.txt exposes 34, no crawl-delay —
  sitemap-diff for launches/delists) + `nicotine-pouches.org` price API. Polite
  rate-limit; respect each site's ToS (facts/prices are low-risk under EU law,
  but check per-site ToS; buying Haypp's Media & Insights feed is the clean
  paid alternative). Output → `/src/data/radar/*.json`.
- `PriceChart.tsx` (Chart.js price-per-pouch, XQS vs ZYN vs Velo), `LaunchFeed.tsx`
  (launch/price events + a compliance-drift flag), KPI cards.
- **Acceptance:** chart + feed render from cached crawl; "live · refreshed
  [time]" label honest; sources cited.

### Phase 5 — polish, deploy, record  (~120 min + recording)
- Map narrative copy, empty/loading states, mobile not-broken (laptop-first).
- Write the demo-script timing into the build (the click path is smooth).
- Deploy to Vercel behind SSO; rehearse once in `DEMO_MODE=offline`.
- Record the ~3-min video ([demo-script.md](demo-script.md)).
- **Acceptance:** the script runs start-to-finish with no stalls; link
  forwards; video recorded.

**Total: ~10–12 human-dev-hours of build across the phases.** A forwardable
artifact exists after Phase 1; the demo is bookable after Phase 2; the live
clincher lands at Phase 3–4.

## 4. The credibility/honesty checklist (review before recording)

- [ ] Public-data banner on every page.
- [ ] Every regulatory figure has a citation chip → a real `regulatory-corpus`
      entry with a working `sourceUrl` + `asOf`.
- [ ] Abstention visibly fires on at least one known gap (France MRC line).
- [ ] Derived figures labelled "(modeled)" / "(analyst derivation)", never
      "STG's number".
- [ ] Bands, never naked point estimates.
- [ ] No investor-facing / earnings-language copy anywhere (EU MAR).
- [ ] Radar labelled "live"; Impact labelled "illustrative model".
- [ ] `DEMO_MODE=offline` produces the identical golden response.
- [ ] Re-verify the EU ETD dates (applies 2028; pouch minima phase 2030–2032)
      and Yulia's title against the AR2025 PDF before recording.

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| AI hallucinates a regulatory number to a CEO | Citation enforcement in the route (code, not prompt); abstention path; golden responses pre-reviewed |
| "Your DKK figures aren't real STG numbers" | It's the design: honest-denominator labels + the editable model + "plug in real volumes behind a DPA" as the paid step |
| Scraper breaks / ToS / data staleness | v1 = cached JSON, manual/scheduled refresh, not request-time; per-site ToS check; Haypp paid feed as clean fallback; "as of" timestamp visible |
| Live Claude call stalls on demo wifi | `DEMO_MODE=offline` golden responses, rehearsed |
| EU MAR / selective disclosure | No investor-facing output, framed as internal scenario prep, stated on-screen and in the email |
| Procurement/infosec kills "software" | v1 is a hosted link / "intelligence brief", zero integration, no data transfer |

## 6. Post-demo / paid expansion (not v0)

- DPA → STG's real volume/price data → finance-grade SKU-level precision
  (the honest-denominator gap closed).
- Supabase (EU) only when radar *history* or saved scenarios genuinely need
  persistence — ask first.
- Automated TRIS / EUR-Lex ingestion for the Impact corpus (post-pilot).
- Pre-earnings regulatory-impact retainer; bespoke scenario deep-dives.

## 7. Open decisions blocking Phase 0

See [ceo-play.md](ceo-play.md) §8 — chiefly: green-light Varsel as the 3-surface
build, the name, the lead worked example (EU ETD vs France), and the Anthropic
API key. Phase 0 can start the moment those are settled.
