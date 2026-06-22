# Q&A prep — Varsel for STG

*Updated: 2026-06-22 09:59 CEST*

*Your authoritative answer sheet for the app + the project. Written so you can answer cold,
in a room, without hedging. Every technical claim here is grounded in the actual code
(file paths cited) so you can stand behind it.*

**How to use this**
- §0 is the 30-second answer you give *anyone* before they ask anything.
- §1 is the shared foundation — the spine of every answer. Internalise it once.
- §3–§7 are persona-by-persona: the questions each will actually ask, and the answer to give.
- §8 is objection-handling (the hostile/skeptical version of every question).
- §9 is the guardrails — the things you must **never** say.
- §10 covers the commercial/delivery questions (the 3-week clause, penalties, data dependency).
- The appendix is a one-line tech cheat-sheet for the CTO conversation.

**The golden rule for the whole conversation:** *the honesty is the product.* Every time you
say "that figure isn't published, so the model abstains / you set it," you are not admitting a
weakness — you are demonstrating the exact discipline that makes the output safe to put in front
of a CFO. Lean into it.

---

## 0. The 30-second core (say this first, to anyone)

> "Varsel turns a tobacco or nicotine **regulation** into a **DKK band on STG's own P&L** — EBITDA,
> volume and margin at risk, as a low/base/high range, not a single number. It's built only on
> **public data** — STG's own published disclosures plus the public regulatory texts — and **every
> figure cites its source, or says so when the source doesn't state it.** No vendor does this:
> monitors stop at summaries, panels look backward, a bespoke study takes months and six figures.
> This is a working prototype, built on public data, designed so you can argue with the model rather
> than just receive a number. The paid step is plugging in your real volumes for a finance-grade band."

That paragraph answers "what is it," "is it credible," "how is it different," and "what's next" at once.
Everything below is depth behind it.

---

## 1. The foundation everyone shares — the credibility spine

These are true regardless of who's asking. They are the load-bearing facts.

**What it is.** A regulation→P&L early-warning room. You pick a regulation (e.g. the EU tobacco-tax
revision, the France oral-nicotine ban, the Denmark nicotine cap) and the engine walks it down to a
DKK EBITDA/volume/margin band on STG's published footprint, with every assumption editable.

**What it is NOT** (say these proactively — they pre-empt half the objections):
- **Not a production system.** It's a pitch prototype / method demonstrator. Engineering decisions
  follow from that, and that's deliberate.
- **Not using any STG internal data.** Zero. The model is built from STG's *published* disclosures
  and public regulatory texts. There is a visible "built on public data, zero STG data" banner.
- **Not investor-facing.** Every output is framed strictly as internal decision-support / scenario
  prep. Under EU MAR we never generate anything that reads as guidance.
- **Not a replacement for your FP&A.** It's the *front end* — it sizes the exposure fast and
  defensibly so your finance team can take it the last mile.

**The five credibility rails** (this is the spine — memorise it):
1. **Citation rails.** Every number the AI emits about a regulation carries an inline reference to a
   curated public source. Enforced in *code* (`src/lib/citation-rail.ts`), by value-match — a number
   that doesn't match a cited source is rejected, even if it sits under a real-looking citation.
2. **Abstention.** If a rate isn't in a cited source, the model returns *"not stated in source — needs
   human lookup,"* never a guess. A wrong euro figure repeated to a CEO would kill the pitch; the model
   is built to refuse rather than risk it. (Show this live — it builds trust.)
3. **Public data only, honestly labelled.** Figures STG doesn't publish (a France pouch line, a
   standalone pouch DKK number) are *analyst derivations from published splits*, marked `*`, with the
   estimation step visible and editable. We never present a derived figure as "STG's own number."
4. **Bands, not points.** Every output is low/base/high. The band is the honest expression of
   uncertainty; a single number would be false precision.
5. **Assumptions are first-class.** Elasticity, pass-through, exposed share, recapture are editable
   sliders with their source studies shown. The CFO *co-owns* the model instead of contesting it.

**The deterministic guarantee** (the most important technical fact for credibility): **the AI never
produces the number.** The DKK band is computed by a deterministic local model (`src/lib/impact-model.ts`),
mathematically constructed so the band always brackets the base case and can't invert. The AI writes
only the *narrative and the cited line-items around* that number. So there is no path by which a
language model hallucinates a kroner figure into the band.

