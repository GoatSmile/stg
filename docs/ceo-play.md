# The CEO play — Varsel

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
> elasticity & pass-through → probability-weighted scenario band → decision-ready
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

- **EU Tobacco Taxation Directive revision** (COM(2025)580, proposed 16 Jul
  2025; directive **applies from 2028**; pouch minima **phase 2030–2032**;
  cigar/cigarillo/pipe minimums raised). The big one — it taxes the combustible
  core that is 50% of group revenue.
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
- **Assumptions are first-class:** elasticity & pass-through as editable sliders
  with their source studies (premium cigarettes −1.0 to −1.2; pass-through
  80–100%). Bands, not point estimates. A skeptical CFO can co-own it instead of
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

### Surface C — the Frederiksen Brief (the wrapper / landing)
The landing page *is* the five questions the CEO is under pressure to answer,
each wired to the live module that addresses it. It's the framing device that
makes a forwarded link instantly legible to anyone in the C-suite — not a
separate build.

*Phase-2 teaser:* a **gray-market / orphaned-demand radar** — where France's and
Denmark's banned/capped demand migrates (checkout-availability testing across EU
retailers). Doubles as advocacy evidence ("bans create unregulated supply") and
growth-capture signal (where XQS can *legally* capture orphaned demand).

## 5. Go-to-market — how an unknown solo shop lands a halved-stock C-suite

The CEO-reality refuter was blunt: a solo consultant will **not** get
Frederiksen's calendar cold, and procurement/infosec will bury "software to
onboard." The entry path is therefore designed around it:

1. **CEO-magnetic in content, IR/CFO-office-adopted in practice.** First user is
   an **IR analyst / FP&A / public-affairs lead** — reachable cold, owns the
   pain, value flows upward. Named surface from the digest: **IR head Torben
   Sand, CFO Marianne Rørslev Bock**, Chairman Henrik Brandt; sell-side analysts
   (Ekman/DNB Carnegie, Grave/Nordea, McNeela/Deutsche Numis) as users *or*
   referrers; industry bodies (Premium Cigar Association, Cigar Association of
   America, the Swedish snus lobby publicly fighting the France/Spain bans — a
   natural ally with the same modeling need).
2. **The forwardable live link is the landing mechanic** (already a house
   discipline: "every page must survive unattended viewing — the buyer will
   forward it"). A public URL turning a *real, dated* regulatory event into a DKK
   band on STG's *published* segments — with a visible **"built entirely on
   public data, zero STG data"** banner — is exactly what an IR analyst forwards
   to the CFO. The banner is also the AI-fluency / trust moment.
3. **v1 is an "intelligence brief," not "software."** Zero integration, no data
   transfer, hosted link. It buys through an **existing research/advisory budget
   line**, not a new-vendor software procurement cycle.
4. **No earnings-language feature in the cold version.** Under EU MAR, no listed
   Danish firm lets an external unvetted tool author investor-facing copy. The
   same output is positioned as **internal decision-support / scenario prep**,
   explicitly not investor-facing.

## 6. Expansion ladder (the consulting business behind the product)

`Public-data v1 (forwardable brief)` → **champion in IR/FP&A/public-affairs**
→ `paid "Varsel" subscription with STG's real volume/elasticity data behind a
DPA` (finance-grade vs analyst-grade precision) → `pre-earnings regulatory-impact
retainer` for IR/CFO (recurring) → `bespoke scenario deep-dives` that undercut
the Oxford Economics niche on **speed and price** → second buyer inside the same
account (public affairs, armed against the prohibition wave). This is the
cleanest ladder of any concept evaluated — and the medium is the message: *built
by one person + AI in weeks, the speed STG itself needs.*

## 7. Build plan (each phase independently demoable)

| Phase | Scope | Est. |
|---|---|---|
| 0 | Scaffold (Next.js + shadcn radix-nova), the segment model (public AR2025 splits as versioned JSON), the Frederiksen Brief landing | ~half day |
| 1 | Impact Room: the 3–4 pre-modeled shocks, editable elasticity/pass-through sliders, scenario bands, citation rails + abstention, "as of" dates, public-data banner | ~1–1.5 days |
| 2 | Live Claude moment: paste a *snippet of a corpus-known text* → structured cited impact (golden response for `DEMO_MODE=offline`) | ~half day |
| 3 | Pouch Radar: crawler over Haypp sitemaps + nicotine-pouches.org, price/launch/bestseller index, Sweden/UK focus | ~1–1.5 days |
| 4 | Polish: the brief narrative, demo script, offline rehearsal, deploy behind Vercel SSO | ~half day |

A meeting is bookable after Phase 1; Phase 3 is the live-data clincher.

## 8. Open decisions (owner)

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
