# STG facts — the single source of truth

*The canonical data-of-record for the prototype. Everything the app shows about
STG traces here, and every datum carries a flag. Compiled 2026-06-13 from STG
Annual Report 2025 (AR2025, published 2026-03-04), st-group.com, and the careers
portal. Deep provenance/narrative lives in [ceo-research-digest.md](ceo-research-digest.md)
and [research-brief.md](research-brief.md) — this file is the structured facts.*

**Flag legend (used everywhere in the app):**
- **`[C]` confirmed** — from a primary source (AR2025, st-group.com, official).
- **`[I]` inferred** — almost certainly real, but the specific value (often a
  city or coordinate) is derived/third-party, not directly published.
- **`*` fabricated** — hypothetical data we created for the demo because it
  isn't public. Plausible and likely obtainable (often behind a DPA), but **not
  real**. Always rendered with an asterisk + "illustrative" in the UI.

This three-way flag is the spine of the transparency promise (see
[map-platform.md](map-platform.md) §6 and the in-app `/transparency` page).

---

## 1. Corporate

| Field | Value | Flag |
|---|---|---|
| Legal name | Scandinavian Tobacco Group A/S | [C] |
| Listing | Nasdaq Copenhagen, ticker STG | [C] |
| CVR | 31 08 01 85 | [C] |
| HQ | Sandtoften 9, 2820 Gentofte (Greater Copenhagen), Denmark | [C] |
| Employees (year-end 2025) | 8,858 (avg 9,144) | [C] |
| Brands | ~200 | [C] |
| Markets sold to | ~100 | [C] |
| Manufacturing sites | ">10" | [C] |
| Sales offices | "in North America and Europe" (no public count; ~20+ est.) | [I] |

## 2. Financials (FY2025, AR2025)

| Metric | FY2025 | FY2024 | Flag |
|---|---|---|---|
| Net sales | DKK 9,035.7m | 9,202.1m | [C] |
| Organic growth | −3.1% | — | [C] |
| EBITDA before special items | DKK 1,791m (19.8% margin) | 2,079m (22.6%) | [C] |
| EBIT before special items | DKK 1,342m | — | [C] |
| Net profit | DKK 669m | 940m | [C] |
| Free cash flow before acq. | DKK 595m | 931m | [C] |
| Adjusted EPS | DKK 10.8 | 13.7 | [C] |
| Dividend / share | DKK 4.50 (cut from 8.50) | 8.50 | [C] |
| Leverage | 3.0x (target 2.5x by end-2026) | — | [C] |
| ROIC | 7.9% (target ≥11% by 2030) | — | [C] |

Focus2030 cost program: ~DKK 200m savings (~100m in 2026). Share ~DKK 67.50,
P/E ~8.2, yield ~6.6% (11 Jun 2026). FY26 guidance: net sales −2%…+2% cc, EBIT
margin b.s.i. 13.0–14.5%, FCF 950–1,200m, adj EPS 9–11. **MAR note:** financial
figures are display-only in the app; never generate investor-facing copy.

## 3. Segments & categories (FY2025)

**Divisions:** Europe Branded (EUB) DKK 3,269.9m (36%, EBITDA 649.4m) ·
NA Branded & RoW (NABROW) DKK 3,016.9m (33%, EBITDA 938.4m) · NA Online & Retail
(NAOR) DKK 2,748.9m (30%, EBITDA 347.1m). All [C].

**Categories:** Handmade cigars DKK 3,164.1m (35%) · Machine-rolled cigars &
smoking tobacco DKK 4,541.5m (50%) · Nicotine pouches (NGP) DKK 428.2m (~5%) ·
Other DKK 902.0m (10%). All [C].

**Geography:** Americas DKK 4,538.1m · Europe DKK 3,933.6m · RoW DKK 564.0m.
**US = DKK 4,230.4m = 46.8% of group** (single largest). Denmark DKK 222.3m. [C]

**Derived figures (label as analyst derivations, never "STG's number"):**
France machine-rolled ≈ DKK 620m ([I], 19% of EUB); EU machine-rolled + pipe
base for the Impact Room ≈ DKK 2,684m ([I], ~82% of EUB).

## 4. Locations (the map markers)

Type codes: `hq` · `sales` (sales office) · `factory` · `leaf` · `dc`
(distribution) · `superstore` · `lounge` · `office`. Coordinates are city-level
unless a street address was found; flag is for the city/coord specificity.