---

## 2. Who's actually in the room at STG

Map the personas you asked about to the real people, so you pitch to the right instinct:

| Persona you asked about | Real person | What they actually care about |
|---|---|---|
| **Head of Strategy** (your first recipient) | **Yulia Lyusina**, SVP Strategy, Transformation & Sustainability | Is this credible enough to forward up? What's the catch? Does it make *her* look good to send it? |
| **CEO** | **Niels Frederiksen** | The surprise that moves guidance; cheap insurance; "is this just a guy with a demo?" |
| **CFO** (the real signer — not in your four but the key forward target) | **Marianne Rørslev Bock** | Are the numbers defensible? MAR/compliance risk? What does it cost, what's the ROI? |
| **CTO / Head of IT & Digital** | (STG digital/IT leadership) | Stack, security, data residency, backup/DR, AI accuracy, lock-in |
| **Head of Sales** | (commercial leadership) | Pouch Radar — competitive intel and regulatory exposure on the nicotine-pouch portfolio |

The realistic path: **Yulia → CFO (Marianne) → CEO (Niels).** The CTO and Head of Sales are people
they may *loop in* to validate — so your job with those two is to survive technical and commercial due
diligence, not to sell.

---

## 3. Head of Strategy — Yulia Lyusina (your first recipient)

She is the gatekeeper. Her #1 silent question is *"can I forward this up without it embarrassing me?"*

**Q: What is this and why are you showing me?**
> A risk-surface for STG's P&L: where the next regulatory surprise comes from, sized in kroner, before
> it lands. Built entirely on STG's public footprint. I'm showing you because it's designed to be
> forwarded — to the CFO and CEO — and because Strategy is where regulatory exposure should be owned
> before it becomes a finance fire-drill.

**Q: Is this credible enough to put in front of the CFO?**
> Yes — that's exactly what it's built for. Every number cites a public source or abstains; nothing is
> presented as STG's own figure unless STG published it; and the output is a band you can argue with,
> with the assumptions exposed as sliders. The two in-force examples (France ban, Denmark cap) plus the
> proposed EU excise revision mean it's not resting on one hypothetical.

**Q: How is this not just public data we already have?**
> The raw data is public — that's the point of the honesty banner. What has no incumbent is the
> *composite*: a regulation turned into an *entity-specific* banded P&L with editable
> elasticity/pass-through and a citation behind every line. That synthesis, on STG's own footprint, is
> the thing you can't buy from FiscalNote, Euromonitor or a panel.

**Q: What do you actually want?**
> A 30-minute call. If it lands, one fixed-fee pilot on the single exposure STG most fears — cheap
> insurance, one signature, no procurement saga.

**Q: What are the risks to STG of engaging with you?**
> Low and bounded: everything is public-data and internal-only (MAR-safe); the moment any real STG
> data is involved it's under a GDPR data-processing agreement with EU hosting and compute-and-return
> (your raw numbers never leave the processing environment); the IP is licensed to you, not sold; and
> I'll disclose the personal intro proactively so no one can call it back-channel procurement.

**Q: Where does this go beyond the first regulation? (the platform's future — also the CEO's "is this a one-off?")**
> Three directions, and I'm precise about which is which. **Deeper** — the same engine reaches every
> regulation that hits a P&L (tariffs, flavour/packaging, FDA), and with your real volumes the band stops
> being a range and becomes a bookable, SKU-level number. **Wider** — the same live map serves any team
> that thinks in geography: the concrete next build is **Tax** (every market's excise rate, live, into the
> same DKK engine — pure public data), and the one that'd watch *your* world is **M&A** — imagine this
> scanning brand-for-sale signals against your deal thesis. **Wired in** — from a hosted demo to a standing
> watch that re-sizes your book the morning a rule is tabled, into your own FP&A. Tax is what I'd build
> next; M&A is the one that's yours; the rest is range — any team with a map and a feed. *(Lead with the
> engine + Radar; M&A is "imagine," never "built." Full ranked roadmap + stars: `docs/map-platform.md` §9.)*

