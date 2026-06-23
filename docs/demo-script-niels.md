# Video script — the Niels cut (CEO, ~2 min)

*Updated: 2026-06-23 — hardened via adversarial red-team (4 lenses: MAR/honesty, CEO-in-chair, production/UI, facts). See git log.*

*The recording kit for a video aimed at **Niels Frederiksen's eyes** (STG CEO). Tighter and
higher-altitude than the Yulia cut ([demo-script.md](demo-script.md)): wound-first, one money-shot,
the hindsight/lead-time proof, honesty said out loud, and a close that routes DOWN to install an owner.
Target **~2:00–2:25 (hard ceiling 2:30)**, spoken ≈ 320 words. With the on-screen actions (reading the
band, one slider, the home→timeline switch) a one-take lands ~2:15–2:30 — if a take runs over, cut the
two lines marked **[trim if long]**. One worked example only: the **EU tobacco-tax revision** on the
cigar/pipe core (his "backbone"); **France is the lead-time proof**, not a second scenario.*

> **Why this differs from the Yulia cut (read once):** Niels is a cornered, operationally-literate
> CEO mid-turnaround who watches the first 20 seconds to decide whether to forward. So: lead with the
> sizing gap in his register (NOT the map, NOT "I build software"); show ONE band, not a 7-lens tour;
> **cut the live-feed parade entirely** (breadth reads as an engineer playing, and the HR/careers beat
> is an optics landmine — see checklist); say the MAR/honesty line OUT LOUD (he owns guidance — a wrong
> or investor-flavoured number is existential); and invert the CTA from "forward up" to "name the owner."

---

## Pre-record checklist — do these BEFORE you hit record

**Integrity (these protect the whole pitch — non-negotiable):**
- [ ] **Cut the HR / careers / SAP-hiring beat.** Do NOT show the HR lens or "your open roles, live" to a senior STG viewer. The data is public, but the optics — your wife works in STG HR, and you'd be showing the CEO his own hiring/SAP patterns mid-data-reliability-crisis — read as a conflict/governance flag, not a wow. The regulatory→P&L engine is the thesis; lead with it, stay on it.
- [ ] **Do NOT quantify the "backbone" on camera.** Say "the backbone" (his own word) and stop. Don't ad-lib "about half your business" or any combustible %. (For your reference only: the combustible core is **~85%** of group — handmade cigars 35% + machine-rolled cigars & smoking tobacco 50%. The "50%" you may have in your head is MRC + smoking tobacco *alone* — never say it as the whole core.) Only the on-screen band carries a number.
- [ ] **The intro token must stay literally true.** Betina suggested it *to your wife, about you* — a personal courtesy, not a professional endorsement. Say exactly *"Betina suggested to my wife that I reach out to you directly."* Do not upgrade it. Keep your wife's name out of the on-camera commercial framing.
- [ ] **MAR/honesty rails literally in-frame on the money-shot.** Frame so BOTH the Impact Room's *"Internal scenario prep — not investor-facing (EU MAR)"* line AND the footer *"Built on public data · zero STG internal data"* banner are visible — scroll once to show the footer if needed. Every on-screen figure is a band that cites a source or visibly abstains. Nothing anywhere implies investor-facing / market-timing.

**Technical:**
- [ ] **Gate OFF** while recording (don't set `SITE_PASSWORD` locally, or you'll hit your own wall).
- [ ] **Opt your browser out of tracking first** — visit `localhost:3000/?notrack=1` once so your record session doesn't pollute the usage log.
- [ ] **Land on the right scenario:** type `localhost:3000/impact` directly (no query string) — it defaults to the EU-ETD tab. Confirm the active "Threat" chip is **"EU tobacco-tax revision (ETD)"** with the amber **"proposed — in Council"** badge before you speak.
- [ ] **Light mode** (parchment theme), clean browser window (no bookmarks bar / personal tabs), 1920×1080, cursor visible.
- [ ] **Record the VO after the build** and **read the actual on-screen band** — don't pre-commit a figure in narration.
- [ ] Talk like you're sitting across from him. No music. Warmth and brevity beat polish. One take is fine.

---

### 0:00–0:22 — to camera (the warrant + the sizing gap)

> "Niels — Betina suggested to my wife that I reach out to you directly, so I will, briefly. Today, when
> a tobacco regulation lands on STG, what it's worth gets worked out by hand, slowly — and the strategic
> call often gets made before anyone's sized it in kroner. So I built something that answers one question
> fast, on public data only: what is that regulation actually worth to STG? Ninety seconds — then you decide."

*Cut to screen — type `/impact` (defaults to EU-ETD). No map tour.*

### 0:22–1:15 — the money-shot (Impact Room, EU-ETD)

> "This is the EU's proposed tobacco-tax revision — COM(2025) 580, still in Council — which raises the EU
> excise floors on cigars and pipe from 2028. That's the backbone of STG — so, what's it worth? The
> answer's on screen as a band —" *[read it: roughly DKK 45 to 95 million a year]* "— labelled a
> public-data model, not STG's own figure. Every line cites its source, and where STG doesn't publish a
> number, it says so —" *[point to the amber "where the source is silent" rail]* "— instead of inventing
> one. And these are assumptions —" *[drag the "Exposed share of the EU base" slider up a notch; the band
> steps up — don't click "re-run"]* "— this one's just my estimate of your exposure. With your real
> volumes, behind a data agreement, the band tightens to a finance-grade number your team can stand behind."