### 4.1 HQ & European sales companies (the 12 EUB markets)
| Country | City | Type | Lat | Long | Flag |
|---|---|---|---|---|---|
| Denmark | Gentofte (Copenhagen) | hq | 55.756 | 12.547 | [C] addr |
| Germany | Bremen | sales | 53.083 | 8.802 | [C] |
| Denmark | Gentofte/Copenhagen | sales | 55.756 | 12.547 | [C] entity / [I] city |
| Sweden | Stockholm | sales | 59.33 | 18.07 | [I] city |
| France | Nanterre (Paris metro) | sales | 48.892 | 2.214 | [C] addr |
| Italy | Rome | sales | 41.84 | 12.49 | [C] |
| Belgium | Lummen | sales | 50.99 | 5.20 | [C] addr |
| Netherlands | Eersel (+ Waalre) | sales | 51.36 | 5.32 | [C] |
| Luxembourg | (no office — market served via NL/BE) | — | — | — | [I] |
| Spain | Madrid | sales | 40.46 | −3.69 | [C] |
| Portugal | Carnaxide/Lisbon (also the SDO finance/IT hub) | sales+sdo | 38.72 | −9.24 | [C] |
| UK | St Albans (Hertfordshire) | sales | 51.75 | −0.34 | [I] city |
| Ireland | (no office — served from UK) | — | — | — | [I] |

### 4.2 United States
| City, State | Role | Type | Lat | Long | Flag |
|---|---|---|---|---|---|
| Bethlehem, PA | Cigars International HQ, NAOR base, distribution center | hq+dc | 40.63 | −75.38 | [C] addr |
| Richmond, VA | NA Branded & Forged Cigars commercial office (**office active; the Sutliff *factory* at this site closed Feb 2025**) | office | 37.54 | −77.44 | [C] |
| New York, NY | Club Macanudo lounge | lounge | 40.76 | −73.97 | [C] |

**15 Cigars International superstores** (all [C] as live retail; coords [I]):
Bethlehem PA (Downtown 40.62,−75.38) · Bethlehem PA (Superstore 40.65,−75.34) ·
Hamburg PA (40.56,−75.98) · Bridgeville PA (40.36,−80.11) · The Colony TX
(33.09,−96.89) · Fort Worth TX (32.76,−97.33) · San Antonio TX (29.42,−98.49) ·
Conroe TX (30.31,−95.46) · Katy TX (29.79,−95.82) · Jacksonville FL
(30.33,−81.66) · Tampa FL (27.95,−82.46) · Lutz FL (28.15,−82.46) · Orlando FL
(28.54,−81.38) · East Ridge TN (35.01,−85.25) · Newport KY (39.09,−84.50).
*(Ohio & Missouri CI legal entities exist — possible 16th/17th stores; unverified [I].)*

### 4.3 Manufacturing & leaf
| Country | City | Produces | Type | Lat | Long | Flag |
|---|---|---|---|---|---|---|
| Dominican Republic | Santiago / Tamboril | Handmade + machine-rolled cigars, wrapper/binder leaf | factory+leaf | 19.45 | −70.70 | [C] (San Pedro site closed 2025) |
| Honduras | Danlí | Handmade cigars | factory | 14.02 | −86.58 | [C] |
| Nicaragua | Estelí | Handmade cigars | factory | 13.09 | −86.35 | [C] |
| Indonesia | Semarang + Pasuruan/Pandaan | Machine-rolled cigars, wrapper/binder leaf | factory+leaf | −6.97 | 110.42 | [I] city — AR2025 names no city; st-group.com lists Pandaan/Pasuruan (E Java). Coord = Semarang (Central Java); **verify before re-plotting** (also touches the ESG water-stress overlay) |
| Sri Lanka | Biyagama (Greater Colombo) | Wrapper/binder leaf | factory+leaf | 6.95 | 79.96 | [C] city |
| Belgium | Lummen + Westerlo | Machine-rolled cigars | factory | 50.99 | 5.20 | [C] |
| Italy | Lucca (Tuscany) | Machine-rolled cigars (Moderno Opificio del Sigaro Italiano, 85%-owned, acq. 2021; on AR2025 EU production map) | factory | 43.84 | 10.50 | [C] site / [I] city |
| Netherlands | Eersel/Waalre | MRC production relocated post-Agio (2020) — **commercial/holding entity only, not a producing site per AR2025** | office | 51.36 | 5.32 | [I] |
| Denmark | Assens | Pipe tobacco | factory | 55.27 | 9.90 | [C] |
| Denmark | Svendborg | Pipe + fine-cut + **owned nicotine-pouch factory** | factory+pouch | 55.06 | 10.61 | [C] |
| Denmark | Holstebro | Fine-cut tobacco | factory | 56.36 | 8.62 | [C] |
| Sweden | (contract) | Nicotine pouches (3rd-party) | pouch | 59.33 | 18.07 | [C] product / [I] site |
| Poland | (contract) | Nicotine pouches (3rd-party) | pouch | 52.23 | 21.01 | [C] product / [I] site |