**The hindsight card is your strongest asset with her.** It shows, from public dates only, that the
France ban was in the public record ~7 months before it took effect and the EU revision ~30 months out
— so "early warning" is a property of *reading the public record systematically*, not a claim that
Varsel ran historically (it didn't exist then, and the card says so).

---

## 4. CEO — Niels Frederiksen

He thinks in strategic risk and capital allocation. Keep it short, business-first.

**Q: Why should I care?**
> In a year of ~DKK 275m special costs and a tightened payout, the one exposure you *haven't* sized is
> the regulatory tail — the kind of surprise that moves guidance. This sizes it, defensibly, for a
> fraction of what a bespoke study costs, before it becomes a number you have to explain to the market.

**Q: Isn't this just a consultant with a slide deck?**
> The opposite. It's a working model on your own footprint, with the method exposed: every figure
> cites a source or abstains, every assumption is editable. You can stress-test it in the room. The
> deck-and-PowerPoint version of this takes a McKinsey three months and six figures and still gives you
> a point estimate you can't audit.

**Q: Our finance team / FP&A can do this.**
> They can — *eventually*, and *backward-looking*, and they're busy closing the books. What they don't
> have is a standing, forward-looking, source-cited engine that turns a regulation into a band in days,
> across the whole surface (excise, bans, FX, leaf, freight, hiring). This makes their work faster and
> more defensible; it doesn't replace them. (And if they could already do it on demand, the EU-ETD
> exposure would already be sized — it isn't.)

**Q: Could using this create a disclosure / MAR problem?**
> No. Public data only; outputs are explicitly internal decision-support, never investor-facing; I'll
> accept an insider-list entry if you want one. The architecture refuses to generate
> earnings-language — that's a deliberate design constraint, not a promise.

**Q: What does it cost?**
> A fixed-fee pilot — one regulation, one footprint, ~DKK 95–150k, one signature. If it proves out,
> it ladders to a real-data build and then a retainer. No day rates, no open-ended hours.

**Q: Who are you and why the warm intro?**
> Independent — Valent / valent.dk. The intro came through a personal relationship in STG HR, which
> I'm disclosing up front precisely so it's arms-length. Judge the work, not the introduction.

---

## 5. CFO — Marianne Rørslev Bock (the real signer — bonus)

Not in your original four, but she's the person who actually approves money and whose instinct is
*"prove the number."* Be ready for her even if she's not in the first meeting.

**Q: How do I know the numbers are right?**
> You don't have to *trust* them — you can *audit* them. Every figure cites a public source or abstains;
> the band is a deterministic contribution-margin walk you can follow line by line; and the
> assumptions STG doesn't publish (exposed share, pass-through) are sliders *you* set, not numbers I
> assert. It's a model you co-own, delivered as a range.

**Q: What's the worked example, concretely?**
> The EU tobacco-tax revision (COM(2025) 580) on the cigar/pipe core: ~DKK 45–95m EBITDA at risk per
> year, base ≈ 72m, on a 30% exposed-share assumption you can change. Plus two in-force cases — the
> France oral-nicotine ban and the Denmark nicotine cap — modelled as lost-revenue-net-of-recapture.

**Q: Why bands and not a number?**
> Because a single number would be false precision on public data. The band brackets the base over the
> elasticity × pass-through grid — it's the honest envelope. When you give me real volumes under a DPA,
> the band tightens to finance-grade. The discipline of refusing false precision is the reason you can
> trust the parts that *are* precise.

**Q: Liability if a decision goes wrong on your number?**
> Outputs are decision-support estimates, not financial advice or guidance; liability is capped at the
> fee; I carry professional-indemnity (E&O) insurance. You're buying a sized scenario to inform your
> own judgement, framed exactly that way in the agreement.

**Q: What changes when we give you our data?** *(the "imagine with your data" beat — say it on the slider)*
> The blindfold comes off — and you can watch it happen. Today every assumption is *wide* because I'm
> guessing at your numbers; that's why the EU-excise band reads DKK 45–95m. Pin your real exposed share
> and contribution margin and the same engine collapses that to a single defensible figure (illustratively
> ~DKK 88m ± 5) — it stops being a range Strategy forwards and becomes a number Finance can book. Then it
> *deepens*: from "DKK 45–95m somewhere in cigars" to "these SKUs, these markets, and the months you have
> to act." Every `*` and every slider in this demo is a slot your data fills — I've shown you the gaps on
> purpose; they're the spec for what your data turns this into. (Precision, never prediction — it sharpens
> an internal scenario, it never becomes earnings guidance.)

