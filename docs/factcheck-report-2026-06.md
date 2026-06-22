# Fact-check report — the three research docs (June 2026)

*Status: **analysis + proposed corrections only**. No client-facing doc has been
edited. Per the escalation rule, edits to `stg-facts.md` / `ceo-research-digest.md`
/ `research-brief.md` (the canonical data the app cites) wait for owner sign-off.
Compiled 2026-06-22 from a web-verified fact-check of **all 200 claims** in those
three docs. Each claim was checked against primary sources (AR2025, interim
reports, STG press releases, EUR-Lex/official legal texts, reputable trade press).*

---

## 0. TL;DR

Every number the app shows traces back to these three docs (CLAUDE.md: *"cite from
here, don't re-research"*), so an error here propagates into the demo and into
anything repeated to Yulia / the CFO / the CEO. We checked all 200 and found the
spine is sound — but **six claims are wrong** and should be corrected before the
link is forwarded, two of them on the financial summary page a CFO reads first.

| Verdict | Count | What it means |
|---|---:|---|
| ✅ confirmed | 167 | Matches a primary source. The financial spine, segment splits, ETD minima, France/DK dates all hold. |
| ⚠️ stale | 14 | Was right, has since drifted (dates, wording, a superseded status). |
| ❓ unverifiable | 13 | Mostly point-in-time stock data + paywalled broker targets — not reproducible from open sources; label as as-of, don't assert. |
| ❌ contradicted | 6 | Factually wrong. **Fix before forwarding.** |

**The one-liner:** *Two wrong figures sit in the FY2025 results table (net profit,
ROIC), one is a fabricated margin, and one is a misattributed market share. None
breaks the impact model — but each is exactly the kind of number a numerate reader
catches, and the pitch's whole credibility claim is "every number cites its source."*

---

## 1. Method & coverage

- **Coverage: 200 / 200 claims** across 18 clusters, web-verified. (This run
  finished a fact-check that three prior sessions had started and lost to session
  limits; 161 verdicts were recovered intact from the workflow journals, the final
  39 were re-verified this session.)
- **Verification strength** (noted per finding below):
  - **Hardened** — an independent adversarial agent tried to *defend the doc* and
    still concluded it's wrong. The 4 most dangerous catches (F14, F19, F50, X25)
    and the top regulatory claim (F97) carry this.
  - **Double-verified** — two independent passes agreed.
  - **Single-verified** — one pass, sourced. (The residual adversarial pass on the
    lower-stakes stale items + a re-attack on the 27 confirmed headline numbers did
    **not** run — it died on the 3:30am session reset. See §6. None of those are
    believed wrong; this is belt-and-suspenders only.)

---

## 2. Tier 1 — correct before any forward (the 6 contradicted)

### ❌ F14 — FY2024 net profit is DKK **940m**, not 944m  · `high` · **hardened**
- **Where:** `stg-facts.md:44` (FY2025 results table), implied at `ceo-research-digest.md:25` (the "−29%").
- **Current:** `Net profit | DKK 669m | 944m` → "−29%".
- **Correct:** FY2025 DKK 669.4m; **FY2024 DKK 939.7m ≈ 940m**; decline **−28.8%** (not −29%). Source: STG Interim Report Q4 2025, Consolidated Income Statement (4 Mar 2026).
- **Edit:** `stg-facts.md:44` → `| Net profit | DKK 669m | 940m | [C] |`. In the digest line 25, change "**-29% to DKK 669m**" → "**-28.8% to DKK 669m (from 940m)**".

### ❌ F19 — FY2025 ROIC is **7.9%**, not 7.8% (7.8% is the Q1 2026 figure)  · `high` · **hardened**
- **Where:** `stg-facts.md:49` (FY2025 table), `ceo-research-digest.md:23` & `:27`.
- **Current:** `ROIC | 7.8% (target ≥11% by 2030)`.
- **Correct:** **FY2025 year-end ROIC = 7.9%** (vs 9.4% in 2024). The **7.8% is real but it's the Q1 2026 ROIC** (7.8% vs 8.8% PY, per the 20 May 2026 interim) — it was placed in the FY2025 results row by mistake. The ≥11%/2030 target is correct.
- **Edit:** `stg-facts.md:49` → `| ROIC | 7.9% (target ≥11% by 2030) | — | [C] |`. The digest's "vs 7.8–7.9% now" (line 23) is fine as a range; line 27's Q1-2026 "ROIC 7.8%" is correct *for Q1* — leave it, just don't let 7.8% be the FY2025 number.

### ❌ F50 — there is no "Power Brands hold 18.4%" share; 18.4% is the pouch CAGR  · `medium` · **hardened**
- **Where:** `ceo-research-digest.md:118`. *(Note: `stg-facts.md:156`'s 26.8% is correct and contains no 18.4% — this edit is digest-only.)*
- **Current:** "…26.8% FY2025 (down from 27.9% in 2024); **Power Brands hold 18.4%**."
- **Correct:** 26.8% / 27.9% is confirmed verbatim (Q4 2025 report). But **no "Power Brands hold 18.4%" MRC share exists** — 18.4% is the **Euromonitor 2025–2029 nicotine-pouch market CAGR** from the CMD deck, misattributed here as an MRC share. STG quantifies MRC Power Brands only for the US business (~45% of US sales).
- **Edit:** delete "; Power Brands hold 18.4%" from `ceo-research-digest.md:118` (or replace with the qualitative "Power Brands grow faster than the category").

### ❌ X18 — fabricated "NGP gross margin 23% → 35.2%"; the 23% is a sales **decline**  · `medium`
- **Where:** `ceo-research-digest.md:89` and `:125` (appears twice).
- **Current:** "…rationalization lifted NGP gross margin **23%→35.2%** YoY in Q1 2026."
- **Correct:** **No such margin figures exist in STG disclosures or the Q1 2026 transcript.** The "23%" is the **~23% organic *sales decline*** in nicotine pouches in Q1 2026 (ACE/GRITT footprint rationalisation + delivery timing). The "35.2%" appears nowhere. Group EBITDA margin b.s.i. Q1 2026 was 17.2% (vs 16.1% PY).
- **Edit:** remove the "23%→35.2% gross margin" clause from both lines. Replace with the real mechanism: "ACE/GRITT rationalisation drove NGP organic ≈ −23% in Q1 2026 (timing + footprint cuts), while improving segment mix." This is the single clearest fabrication in the corpus — highest priority to strike.

### ❌ F83 — Netherlands is **not** an MRC production site; Italy (Lucca) is missing  · `medium`
- **Where:** `stg-facts.md:118/120/121`, `ceo-research-digest.md:90`.
- **Current:** machine-rolled made in "Belgium (Lummen + Westerlo), **Netherlands (Eersel/Waalre)**, DR, Indonesia (**Semarang** + Pasuruan)."
- **Correct (AR2025):** MRC production is "Belgium, Indonesia and the Dominican Republic"; the European production map lists **Denmark, Belgium and ITALY**. (1) **NL MRC production closed/relocated** post-2020-Agio — NL is now holding/commercial only (stg-facts already flagged it `[I] verify mfg vs commercial`). (2) **Italy (Lucca — Moderno Opificio del Sigaro Italiano, 85%-owned, acquired 2021) is a real AR2025 cigar-production site and is omitted.** (3) **Indonesia city is likely Pandaan + Pasuruan, not Semarang** (st-group.com about page; AR names no city). Belgium (Lummen + Westerlo) is correct.
- **Edit:** drop NL from the factory list (keep it as a sales/commercial entity), add Italy/Lucca as an MRC site, and change the Indonesia city to Pandaan/Pasuruan (or label the city `[I]`). *Touches map markers (§4.3) — worth a careful pass since the map plots these.*

### ❌ X25 — keep ETD = excise, TPD3 = packaging/flavour (the docs are already right — don't regress)  · `low` · **hardened**
- **Where:** `ceo-research-digest.md:127` & `:148`.
- **Finding nuance:** the adversarial agent confirmed (with EUR-Lex) that **plain-packaging / characterising-flavour bans are TPD3 measures, NOT the ETD revision COM(2025) 580** — the ETD threatens the MRC cash cow via **sharply higher excise** (cigars/cigarillos 5%→up to 40% WAP; €12→€143/kg), not packaging. **However, the actual doc text at lines 127 & 148 already attributes flavour/packaging to the "TPD revision" — so the docs are correct as written.** The catch fired on a compressed paraphrase, not the live text.
- **Action:** **no edit needed**, but it's the one place to never blur: keep "ETD/COM(2025) 580 → excise" and "TPD3 → flavour/packaging/plain-packaging" cleanly separated everywhere (esp. if the Impact Room copy or qa-prep ever paraphrases this). Listed here so the distinction is on record.

---

## 3. Tier 2 — stale, should refresh (14)

### Medium materiality

| ID | Where | Issue | Fix |
|---|---|---|---|
| **F97** *(hardened)* | `stg-facts.md:177`, `digest:200`, `brief.md:66` | COM(2025) 580 / 16 Jul 2025 / apply-2028 all confirmed, but **status moved on**: "Cyprus compromise failed Jan 2026" is no longer the latest milestone — Cyprus pulled the file from the 12 Jun 2026 ECOFIN agenda; it passed to the **Irish Presidency (H2 2026)**, still in Council under unanimity (Council doc ST-9504/26, 29 May 2026). | Update status line to "in Council under unanimity; passed to the Irish Presidency H2 2026" (drop the Jan-2026 anchoring or mark it historical). |
| **F103** | `digest:127/265`, `brief.md:54` | Conseil d'État 22 Dec 2025 suspended only manufacture/export; sale/import/possession/use ban in force **1 Apr 2026** — correct. But **no source supports the "until end-June 2026 to relocate" deadline**; the only June-2026 date is the expected **merits ruling**. Also `brief.md:54` hedges "1 Mar 2026 (some say 1 Apr)" — it's **1 Apr**. | Drop/repair the "end-June relocation deadline"; set the in-force date firmly to **1 Apr 2026** in `brief.md:54`. |
| **F52** | `stg-facts.md:156`, `digest:119` | MRC leadership broadly right (BE ~90%+, FR ~80% MRC, NL >50–60%, UK ~45–50%, ES ~55%), but **"Nordics >50%" and "Canada leader" are not evidenced** in the FY2025/CMD primary sources. | Soften to "Belgium (~90%+); leader in FR/UK/NL/ES" and qualify or drop the Nordics-%/Canada-lead specifics. |
| **F60** | `stg-facts.md:161`, `digest:124/232` | **XQS was acquired in 2023** (announced 23 Apr 2023, completed 31 May 2023), **not 2021**. Sweden share 7.8%(FY24)→12.3%(FY25), >13% year-end, 13.6% Q1 2026 — confirmed. "#2 in Sweden" plausible (Velo #1). | Change "2021" → "2023" (and "more than quadrupled since acquisition" still holds off the 2023 base). |
| **F68** | `digest:13` | **"CEO since May 2018" is wrong** — Frederiksen has been CEO since **1 Mar 2015** (internal promotion from EVP Global Supply Chain). `stg-facts.md:165` and `brief.md:45` already say 2015 (correct); only the digest disagrees with itself. | `digest:13` → "CEO since March 2015". |
| **F88** | `stg-facts.md:103`, `digest:108` | 15 superstores / Newport KY #14 / Orlando FL #15 all confirmed. **The planned Chesterfield, MO store was scrapped** (cancelled). | Remove the "planned Chesterfield MO" mention (or mark "cancelled"). |

### Low materiality (refresh when convenient)

| ID | Where | Issue |
|---|---|---|
| F61 | `stg-facts.md:161`, `digest:124/235` | XQS UK launch was **Apr/May 2024**, not "summer 2024"; **Oct 2025 was a flavour launch, not a rebrand** (range rebrand = Feb 2026). |
| F62 | `stg-facts.md:161`, `digest:124/234` | Focus2030 focus is **"Scandinavia and the UK"** (CEO's words), slightly broader than "Sweden and UK only". |
| X17 | `digest:235/236` | Same as F61 — "Oct 2025 **rebrand**" → "Oct 2025 **flavour launch**" (Cola Lime + Fizzy Peach 8mg); rebrand was Feb 2026. |
| F92 | `brief.md:42` | Feb 2026 reorg date/structure correct, but the **"56 SKUs discontinued" is misattributed** — that was a separate **March 2025** event, not the Feb 2026 reorg. |
| X20 | `digest:108`, `stg-facts.md:104` | "The Colony TX = largest, rebuilt 2025" is **outdated** (Orlando 9,900 sq ft is larger). "Bridgeville" (stg-facts) and "South Fayette" (digest) are the **same store** — no contradiction. Chesterfield scrapped (see F88). |
| F114 | `stg-facts.md:184`, `brief.md:58` | **Finland is no longer pharmacy/NRT-only** — pouches moved into the Tobacco Act (2025): licensed **retail** sale, 16.6 mg/g cap, tobacco/menthol/mint flavours only, online restrictions. Re-label FI from "restricted/pharmacy-only" to "restricted (retail, capped/flavour-limited)". |
| F130 | `digest:245` | BAT Velo "+384% / £105m" is the **FY2025** US Modern Oral figure, **not H1 2025**. |
| F155 | `digest:83/141` | The "10% USD/DKK ≈ 5% of sales" sensitivity is confirmed verbatim; the **"~6.4–6.9/USD during 2025" band is understated** — 2025 USD/DKK ran ~6.29–7.28 (avg ~6.61), a strongly trending year. Widen or date the band. |

---

## 4. Tier 3 — unverifiable: label as as-of, don't assert (13)

Most of these are **point-in-time market data** (stock price, returns, broker
targets) that are *plausible and consistent* but not reproducible from open sources
months later — they're not "wrong," they just shouldn't be stated as standing facts.
Recommended blanket action: **date-stamp them "as of <date>, source X"** and never
let the app surface them as live (the app already avoids investor-facing copy under
MAR — good).

| ID | Where | Note / action |
|---|---|---|
| F24 | `stg-facts.md:52`, `digest:58` | Share ~DKK 67.50 / P/E 8.2 / yield 6.6% — close to a real ~67.70 / P/E 8.4 mid-June 2026 read. Fine **as a dated snapshot**; don't present as current. |
| F106 | `stg-facts.md:181`, `digest:120/148` | **"France is STG's #1 MRC/EUB market" can't be confirmed** from public sources (STG calls it "a big market", 19% of EUB ≈ DKK 620m is an analyst derivation). Soften to "one of STG's largest EUB markets" or keep the explicit derivation flag. *(Matters — it's load-bearing for the France narrative.)* |
| F138 | `digest:161/162/206` | Tamarind **product structure** confirmed; the **exact à-la-carte prices** ($1,300 / $3,995 etc.) aren't all re-verifiable — label "indicative, as advertised 2026-06". |
| F129 | `digest:239` | Sweden pouch "USD 50.6m / ~29% CAGR" matches **Cognitive Market Research, not Grand View** as cited — **fix the attribution** (or drop the source name). |
| F137 | `digest:157` | Tamarind founded 2014 + the three brands confirmed; minor sub-details (exact office list) soft — fine to keep. |
| F9 | `stg-facts.md:34` | "**>20 sales offices**" — STG's boilerplate says only "sales offices in North America and Europe" with no number. Keep but label as estimate, or drop the "20+". |
| X9, X10, X12, X13, X14, X16 | `digest:52/56/57/58/59/124` | Danish-press / Simply Wall St / TradeDesk characterisations & historical targets (−27% TSR, −32.61% 30-day, DKK 85 fair value, Carnegie DKK 135 Jan-2024, "6 of last 8 quarters", Mac Baren US/DK/DE split). All **directionally consistent, individually not reproducible**. Keep as cited colour, never as hard facts. |

---

## 5. What's solid (the 167 confirmed)

The load-bearing spine **all verified clean** — worth stating because it's what the
pitch rests on:

- **FY2025 financials:** net sales DKK 9,035.7m, EBITDA b.s.i. 1,791m (19.8%), FCF 595m, adj. EPS 10.8, dividend 4.50 (cut from 8.50), leverage 3.0x, special items ~200m, FY26 guidance — **all confirmed** (F10–F18, F21, F22).
- **Segment & geography splits:** EUB/NABROW/NAOR, the category splits, **US = DKK 4,230.4m = 46.8% of group**, NGP DKK 428.2m — **all confirmed** (F34–F43).
- **Regulatory spine:** ETD minima (€71.5/kg→€143/kg; cigarette 63% WAP/€215) (F98, F99); COM(2025) 580 is a *proposal* (F100); **France Décret 2025-898, in force 1 Apr 2026** (F101, F102); **Denmark 9 mg + tobacco/menthol cap, full effect Apr 2026** (F107) — **all confirmed**.
- **Footprint:** Sutliff Richmond factory closed Feb 2025 → Assens (F81); handmade in DR/HN/NI (F82); leaf in Indonesia/Sri Lanka/DR (F84); pouches own-Svendborg + contract SE/PL (F86); Bethlehem PA as CI/NAOR base (F87) — **all confirmed**.
- People (Bock CFO 2018, Lyusina SVP 2019), Haypp/vendor-landscape facts, leaf-climate water-stress — confirmed.

*Watch-item (not an error today):* the **Svendborg pouch/pipe factory is slated to
close by ~2026–2027** (Mac Baren consolidation → Assens). F85 is correct per AR2025
but will go stale when it shuts — flagged so the map doesn't keep a dead site.

---

## 6. Verification caveats (what didn't get the extra pass)

- The **adversarial re-attack on the 27 confirmed headline numbers** (the FY2025
  financials, segment splits, ETD minima, France/DK dates) **did not run** — it died
  on the 3:30am session reset. Those claims are each confirmed (most twice, all from
  AR2025/interim reports), so this is belt-and-suspenders, not a gap in coverage.
- **10 of the 15 defend-the-doc passes** (the lower-stakes stale items — F52, F60,
  F61, F62, F68, F88, F103, F114, F130, X17 — plus the X18 fabrication) are
  **single-verified**, not adversarially hardened. All are sourced; none is in doubt;
  X18 in particular is unambiguous (a documented sales-decline number relabelled as a
  margin).
- **Offer:** the residual hardening is ~11 small agents and can be run in one short
  workflow if you want every catch double-locked before edits land. Not necessary for
  Tier 1 (already hardened) — your call.

---

## 7. Appendix — proposed edits grouped by file (apply on approval)

**`stg-facts.md`**
- `:44` net profit FY2024 `944m` → `940m`.
- `:49` ROIC `7.8%` → `7.9%`.
- `:118/120/121` (§4.3 factory table + map markers): drop NL as an MRC *factory*; add Italy/Lucca; Indonesia city → Pandaan/Pasuruan (or `[I]`).
- `:156` soften ">50% Belgium & Nordics" → "Belgium (~90%+); leader FR/UK/NL/ES" (F52); "UK launched 2024" already fine.
- `:161` XQS "2021"→"2023" acquisition (F60); "launched 2024" ok; focus "Sweden + UK" → "Scandinavia + UK" (F62).
- `:181` France "#1 MRC market" → "one of STG's largest EUB markets" or keep derivation flag (F106).
- `:184` Finland re-label (F114).
- `:34` "20+ sales offices" → estimate/drop the number (F9).

**`ceo-research-digest.md`**
- `:13` "CEO since May 2018" → "March 2015" (F68).
- `:25` "−29% to DKK 669m" → "−28.8% (from DKK 940m)" (F14).
- `:89` & `:125` strike "NGP gross margin 23%→35.2%"; replace with the real −23% organic mechanism (X18).
- `:118` delete "Power Brands hold 18.4%" (F50).
- `:108` Colony "largest, rebuilt 2025" outdated; remove Chesterfield (X20, F88).
- `:124` Mac Baren US/DK/DE split → label unverified (X16); XQS focus markets (F62).
- `:235/236` Oct 2025 "rebrand" → "flavour launch" (F61, X17).
- `:239` Sweden CAGR source → Cognitive Market Research, not Grand View (F129).
- `:245` BAT Velo "+384%/£105m" → FY2025, not H1 2025 (F130).
- `:83/141` widen/date the USD/DKK 2025 band (F155).
- Keep ETD(excise) vs TPD3(packaging/flavour) cleanly separated (X25 — already correct, don't regress).

**`research-brief.md`**
- `:42` "56 SKUs" — separate Mar-2025 event, not the Feb-2026 reorg (F92).
- `:54` France in-force date → firmly **1 Apr 2026**; repair the "end-June relocation" deadline (F103).
- `:58` Finland re-label (F114).
- `:45` "CEO Niels Frederiksen (2015)" — already correct (keep).