**Do NOT plot:** Richmond, VA *as a factory* (Sutliff closed Feb 2025 → moved to
Assens); a German warehouse (closed 2025). Richmond *office* still plots.

### 4.4 RoW offices (the "20+" tail — legal entities [C], cities [I])
Norway (Oslo) · Canada (Toronto/Montreal) · Australia (Sydney/Melbourne) ·
Hong Kong (APAC / Global Travel Retail hub). Markets served without own entity
(don't plot as offices): New Zealand, Finland, Switzerland, Israel, + GTR/Asia
distributors.

## 5. Employees by country (AR2025 p96, 31 Dec 2025) [C]

DR 1,626 · Indonesia 1,409 · Honduras 1,382 · Sri Lanka 1,264 · US 883 ·
Belgium 763 · Denmark 548 · Nicaragua 361 · Netherlands 128 · Germany 88 ·
France 76 · Italy 76 · Portugal 71 · Spain 62 · UK 52 · Other 69. **Total 8,858.**

By region: Americas 4,295 (50%) · Europe 1,887 (20%) · RoW 2,676 (30%).
Gender: F 5,366 / M 3,484 / Other 8. Age: <30: 1,475 · 30–50: 5,080 · >50: 2,303.
**Turnover 2025: 18.7%** (down from 22.7%); 1,696 leavers. *(No per-city
headcount is published — city-level allocation on the map is [I], e.g. DR 1,626
→ Santiago.)*

## 6. Brands (Power Brands in bold)

- **Handmade:** **Macanudo, CAO, Cohiba** (US), **Alec Bradley**, Punch, Partagas
  (US), La Gloria Cubana, Diesel; NAOR exclusives Man O'War, 5 Vegas. ~#3 globally,
  ~6% volume share of international handmade. [C]
- **Machine-rolled:** **Signature, La Paz, Mehari's, Panter**; Café Crème, Henri
  Wintermans, Colts (Canada), Gold (France). Key-European MRC volume share 26.8%
  (2025, down from 27.9%); >50% Belgium (~90%); market leader FR/UK/NL/ES. [C]
- **Pipe:** Captain Black, Erinmore, Borkum Riff, W.Ø. Larsen + Mac Baren,
  Amphora, Holger Danske. "Undisputed global leader in pipe tobacco." [C]
- **Fine-cut:** Bugler (US), Break (DE), Bali Shag, Tiedemanns (NO) + Amsterdamer.
- **Pouches:** **XQS** (flagship), ACE, GRITT. XQS organic +55% FY25; Sweden
  share 7.8%→13.6%; UK launched 2024; focus markets Scandinavia + UK. [C]

## 7. Leadership (2026)

CEO **Niels Frederiksen** (since 2015) · EVP & CFO **Marianne Rørslev Bock**
(2018) · CCO **Régis Broersma** (2024) · **SVP Strategy, Transformation &
Sustainability Yulia Lyusina** (2019; ex-BCG; owns Focus2030 + M&A — *the pitch
recipient*) · CSCO **Jesper Madsen** (2023) · CHRO **Thomas Kolber** (2024) ·
Head of IR & External Comms **Torben Sand** · Group GC / SVP Legal, IP, Public &
Regulatory Affairs **Peter Schøtt Knudsen** · SVP Scientific & Regulatory Affairs
**Thomas Lindegaard** · Chairman **Henrik Brandt**. All [C].

## 8. Regulation touching the footprint (the threat layer)

Full table + sources in [research-brief.md](research-brief.md) §2. Summary:
- **EU Tobacco Taxation Directive revision** — `COM(2025) 580` (CELEX
  52025PC0580), **a proposal, in Council negotiation** (Cyprus compromise failed
  Jan 2026; file since passed to the Irish Presidency for H2 2026 — still under
  Council unanimity, no agreement); would apply from 2028; pouch minima phase
  2030–2032; raises cigar/cigarillo/pipe minimums. [C] **The lead worked example.**
- **France** — total oral-nicotine ban in force Apr 2026 (Décret 2025-898);
  Conseil d'État merits ruling ~June 2026. France is also one of STG's largest EUB/MRC
  markets (≈19% of EUB ≈ DKK 620m — analyst derivation, not an STG-stated rank). [C]/[I]
- **Denmark** — 9 mg cap + tobacco/menthol-only flavours (full effect Apr 2026). [C]
- **Spain** — 0.99 mg cap proposed. **Poland** — pouch excise 150→200 PLN/kg +
  proposed flavour/online-sale bans. **Belgium/NL/LU/FI** — banned/restricted.
  **Sweden/Italy/Czechia/Austria** — open. [C]
- **US** — handmade cigar tariff lines (DR/HN/NI); regime in flux (EO 14389
  reversed some duties Feb 2026) — treat as a scenario variable. [C]

## 9. Careers / live HR data (SAP SuccessFactors) [C]

- Portal: `careers.st-group.com` (SAP SuccessFactors Recruiting / RMK; tenant
  `st-group-careers.jobs.hr.cloud.sap`).
- **Open roles are live + daily, not a fixed snapshot** — count shifts as postings
  open/close (e.g. **68 on 2026-06-16**: 30 strategic-site · 33 US retail/bars · 5
  unmapped-EU field/other). The robots-**allowed** `/jobs.xml` syndication feed is the
  spine (complete set + full descriptions + apply links); the `/services/` department +
  days-open enrichment is a manual, owner-authorised pass. Posting URL encodes city +
  postal + req id (`/job/{City}-{Title}-{Postal}/{reqId}/` → geocodable); detail pages
  carry **"Posting Start Date"** → days-open.
- **Source of truth is the DB, served live** — every role (title · real department ·
  days-open · full description · apply URL) lives only in `varsel_careers_snapshots.roles`
  (Supabase EU) and the app reads it live via `/api/feeds/careers?roles=1`; `hr.json`
  carries no roles. Each role is bucketed by location into one of the 12 strategic sites,
  `us-retail` (US Cigars-International stores/bars) or `eu-other` (Holstebro DK + NL/SE/UK
  field sales). Six career areas seen: Solution Delivery Org, Digital & IT, Global
  Commercial, Supply Chain–Manufacturing, Business Support, NA Commercial. (The 06-13
  "~49 / per-location" snapshot this section used to quote is superseded.)

## 10. Public live-data feeds an AI agent can fetch (the "agents go get it" story)

| Feed | Source | Cost | Powers layer |
|---|---|---|---|
| Euro FX reference rates | ECB `eurofxref-daily.xml` | free, no key | Finance (FX exposure) |
| Weather / crop / climate | Open-Meteo API (+ NOAA CPC ENSO, WRI Aqueduct water-stress) | free (non-commercial) | Procurement, ESG (leaf regions) |
| Tobacco-leaf prices | FRED `WPU152402*`, USDA AMS tobacco reports | free | Procurement |
| Ocean-freight rates | Freightos Baltic Index, Drewry WCI, Baltic Dry | partly free | Supply chain |
| STG open positions | `careers.st-group.com` (SuccessFactors) | scrapable | HR |
| Pouch e-commerce | Haypp sitemaps + nicotine-pouches.org API | scrapable* (ToS gate) | Sales (= Pouch Radar) |
| Regulatory notifications | EUR-Lex webservice + Cellar RSS, TRIS | free (roadmap/post-pilot) | Regulatory |

*ToS gate per [build-plan.md](build-plan.md) Phase 4 (robots.txt ≠ ToS;
*Ryanair v PR Aviation*). These feeds + the per-department overlays are detailed
in [map-platform.md](map-platform.md).

## 11. Known corrections / watch-outs (don't regress)

- Richmond VA: *factory* closed Feb 2025, *office* active — plot office only.
- `COM(2025) 580` is a **proposal**, not enacted — "would raise", never "raises".
- The widely-indexed halfwheel "100+ layoffs" article is **2018** — do not cite.
- No clean public elasticity exists for **cigars/pipe** — never show a cited
  *cigarette* elasticity against a cigar base (the Impact Room honesty rule).
- City-level headcount is not published — those allocations are [I].
- No earnings-facing copy anywhere (EU MAR).