---

## 6. CTO / Head of IT & Digital — the technical deep-dive

This is the section to over-prepare. The instinct here is due-diligence: *can this break, leak, or
lock us in?* Answer plainly, lead with the honest framing, and never oversell.

> **The two-question reflex.** Every architecture question — hosting, security, resilience, DR, scale —
> has *two* answers. Name which you're giving before you answer: **(1) the prototype in front of you** —
> a public-data demo, deliberately lean because there's nothing sensitive to protect yet; and **(2) the
> system we'd run for STG** — scoped with your security team: EU-hosted, DPA'd, SSO, monitored. Give both
> in one breath. Never let a production due-diligence question get the demo's answer (sounds like a toy),
> or the demo get a production claim (you'll trip a security review you don't need to pass yet — see §9).

**Q: What's it built in?**
> Next.js 16 (App Router) with TypeScript, React 19, Tailwind 4 and shadcn/ui (radix-nova). The world
> map is D3 + TopoJSON. The AI calls go to the Anthropic Claude API (server-side only). One Postgres
> table on Supabase (EU). Hosted on Vercel. It's a deliberately small, boring, well-trodden stack —
> nothing exotic to maintain or audit. (`package.json`: `next` 16.2.5, `react` 19.2.4, `typescript` 5,
> `tailwindcss` 4, `@anthropic-ai/sdk` 0.104.1, `d3` 7.)

