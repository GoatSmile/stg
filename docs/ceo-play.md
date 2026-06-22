# The CEO play — Varsel

*Updated: 2026-06-22 09:59 CEST*

*Prepared 2026-06-12. The pivot doc. Supersedes the HR/"Broen" track (now
parked — see [ideas.md](ideas.md) header). Evidence base:
[ceo-research-digest.md](ceo-research-digest.md) (raw, sourced) and
[research-brief.md](research-brief.md). Method: a multi-agent ideation —
4 research sweeps → 4 ideator personas (activist investor, CPG operator, risk
strategist, AI-startup founder) → 3-judge panel → 3 adversarial refuters on the
winner. This doc is the convergent result, with every stress-test correction
already folded in.*

---

## 1. Why we pivoted

The HR track aimed at a department head (Anne-Marie, People & Culture). Strong
narrative, but a department-level buyer who "may or may not use it." The
instruction now: **find the thing the CEO would personally want, that gets used
immediately, in any domain.** So we started from the CEO's actual pain, not
from a function we wanted to sell into.

## 2. What is actually keeping Niels Frederiksen awake

Sourced from his earnings calls, interviews, and analyst pressure (full quotes
+ links in the digest). The picture is unambiguous:

- **The stock roughly halved.** FY2025 (reported 4 Mar 2026) missed STG's *own
  just-narrowed* guidance; shares fell ~24% in a day. Dividend cut ~47%
  (DKK 8.50 → 4.50). **Buybacks suspended for the first time since the 2016
  IPO.** Trading at P/E ~8.2, P/B ~0.6, yield ~6.6% as of 11 Jun 2026.
- **A credibility wound, named by the Danish press:** STG "disappointed in 6 of
  the last 8 quarters." Focus2030's Capital Markets Day ambitions (20 Nov 2025)
  were broken by the 2026 guidance issued **~14 weeks later**. Analyst Niklas
  Ekman (DNB Carnegie) pressed exactly this.
- **His own framing of the battlefield:** *"a difficult consumer environment in
  a structurally declining category with fierce competition,"* and 2026 will be
  *"a year where geopolitical uncertainty will remain a market condition."*
- **Every guidance cut was a surprise the market punished.** Twice in 2025, then
  the FY25 miss. The single most valuable thing anyone can hand this CEO is
  **the ability to stop being surprised** — to walk into a Council vote or an
  earnings call already knowing the size of the regulatory tail.

The five questions he is most under pressure to answer (digest §ceo-voice) are
dominated by: *is the Focus2030 story credible, and what is the quantified
downside from regulation and structural decline?*

## 3. The gap in the market (verified, and corrected)

Across the vendor landscape, **no product converts a live regulatory event into
a specific company's P&L impact.** The layers that exist each stop short:

- **Monitoring/alerting** — Tamarind/TobaccoIntelligence, FiscalNote, CUBE,
  Regology. They summarize; they never touch revenue/margin.
- **Market-level forecasting** — Euromonitor Passport (periodic, 3×/year,
  macro-scenario, category-level — *not* company-specific, *not* custom-text-in).
- **Government-revenue / public-health excise models** — Tobacconomics, TETSiM:
  built to maximize state revenue, not model a manufacturer's P&L.
- **Bespoke consulting** — Oxford Economics: six-figure, months of lead time,
  one-off. Not a standing product.

> **Correction baked in (adversarial pass).** Earlier drafts claimed "Tamarind
> excludes pouches" and "incumbents ignore ~90% of STG's revenue (cigars/pipe)."
> A direct web-check refuted both: Tamarind's Policy Radar **does** cover
> nicotine pouches (~39 countries); Euromonitor Passport **does** cover
> cigars/cigarillos/smoking tobacco. **Do not repeat those claims.** The moat is
> not a coverage gap — it is the **composite** nobody assembles:
> *live regulatory text in → STG-specific DKK EBITDA/volume/margin → editable
> elasticity & pass-through → scenario band → decision-ready
> out.* (The exact extent of each incumbent's cigar/pipe depth still needs
> precise re-verification before any client meeting — flagged.)

The empirical proof the gap is real and STG-shaped: **on STG's own Q1 2026
earnings call, asked directly about EU pouch/tobacco regulation, management
answered qualitatively ("we think about it as Europe") and produced no number.**
That reactive posture is exactly what the product attacks.

## 4. The product — Varsel

