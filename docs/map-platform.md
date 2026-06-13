# Varsel Pulse — the map as a department platform (re-architecture)

*Owner's expanded scope (2026-06-13): the Global Pulse map is no longer a single
regulatory view — it's a **department-switchable operations platform**. Flip a
switch and the same world map re-skins with HR / Sales / Finance / Procurement /
Supply-chain / Sustainability / Regulatory data. This doc is the design + how it
connects to [build-plan.md](build-plan.md). Data-of-record: [stg-facts.md](stg-facts.md).*

---

## 1. The concept

One map engine, many **lenses**. A department picker (segmented control, top of
Surface C) swaps the *marker payload* and *overlays*, not the map. Each lens
answers "what does my department see when it looks at STG's footprint?" — live
where the data is public or agent-fetchable, illustrative (asterisked) where it
isn't yet.

This reframes — does not replace — the three surfaces:
- **Surface C (the map) becomes the platform / home.** The regulatory threat
  view is now just the **Regulatory lens**. Default lens on load = **Regulatory**
  (the CEO/Yulia story); the HR lens is the first to build out fully (richest
  obtainable data + owner priority).
- **Surface A (Impact Room)** = the drill-down behind the Regulatory & Finance
  lenses (click a threat → DKK band).
- **Surface B (Pouch Radar)** = the drill-down behind the Sales lens.

So the platform unifies the earlier surfaces under one navigational spine, and
adds HR / Procurement / Supply / ESG as new lenses.

## 2. Why this is a strong product idea (not just a bigger demo)

- **It shows range.** One artifact proves the app serves the whole C-suite, not
  one function — exactly what makes a strategy SVP (Yulia) forward it sideways.
- **The live-agent story becomes visceral.** "AI agents go fetch public data and
  keep each department's map fresh" is concrete and demonstrable (FX, weather,
  freight, jobs, prices — all real feeds; see §5).
- **It's honest about its own limits.** The provenance legend (§6) turns "we
  don't have all the data" into a credibility feature, not a weakness.

## 3. Architecture (how the layers work)

Same map engine; a `lenses` registry drives everything. No new map per lens.

```
/src/data
  operations.json          # the shared geo spine: every site {id,type,country,city,lat,lng,flag}
  layers/
    regulatory.json        # threat markers + per-market status  [public]
    hr.json                # headcount, openings, *retirement/turnover  [public + agent + *]
    sales.json             # pouch price/share, store signals  [public/agent]
    finance.json           # segment $, FX, regulatory-P&L hook  [public]
    procurement.json       # leaf regions, commodity/weather risk  [public/agent]
    supply.json            # lanes, freight, *OTIF  [public/agent + *]
    sustainability.json    # *emissions, water-stress  [public + agent + *]
  feeds/                   # cached AI-agent feed snapshots (FX, weather, freight, jobs…)
```

```ts
// shape (TypeScript, /src/lib/lenses.ts)
type Provenance = 'public' | 'agent' | 'internal' | 'fabricated' // drives the legend + asterisk
type Marker = { siteId: string; value?: number; label: string; provenance: Provenance; sourceRef?: string; asOf?: string }
type Lens = {
  id: string; dept: string; label: string; icon: string;
  markers: Marker[];           // re-skins the shared geo spine
  overlays: Overlay[];         // arcs (flows), choropleth (market status), badges
  metrics: KpiCard[];          // the rail for this dept
  legend: ProvenanceCount;     // how many markers are public / agent / internal / *
  feeds?: FeedRef[];           // which live feeds refresh this lens
}
```

The map component takes `activeLens` and renders `operations.json` + the lens's
markers/overlays. Switching lenses is a client state change — instant, no reload.

## 4. The lenses

Each lists 4–8 overlays, tagged `[public-now]` / `[agent]` (AI fetches public
data on a schedule) / `[internal]` (needs STG data — shown as `*` illustrative
in the demo) / `*` (fabricated-plausible). Full inventory in
[ceo-research-digest.md](ceo-research-digest.md); condensed here.

### 4.1 HR / People — *build this lens first and richest* (owner priority)
The "typical life of the company from HR's seat," on a map:
- **Headcount by site**, markers sized by employees (DR 1,626 … UK 52). `[public-now]`
- **Open positions per location + days-open**, live from the SuccessFactors
  careers feed (~49 roles; city+postal in the URL; posting date on detail page).
  Badge per city = # openings; colour = oldest days-open. `[agent]` — *the hero
  HR feature, and it's real.*
- **Hiring velocity** ("where STG is staffing up vs freezing") — diff the careers
  feed over time. `[agent]`