**Q: Where is it hosted? Data residency?**
> The app runs on Vercel. The single database (the careers feed's daily snapshots) is Supabase in
> **eu-west-3 (Paris) — EU data residency**. Critically: **no STG data is stored anywhere** in this
> prototype. The only persisted data is public job-posting counts. For the paid real-data phase the
> contract specifies EU hosting and compute-and-return — your raw figures are processed and the bands
> returned; the raw numbers never persist outside the processing environment.

**Q: How secure is it?**
> Let me be precise about what this is: it's a **public-data demo**, so there are no secrets behind the
> gate to protect — and I've built it accordingly rather than over-claiming enterprise security it
> doesn't need. Concretely, today:
> - **Secrets never reach the browser.** The Anthropic API key and the Supabase service key are
>   server-side only (in `/api/*` routes); nothing sensitive is ever in `NEXT_PUBLIC_` or client code.
> - **Access gate.** Prod is behind an env-driven password gate (`src/proxy.ts`): unauthenticated
>   requests are redirected to a styled `/gate` page; a valid cookie is a SHA-256 of the shared
>   password (`src/lib/gate.ts`), httpOnly, never the raw password. It's a shared password the owner
>   emails with the link — appropriate for a forwardable demo, and I'll say plainly it's not SSO.
> - **Database least-privilege.** The one table has public-read row-level security and service-role
>   writes; reads use the anon key, writes use a separate service key held only where the pull script runs.
> - **Transport.** TLS everywhere (Vercel + Supabase default).
>
> For the production / real-data phase, the security model steps up to match: GDPR DPA (art. 28, STG
> controller / Valent processor), EU hosting, compute-and-return with raw volumes firewalled,
> sub-processor list, breach notification, deletion on termination, SSO instead of a shared password,
> and source-code escrow. I'd scope that with your security team, not hand-wave it.

**Q: What's your backup / disaster-recovery / catastrophe strategy?** *(the question you flagged)*
This is a genuine strength — lead with the architecture, because it was designed for exactly this.
> The app is **resilient by architecture, not by hope.** Five layers:
> 1. **Stateless and reproducible.** Almost all data is versioned JSON bundled into the build at compile
>    time (`src/data/`) — the segment model, scenarios, radar data. It physically cannot fail at
>    runtime, and the entire app is reproducible from git. A total infrastructure loss is a `git push`
>    away from a fresh Vercel deploy in minutes.
> 2. **Every live feed degrades gracefully.** All five external feeds (ECB FX, careers/Supabase,
>    Open-Meteo weather, NOAA climate, FRED freight) catch *every* failure class — timeout, DNS down,
>    non-200, malformed payload, missing key — and return a committed cached snapshot **labelled
>    "cached."** A single upstream outage cannot 500 the page or fake a live value. (Verified by an
>    adversarial resilience audit.)
> 3. **The AI call is bounded and self-healing.** The Claude call has a 9-second timeout, no retries,
>    and a 15-second hard platform cap (`/api/ai/impact`). If it's slow, errors, or rate-limits, the
>    route serves a **pre-reviewed "golden" response** — so the Impact Room always renders, and it's
>    labelled "offline" so a cached answer is never passed off as live.
> 4. **Branded error boundaries.** A new `error.tsx` / `global-error.tsx` / `not-found.tsx` mean that
>    even an unexpected server-side throw renders a branded page *with the disclaimers intact* — it
>    never drops to a naked, disclaimer-stripped 500. The global boundary is inline-styled so it renders
>    even if the stylesheet itself failed to load.
> 5. **The map's one stateful feed has a cached fallback too.** If the careers database is unreachable,
>    the map's open-role counts fall back to a bundled snapshot labelled "cached" rather than silently
>    showing zero (`src/components/map/PulseDashboard.tsx`).
>
> **Data backup specifically:** the one database table is itself re-derivable — it's a snapshot of a
> public job feed regenerated by one script (`scripts/pull-jobs.ts`), and Supabase carries its own
> managed backups. Everything else lives in git.
>
> **The honest caveat I'll volunteer:** this is not an offline PWA. The graceful degradation protects
> against *upstream* outages (a feed, the DB, or the AI going down). If the *recipient's own* internet
> is dead, nothing loads — but that's a demo over a link, not a 24/7 service. The genuinely
> network-independent artifact is the one-page PDF export (`/onepager`), which is what survives a dead
> connection. For a production deployment, uptime SLA, monitoring and PITR backups are contractable.

**Q: It uses AI — how do you stop it hallucinating a number?**
> Architecturally, not by hoping. **The AI never produces the DKK figure** — that's a deterministic
> local model. The AI only writes the narrative and the cited line-items, and a code-level citation
> rail (`src/lib/citation-rail.ts`) validates every figure it emits by **value-match against the cited
> source** and abstains anything that doesn't match — so a hallucinated number can't survive even if
> it's dressed in a real citation. And the offline fallback is a human-pre-reviewed golden response.
> Three independent guards: deterministic math, value-match citations, pre-reviewed fallback.

**Q: Which model, and why Sonnet?**
> Claude Sonnet (`claude-sonnet-4-6`), chosen for live-demo latency — it's a deliberate
> speed-over-Opus override noted in the code. The model is one constant; swapping it is a one-line
> change. Nothing about the architecture depends on a specific model.

**Q: Scalability / multi-tenancy?**
> Single-tenant by design — hosted by me, the repo is never shipped. For a tobacco/nicotine niche this
> is a boutique book (a handful of logos), not horizontal SaaS, and I'm honest that building
> multi-tenancy before a second customer would be premature. Each instance is isolated; there's no
> shared-tenant data surface to worry about.

**Q: Testing / code quality?**
> TypeScript throughout, with `tsc --noEmit` + `next build` as hard gates before anything ships, and
> RSC-boundary discipline so it doesn't pass build and explode at runtime. It's smoke-tested manually
> rather than with an automated suite — a deliberate call for a demo with a shelf life. If it
> graduates to a pilot/product, an automated test suite is the first thing I add, and I'd say that
> openly rather than pretend a demo has production test coverage.

**Q: Vendor lock-in / what if you get hit by a bus?**
> A source-code escrow clause: the code is released to STG on my insolvency or permanent cessation, for
> your continued internal use. Single-key-person risk is real for any boutique; escrow plus documented,
> reproducible-from-git deployment is the mitigation. You're never stranded.

**Q: Supply-chain / dependency risk?**
> A short, mainstream dependency list (Next, React, Tailwind, Radix, D3, the Anthropic SDK) — no obscure
> or unmaintained packages. Easy to audit, easy to patch.

**Q: Could it integrate with our systems (SAP / BI)?**
> Yes — post-DPA. The natural integration is compute-and-return over an API: your figures in, bands
> out, into your FP&A or BI layer. v1 is deliberately standalone so there's nothing to integrate (and
> nothing to break) until there's a signed reason to.

