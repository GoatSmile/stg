# Varsel — prototype spec (v0, pre-build)

*Status: proposed, awaiting owner green-light. Working title "Varsel" (Danish:
a warning / advance notice / forecast). The why lives in
[ceo-play.md](ceo-play.md); the evidence in
[ceo-research-digest.md](ceo-research-digest.md). The earlier HR/"Broen" spec is
parked — see [ideas.md](ideas.md) header.*

## One-liner

A standing web app that turns a live tobacco/nicotine **regulatory event** into a
**probability-weighted DKK EBITDA/volume/margin band on STG's own footprint** —
the thing no incumbent does, aimed at the CEO's single most-punished wound:
surprise guidance cuts in "a market condition of geopolitical uncertainty."

## Audience and demo context

CEO-magnetic in *content*; IR/CFO-office-adopted in *practice*. The real first
user is an IR analyst / FP&A / public-affairs lead (named surface: IR head
Torben Sand, CFO Marianne Rørslev Bock). The artifact is a **forwardable live
link** that sells itself up the chain. Must survive unattended viewing and being
forwarded into a halved-stock C-suite. Live-demo target: ~25–30 min, presenter-
driven, with one undeniable real-data moment.

## The three surfaces

### A — Impact Room (`/impact`) ⭐ spine
Pre-modeled shocks → DKK bands on a transparent model of STG's published
segments. Shocks: EU Tobacco Taxation Directive revision (COM(2025)580, applies
2028, pouch minima phase 2030–2032), France oral-nicotine ban (+ France as #1
MRC market), Denmark 9 mg/flavor cap, US handmade tariffs (scenario variable).
Each band has **editable elasticity & pass-through sliders** (with cited source
studies), low/base/high scenarios, "as of" dates, and a visible **"built on
public data only, zero STG data"** banner.

**Hard rules (the credibility of the demo depends on these):**
- Curated, dated, source-linked corpus (seeded JSON) — **no live-parse of an
  arbitrary URL** on stage.
- **Citation rails + abstention** — every number carries an inline source ref;
  no source → "not stated in source, needs human lookup," never a guess.
- **Honest denominator** — France-MRC and standalone-pouch DKK figures are
  labeled analyst derivations from published splits, with the estimation step
  visible and editable (not "STG's own numbers").
- Bands, not point estimates.

### B — Pouch Radar (`/radar`) — live-data proof layer
Daily index of XQS vs ZYN vs Velo across Sweden/UK (+ DE/IT/PL) from public
e-commerce exhaust: price-per-pouch, promo depth, new-SKU/flavor launch
detection, bestseller-rank as online share proxy. Built on Haypp sitemaps
(robots.txt exposes 34, no crawl-delay) + nicotine-pouches.org. The
verifiable-live wow that doesn't depend on elasticity math; its demand signal
feeds the pouch portion of the Impact Room.

### C — Frederiksen Brief (`/`) — wrapper / landing
The landing page is the five questions the CEO is under pressure to answer, each
wired to the module that addresses it. Framing device, not a separate build.

*Phase-2 teaser:* gray-market / orphaned-demand radar (where France/Denmark
banned demand migrates) — advocacy evidence + growth-capture signal.

## Stack

Per CLAUDE.md: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
(radix-nova), Vercel behind SSO. **No database in v0** — segment model + curated
regulatory corpus + golden responses are versioned JSON in `/src/data/`. The
Pouch Radar crawler output is cached JSON, refreshed on a schedule (not at
request time). Claude API server-side only (`/api/ai/*`), `ANTHROPIC_API_KEY`
server-side. Add Supabase only if the radar history genuinely needs persistence.

## Demo-grade engineering rules

- **Live AI, honest AI** — the impact estimate calls Claude for real; golden
  response in `/src/data/golden/` for `DEMO_MODE=offline`. Never cached-as-live.
- **Public data only, honestly labeled** — no real STG internal data in the repo
  ever; the model is built from STG's *published* disclosures + public
  regulatory texts, and says so on screen.
- **Every regulatory datum is dated and sourced** to the curated corpus. Stale-
  but-dated beats fresh-but-wrong; abstain rather than guess.
- **The demo script is a deliverable** (`docs/demo-script.md`): the worked
  example, the live moment, the recovery lines, the meta-close.

## Build plan

See [ceo-play.md](ceo-play.md) §7. Five phases, ~4 days to a clincher demo;
bookable after Phase 1 (Impact Room), clinched at Phase 3 (live Pouch Radar).

## Open decisions (owner)

See [ceo-play.md](ceo-play.md) §8: green-light Varsel vs. Pouch-Radar-first;
name; lead market for the worked example (EU ETD vs. France); API key;
re-verify incumbent cigar/pipe coverage before any client meeting.
