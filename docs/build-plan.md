# Varsel — detailed development plan

*Updated: 2026-06-22 09:59 CEST*

*The end-to-end engineering plan. This is the plan-then-build artifact
(CLAUDE.md convention) — no app code is written until the owner green-lights.
Strategy: [ceo-play.md](ceo-play.md). Surfaces: [mockups/](mockups/). Facts to
cite: [ceo-research-digest.md](ceo-research-digest.md),
[research-brief.md](research-brief.md).*

> **⚠️ Shipped — this is the pre-build plan, kept for the record.** The app is built, deployed and
> gated; all 7 lenses, 5 live feeds, the Impact Room and Pouch Radar are live. Two choices below were
> superseded in the build: the gate is an in-app env-driven `SITE_PASSWORD` page (**not** Vercel SSO),
> and Supabase (EU) **is** wired for the careers feed (**not** "no DB in v0"). Data-model filenames
> also drifted (shipped as `operations.json` + `layers/*.json`, `impact-model.ts`, `lenses.ts`). For
> current state, read the "Status & handoff" log in [CLAUDE.md](../CLAUDE.md) and
> [map-platform.md](map-platform.md) §8.

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

- **Next.js 16 App Router + TypeScript + Tailwind + shadcn/ui** (style
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
  pouch, retail, hq. ~12 sites + 15 superstores (geo from the research digest).
  **Richmond, VA (Sutliff/Mac Baren) is CLOSED** — last production 28 Feb 2025,
  consolidated into Assens, DK ([cigar-coop, Jan 2025](https://cigar-coop.com/2025/01/stg-shutting-down-sutliff-tobacco-richmond-facility-and-streaming-portfolio-news.html));
  carry that dated `sourceRef` so the omission is provably correct, not an
  error. (Note: this corrects the earlier commercial-footprint line in the
  digest, which predates the closure.)
- **`regulatory-corpus.json`** — the curated, dated, sourced events:
  `[{id, celex, title, jurisdiction, instrument, status, sourceUrl, asOf,
  summary, knownRates: [{claim, value, unit, sourceRef}], exposedShare?,
  exposureFootprint: [...], appliesFrom}]`. Start with 5: EU ETD revision
  (`COM(2025) 580`, CELEX `52025PC0580`, status **proposed — in Council
  negotiation**, proposed to apply from 2028, pouch minima phase 2030–2032),
  France ban (in force Apr 2026), Denmark 9mg+flavour, Spain 0.99mg proposal,
  US handmade tariffs (flag EO-14389 flux). `status` is rendered on-screen
  (proposed vs in-force) — never present a proposal as enacted. This file is the
  citation source of truth — the AI may cite only from here, by `sourceRef`,
  and only values that match `knownRates` (see Phase 3).
- **`elasticity-priors.json`** — `[{category, low, base, high, source,
  hasPublicConsensus}]`. **Honesty rule:** there is no clean public elasticity
  for *cigars/pipe* — that category sets `hasPublicConsensus:false`, the UI
  labels the slider "demand elasticity (cigars — no public consensus; a range
  you set)", and the default sits inside whatever band is shown. Do NOT display
  a cited cigarette elasticity (e.g. IARC 2011 −1.0…−1.2) against a cigar/pipe
  base — that mismatch is the single fastest way an ex-BCG reader catches the
  citation rail "citing a number you then don't use." Cigarette/pouch categories
  may carry their real cited priors where the base actually is cigarettes/pouches.
- **`golden/*.json`** — one cached Claude response per pre-modeled scenario,
  keyed by `{eventId + assumptionHash}` for the demo's default slider positions.
- **`radar/*.json`** — cached crawler output (prices, launches, ranks). See §6.

## 3. Phase plan (each phase independently demoable; smoke-test before moving on)

> Estimates are `~human-dev-min (wall-clock wait while I build)`. After each
> phase: `tsc --noEmit` + `next build` + click every new route in Preview
> (RSC boundary violations pass the build and only explode at runtime —
> jensen-fms lesson fa1dbed).

### Phase 0a — source verification  (~60 min, no code)
Before any datum enters the corpus, confirm against the AR2025 PDF + primary
sources and record `sourceRef`/`asOf` for each: EU ETD status & dates (proposed,
in Council, applies 2028, pouch minima 2030–2032), the Richmond VA closure, the
segment/geography splits, and Yulia's exact current title. A wrong fact here
propagates into a number shown to a CEO — this block is cheap insurance.

### Phase 0b — scaffold + data spine  (~90 min build)
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

### Phase 2 — Surface A, the Impact Room (static model)  (~3–4 h)
- `/lib/model.ts`: a contribution-margin walk on clearly-typed **fractional**
  inputs (no unit/sign defect). Given `exposedBase` (DKK revenue actually below
  the new excise floor — NOT the whole category), `priceIncreasePct`,
  `passThrough`, `elasticity` (negative), `contributionMargin`:
  ```
  effPriceUp        = priceIncreasePct × passThrough
  retainedVolFactor = 1 + elasticity × effPriceUp        // <1
  volumeLossDKK     = exposedBase × (1 − retainedVolFactor)
  marginLossOnVol   = volumeLossDKK × contributionMargin
  absorbedExcise    = exposedBase × priceIncreasePct × (1 − passThrough)
  ΔEBITDA           = −(marginLossOnVol + absorbedExcise)   // negative = at risk
  ```
  **Band = min/max of ΔEBITDA over the full grid** of {elasticity, passThrough}
  low/base/high from `elasticity-priors.json` — this guarantees the band brackets
  the base point and can never invert (the ±0.30 shortcut could). _(Planned a Vitest
  unit-suite here to pin the band-brackets invariant + a zero-exposed-share case;
  later dropped per CLAUDE.md "out of scope" — manual smoke-test discipline instead.
  Revisit if this graduates to a pilot.)_
- **`exposedShare` is a first-class, visible input** — the model never applies
  an excise *minimum* across 100% of a category (a minimum only bites below the
  floor). Default conservative, labelled "assumption — which markets sit below
  the floor", editable.
- `ScenarioControls.tsx` (sliders), `ImpactBand.tsx` (figure + band bar),
  `CitationChip.tsx`, `Abstain.tsx`, and an **always-visible eye-level tag** next
  to the DKK figure: "illustrative — public-data model, not STG's own figure".
- Event selector wired to `regulatory-corpus.json`; deep-link from the map.
- **Acceptance:** sliders recompute the band live; band always brackets the base;
  every number sourced or abstained; the "not STG's figure" tag sits beside the
  number (not buried in a footer).

### Phase 3 — the live AI moment  (~120 min)
- `/api/ai/impact/route.ts`: server-only Claude call. Input = a corpus event +
  current assumptions. **Structured output** (a tool/JSON schema): the model
  returns `{narrative, lineItems:[{claim, value, sourceRef|abstain}], band}`.
- **Citation enforcement at the route layer (value-match, not key-exists):**
  reject-to-abstain any `lineItem` whose `sourceRef` is missing **OR** whose
  `value` doesn't match the corpus `knownRates[sourceRef].value` within tolerance
  (exact string for non-numeric claims). Validating only that the source ID
  exists still lets a hallucinated *number* through — the rail must check the
  number. The rails are code, not prompt vibes.
- **Offline behaviour that keeps sliders live:** `{eventId+assumptionHash}` only
  hits for the default sliders, so in `DEMO_MODE=offline` freeze the Claude
  *narrative* to the default-scenario golden, but **always recompute the band
  locally via `model.ts`** from current slider state. The sliders stay live
  offline; only the prose is cached. (A pure golden-by-hash would go blank the
  moment the presenter drags a slider — the rehearsed path.)
- **Pin an abstention golden fixture:** a deterministic golden for the default
  EU-ETD scenario where the France-specific MRC line returns `abstain:true`
  ("not stated in source — needs human lookup"); assert the route returns it
  verbatim offline. The scripted abstention beat must not depend on a live
  model's mood.
- The demo uses "paste a snippet of a corpus-known text → cited impact" — NOT
  live-parse of an arbitrary URL (hallucination trap; descoped to post-pilot).
- **Acceptance:** live call returns value-validated cited impact; offline mode
  serves frozen narrative + live-recomputed band; the France-line abstention
  fires deterministically.

### Phase 4 — Surface B, the Pouch Radar  (~3–4 h crawler + UI)
- **GATE (do first):** Surface B does not ship until a per-retailer **ToS read**
  confirms automated price collection is permitted. robots.txt permission ≠ ToS
  permission — post-*Ryanair v PR Aviation*, a site's ToS can contractually
  restrict scraping of even public, non-protected price data. If a retailer's
  ToS prohibits it, fall back to the **Haypp Media & Insights paid feed** or a
  manually-sourced snapshot. Prefer **sitemap-diffing** over HTML scraping.
- Crawler (`/scripts/crawl-radar.ts`, run locally / on a schedule, NOT at request
  time): permitted Haypp sitemaps + `nicotine-pouches.org` API; polite
  rate-limit; output → `/src/data/radar/*.json` with `crawledAt`.
- `PriceChart.tsx` — **`'use client'` + `next/dynamic({ssr:false})`** (Chart.js
  touches `window`/canvas; an SSR import 500s — the "passes build, explodes at
  runtime" trap). `LaunchFeed.tsx` (events + compliance-drift flag), KPI cards.
- **Acceptance:** ToS check logged per source; chart + feed render from cached
  crawl; `/radar` does not 500 with JS disabled; "live · refreshed [crawledAt]"
  label honest; sources cited.

### Phase 5 — polish, deploy, record  (~2–3 h + recording)
- Map narrative copy, empty/loading states, mobile not-broken (laptop-first).
- Walk the demo-script click path until smooth; run the honesty checklist (§4).
- Deploy to Vercel behind SSO; rehearse once in `DEMO_MODE=offline`.
- Record the ~3-min video ([demo-script.md](demo-script.md)) — VO *after* the
  build so spoken figures match the screen.
- **Acceptance:** the script runs start-to-finish with no stalls; link
  forwards; video recorded.

**Total: ~16–20 human-dev-hours** (the earlier ~10–12 underestimated the D3 map,
the crawler, and the AI-route rails by ~2×). A forwardable artifact exists after
Phase 1; the demo is bookable after Phase 2; the live AI clincher lands at
Phase 3. **Recommended cut if time-boxed: ship Phases 0–3 (map + impact + live
AI) as the demo and treat the Pouch Radar (Phase 4) as a fast-follow** — it's the
highest-effort, highest-ToS-risk surface, and Phases 0–3 already carry the
pitch.

## 4. The credibility/honesty checklist (review before recording)

- [ ] Public-data banner on every page.
- [ ] Every regulatory figure has a citation chip → a real `regulatory-corpus`
      entry with a working `sourceUrl` + `asOf`; the route value-matches it.
- [ ] Proposals labelled **"proposed / in Council"**, never as enacted; "would
      raise", not "raises". (COM(2025) 580 is a proposal.)
- [ ] Abstention visibly fires on at least one known gap (France MRC line),
      from a pinned golden fixture.
- [ ] Elasticity slider for cigars/pipe is labelled "no public consensus — a
      range you set"; **no cited cigarette elasticity shown against a cigar base**;
      default sits inside the displayed band.
- [ ] `exposedShare` visible and editable — no minimum-excise applied across a
      whole category.
- [ ] "Illustrative — not STG's own figure" tag sits **beside** the DKK number,
      not only in a footer.
- [ ] Bands, never naked point estimates; band brackets the base (unit test).
- [ ] No investor-facing / earnings-language copy anywhere (EU MAR); a persistent
      "internal scenario prep" footer on the app UI, not only a spoken line.
- [ ] Radar labelled "live · [crawledAt]"; Impact labelled "illustrative model".
- [ ] `DEMO_MODE=offline`: frozen narrative + locally-recomputed live band.
- [ ] Re-verify EU ETD status/dates, the Richmond closure, and Yulia's title
      against the AR2025 PDF before recording (Phase 0a).

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
