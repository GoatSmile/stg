# STG / Broen

Pitch prototype targeting Scandinavian Tobacco Group (STG) — built by
Jensen Production / talent.dk as a consulting calling card. The buyer is
STG's Head of Global People Data and Digital Solutions; the product is a
working demo of the bridge between STG's OneProcess (SAP S/4HANA) foundation
and AI-driven work redesign. **This is a demo, not a production system** —
every engineering decision below follows from that.

Read first: `docs/ideas.md` (the strategy + full ideation),
`docs/prototype-spec.md` (what we're building), `docs/research-brief.md`
(sourced facts about STG, regulation, the buyer — cite from here, don't
re-research).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- shadcn style is `radix-nova` (same as jensen-fms — do NOT re-init with
  newer CLI defaults; `base-nova` won't compose with `asChild` patterns)
- Deploy: Vercel, push-to-`main` → prod, gated behind Vercel SSO until we
  deliberately share a link
- **No database in v0.** Synthetic data is versioned JSON in `/src/data/`.
  Add Supabase (EU region) only when a feature genuinely needs persistence —
  and ask first, since it adds a moving part to the demo.
- Claude API server-side only (`/api/ai/*` routes, `ANTHROPIC_API_KEY` in
  `.env.local` — never `NEXT_PUBLIC_`). Default model: latest Sonnet-class
  for live demo latency; check `/model` pricing before switching.

## Demo-first engineering principles — do not silently change these

- **Live AI, honest AI.** Demo moments call Claude for real. Every live call
  ships with a cached golden response in `/src/data/golden/`, served when
  `DEMO_MODE=offline` (set in `.env.local`). The toggle exists because
  conference/client wifi is not a dependency we accept. Never present a
  cached response as live — the presenter says "offline mode" out loud.
- **Synthetic people only.** All employee data is generated, deterministic
  (seeded — same fake org every build), and obviously fictional on close
  inspection. Real people's names (STG executives, the buyer) may appear in
  `/docs` for strategy context but NEVER in app UI, code, or seed data.
- **No real STG data, ever**, until a signed agreement exists. If the client
  hands us data mid-conversation, it goes in a separate private repo, not here.
- **Every page must survive unattended viewing.** The buyer will forward the
  link. No lorem ipsum, no dead buttons, no console errors on the happy path.
  A half-built feature is hidden behind a flag, not shipped half-built.
- **Wow over rigor, but never fake.** Skipping auth, skipping tests, hardcoding
  a scenario: fine, note it in "Demo shortcuts" below. Faking an AI capability
  we can't actually deliver: never — this demo's credibility IS the pitch.
- **Regulatory facts stay dated and sourced.** The `/pulse` surface shows
  legal claims (bans, caps). Each datum carries an "as of" date and maps to a
  source in `docs/research-brief.md`. Stale-but-dated beats fresh-but-wrong.

## Conventions (inherited from jensen-fms, still binding here)

- **Git: commit on `main`, push to `origin` every time.** No PRs, no feature
  branches. Solo-dev shop; speed beats process.
- Plan-then-build: before writing code, list files you intend to create/modify
  and wait for confirmation.
- Server-render initial page; client components only for interactive state.
- shadcn/ui components by default; custom only when shadcn lacks it.
- Sentence case in UI text — never Title Case. ALL-CAPS eyebrow micro-labels
  via CSS (`uppercase tracking-wide text-xs`) are the accepted exception;
  keep the underlying string sentence case.
- Time estimates quoted as `~X human-dev-min (Y min wait)`.
- UI language: English (STG corporate language). da/en generation may appear
  as a *demoed capability* (change-comms translator), not as app chrome.
- `tsc --noEmit` + `next build` before declaring a phase done, then smoke-test
  new routes in the browser/Preview — builds pass on RSC boundary violations
  that only explode at runtime (lesson inherited from jensen-fms fa1dbed).

## Repo layout

- `/docs` — strategy, spec, research, demo script. The docs are deliverables
  here, same rank as code.
- `/src/data` — synthetic org, seeded content (radar use cases, policies),
  golden AI responses. Versioned, deterministic, reviewed like code.
- `/src/app` — routes per spec: `/` (narrative landing), `/radar`, `/studio`,
  `/studio/org`, `/colleague`, `/pulse`.

## Demo shortcuts (running log — add as they're taken)

*(none yet — repo is pre-build)*

## Out of scope for the demo

- Auth/RLS/multi-tenancy (Vercel SSO is the only gate)
- Real SuccessFactors/SAP integration — we mock the *shape* of PeopleHub data
  (employee, position, skills) so the "this could plug in" story is honest
- Mobile-first polish (demo runs on a laptop/projector; don't ship broken
  mobile, but don't gold-plate it)
- Automated test suite (manual smoke-test discipline instead — this is a
  demo with a shelf life, not a product. Revisit if it graduates to a pilot)

## Escalation

Strategy and scope questions (which act to cut, whether to add Supabase,
anything touching how the pitch lands) go to the owner — often decided in a
separate planning chat. Tactical implementation stays here. Anything
involving contact with STG or use of their data: owner decides, always.

## Status & handoff

- **Pre-build.** Repo contains strategy docs + this file. Next step: owner
  green-lights the Broen concept and scope (`docs/prototype-spec.md` open
  decisions), then Phase 0 scaffold.
- When phases ship, log them here (jensen-fms-style: what shipped, commit
  range, what's next) so a fresh session can pick up cold from this file +
  git history alone.