- **Employer-brand signal** — Glassdoor/Indeed rating + review count per country
  entity. `[agent]`, directional.
- **Restructuring/closure news pins** — geolocated (e.g. Sutliff closure). `[agent]`
  (date-filter — the halfwheel layoff piece is 2018).
- **Retirement-risk / seniority index** per site — `*` illustrative (needs
  PeopleHub age/tenure); shown banded with an explicit "illustrative — needs
  PeopleHub" tag.
- **Turnover / attrition by site** — group turnover 18.7% is `[public-now]`;
  per-site is `*` (PeopleHub).
- **Office/lease expiries** — `*` (internal).
KPI rail: 8,858 employees · 18.7% turnover · ~49 open roles · 30/50/20 region split.

### 4.2 Sales / Commercial
Per-market pouch price & bestseller-rank (XQS vs ZYN vs Velo) `[public-now]` (=
Pouch Radar) · competitor SKU launches geotagged `[agent]` · cigar e-commerce
price/promo war `[public-now]` · superstore footfall via Google popular-times
`[agent]` proxy · per-market MRC share (published aggregates) `[public-now]` ·
per-store revenue `*`.

### 4.3 Finance
Segment revenue/EBITDA by region `[public-now]` · live FX exposure by currency
(ECB feed; USD ≈ half of sales) `[public-now]` · share price/analyst consensus
`[public-now]` (display-only, MAR) · **regulatory-P&L band per market** = the
Impact Room hook `[agent]` · tariff exposure by lane `[agent]` · cost-program /
leverage tracker `[public-now]` · live receivables/working capital `*`.

### 4.4 Procurement / Leaf sourcing
Leaf-growing regions plotted `[public-now]` · tobacco-leaf commodity price
(FRED/USDA) `[agent]` · **weather/drought risk per growing region (Open-Meteo)**
`[agent]` — the best procurement wow · supplier concentration / STP coverage
(>70 strategic suppliers) `[public-now]` aggregate · EUDR deforestation exposure
per origin `[agent]` · per-supplier scores `*`.

### 4.5 Supply chain / Logistics
Factory→market flow arcs `[public-now]` geo / `*` volumes · ocean-freight rate
per lane (Freightos FBX) `[agent]` · port congestion `[agent]` · the 2025 SAP
go-live execution-risk markers (EU done, **US late 2026** = the next pulsing
risk) `[public-now]` narrative · inventory/OTIF/days-of-supply `*`.

### 4.6 Sustainability / ESG
SBTi status badge `[public-now]` · Scope 1/2/3 group totals `[public-now]` /
per-site `*` · **water-stress of growing regions (WRI Aqueduct)** `[agent]` ·
deforestation/land-use (Global Forest Watch) `[agent]` · catalogue-reduction
(US online) `[public-now]` · per-supplier STP scores `*`.

### 4.7 Regulatory / Public Affairs (the default lens)
Live threat pins per market `[public-now]` · per-market regime choropleth
(banned/restricted/open) `[public-now]` · threat → DKK Impact Room click-through
`[agent]` · excise-rate-by-market `[public-now]` · live EUR-Lex/TRIS ingest
`[agent]` (roadmap/post-pilot) · gray-market flow (Phase-2 teaser) `[agent]`.

## 5. The AI-agent live-data feeds (the "agents go get it" story)

Concrete, mostly-free public feeds an agent refreshes on a schedule — this is
the demonstrable "live" claim (full list in [stg-facts.md](stg-facts.md) §10):

| Feed | Powers | Cost |
|---|---|---|
| ECB euro FX rates (`eurofxref-daily.xml`) | Finance | free |
| Open-Meteo + NOAA ENSO + WRI Aqueduct | Procurement, ESG | free* |
| FRED / USDA tobacco-leaf prices | Procurement | free |
| Freightos Baltic Index / Drewry WCI | Supply chain | partly free |
| SuccessFactors careers feed | HR | scrapable |
| Haypp + nicotine-pouches.org | Sales | scrapable (ToS gate) |
| EUR-Lex webservice + TRIS | Regulatory (roadmap) | free |

Demo framing: "each lens has agents that fetch public data and keep it current —
here's the FX from this afternoon, the weather over the Dominican leaf region,
this morning's competitor price moves, today's open roles." Real, current,
undeniable — and where a feed needs STG's own data, the marker is asterisked.

## 6. Transparency & the honest-data contract (owner's explicit requirement)

Full transparency about what's real, what's agent-fetched, and what's fabricated:
- **Three-flag provenance** everywhere (`[C]` / `[I]` / `*` in data;
  `public` / `agent` / `internal` / `fabricated` in the UI).
