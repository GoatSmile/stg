# Varsel — surface mockups (design reference)

Faithful spec of the three surfaces, mocked live in the planning chat
(2026-06-12) as interactive widgets and described here so Phase 0 can rebuild
them in Next.js + shadcn. All figures are real public AR2025 numbers; the
impact math is illustrative-but-interactive. The chat widgets were styled with
the host design system (`--color-*` vars) — rebuild on shadcn/radix-nova tokens.

See [../ceo-play.md](../ceo-play.md) §4 (surfaces) and §5b (the video that walks
through them). Data: [../ceo-research-digest.md](../ceo-research-digest.md).

---

## Surface C — Global Pulse map (hero / landing, `/`)

The forwardable wow and the video's opener. Layout, top to bottom:
- Header: "Varsel — global pulse" · "Scandinavian Tobacco Group · FY2025" ·
  right-aligned pill **"built on public data · zero STG data · as of 12 Jun 2026"**.
- KPI cards (4): Net sales **DKK 9.0bn** · US share **46.8%** · Employees
  **8,858** · Markets **~100**.
- World map (D3 `geoNaturalEarth1`, `world-atlas@2/countries-110m`, neutral land
  fill) with point markers, colour = type:
  - Manufacturing & leaf (teal #1D9E75): Dominican Republic, Honduras, Nicaragua,
    Indonesia, Sri Lanka, Belgium (marker radius ∝ employees: DR 1,626 / Indonesia
    1,409 / Honduras 1,382 / Sri Lanka 1,264 the largest).
  - Pouches (purple #7F77DD): Svendborg DK (owned), Sweden + Poland (contract).
  - US online & 15 superstores (blue #378ADD): plotted on US South/SE cluster.
  - HQ (gray): Gentofte / Copenhagen.
  - **Live regulatory threats (red, pulsing)**: France, EU (Brussels), Denmark,
    Spain, US — each with a hover title.
- Legend row, then a tap-able threat chip grid (France / EU excise / Denmark /
  Spain / US tariffs). Tapping a chip rings + enlarges its map marker and writes
  the one-line exposure into a caption. In the real app, the chip click-throughs
  to the Impact Room pre-loaded on that shock.

## Surface A — Impact Room (the spine / money-shot, `/impact`)

> **The chat mockup of this surface contained the fatal flaw the red-team
> caught** (cited cigarette elasticity against a cigar base; default outside its
> own band; "applies 2028" as if enacted). The corrected spec below is what to
> build — it diverges from the rendered widget on purpose.

Worked example: **EU's proposed tobacco-tax revision — would raise excise
minimums** (chip: `COM(2025) 580 · proposed, in Council · as of 12 Jun 2026`,
CELEX `52025PC0580`). Header pill: "scenario prep · internal decision-support ·
not investor-facing" (the EU-MAR guardrail, visible). Two columns:
- **Left — assumptions (editable):** sliders — excise-driven price rise
  (2–16%, default 8), pass-through (50–100%, default 85), **exposed share** of
  the cigar/pipe base below the new floor (default conservative, labelled "which
  markets sit below the floor — your call"), and demand elasticity labelled
  **"cigars — no public consensus; a range you set"** (default *inside* the shown
  band; NO cited cigarette number against a cigar base).
- **Right — modeled annual EBITDA impact:** big red figure + a **band** + bar,
  context "vs EBIT before special items DKK 1,342m" (source chip), and an
  **eye-level tag beside the number**: "illustrative — public-data model, not
  STG's own figure". (Figures recomputed by `model.ts`; don't hard-code.)
- Footer strip: exposed base "EU cigar & pipe (modeled from published EUB
  splits)", contribution margin 30% (editable), and an **abstention** cell —
  "France-specific MRC line: not stated in source — needs STG volumes".

Interactive math: see [../build-plan.md](../build-plan.md) §3 Phase 2 — the
corrected contribution-margin walk on `exposedBase` (not the whole category),
with the band as min/max over the elasticity×pass-through grid (guaranteed to
bracket the base). Round every displayed number.

## Surface B — Pouch Radar (live-data proof, `/radar`)

Header pill: **"live · public e-commerce · refreshed 06:12 today"**.
- KPI cards: XQS share Sweden **13.6% ▲ from 7.8%** · XQS price/pouch **£0.18
  (mid)** · Mint = **58%** of UK cans · **7** new SKUs this week.
- Left: price-per-pouch line chart (Chart.js), UK 8mg mint — **ZYN ~£0.30**
  (coral), **Velo ~£0.22** (blue, dashed), **XQS ~£0.18** (teal, dotted); custom
  legend, dash patterns so colour isn't the only cue.
- Right: launch & price feed — ZYN 16.5mg menthol listed (sitemap diff), Velo
  Shift into Swedish bestseller top-10 (rank proxy), XQS Fizzy Peach back in
  stock, and a **compliance-drift flag** ("2 shops still shipping flavoured SKUs
  into Denmark post-cap").
- Footer: sources (Haypp storefronts — robots.txt exposes 34 sitemaps —
  + nicotine-pouches.org price API); "bestseller rank = online share proxy";
  "illustrative figures".

---

**Build note:** Surface B is the only one with genuinely live data on day one;
A and B's numbers are illustrative until real volumes arrive behind a DPA. The
map's geo + KPIs are real public data. Keep the three honesty markers (public-
data banner, citation chips + abstention, "live/illustrative" labels) — they are
the credibility spine, not decoration.
