# Run-of-show — STG meeting, Thursday 24 September 2026

**10:00–10:45 · STG offices, Sandtoften 9, Gentofte · in person.**
Invite title: *"Intro to AI tool to STG."* In the room: **Peter Schøtt Knudsen** (Group General
Counsel — the gatekeeper), **Hanna Løyche** (Head of Corporate Affairs, Europe — the champion),
**Emilie Thornedahl** (working-level Legal/PA — the day-to-day evaluator, likely writes the internal
note). All Legal & Public Affairs. Personas + every anticipated question: [qa-prep.md](qa-prep.md)
§7.5 (rehearse it, don't read it).

**The goal (say it to yourself, not to them):** they leave wanting one of two things — *"run it on a
regulation we care about"* (a small pilot from their own function) or *"Strategy/Finance should see
this"* (a second session). **Not a signature. Not a price conversation unless they open it.**

**The one sentence everything hangs on:**
> "You already monitor regulation better than I ever could. This is the step *after* monitoring —
> turning a regulation you're already tracking into a defensible, sourced kroner band you can put in
> front of the board or a ministry."

---

## 1. Countdown

**Week of 15 Sep**
- [ ] Check `/usage` — did Hanna (14) / Peter (15) open the video or app? Tailor the open accordingly:
      if they've explored, skip basics and ask what they clicked; if untouched, assume zero context.
- [ ] Re-verify the three scenario statuses (has EU-ETD moved in Council? France enforcement news?
      DK cap news?) — one stale spoken fact in front of three lawyers costs more than the whole demo earns.
- [ ] One-line reconfirm to Hanna if anything needs it (room, screen availability — ask if a screen
      with HDMI is available, else plan laptop-on-table).

**Mon 22 – Tue 23 Sep**
- [ ] **Feed freshen** (the deferred owner task): re-pull careers, re-commit fresh feed snapshots,
      sweep `asOf` dates. A "live early-warning" demo with June dates self-refutes.
- [ ] Rebuild + full offline rehearsal: `DEMO_MODE=offline` local prod build, wifi OFF, run the whole
      20-minute demo twice. Time it.
- [ ] Print **4 × one-pager PDFs** (`/onepager` → Save as PDF; France scenario) + 1 spare set of the
      EU-ETD version. Lawyers like paper; it's also your crash plan.

**Wed 23 Sep evening — pack**
- [ ] Laptop, fully charged + charger. Local prod build tested that evening, `DEMO_MODE=offline`.
- [ ] Phone with hotspot (backup only — the demo must not need it).
- [ ] USB-C → HDMI adapter.
- [ ] The printed one-pagers. Notebook. Business cards if you have them.

**Thu 24 Sep morning**
- [ ] Arrive **09:40** — badge-in at a tobacco HQ takes time; be set up and calm, not plugging in
      cables at 10:02.
- [ ] Demo from **localhost** (the offline build), never from stg.valent.dk over their wifi — and
      never via Hanna's/Peter's tagged links (tracking pollution). If their wifi happens to work,
      the live site is a flourish at the end, not the spine.

---

## 2. The 45 minutes

### 10:00–10:03 — Open (3 min, standing or sitting, no screen yet)
- Thanks + one line of who you are: *"I build software for a living in Frederiksberg — valent.dk —
  with a focus on risk."*
- **The disclosure, proactively, in the first minute:** *"And as you may know from the email chain —
  my wife Tanya works at STG, in People & Culture. I flagged that from the first email, and nothing in
  what you'll see uses anything internal or anything from her. I'd rather you hear that from me than
  wonder."* (To a GC, volunteering this is worth more than anything else you could open with.)
- Set the shape: *"I'll show you the actual thing for about 15 minutes — one regulation, worked all
  the way down — and then I'd rather spend the time on your questions."*

### 10:03–10:08 — The frame (5 min, still mostly talking)
- Their gap, respectfully: monitor → interpret → engage, they do all three; the missing verb is
  **quantify**. The core-reframe sentence (above) goes here.
- **Defuse the invite title now, don't wait:** *"The invite says 'AI tool' — so let me say up front
  what the AI does and doesn't do. It never produces a number. A fixed, deterministic model computes
  the band; the AI only writes the sourced narrative around it, and a code check rejects any figure
  that doesn't match its cited source. You'll see it refuse to answer in a minute — that refusal is
  the design."*
- **The lead-time proof** (home page, hindsight card): France ban — public signal Sep 2025, in force
  Apr 2026, ≈7 months of lead time *in the public record*; EU-ETD ≈30 months, on the radar now. *"This
  isn't a claim my tool ran historically — it didn't exist then. It's the lead time already sitting in
  the public record, if the record is read systematically. That's your function's raw material."*

### 10:08–10:22 — The demo (14 min, one regulation deep, not seven lenses wide)
1. **France ban → Impact Room** (the in-force case they live with):
   - The sourced facts panel — every fact carries a citation chip (Décret 2025-898). Click one.
   - The band: **a range, not a point** — "bands are the honest expression of what public data
     supports."
   - **Hand Emilie the slider.** *"Disagree with the market-share assumption? Change it."* The band
     recomputes live. "The model is something you argue with, not something you receive."
   - **The abstention beat (the single most important 30 seconds):** show the line that says
     *not stated in source — needs human lookup*. Say: *"It doesn't know STG's France pouch revenue —
     because STG doesn't publish it. So it refuses, and makes the estimate an editable assumption
     labelled as yours. It will not guess. Ever."* Pause. Let that land on the lawyers.
2. **Denmark cap → the XQS SKU-exposure card** (their daily brief, made concrete): the flavour rule
   delists 23 of 34 UK / 27 of 34 SE SKUs — competitive exposure computed from public product data.
   One minute, then move.
3. **The Pulse map, 60 seconds, no more:** *"Same engine, whole risk surface — FX, leaf weather,
   freight, hiring — all live public feeds. The regulatory room you just saw is the worked example;
   the rest plug into the same discipline."* Do NOT tour seven lenses; depth already won.
4. Land on the **one-pager**: *"And any scenario exports to this — one page, sourced, caveated,
   board-ready."* Hand out the prints here.

### 10:22–10:40 — Their questions (18 min — this is the real meeting)
- Let them drive. Silence after a question is fine; three lawyers will fill it.
- Every anticipated question + answer is in **qa-prep §7.5**: monitoring-vs-quantification, advocacy
  use, MAR, discoverability, data-to-Anthropic, competitors/exclusivity, liability, who-are-you.
- House style under fire: **never bluff.** If you don't know: *"Not stated in my sources — I'll come
  back to you on that."* That's the product's own behaviour; embodying it is the pitch.
- Watch Emilie: if she's quiet, pull her in — *"You'd be closest to using this day-to-day — does the
  workflow make sense from where you sit?"*

### 10:40–10:45 — Close (5 min, firm and small)
- Summarize in one line: *"So: regulation in, defensible kroner band out, everything sourced or
  refused."*
- **The two forks, offered plainly:** *"Two natural next steps, and either is fine: I calibrate this
  to one regulation you actually care about — a small, fixed-fee piece of work — or, if you think the
  P&L side belongs with them, we show Strategy or Finance the same 20 minutes."*
- **The question that closes:** *"Who else at STG should see one regulation worked end-to-end?"*
- Leave with a named next step, however small (a name, a date, a "send us X"). Thank them; out by
  10:45 sharp — ending on time is a competence signal to this audience.

---

## 3. Contingencies

| If | Then |
|---|---|
| No screen / HDMI fails | Laptop on the table, three chairs around it — 3 people is fine. Practice this layout once. |
| Laptop dies / total crash | The printed one-pagers become the demo; walk the band + citations on paper. You rehearsed the narration without the screen. |
| Meeting cut to 30 min | Drop the map flyover and the DK cap; **never** drop the abstention beat or the close. |
| Peter doesn't show | Aim at Hanna + Emilie; add one question: *"What would Peter need to see to be comfortable?"* — it recruits them to prep him for round two. |
| "How much does it cost?" | They opened it: the fixed-fee sprint answer from qa-prep §10 (anchor DKK 110k, band 95–150k, fixed, one regulation). One sentence, then back to scope. Never a day rate. |
| Hostile deep-dive on a number | Click its citation chip. If it's an assumption, say so and move the slider. If it's not sourced, it already says "not stated." The tool answers for you. |
| "Can you leave the tool with us?" | The live gated link they already have; offer to mint access for Emilie. The *instance* stays hosted — that's the licensing model, said plainly if asked. |

---

## 4. Same-day follow-up (send by ~15:00)

Short, from you alone:
- Thanks + one specific callback to something *they* said in the room.
- Attach the one-pager PDF of whichever scenario got the most attention.
- Restate the agreed next step in one sentence, with a date.
- Nothing new, no price unless it was discussed, no pressure.

*(If the meeting produced a pilot conversation: the send-ready proposal is
[pilot-proposal.md](pilot-proposal.md) — Part A adapts in an hour. Don't send it same-day unless they
asked for it.)*