- **Per-lens provenance legend** — a small key on each switched view: "of N
  markers: X public · Y agent-fetched · Z illustrative*". Turns honesty into a
  visible feature and demonstrates the app's *ability* distinct from current data.
- **Asterisk (`*`) on every fabricated datum**, inline, always paired with
  "illustrative". Fabricated data is plausible and likely obtainable (usually
  behind a DPA) — never a guess presented as fact.
- **Footer disclaimer** on every page: one line — "Built on public data. Some
  figures are illustrative (marked *). How we source everything →" linking to…
- **`/transparency` page** (a real route): explains the method, lists every data
  source with its flag, states what's public vs agent-fetched vs illustrative vs
  needs-a-DPA, and restates the MAR posture (internal scenario prep, not
  investor-facing). This page *is* the credibility play — it's the first thing a
  skeptical ex-BCG reader (or her Legal team) will want.
- **Fake-data policy (owner):** if data is likely real and obtainable, use it
  (real). If not, fabricate plausibly and asterisk it. Unknown locations →
  hypothetical + asterisk. The demo shows a *hypothetical situation + the app's
  abilities*, not only verified facts — but the line between the two is always
  visible.

## 7. Database decision

v0 stays **no-DB / versioned JSON** for the static spine (operations + lens
data) — it keeps the demo instant and offline-safe. **But** two features pull
toward a lightweight DB sooner than the earlier plan assumed:
- **Hiring velocity & days-open** need *time-series* (diffing the careers feed
  across days) — a JSON snapshot can show a point-in-time count, but "how long
  open / staffing-up trend" wants stored history.
- **Multiple agent feeds on a schedule** want somewhere to write.

Recommendation: ship Surface C v0 on cached JSON (snapshots, dated). Add
**Supabase (EU region)** when we wire the first scheduled agent feed with history
(likely the HR careers feed) — it's the natural trigger, and it's cheap. Flagged
as a near-term decision, not v0-blocking. (CLAUDE.md says ask before adding it —
this is the ask, pre-approved in principle by the owner's "we can quickly create
a database if useful.")

## 8. How this connects to the build plan

Revises [build-plan.md](build-plan.md) — the phases still hold, re-scoped:

| Build-plan phase | Was | Now (platform) |
|---|---|---|
| 0a source-verify | facts check | done — see [stg-facts.md](stg-facts.md) |
| 0b scaffold + spine | segment + ops JSON | + `operations.json` (full geo) + `lenses` registry + the layer JSON files + `/transparency` route + footer |
| 1 Surface C map | single regulatory view | **the lens platform**: map engine + department switcher + **Regulatory lens (default) + HR lens (full)**; other lenses stubbed with provenance legends |
| 2 Surface A Impact Room | standalone | the drill-down behind Regulatory/Finance lenses |
| 3 live AI | one impact call | + the agent-feed pattern (start with one real feed — ECB FX or careers — to prove "live") |
| 4 Surface B Pouch Radar | standalone | the Sales lens drill-down |
| 5 polish/record | as is | + the `/transparency` page is part of "done" |

**Sequencing for this push (owner's "aim for Surface C"):**
1. Phase 0b scaffold + `operations.json` + `lenses` registry + footer + `/transparency` stub.
2. Surface C map engine + department switcher.
3. **Regulatory lens** (default — the existing threat data) and **HR lens**
   (headcount + open-positions, the richest real layer) built out fully.
4. Remaining lenses as stubs with real KPI rails + provenance legends + a few
   markers (expand later).
This gets a forwardable, multi-department map — the thing the owner wants to see
— while keeping every other surface on its existing track.

## 9. Other departments / future live-agent cases (owner's additional task)

Beyond the seven lenses, map-shaped use cases where agents fetch live public
data for STG teams:
- **M&A / Corporate Development** (Yulia's other hat): plot acquisition targets,
  competitor M&A moves, brand-for-sale signals — agent-scanned from trade press
  + filings. Ties to "M&A is in STG's DNA."
- **Treasury:** live FX + interest-rate exposure by entity geography (ECB +
  central-bank feeds).
- **Tax:** excise-rate-by-market + the ETD/TTD changes (overlaps Regulatory +
  Finance).
- **Brand protection / IP:** counterfeit-listing scans on marketplaces, geotagged.
- **Travel Retail (GTR):** airport/duty-free location performance signals.
- **Investor Relations:** peer share-price/multiple map (display-only, MAR).
- **Crisis/Comms:** geotagged news/sentiment monitoring per market.
Each is the same engine + a new lens + a public feed an agent refreshes. The
platform's ceiling is "any team that thinks in geography + a live external feed."
