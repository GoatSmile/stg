# Niels video — Loom teleprompter + operator cut

*A clean read-aloud version of [demo-script-niels.md](demo-script-niels.md) (the full kit). Rebuilt
2026-06-24 from a 6-persona cold-reception panel + a 3-draft / 3-judge write-off — the old cut "jumped
straight in": no name, no "what is this", and it died the moment it was forwarded to someone who hadn't
read the email. This cut **orients first** (who I am · what this is · public-data guardrail) before a
single krone appears, so it survives a naked forward to strategy or the CFO.*

*Each scene gives **SAY** (read it) and **DO** (your cursor / screen — don't read these aloud). Record
in two camera modes and stitch (see below). Target **~2:10–2:25**, hard ceiling 2:30.*

---

## Recording structure — two modes, stitched

The to-camera scenes should be **your face full-frame**, not a corner bubble — a cold CEO needs to see
you. So record in two passes and arrange them in Loom's editor:

| Clip | Loom capture mode | How to set it | Content |
|---|---|---|---|
| 1 | **Camera Only** (face full-frame) | Loom icon → **Camera Only** | Scene 1 — who I am + the gap |
| 2 | **Screen + Cam** (bubble) | Loom icon → **Screen + Cam** | Scene 2 — Impact Room |
| 3 | **Screen + Cam** (bubble) | Loom icon → **Screen + Cam** | Scene 3 — lead-time chart |
| 4 | **Camera Only** (face full-frame) | Loom icon → **Camera Only** | Scene 4 — honesty + close |

**Set the mode by clicking the Loom icon in Brave** and picking it in the recorder window *before* you
start each clip — there is **no keyboard shortcut** for capture mode in the browser extension. You also
can't switch *into* Camera Only mid-recording (Loom only lets you toggle Screen ↔ Screen+Cam while
live), which is exactly why scenes 1 & 4 are their own Camera-Only clips. Then drag the four clips into
order in Loom's editor and trim the dead ends.

---

## Pre-flight (before you hit record)

