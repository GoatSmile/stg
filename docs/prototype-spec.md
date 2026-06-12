# Broen — prototype spec (v0, pre-build)

*Status: proposed, awaiting owner green-light on concept and scope. Working
title "Broen" (The Bridge). The why lives in [ideas.md](ideas.md) §4.*

## One-liner

A demo app that makes STG's missing story tangible: **OneProcess built the
foundation → here is how work gets redesigned with AI → here is the first
digital colleague — and HR orchestrates all of it.**

## Audience and demo context

Primary: Anne-Marie Tørnes-Hansen (Head of Global People Data and Digital
Solutions, STG), 25–30 min meeting, presenter-driven, her hands on the
keyboard for Act 2. Secondary: CHRO / CTO in a follow-up. Must also survive
being clicked through unattended (she *will* forward the link).

## The four surfaces

### Act 1 — Foundation radar (`/radar`)
Interactive map of the four OneProcess value streams (Record-to-Report,
Source-to-Pay, Order-to-Cash, Plan-to-Deliver). Each stream expands into
4–6 AI use-case cards scored on **data readiness** (what S/4 consolidation
now makes possible) and **value potential**, each naming its OneProcess
prerequisite ("single master data", "real-time postings"…). Each card also
carries a **"SAP Joule today / custom bridge" badge** — whether SAP's GA
agent portfolio already covers it or a custom layer wins (sourced from
research-brief.md §5; demonstrates Joule fluency without vendor-bashing).
Static seeded content, hand-written, credible. No live AI required.

### Act 2 — Work redesign studio (`/studio`) ⭐ centerpiece
- Pick a seeded STG-flavored role (financial controller, customer service
  rep, demand planner, regulatory affairs specialist…) **or paste any job
  description**.
- Live Claude call decomposes the role into 10–15 tasks; each task classified
  **automate / augment / human-core** with one-line reasoning and a confidence
  hint. Streaming UI — the audience watches it think.
- Output: redesigned role card (time reallocation donut, "freed hours →
  redirected to" list), skills delta (drop / keep / grow), and a reskilling
  path framed as STG Academy modules.
- **Org view** (`/studio/org`): AI-impact heatmap across the synthetic org
  (~120 employees, dept × impact-type), drill-down to person-level role cards.
  Pre-computed from the same pipeline, cached as JSON.

### Act 3 — The digital colleague (`/colleague`)
Employee file for `00-AI-001 "Astrid"` rendered in a PeopleHub-style profile:
job description, manager, objectives, probation status, performance review
with KPIs. One **live task demo**: a chat panel where Astrid answers an HR
policy question (RAG over ~10 synthetic policy docs, with citations) or
drafts role-specific change comms. The provocation: *if agents are workers,
HR governs them.*

### Teaser — Regulatory pulse (`/pulse`)
Europe map, per-market pouch status (data from research-brief.md §2, kept
honest and dated), one market click-through (France) showing the workforce-
impact overlay on the synthetic org. Visibly marked "concept preview" —
it's the phase-2 hook, not a finished feature.

Landing page (`/`) frames the narrative arc and links the acts in order.

## Stack

Per CLAUDE.md: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui,
Vercel. **No database in v0** — all synthetic data is versioned JSON in
`/src/data/`. Claude API via a single server route (`/api/ai/*`),
`ANTHROPIC_API_KEY` server-side only. Add Supabase only if/when a surface
needs persistence (e.g. Experiment Hub later).

## Demo-grade engineering rules

- **Live AI, honest AI.** Act 2 calls Claude for real. Every live call has a
  cached "golden" response (`/src/data/golden/`) used when `DEMO_MODE=offline`
  — conference wifi is not a dependency. Never present cached as live.
- **Synthetic people only.** Fictional names, no real STG employee data, no
  scraped personal data. Real public figures (executives) appear only in
  `/docs`, never in the app UI.
- **The demo script is a deliverable** (`docs/demo-script.md`, written during
  the build): per-act talking points, the her-hands-on-keyboard moment, the
  meta-message close, recovery lines for failures.
- **Unattended-proof:** every page reads correctly without narration; empty
  states explain themselves; the landing page tells the arc.

## Build plan (vibe-coding phases, each independently demoable)

| Phase | Scope | Est. |
|---|---|---|
| 0 | Scaffold: Next.js + shadcn (radix-nova), layout shell, landing page, synthetic-org generator (~120 employees, deterministic seed) | ~half day |
| 1 | Act 2 studio: role picker + JD paste → Claude decomposition (streaming) → role card + skills delta. Golden-response fallback | ~1–1.5 days |
| 2 | Act 2 org heatmap (pre-computed JSON) + drill-down | ~half day |
| 3 | Act 1 radar (seeded content, nice viz) | ~half day |
| 4 | Act 3 colleague: profile + policy-RAG chat over synthetic docs | ~1 day |
| 5 | Pulse teaser map + France click-through | ~half day |
| 6 | Polish pass: landing narrative, demo script, offline mode rehearsal, Vercel deploy behind SSO | ~half day |

Order of value: a meeting can be booked after Phase 1 — everything else
deepens the story.

## Open decisions (owner)

1. Green-light Broen as the flagship vs. a different Tier-1 pick from
   ideas.md §3.
2. App language: English-only v0 (recommended — STG corporate language) vs.
   da/en toggle (Act 3 comms demo could showcase bilingual generation
   cheaply).
3. Branding: neutral "Broen" branding (recommended) vs. STG-colored skin —
   using STG's visual identity uninvited can charm or backfire; decide
   per-audience.
4. Anthropic API key: which account/billing to use for the live calls.