*Switch to the home page; scroll to the lead-time bar chart.*

### 1:15–1:40 — the lead-time proof (hindsight timeline)

> "And here's why the timing matters. The France ban that took effect this April was in the public record
> seven months earlier — the decree was published last September. This reads that record and sizes it
> early —" *[cursor on the dashed "today" line of the lead-time chart — France/Denmark landed to its
> left, EU-ETD running past it to 2028]* "— so the next one reaches your team as a quantified decision,
> not a late surprise."

*Cut to camera.*

### 1:40–2:05 — to camera (honesty + route-down close)

> "That's it. It's public data only — zero STG figures, and deliberately nothing investor-facing; it's
> internal scenario-prep, full stop. **[trim if long]** Your team can pressure-test it on public data
> before committing anything. If it's worth a proper look, point me at whoever should own it — strategy
> would be the natural home — and behind a data agreement we'd run it on your real figures. Either way —
> thanks for the two minutes."

*End. No outro card / link — the link lives in the covering email so the video forwards clean.*

---

## Shot list (glanceable — for recording)

| Time | On screen — do this | Say (gist) | Cue |
|---|---|---|---|
| 0:00–0:22 | **You, to camera** | Betina suggested I reach out; what a reg is worth gets sized by hand, late — the call gets made before it's sized; I built something that answers one question; 90 sec | warm, literally-true token, **no "I build software"** |
| 0:22–1:15 | Type **`/impact`** (EU-ETD chip + amber "proposed" badge); let the **band** sit; point the **"where the source is silent"** rail; **drag "Exposed share of the EU base"** (don't re-run) | COM(2025) 580, in Council, cigar/pipe excise floors from 2028 = the backbone; what's it worth → band (read it); "not STG's figure"; cites or abstains; one slider = my estimate → real volumes behind a data agreement tighten it | read the on-screen band; **no map, no feeds, no %** |
| 1:15–1:40 | **Home → lead-time BAR CHART** (the SVG with the dashed "today" line — not the text rows) | France ban was public 7 months early (decree last Sept); this sizes the record early → a quantified decision, not a late surprise | cursor on the "today" line |
| 1:40–2:05 | **You, to camera** | public data only, zero STG figures, never investor-facing, internal scenario-prep; pressure-test before committing; **name the owner — strategy is the natural home**; real figures behind a data agreement | low-pressure; CTA routes DOWN |

---

## On-screen numbers cheat-sheet (so you read them right)

- **EU-ETD band:** ≈ **DKK 45–95m / year**, base case ≈ **DKK 72m** (verified: model computes 44.6–95.4m, base 72.0m). It's a range, never a point.
- **EU-ETD:** COM(2025) 580, **tabled 2025-07-16**, raises EU excise *floors* on cigars/pipe, application **from 2028**, still in Council (Irish Presidency, H2 2026).
- **France lead-time:** Décret 2025-898 **published 2025-09-05** → sale/import/possession ban in force **2026-04-01** = **≈ 7 months** of public warning.
- **The "backbone":** combustibles ≈ **~85% of group net sales** (handmade cigars 35% + machine-rolled cigars & smoking tobacco 50%, AR2025). "Cigars are the backbone of our company" = Niels's own words. **Say "the backbone," not a percentage.** (50% = MRC + smoking tobacco alone — don't quote it as the whole core.)
- Don't show a France band in this cut — France is the *lead-time proof*, not a second scenario. One scenario only.

---

## Recovery lines (if challenged — CEO-tuned)

- **"That number looks off."** → "It should — it's a model on public splits, not your real volumes. That's the gap I'd close with your data; tell me the right input and watch the band move."
- **"Is this an investor / IR tool?"** → "No — strictly internal scenario-prep, and deliberately built so it never produces anything investor-facing. Public data only, zero STG figures."
- **"We already monitor regulation."** → "You track *that* it's happening. This is what it's *worth* — to STG, in kroner, with the assumptions on the table. I haven't found anyone who sells exactly that."
- **"Why are you showing me this and not my team?"** → "Because you'd know in one glance whether it's worth your team's time — and Betina's suggestion gave me the opening to ask you directly. If it is, strategy's the right home and I'll take it from there."
- **"Isn't that France decree in court?"** → "The sale, import and possession ban took effect 1 April; the Conseil d'État only suspended the manufacture/export side, with a merits ruling expected H2 2026. The lead-time point stands either way."

---

## Channel note (decide later — does not change the recording)

This script is written for **Niels as the viewer**, so the close routes DOWN to install an owner. The
only channel-dependent parts are the **first sentence** (the warrant) and the **covering email** — both
swappable without re-recording the body. If the final decision is Yulia-first with a forward-up to
Niels, the body still works; only the opening token and the email change. The covering email (short,
plain-text, single CTA = "watch the 2-min video"; an ungated video link so a CEO-forward-down doesn't
have to carry a password) is a separate deliverable — draft it once the channel is chosen.