*Working name "Varsel" (Danish: a warning, an advance notice, a forecast).
Changeable — see open decisions. One Next.js app, three surfaces, one spine.*

### Surface A — the Impact Room (the spine, the CEO magnet)
Pre-modeled regulatory shocks, each rendered as a **DKK EBITDA / volume / margin
band on a transparent model of STG's published segments**, with every assumption
visible and editable:

- **EU Tobacco Taxation Directive revision** (COM(2025) 580, **a proposal,
  still in Council negotiation**, proposed 16 Jul 2025; would apply from 2028;
  pouch minima phase 2030–2032; cigar/cigarillo/pipe minimums raised). The big
  one — it reaches the cigar and pipe core directly. (Exposure = the share of
  that base sitting *below* the new floor, not the whole 50% block — an excise
  minimum only bites below the floor; the model makes that share an editable
  assumption.)
- **France oral-nicotine ban** (in force April 2026) — and France is *also*
  STG's #1 machine-rolled cigar market (~19% of Europe Branded), a separate and
  larger exposure than the pouch line.
- **Denmark 9 mg + tobacco/menthol-only** flavor cap (full effect Apr 2026) —
  hits XQS's flavor-led portfolio in the home market.
- **US handmade tariff lines** (Dominican Republic / Honduras / Nicaragua) —
  treated as an explicit *scenario variable*, not a fixed input (the tariff
  regime is in flux; EO 14389 reversed some duties Feb 2026).

**Demo discipline (non-negotiable, from the feasibility refuter):**
- Pre-modeled against a **curated, dated, source-linked corpus** (seeded JSON) —
  *not* live-parsing an arbitrary EUR-Lex URL on stage (the numbers live in
  annexes; live parse is a hallucination trap in front of a CEO).
- **Citation rails + abstention:** every number Claude emits carries an inline
  source ref; if a rate isn't in a cited source it returns *"not stated in
  source — needs human lookup,"* never a guess. The rails are shown in the demo;
  they *build* trust.
- **Honest denominator:** STG does not publish a France-specific MRC line or a
  standalone pouch DKK figure. Those are *analyst derivations from published
  category/geography splits*, labeled as such, with the estimation step visible
  and editable. ("Plug in your real volumes behind a DPA for SKU precision" is
  the paid expansion, not a v1 claim.)
- **Assumptions are first-class:** pass-through and demand elasticity as editable
  sliders. Honesty rule (cost us a fatal in red-team): there is **no clean public
  elasticity for cigars/pipe**, so that slider is labelled "no public consensus —
  a range you set" and the default sits inside the shown band — we never display
  a cited *cigarette* elasticity against a *cigar* base (that mismatch is the
  fastest way the citation rail gets caught citing a number it doesn't use).
  Bands, not point estimates. A skeptical CFO can co-own the model instead of
  contesting it — which turns STG's regulatory-affairs team from competitor into
  champion.

### Surface B — the Pouch Radar (the live-data proof layer)
The judges' counter-pick, folded in to **de-risk the demo**: a daily index of
XQS vs ZYN vs Velo across the Focus2030 growth markets (Sweden, UK, + DE/IT/PL),
built entirely on **public e-commerce exhaust** — price-per-pouch, promo depth,
new-SKU/flavor launch detection, bestseller-rank as an online share proxy.
Feasibility is *proven*: nicotine-pouches.org already crawls 10+ shops daily and
sells an API; **Haypp's robots.txt exposes 34 product sitemaps with no
crawl-delay** (launch/delist = trivial sitemap-diffing). This is the
*undeniable, verifiable-live* wow that does **not** depend on contestable
elasticity math — "here is a competitor price/SKU move from **this morning** your
quarterly-panel team hasn't seen yet" — and its demand signal feeds the pouch
portion of the Impact Room with evidence instead of assumption.

### Surface C — the Global Pulse map (the hero / landing)
*Owner's idea, adopted as the landing.* A world map of STG's actual footprint —
manufacturing & leaf (Dominican Republic, Honduras, Nicaragua, Indonesia, Sri
Lanka, Belgium), pouch production (Svendborg DK, + contract Sweden/Poland), US
online & 15 superstores, HQ in Gentofte — over which the **live regulatory
threats glow on the geographies they hit** (France ban, EU excise, Denmark cap,
Spain proposal, US tariffs). It gives a CEO the *pulse of the business* in one
glance, on a geography he feels viscerally, and every threat marker is a
click-through into the Impact Room (Surface A). KPI rail: net sales DKK 9.0bn,
US 46.8%, 8,858 employees, ~100 markets. The five questions the CEO is under
pressure to answer ride alongside as the framing device — so a forwarded link is
instantly legible to anyone in the C-suite. This is the forwardable wow and the
"this is real" opener of the video. *(Mockups of all three surfaces:
[mockups/](mockups/).)*

*Phase-2 teaser:* a **gray-market / orphaned-demand radar** — where France's and
Denmark's banned/capped demand migrates (checkout-availability testing across EU
retailers). Doubles as advocacy evidence ("bans create unregulated supply") and
growth-capture signal (where XQS can *legally* capture orphaned demand).