---

## 7. Head of Sales — Pouch Radar & the competitive angle

Their lens is the nicotine-pouch portfolio (XQS) and the competitive set. The relevant surface is
**Pouch Radar** (`/radar`) plus the pouch scenarios in the Impact Room.

**Q: What does Pouch Radar tell me?**
> It tracks the nicotine-pouch competitive set — XQS vs VELO, ZYN, Nordic Spirit — across Sweden, the
> UK and Denmark: nicotine strength, flavour range, pack count, per-can price, and a derived
> **price-per-mg** (a normalised value metric no competitor dashboard shows), plus a launch &
> compliance feed. So you see not just who's cheaper, but who's cheaper *per milligram of nicotine*.

**Q: Where does the data come from? Is it reliable?**
> Public manufacturer specs and retailer prices. The strength, flavour and pack-count are sourced
> per-row with a confidence level. The prices were cross-verified against a second and third
> independent shop per market (UK, DK and SE all confirmed), so they're marked high-confidence. I'm
> explicit that this is a dated one-time snapshot, not a continuous crawl — the crawler is built and
> proven but gated; continuous tracking is the paid expansion.

**Q: How is this different from a Nielsen / Euromonitor panel?**
> Panels look backward at share. Radar ties competitive moves to *regulatory exposure*. The clearest
> example: the Denmark/EU flavour-cap analysis shows it would delist roughly **79% of XQS's Swedish
> range and 68% of the UK range** by SKU count — that's a forward-looking foreclosure signal a
> backward share panel can't give you, and it feeds straight into the Impact Room's Denmark-cap scenario.

**Q: Does it cover our whole portfolio / more markets?**
> The structure scales to more brands and markets; today's snapshot is SE/UK/DK and the coverage gaps
> are disclosed on-page (e.g. Nordic Spirit's Denmark availability post-cap is unverified, so it's
> deliberately omitted rather than guessed). Broader, continuous coverage is exactly the paid expansion.

**Q: How does this connect to the P&L story?**
> Through the Impact Room: the France ban and Denmark cap scenarios show the *foreclosed pouch revenue*
> against STG's stated DKK 1bn+ pouch ambition. So Radar isn't just competitive trivia — it's the
> evidence base for how much of the growth plan a regulation puts at risk.

---

## 8. The hard / skeptical questions (objection handling)

The blunt versions. Have these cold.

**"The data's all public — why pay you?"**
> Because the value isn't the data, it's the synthesis: a regulation turned into *your* banded P&L with
> a citation behind every line and the assumptions exposed. That composite has no incumbent. The public
> data is the honesty guarantee, not the product.

**"You're one person. What happens when you're unavailable / disappear?"**
> Source-code escrow (released on cessation), reproducible-from-git deployment, and documented method.
> And the engagement model is fixed-scope deliverables, not a dependency on me being on call.

**"Tobacco is reputationally radioactive — why should we engage?"**
> The work is internal decision-support on public data — it makes nothing public, generates no
> investor-facing copy, and helps you manage regulatory risk responsibly. It's a risk-management tool,
> not marketing.

**"How do we know the AI isn't making things up?"**
> The AI never produces the numbers — those are deterministic. It writes prose around them, and a
> code-level rail rejects any figure that doesn't value-match a cited public source. The fallback is a
> human-reviewed canned response. (Then show the abstention live.)

**"Isn't ~DKK 45–95m a huge range? That's not precise."**
> Deliberately. On public data, a single number would be false precision. The band is the honest
> envelope; with your real volumes under a DPA it tightens to finance-grade. The width *is* the
> integrity.

**"This is just a dashboard / BI tool."**
> A BI tool shows you what happened. This sizes what *hasn't* happened yet — a forward regulatory event
> turned into a P&L band — and it's auditable line-by-line. The map is the surface; the engine is the
> point, and the home page leads with the engine for exactly that reason.