- **Gate OFF** (no `SITE_PASSWORD` locally). Visit `localhost:3000/?notrack=1` once so your own views don't pollute the usage log.
- **Light mode** (parchment), clean browser window — no bookmarks bar, no personal tabs — and the cursor visible.
- **Zoom the browser so the band and the sliders fit on one screen.** Press `Cmd −` two or three times (≈ 67–75% on a 1080p display) until, on `/impact`, the headline **DKK band** at the top AND the **"Assumptions — you co-own the model"** sliders lower down are both visible without scrolling. This is what makes the band visibly jump when you drag the slider on camera. **Do one dry run to confirm.**
- Open `localhost:3000/impact` — confirm the chip reads **"EU tobacco-tax revision (ETD)"** with the amber **"proposed — in Council negotiation"** badge before you speak.
- Say **"the backbone"** — never a percentage. **Read the band off the screen** (don't pre-commit a figure). **Don't open the HR lens.**
- Talk like you're across the table from him. Warmth + brevity beat polish.

---

## 1 · CAMERA ONLY — who I am + the gap — (0:00–0:22)

> *Your face, full frame. No screen yet.*

**SAY:**

Hi Niels — I'm Nazar Taras. I build software for a living, here in Frederiksberg, at valent.dk; I'm not from STG, and I have no STG data. What you're about to see is a working prototype I built in my own time — not a deck, an actual tool.

It runs only on STG's published filings and public regulatory texts — nothing internal — and it's scenario-prep, not a forecast.

My wife, Tanya Pavlenko, works at STG, so let me be up front: nothing here comes from her. She checked with Betina, who said you'd likely read a note like this — so I'm sending one. Ninety seconds — me, no slides.

---

## 2 · SCREEN + bubble — the money-shot (Impact Room) — (0:22–1:10)

**DO — set the stage before you talk:**
1. Cut to the browser, already on **`localhost:3000/impact`** (EU-ETD tab), zoomed so the band + sliders share the screen. **No map, no other tabs.**
2. Rest the cursor near the top, so the title **"EU tobacco-tax revision (ETD)"** and the amber **"proposed — in Council negotiation"** badge are in frame.

**SAY:**

Across this industry, sizing a regulation before the decision has to be made is slow, and done by hand. This does it fast.

The worked example is on screen: the EU's proposed tobacco-tax revision — COM(2025) 580, still in Council — which raises the excise floors on cigars and pipe from 2028. That's the backbone of STG. So what could it mean?

**DO:** Move the cursor to the big number under the label **"EBITDA at risk — on these assumptions."**

**SAY:** The answer's right here, as a band —

**DO:** Circle the headline figure **"DKK 45–95m"** and the **"base case ≈ DKK 72m / year"** line just under it. Then point at the amber tag on the right: **"illustrative — public-data model, not STG's own figure."**

**SAY:** — roughly DKK 45 to 95 million a year — and it's labelled, right there, a public-data model, not STG's own figure.

**DO:** Move the cursor to the right-hand column, to the heading **"Where the source is silent,"** and run it down that short list of abstained rows.

**SAY:** Every line cites its public source — and where STG doesn't publish a number, it says so here, instead of inventing one.

**DO:** Move to the left-hand column, **"Assumptions — you co-own the model."** Grab the **top slider, "Exposed share of the EU base"** (it shows 30%) and **drag it up one notch** — watch the headline band step up as you drag. **Do NOT click anything labelled re-run.**

**SAY:** And these are assumptions you can argue with — this top one is just my estimate of your exposure; you set it. See the band move. With your real volumes, behind a data agreement, it tightens — still a band, just a much narrower one your team owns.

---

## 3 · SCREEN + bubble — the lead-time proof — (1:10–1:35)

**DO — switch screens:**
1. Go to the **home page** — type `localhost:3000/` (or click the wordmark, top-left).
2. **Scroll down one block**, past the engine preview, to the card headed **"Before it lands — the lead time is in the public record."**
3. The bar chart is inside it. Park your cursor on the dashed vertical **"today"** line down the middle of the chart.

**SAY:**

And it's a proposal, not law — which is the point: you see the range now, while it's still arguable. The timing was always in the public record.

**DO:** Trace the cursor left along the short **France** and **Denmark** bars (the claret "in force" ones, sitting to the left of the "today" line), then sweep right along the long amber **EU-ETD** bar that runs past "today" out to 2028.

**SAY:** The French ban in force this April was published as a decree last September — seven months' warning. I'm not claiming this tool called France; it didn't exist then. The point is a tool that reads that public record systematically hands your team the next one as a sized scenario, not a late surprise.

---

## 4 · CAMERA ONLY — honesty + close — (1:35–1:58)

> *Cut back to your face, full frame. Stop touching the mouse.*

**SAY:**

That's the whole thing. Public data only — zero STG figures, nothing investor-facing; internal scenario-prep, full stop. *(if running long, drop this next line →)* Your team can pressure-test every assumption before anyone commits to anything.

If it's worth a proper look, you'll know far better than me who should own it — strategy would be my guess. I'm Nazar Taras, at valent.dk. Either way — thanks for the two minutes.

> *End. No outro card, no link on screen — the link lives in the covering email so the video forwards clean.*

---

## One choice before you record — naming Betina

The recommended Scene 1 line names her: *"She checked with Betina, who said you'd likely read a note
like this."* That's warm, true, and matches your email. **But the video gets forwarded** — so her name
travels to strategy / the CFO, people she never spoke to. If you'd rather it didn't, swap that one
sentence for:

> "She checked with your office first, and was told you'd likely read a note like this."

Niels still knows exactly who you mean (the email names her); forwarded viewers don't get the name.
**Tanya stays named either way** — that "nothing comes from her" firewall is the honesty disclosure
Betina actually asked for, and it protects Tanya at her own employer.

---

## After recording (Loom)

- Arrange the four clips in order; trim the dead ends.
- Set the Loom share link to **"Anyone with the link"** (no sign-in to view) so it forwards clean to strategy/CFO.
- Paste that URL into `[video link]` in [outreach.md](outreach.md) — and you're send-ready.
- If challenged on a call afterwards, the CEO-tuned recovery lines are in [demo-script-niels.md](demo-script-niels.md) §Recovery lines.