## 5. Go-to-market — the warm intro changes everything

The CEO-reality refuter assumed cold outreach. We have better: **the owner's
wife works in STG HR (data analyst) and can introduce him to the Head of
Strategy.** That is the single hardest step (getting watched at all) solved for
free — and it lands on the *ideal* owner, not a compromise.

1. **The recipient is Yulia Lyusina — SVP, Strategy, Transformation &
   Sustainability** (not "Irina" — a misremembered name; she's Russian-born,
   ex-BCG, reports to the CEO). She *owns Focus2030, M&A, and transformation* —
   the exact thesis the regulatory threats endanger. Ex-BCG means she thinks in
   models, bands, and assumptions: Varsel's honest-rails design is built for her
   skepticism, not against it. Use her **real title** ("SVP, Strategy,
   Transformation & Sustainability"), not the aggregator label "CSO."
2. **The intro mechanic:** wife tells Yulia an email is coming → the email's
   payload is a **short forwardable video** (see §5b) → the email CTA is *"reply
   and I'll plug in STG's real numbers and walk you through it live."*
3. **Design the artifact to be forwarded by Yulia to the CFO, Marianne Rørslev
   Bock.** The DKK EBITDA/margin band is CFO-native language; the money-shot
   (Surface A) must stand alone when she forwards it. Secondary forward targets:
   IR head Torben Sand (internal scenario-prep framing only) and Group GC /
   Public & Regulatory Affairs Peter Schøtt Knudsen (the source-credibility
   check). Note: there is **no standalone Corporate Affairs SVP** — regulatory
   ownership is split across Strategy (Lyusina), Legal (Knudsen) and Scientific &
   Regulatory (Thomas Lindegaard), which is *why* a regulation→P&L tool that
   straddles all three has no internal owner. That's the whitespace.
4. **A strategy-head sponsor is how a cross-cutting tool gets adopted.** Pitched
   cold to the CFO or IR it risks being filed as "an FP&A tool" or "an IR comms
   tool" and siloed. Yulia can convene the CFO/IR/Legal table Varsel needs.
5. **v1 is an "intelligence brief," not "software."** Zero integration, no data
   transfer, a hosted link with a visible **"built on public data, zero STG
   data"** banner (the AI-fluency / trust moment). It buys through an existing
   research/advisory budget line, not a new-vendor procurement cycle.
6. **No earnings-language feature.** Under EU MAR no listed Danish firm lets an
   external tool author investor-facing copy — output is framed as **internal
   decision-support / scenario prep**, explicitly not investor-facing.

## 5b. The pitch video (the email payload)

The introduction is a **~3-minute video** (hard ceiling 4): the owner to camera,
intercut with a screen-walkthrough of the demo. Forwardable, publicly
accessible, viewers free to contact him. Rationale: best self-introduction,
far higher response rate than a deck, and it removes all guesswork — he narrates
the screen "like a baby." Recommended structure:

| Time | Beat | On screen |
|---|---|---|
| 0:00–0:20 | To camera. "[Wife] mentioned I'd reach out. 3 minutes, no deck." Name the wound: surprise guidance, the regulatory tail. | Face |
| 0:20–0:50 | The map — "STG's footprint on public data, and what's coming at it." Threats light up. | Surface C |
| 0:50–2:10 | The money-shot: walk **one** scenario (EU excise or France), drag the elasticity slider — "these are *your* assumptions; every number cites its source, and it refuses to guess where there's none." | Surface A |
| 2:10–2:40 | The live proof: a competitor price/launch move from this morning. | Surface B |
| 2:40–3:00 | To camera. "Built by one person in days — the speed STG needs. Public data only; plug in your real numbers and it gets sharp. Reply and I'll tailor it live." | Face |

**On linking the live app:** include it, but make the video the star. The app
link *is* the proof it's real (not slideware) and the forwardable landing
mechanic — but gate the depth: the link shows the demo, the valuable step
("plug in STG's real numbers") requires replying to the owner. Put the link in
the email body, not burned into the video, so the video forwards cleanly on its
own. This satisfies the owner's "whet the appetite, let them come after me"
instinct while still proving the thing works.

## 6. Expansion ladder (the consulting business behind the product)

`Public-data v1 (forwardable video + link)` → **Yulia sponsors, forwards to CFO**
→ `paid "Varsel" subscription with STG's real volume/elasticity data behind a
DPA` (finance-grade vs analyst-grade precision) → `pre-earnings regulatory-impact
retainer` for Strategy/IR/CFO (recurring) → `bespoke scenario deep-dives` that
undercut the Oxford Economics niche on **speed and price** → second buyer inside
the same account (public affairs, armed against the prohibition wave). This is
the cleanest ladder of any concept evaluated — and the medium is the message:
*built by one person + AI in weeks, the speed STG itself needs.*

## 7. Build plan (each phase independently demoable)

> **Update (2026-06): all phases built — kept for the record.** Phases 0–4 shipped (the platform grew
> to 7 lenses + 5 live feeds beyond this original scope). Two drifts in the table below: the gate is an
> in-app `SITE_PASSWORD` page, **not** Vercel SSO (Phase 4); and only the **video** (Phase 4) remains
> unrecorded. Current state: [CLAUDE.md](../CLAUDE.md) + [map-platform.md](map-platform.md) §8.

| Phase | Scope | Est. |
|---|---|---|
| 0 | Scaffold (Next.js + shadcn radix-nova), the segment model + operations footprint (public AR2025 splits + site/store geo as versioned JSON), the Global Pulse map landing | ~half day–1 day |
| 1 | Impact Room: the 3–4 pre-modeled shocks, editable elasticity/pass-through sliders, scenario bands, citation rails + abstention, "as of" dates, public-data banner | ~1–1.5 days |
| 2 | Live Claude moment: paste a *snippet of a corpus-known text* → structured cited impact (golden response for `DEMO_MODE=offline`) | ~half day |
| 3 | Pouch Radar: crawler over Haypp sitemaps + nicotine-pouches.org, price/launch/bestseller index, Sweden/UK focus | ~1–1.5 days |
| 4 | Polish + record: the map narrative, demo script, offline rehearsal, deploy behind Vercel SSO, **record the ~3-min video** | ~1 day |

The deliverable is the video + a forwardable link; Phase 3 is the live-data
clincher. Visual targets are mocked in [mockups/](mockups/).

## 8. Open decisions (owner)

> **Update (2026-06): mostly resolved — kept for the record.** #1 green-light (built + shipped),
> #2 name ("Varsel for STG"), #3 worked example (EU-ETD is the lead; France + Denmark also modelled),
> #4 Anthropic key (set), and #7 app link (yes, gated — prod is gated) are all **DONE**. #6's title is
> confirmed and used everywhere ("SVP, Strategy, Transformation & Sustainability"). **Genuinely still
> open:** #5 — re-verify Tamarind & Euromonitor's exact cigar/pipe depth before any *spoken* specific
> claim — and the wife-intro confirmation in #6 (the `[wife]` placeholder in
> [outreach.md](outreach.md) is still unfilled). See the "Status & handoff" log in [CLAUDE.md](../CLAUDE.md).

1. **Green-light Varsel** as the build (vs. leaning harder into the Pouch Radar
   alone as a faster, lower-risk first wedge — judge #2's case).
2. **Name:** "Varsel" vs. neutral vs. something else (it's a working title).
3. **Lead market for the demo's worked example:** the EU ETD (hits the 50%
   combustible core — most CEO-magnetic) vs. France (most acute, dual cigar+pouch
   exposure).
4. **Anthropic API key** for the live Claude call.
5. **Re-verify** the precise cigar/pipe depth of Tamarind & Euromonitor before
   any client conversation (our own agents conflicted; framing is safe either
   way, but a specific spoken claim must be checked).
6. **Confirm Yulia's exact title** against the AR2025 PDF before written outreach
   (web board page says "SVP, Strategy, Transformation & Sustainability"), and
   confirm with the wife that Yulia (not someone else) is who she can introduce.
7. **App link in the email — yes/no.** Recommendation: yes, but gated (video is
   the star; the valuable "plug in real numbers" step requires replying).
