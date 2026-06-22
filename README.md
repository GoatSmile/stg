# Varsel for STG — regulation→P&L early-warning room

*Updated: 2026-06-22 09:59 CEST*

A pitch prototype for Scandinavian Tobacco Group, built by Nazar Taras / valent.dk.
It turns a tobacco/nicotine regulation (EU excise revision, the France pouch ban, the
Denmark nicotine cap, flavour caps) into a DKK EBITDA/volume/margin **band** on STG's own
*published* footprint — a scenario range, not a point estimate — the thing no incumbent does.
Aimed at the office of the CEO/CFO. **Built on public data only, zero STG internal data.**

The in-app display name is **"Varsel for STG"**; "Varsel" stays the internal codename.

## Status: shipped, deployed, gated

Feature-complete and live (gated) at `https://stg-azure.vercel.app` — shared password
(`SITE_PASSWORD`).

- **7 department lenses, zero stubs** — Regulatory, HR, Finance, Sales, Procurement, Supply, ESG.
- **5 live public-data feeds**, each with an offline-safe cached fallback — ECB FX, careers
  (→ Supabase EU), Open-Meteo weather, NOAA ENSO climate, FRED Brent freight.
- **Impact Room** (`/impact`) — three worked examples (EU-ETD proposed + France ban & Denmark cap
  in-force): regulation → DKK band, with editable assumption sliders, citation + abstention rails,
  and a live Claude narrative (golden offline fallback). The band is a deterministic local model —
  the AI never produces the number.
- **Pouch Radar** (`/radar`) — competitive nicotine-pouch tracking (strength / flavour / price /
  price-per-mg), real + sourced, feeding the Impact Room's flavour-cap scenario.
- **Home** (`/`) leads with an interactive engine preview + a hindsight/lead-time card, then the
  7-lens map. **One-pager** (`/onepager`) is a print-clean PDF export. **Transparency**
  (`/transparency`) is the honest-data contract.
- **Resilience:** bounded AI call → golden fallback, cached feed fallbacks, branded error
  boundaries, prod password gate.

## Stack

Next.js 16 (App Router) · TypeScript · React 19 · Tailwind 4 · shadcn/ui (radix-nova) · D3 +
TopoJSON map · Anthropic Claude (`claude-sonnet-4-6`, server-side only) · Supabase (EU, one table) ·
Vercel (push-to-`main` → prod).

## The docs (deliverables — same rank as code)

- **Current state / working agreements:** [CLAUDE.md](CLAUDE.md) — the authoritative status log.
- **Strategy:** [docs/ceo-play.md](docs/ceo-play.md) · **platform architecture:**
  [docs/map-platform.md](docs/map-platform.md) · **spec:** [docs/prototype-spec.md](docs/prototype-spec.md)
  · **build plan:** [docs/build-plan.md](docs/build-plan.md)
- **Evidence base (sourced):** [docs/ceo-research-digest.md](docs/ceo-research-digest.md) ·
  [docs/research-brief.md](docs/research-brief.md) · [docs/stg-facts.md](docs/stg-facts.md)
- **Commercial:** [docs/commercial-strategy.md](docs/commercial-strategy.md) ·
  [docs/pilot-proposal.md](docs/pilot-proposal.md) · [docs/outreach.md](docs/outreach.md)
- **Pitch prep:** [docs/demo-script.md](docs/demo-script.md) · [docs/qa-prep.md](docs/qa-prep.md)
  (the C-level Q&A answer sheet)
- **Parked:** [docs/ideas.md](docs/ideas.md) — the earlier HR/"Broen" track (reference only).

## Dev

`npm run dev` (:3000). The gate is **off** when `SITE_PASSWORD` is unset (local dev stays open).
The Claude call is live when `ANTHROPIC_API_KEY` is set and `DEMO_MODE` ≠ `offline`; otherwise it
serves the pre-reviewed golden, labelled "offline." `tsc --noEmit` + `next build` are the ship gates.

## Printing the docs (numbered PDFs)

Markdown has no pages, so the `.md` files print without page numbers. To get print-ready,
page-numbered PDFs (e.g. to upload to a print kiosk — upload the `.pdf`, not the `.md`):

```
npm run docs:pdf                          # all docs/*.md → docs/print/*.pdf
npm run docs:pdf -- qa-prep.md            # just one doc (the "--" is required; ".md" optional)
npm run docs:pdf -- outreach pilot-proposal   # a selected few
```

A4, "Page X of Y" baked into the footer (dark enough for B/W). Renders via your installed
Chrome/Brave/Edge/Chromium (`CHROME_PATH=…` to override) — no Chromium download. Output
`docs/print/` is gitignored. Script: [scripts/docs-to-pdf.mjs](scripts/docs-to-pdf.mjs).