**"Can't McKinsey/BCG/our auditors do this?"**
> They can produce a one-off study in three months for six figures, as a static point estimate you
> can't re-run. This is a standing, editable, source-cited engine that turns it around in days and lets
> you change the assumptions yourself. Different product.

**"What's the catch / what are you really after?"**
> No catch — a fixed-fee pilot, then if it earns it, a real-data build and a retainer. I'd rather you
> see the method work on public data first and decide with your eyes open.

---

## 9. Guardrails — what to never say

These protect the credibility (and the legal position). Treat as hard rules.

- **Never present a derived figure as STG's own number.** Always: "this is an analyst derivation from
  published splits — you set the real one." STG does not publish a France pouch line or a standalone
  pouch DKK figure; saying they do is the one error that detonates the pitch.
- **Never generate or imply investor-facing / earnings language.** Everything is internal
  decision-support (EU MAR). If anyone asks for "something we could put in an announcement" — decline
  and explain why.
- **Never claim precision you don't have.** It's a band on public data. Don't let enthusiasm turn
  "~DKK 72m base on a 30% assumption you set" into "STG will lose DKK 72m."
- **Never quote a day rate or an hour count.** Fixed fee only. The day rate exists internally to scope,
  never as the headline (it commoditises you instantly).
- **Never present cached/offline data as live.** If a feed or the AI is on its cached/golden path, say
  "that's running offline right now" out loud.
- **Never claim it's a finished, production, secure-for-real-data system.** It's a public-data
  prototype; the production/security/DPA story is the *next* phase. Conflating them invites a security
  review you'll fail and don't need to pass yet.
- **Disclose the warm intro proactively.** Every time. It removes the only ad-hominem available.

---

## 10. Commercial & delivery questions — the "3 weeks" clause

These are the questions a careful buyer (and you) should ask about the pilot terms. See also the
companion analysis at the end of this section for what to *change* in `docs/pilot-proposal.md`.

**Q (buyer): When does the 3 weeks start, and what if delivery slips?**
> The ~3 weeks is a target that starts from signature, in public-data mode. In real-data mode the clock
> starts when the data and the DPA are in place — the DPA runs as its own milestone first. It's a
> reasonable-efforts target, not a hard deadline with penalties: the sole remedy for a slip caused by
> me is delivery, and the timeline extends day-for-day for any delay on STG's side (data, access,
> sign-off). For a fixed-fee analytical sprint that's standard — you're buying a defined deliverable,
> not buying time.

**Q (buyer): What if you can't get / we can't give the right data?**
> Two modes are built in. Public-data mode needs nothing from you and always delivers — derived figures
> labelled as estimates. Real-data mode needs the relevant volume/margin lines under NDA+DPA; if that
> data can't be provided in time, we fall back to public-data mode (and the band stays a defensible
> range, just wider) rather than the engagement stalling. You're never paying for a deliverable that
> can't be produced.

**Q (buyer): Is there a penalty if you're late?**
> No liquidated-damages / penalty clause, and you shouldn't expect one on a fixed-fee creative/analytical
> engagement of this size — it's not market for a ~DKK 110k sprint, and a penalty would just price
> itself into the fee. Your protections are: 50% held until delivery, liability capped at the fee, and a
> defined "done." If I materially fail to deliver, you haven't paid the second half.

### Companion analysis — your contract questions, answered

You asked four sharp things. Here's the straight read, and what I'd tighten in the proposal:

1. **"Three weeks from *what*?"** — The proposal already says **"~3 weeks from signature"** (Part B,
   Timeline) for public-data mode, and **"+ the time to sign the DPA"** for real-data mode. The gap:
   Part A just says "in ~3 weeks" with no anchor, and neither place handles **client-side delay** (slow
   data, slow access, slow sign-off). **Fix:** make the clock start on the *later of* signature /
   receipt of inputs, and add a "client delays extend the timeline day-for-day" line.

2. **"Does it speak about once the data is collected?"** — Not explicitly, and it should. Right now the
   real-data timeline only adds "DPA signing time," not "data-receipt." **Fix:** state that in
   real-data mode the delivery clock starts on receipt of complete data + executed DPA, not on signature
   of the engagement.

