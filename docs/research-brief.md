# Research brief — STG, pouch regulation, the buyer, the market

*Compiled 2026-06-12 from open-web research. All claims sourced; uncertainties
flagged. Companion to the internal "Research for N" document (not in this
repo) and [ideas.md](ideas.md).*

---

## 1. Scandinavian Tobacco Group — Focus2030 and 2025–26 state of play

**Focus2030** (launched at Capital Markets Day, 20 Nov 2025):
1. A sustainable, stable machine-rolled cigar & smoking tobacco business (Europe-focused)
2. A growing handmade cigar business anchored in the US
3. A **bigger nicotine pouch business** — more markets, stronger mint-segment presence

Financial ambitions: ROIC ≥ 11% by end-2030; low single-digit organic EBIT
CAGR; FCF before acquisitions ≥ DKK 1.2bn in 2030; **~DKK 200m cost program**
(~DKK 100m effect in 2026, rest by 2027–28); 40–60% payout policy.
Digitalisation framing: "continue to invest in people, data, digitalisation
and business analytics" — **no explicit public AI program found**.
Sources: [GlobeNewswire 19 Nov 2025](https://www.globenewswire.com/news-release/2025/11/19/3190642/0/en/Scandinavian-Tobacco-Group-announces-financial-ambitions-and-new-flexible-shareholder-return-policy-ahead-of-Capital-Markets-Day.html),
[STG CMD page](https://www.st-group.com/investor/capital-markets-day-2025/).

**FY2025** (reported 4 Mar 2026): net sales DKK 9.0bn (−1.8% reported, −3.1%
organic); adjusted EPS DKK 10.8 (vs 13.7); FCF before acq. DKK 595m (vs 931m).
Headwinds: US tariffs, weak US consumer, FX, **ERP roll-out disruptions**.
Special items ~DKK 200m (≈130m SAP, ≈70m reorg/Mac Baren), guided ~DKK 275m
in 2026. [Source](https://www.globenewswire.com/news-release/2026/03/04/3249564/0/en/Scandinavian-Tobacco-Group-A-S-Reports-Full-Year-Results-and-Proposes-a-DKK-4-50-Dividend-Per-Share.html)

**Q1 2026** (20 May 2026): net sales DKK 1.9bn (−0.6% cc); EBIT margin b.s.i.
10.4%; handmade +8% organic; **XQS >13% market share in Sweden**; machine-
rolled "stabilizing". FY26 guidance: sales −2%…+2%, EBIT margin 13.0–14.5%,
FCF 950–1,200m. [Source](https://www.globenewswire.com/news-release/2026/05/20/3298716/0/en/Scandinavian-Tobacco-Group-A-S-Interim-Report-First-Quarter-2026.html)

**OneProcess (SAP S/4HANA):** replaces **12 inherited ERPs with one global
platform**; harmonised processes + master data. 2025 European factory
go-lives caused supply disruption and market-share loss in Q3 2025; rollout
continues into 2026. STG uses Worksoft for automated SAP testing.
Sources: [STG "Seeking the Single Truth"](https://www.st-group.com/press-media/news-stories/in-focus-stories/seeking-the-single-truth/),
[Worksoft case study](https://www.worksoft.com/case-study-scandinavian-tobacco-group/).

**Org notes:** US premium-cigar distribution reorganised effective 2 Feb 2026
(General Cigar ↔ Forged brand shuffle; 56 SKUs discontinued). Mac Baren
acquisition (DKK 535m, 2024 — incl. pouch brands ACE and GRITT) integration
"on track". CEO Niels Frederiksen (2015), CFO Marianne Rørslev Bock (2018),
CCO Régis Broersma (2024), **CHRO Thomas Kolber (2024)**. No confirmed large
named layoff round 2025–26 (widely-indexed halfwheel layoff article is from
2018 — do not cite it).

## 2. Nicotine pouch regulation in Europe (as of June 2026)

| Market | Status | Detail |
|---|---|---|
| **France** | **Banned** | Decree 2025-898 (Sept 2025), effective 1 Mar 2026 (some outlets say 1 Apr). Bans import, possession, **use** of all oral nicotine products incl. pouches; only medicinal NRT exempt. Conseil d'État (22 Dec 2025) suspended only manufacture/export provisions; sales/possession ban stands; **merits ruling expected June 2026** |
| **Belgium** | Banned | Total ban since Oct 2023 |
| **Netherlands** | Banned (retail) | Sale banned Jan 2025; possession legal |
| **Luxembourg** | De facto banned | 0.048 mg nicotine cap |
| **Finland** | Restricted | Effectively pharmacy/NRT-only |
| **Denmark** | Restricted | From 1 Jul 2025 (full effect Apr 2026): **9 mg/pouch cap, tobacco + menthol flavors only**, cigarette-equivalent taxation |
| **Spain** | Restriction proposed | **0.99 mg/pouch cap** + tobacco-only flavors — would kill standard products; timeline unclear |
| **Germany** | Grey | Classified unauthorised novel food; domestic sale restricted, personal import tolerated |
| **Latvia / Estonia** | Restricted / legal | LV: 4 mg/g cap, age 20; EE: legal + excise |
| **Sweden, Italy, Poland, Austria, Czechia** | Open | Plus UK/Norway/Switzerland outside EU |

**EU level:** TPD3 still pre-proposal as of spring 2026 (pouches entirely
outside TPD2; realistic effect ~2028+). Tobacco-excise revision COM(2025)580
(16 Jul 2025) proposes **€143/kg or 50%-of-price minimum excise on pouches**;
Council deadlocked (Cyprus compromise failed Jan 2026).
**Sweden's pushback:** Trade Minister Benjamin Dousa — formal warning letters
to France and Spain (24 Sept 2025), "an attack on the Swedish way of living",
criminalisation of travelling Swedes "clearly absurd"; EP question
P-001366/2026 challenges the French possession ban; EU row over taxation +
free movement reignited Apr 2026.

**Operational takeaway:** there is no single European pouch product. A
pan-European seller must run market-specific SKU portfolios (nicotine
ceilings, flavor lists, labeling, tax stamps, age limits), watch TRIS
notifications, and absorb whole markets going dark — forecast write-offs,
channel exits, parallel-import leakage. This is master-data complexity of
exactly the kind OneProcess exists to manage, and a workforce-planning
problem nobody has tooled.

Key sources: [Vidal (FR decree)](https://www.vidal.fr/actualites/31543-les-produits-a-usage-oral-contenant-de-la-nicotine-interdits-a-partir-de-mars-2026.html),
[CNCT (Conseil d'État)](https://cnct.fr/communiques/sachets-de-nicotine-le-conseil-detat-confirme-linterdiction-de-la-vente-malgre-une-suspension-partielle-du-decret/),
[sik.dk (DK rules)](https://www.sik.dk/en/business/legal-guides/tobacco/new-danish-regulation-nicotine-and-tobacco-products-1-july-2025),
[EUR-Lex COM(2025)580](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:52025PC0580),
[The Local (Dousa)](https://www.thelocal.com/20260330/a-ban-on-being-swedish-minister-rails-against-frances-new-snus-ban),
[EP question](https://www.europarl.europa.eu/doceo/document/P-10-2026-001366_EN.html).

## 3. Anne-Marie Tørnes-Hansen

- Current title: **Head of Global People Data and Digital Solutions**, STG
  (previously Director, HR Technology, Processes and Insights). Based
  Hundested, DK. **Master's in IT Management, ITU Copenhagen (2022–2025)**.
- Co-led **PeopleHub** — STG's global SAP SuccessFactors platform (employee
  data, performance, comp, succession, learning incl. "STG Academy",
  analytics). Delivered on time/budget; ~80% office-employee enrollment at
  publication. Built partly as an M&A-integration capability (first test:
  Royal Agio). Key quote: *"The job of HR is changing… now it's rather to
  ensure that we have high enough data quality."*
  [Source](https://www.st-group.com/press-media/news-stories/in-focus-stories/click-here-for-hr-data/)
  (article predates current CHRO — several years old).
- **Rethink! HR Tech Nordic 2026**, Copenhagen, 28–29 Sept 2026: she has a
  speaker/participant profile ([page](https://www.rethink-hrtech-nordic.com/peoples/anne-marie-tornes-hansen-2));
  session topic not retrievable — uncertain if presenting or attending.
- No podcasts/articles/recorded AI talks found in open search. Her *visionary
  AI voice* (per the internal research doc's LinkedIn summaries) is not
  visible outside LinkedIn — the two sources are complementary, not
  contradictory: visionary messaging on a data-operator foundation.
- Reports into **CHRO Thomas Kolber** (since 2024, ex-Knauf Chief People &
  Change Officer).

## 4. The AI + HR vendor landscape (2025–26) — for buy-vs-build framing

- **Skills intelligence:** Eightfold AI, TechWolf (skill inference from work
  systems), Lightcast, Gloat, SkyHive/Cornerstone Galaxy, Workday Skills Cloud.
- **Workforce-planning copilots / people analytics:** Visier, Workday
  Illuminate (org-design & scenario agents), SAP SuccessFactors **People
  Intelligence**.
- **Agentic HR service delivery:** ServiceNow + Moveworks (~$2.85B, Mar 2025),
  Leena AI, Workday Sana, **SAP Joule / Joule Studio (30+ SuccessFactors AI
  use cases — STG's default trajectory)**, Oracle Agent Studio, Gloat Agentic
  HR (Mar 2026, "Loomra" semantic layer).
- **AI adoption/enablement:** Multiverse ($70M at $2.1B valuation, "Europe's
  AI adoption platform", acquired StackFuel Jan 2026), Sana, Section,
  Copilot Studio ecosystem.
- Framing (Josh Bersin, Mar 2026): five-layer agentic architecture; shift
  from "systems of record" to "systems of context"; 2026 = "consolidation
  and agentization". [Source](https://joshbersin.com/2026/03/gloat-enters-the-crowded-war-for-ai-agents-in-hr/)

**Positioning consequence:** for a SAP shop mid-ERP-consolidation with a
data-quality-doctrine buyer, credible entry points are (1) people-data/skills
foundations, (2) Joule-compatible agentic service delivery, (3) AI
adoption/enablement during restructuring — not rip-and-replace talent-
marketplace plays.

## 5. SAP agentic stack — verified facts (adversarially fact-checked June 2026)

Checked because the Grok second-opinion report (see ideas.md §6) made claims
here that we might otherwise repeat to the client. Use these wordings.

- **Joule Studio** is a low-code/no-code capability within SAP Build on BTP:
  skill builder **GA July 2025**, agent builder **GA Dec 2025/Jan 2026**.
  Caveat: a *separate, new* fully managed "Joule Studio" offering announced at
  Sapphire (May 2026) is **not yet GA** (free design-time access through end
  of 2026). [SAP News Q2-2025](https://news.sap.com/2025/07/sap-business-ai-release-highlights-q2-2025/),
  [SAP Connect Oct 2025](https://news.sap.com/2025/10/sap-connect-business-ai-new-joule-agents-embedded-intelligence/),
  [Q4-2025 highlights](https://news.sap.com/2026/01/sap-business-ai-release-highlights-q4-2025/),
  [Sapphire May 2026](https://news.sap.com/2026/05/new-joule-studio-enterprise-scale-agentic-development/).
- **Joule agents:** as of Q1-2026 highlights (Apr 2026), at least one GA agent
  per domain — finance (Expense Report Validation), supply chain (Tender
  Analysis), procurement (Catalog Optimization), HR (Performance Preparation,
  GA ~Nov 2025) — but many headline agents (Dispute Resolution, Cash
  Management, Production Planning & Operations…) were still beta/Early
  Adopter Care in H1 2026. SAP cites 30+ specialized agents, 2,500+ skills,
  Joule live across 35 solutions. "SAP ships GA agents across the board"
  **overstates** it. [Q1-2026 highlights](https://news.sap.com/2026/04/sap-business-ai-release-highlights-q1-2026/)
- **Where Joule runs:** embedded in SAP SuccessFactors and S/4HANA **Cloud**
  (Private Edition via BTP setup) — not on-premise S/4HANA. Which S/4 edition
  OneProcess uses is a **question to ask STG**, not to assume.
- **Productivity numbers:** SAP does NOT publish a "30–80% time savings"
  benchmark. Actual SAP claims (all self-reported, labeled indicative):
  2,100+ task automations covering ~80% of most-used SAP transactions;
  routine tasks "up to 80% faster"; a *goal* of 30% end-user productivity;
  per-agent projections of 10–83%. Quote precisely or not at all.
  [SAP Learning](https://learning.sap.com/courses/introducing-joule/identifying-roles-and-personas)
- **Tooling corrections:** **SAP Build Apps retired as a standalone product
  23 March 2026** (folded into unified SAP Build — don't recommend it).
  Signavio Process Intelligence = the process-mining product (real). Custom
  Joule skills are declarative low-code calling APIs via BTP — *not*
  "LangChain wrappers"; the pro-code path is **SAP Cloud SDK for AI**
  (`sap-ai-sdk-gen`, v6.10.0 May 2026, LangChain integration included) on
  BTP, reaching S/4HANA through standard OData/REST APIs.
  [Deprecation post](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-build-apps-deprecation-and-the-path-forward/ba-p/14351750),
  [sap-ai-sdk-gen](https://pypi.org/project/sap-ai-sdk-gen/)
- **Pouch market growth (for any deck slide):** consensus **25–30% CAGR**
  through 2030–2033 (Grand View 24.7–29.6%, TBRC ~28.9%, Persistence 28.4%);
  top-end outliers ~36% (SkyQuest), low end ~18–19%. Say "25–30%, with some
  forecasts to ~36%" — never bare "36%".
  [Grand View](https://www.grandviewresearch.com/industry-analysis/nicotine-pouches-market-report)