3. **"What if I don't deliver in three weeks — penalty? How adjudicated?"** — The proposal is currently
   **silent** on late delivery (it has a liability cap, but no late-delivery clause). For a solo,
   fixed-fee sprint this silence is *acceptable but exploitable* — better to make it explicit in your
   favour. **What's normal / what you want:** for an engagement this size you want **no penalty / no
   liquidated damages**; the timeline is a good-faith *target*; the sole remedy for delay is delivery;
   and the client's own protection is the 50%-on-delivery holdback + the fee-capped liability. Never
   accept a penalty or service-credit regime on a fixed-fee analytical deliverable — it's
   disproportionate to the fee and the value at stake (a DKK band) is advisory, not operational.

4. **"What outcomes do I really want?"** — Three: (a) get paid for *defined work*, not for hours or for
   hitting a date; (b) never be on the hook for a client-caused delay; (c) always have a deliverable you
   *can* produce (the public-data fallback guarantees this). The recommended clause set below delivers
   all three.

**Recommended clause additions for `docs/pilot-proposal.md` (Part B)** — for your advokat to bless:
> - **Timeline:** "Target delivery ~3 weeks from the *later of* (i) signature and 50% payment, and (ii)
>   receipt of all inputs needed for the chosen mode (public-data: none; real-data: complete data + an
>   executed DPA). A good-faith target, not a fixed deadline."
> - **Client dependencies:** "The timeline extends day-for-day for any delay in STG providing data,
>   access or sign-off. If real-data inputs are not available within [10 business days] of signature,
>   the engagement proceeds in public-data mode unless the parties agree otherwise."
> - **Delay remedy:** "If delivery is delayed for reasons within the Supplier's control, the Customer's
>   sole remedy is delivery of the deliverable; no penalty or liquidated damages apply. The 50%
>   delivery payment is due only on delivery."
> - **Definition of 'delivered':** "Delivery = the hosted private instance is live, the 1-page PDF
>   export is provided, and the 90-minute working session is offered." (So 'done' isn't a judgement call.)

*I can apply these edits to `docs/pilot-proposal.md` on your say-so — flagged, not auto-applied, since
it's the send-ready client doc.*

---

## Appendix — one-line tech cheat-sheet (for the CTO conversation)

| Topic | The fact |
|---|---|
| **Framework** | Next.js 16.2.5 (App Router), React 19.2.4, TypeScript 5 |
| **UI** | Tailwind 4 + shadcn/ui (radix-nova); D3 7 + TopoJSON world map |
| **AI** | Anthropic Claude `claude-sonnet-4-6`, server-side only, never client |
| **AI safety** | Band is deterministic (not AI); citation rail value-matches every AI figure; abstains otherwise; pre-reviewed golden fallback |
| **Hosting** | Vercel (app); Supabase Postgres eu-west-3 / Paris (one table, careers snapshots) |
| **Data residency** | EU. **No STG data stored** — public job-posting counts only |
| **Secrets** | API key + service key server-side only; nothing in `NEXT_PUBLIC_` |
| **Access control** | Env-driven password gate; httpOnly SHA-256-of-password cookie; not SSO (by design, for a demo) |
| **DB security** | Public-read RLS + service-role writes; reads via anon key |
| **Live feeds** | 5 (ECB FX, careers, Open-Meteo, NOAA ENSO, FRED Brent) — each with a committed cached fallback labelled "cached" |
| **Resilience** | Bundled JSON (can't fail at runtime); bounded AI (9s/15s) → golden; error boundaries; cached feed + careers-badge fallbacks |
| **Offline artifact** | `/onepager` PDF export — the genuinely network-independent deliverable |
| **DR** | Reproducible from git; Vercel redeploy in minutes; DB re-derivable via `scripts/pull-jobs.ts` + Supabase backups |
| **Build gates** | `tsc --noEmit` + `next build` before ship; manual smoke-test (no automated suite yet — by design) |
| **Lock-in** | Source-code escrow on insolvency/cessation; single-tenant, repo never shipped |
| **Production path** | DPA (art. 28), EU hosting, compute-and-return (raw data firewalled), SSO, monitoring, automated tests |

---

*Maintained alongside the app. If a feature changes, update this sheet — it's only authoritative if it
stays true to the code. Last verified against the build: 2026-06-21.*
