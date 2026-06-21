# Careers scraper — productionization decision memo

**Status: RESOLVED — owner decided 2026-06-14.** What the owner authorised, and what shipped:

> **Current state (read this first).** Roles are **DB-only**, served live via
> `/api/feeds/careers?roles=1`; the scraper is the single script **`scripts/pull-jobs.ts`** — the old
> `crawl-careers.ts` + `enrich-roles.ts` are **retired** (the investigation below still names them in
> the present tense; treat that as history). Roles bucket three ways — strategic site / **`us-retail`** /
> **`eu-other`** — and the count is live/daily (**68 on 2026-06-16: 30 strategic · 33 us-retail ·
> 5 eu-other**; it shifts as postings open/close). Per-site open-COUNTS now also have a **cached
> fallback** (`careers.json` `sites[]` + an `unmapped` block) so the map degrades to a labelled "cached"
> count instead of zero when the DB is down (gap-#5, 2026-06-21).

- **A one-time, real pull was authorised** ("get real complete data once… use the JSON
  API if necessary"). Done: a manual POST-paginate of `/services/recruiting/v1/jobs`
  (the robots-disallowed RMK API) pulled the full live job set on 2026-06-14. This
  resolves decision 2 (real `datePosted` per role → honest days-open) and decision 3
  (count everything, break out strategic sites, bucket the rest).
- **No automated scraping of the disallowed path** (decision 1): "we will not do scraping
  if it's disallowed later — we'll automate it some other way." So `crawl-careers.ts` is
  **manual-only**; it must NOT be wired to a cron/Action against `/services/`. A future
  refresh, if wanted, uses a robots-allowed source or an arrangement with STG.

**Update 2026-06-15 — the "some other way" is `/jobs.xml`.** Beyond the sitemap (found
below, but it lacks dates + descriptions), STG also publishes **`/jobs.xml`** — its
Google-Jobs/Indeed RSS syndication feed. `robots.txt` does **not** disallow it (only
`/services/`, `/apply*`, `/talentcommunity` etc.), and it carries the **full job
description**, canonical apply link, location and a stable `g:id` per posting — i.e. the
one thing the sitemap and the disallowed search API each couldn't give cleanly. So:
`scripts/enrich-roles.ts` reads `/jobs.xml` to attach real descriptions + apply links to
the HR-lens roles (the role-click popup), and **because the feed is robots-allowed it is a
legitimate candidate to automate** (unlike the `/services/` search pull). Counts +
department + days-open still come from the manual `/services/` pull (the feed lacks job
family + a start date).

**Update 2026-06-15 (later) — roles are now DB-only; the two scripts are one.** Per owner
("DB is the only source of truth and the only spot to store this data — nowhere else;
everything live from the DB"): the per-role data (title, family, days-open, full
description, apply URL) now lives **only** in `varsel_careers_snapshots.roles` and the app
reads it **live** at `/api/feeds/careers?roles=1` (live-only — empty if the DB is down,
never a JSON copy). `hr.json` no longer carries any `roles[]` / per-site counts; the map
derives each site's open-count from the live roles. `crawl-careers.ts` + `enrich-roles.ts`
are **retired**, collapsed into **`scripts/pull-jobs.ts`**: `jobs.xml` (robots-allowed) is
the spine + the automatable refresh; the `--services` department/days-open enrichment stays
the **manual, owner-authorised** pass (the policy below is unchanged — never cron
`/services/`). A jobs.xml-only auto-refresh would need to preserve existing dept/days for
unchanged gids rather than wipe them. Current snapshot (2026-06-15): **71 real roles — 32
strategic / 39 US retail-bars**, all 71 with descriptions in the DB, 70 with department.
*(Superseded — now 3-way bucketed; see the current-state banner at the top: 68 on 2026-06-16,
30 / 33 / 5.)*

**Shipped from this pull:** 60 real vacancies (3 evergreen "talent pool" posts excluded;
a >365-day standing req excluded from "oldest vacancy") — 29 at strategic sites, 31 US
retail/bars. `src/data/feeds/careers.json` + the Supabase row + the HR lens markers/KPIs
were rewritten to the real numbers (the illustrative "49" seed is gone), and
`crawl-careers.ts` now parses the real RMK payload. The original investigation is kept
below for the record.

---

Documented 2026-06-14. Owner call was required per CLAUDE.md escalation (touches STG
data/collection + how the pitch lands).

**TL;DR:** The careers feed *reads* fine off its seeded snapshot, but the *daily
scraper* (`scripts/crawl-careers.ts`) is not production-wired. A live probe of
`careers.st-group.com` found the clean data API is robots-disallowed, the
robots-allowed path (the sitemap) lacks posting dates, and the live job mix matches
neither our 12-site model nor the seeded "49 open roles."

## Background

- `scripts/crawl-careers.ts` is meant to run daily: scrape STG's public SuccessFactors
  careers listings, aggregate open roles per site, and write one dated snapshot to
  Supabase (`varsel_careers_snapshots`). Diffing snapshots over time yields days-open /
  hiring velocity — the HR lens needs ≥2 crawls before it can show a trend.
- It was authored in a sandbox with no network access, so its endpoint + parser were
  guesses (flagged in the file header).
- The Supabase **write path is verified** (manual curl insert/delete with the rotated
  `sb_secret_…`, 2026-06-14). The feed's **read** side works live. Only the **scrape
  source + scheduling** are unresolved.

## Live-site findings (probed 2026-06-14; sitemap dated 2026-06-13)

Platform: SAP SuccessFactors Career Site Builder (jobs2web / RMK).

1. **The clean JSON API is robots-disallowed.** Job data loads via an AJAX call under
   `/services/`, and `robots.txt` disallows `/services/`. The current `JOBS_URL` default
   (`/api/jobs`) is dead (302). `/search/` is a client-rendered SPA with no job data in
   the HTML (only facet config); `/search/json` returns the SPA shell, not JSON.
   → A daily automated hit on `/services/` would breach robots **on the company we're
   pitching** — a poor fit for a demo whose selling point is "honest/credible."

2. **Robots-allowed path: `/sitemap.xml`.** Returns 200 — a direct `urlset` of **75
   `/job/…` URLs** (today). Sitemaps are crawler-intended, so this is the legitimate
   enumeration source. `robots.txt` has no `Sitemap:`/`Allow:` lines; `/job/` pages are
   not disallowed.

3. **Sitemap limits:**
   - **No posting dates** — all 75 `<lastmod>` = `2026-06-13` (the sitemap's regen date,
     not per-job). "Oldest vacancy / days-open" can't come from the sitemap; it needs each
     job page's SEO JSON-LD (`datePosted`) → ~75 extra GETs per crawl.
   - **Location comes from the URL slug** (e.g. `Tampa-…-FL-33619`) — workable but coarse.

4. **Coverage gap: only 30 of 75 roles map to our 12 sites.** The other 45 are unmapped,
   dominated by **US retail / bar associates** (Tampa FL; Jacksonville FL; Katy, Conroe,
   San Antonio, The Colony, Ft Worth TX; Bridgeville PA), plus DR **San Pedro de Macoris**
   SAP/ERP roles (our `fac-dr` match `["santiago","dominican"]` misses them) and
   **Holstebro DK**.
   Mapped breakdown (30): Lisbon/Carnaxide 8 · Bethlehem 7 · Madrid 4 · Richmond 3 ·
   Copenhagen 2 · Sri Lanka 2 · Dominican Rep 2 · Bremen 1 · Belgium 1. (Nicaragua /
   Indonesia / Honduras: 0 in the sitemap today.)

5. **Honesty flag.** The HR-lens seed shows **49 open roles**; the live sitemap shows
   **75 total / 30 at our sites** (seed per-site numbers sum to ~37). These don't
   reconcile — the seeded "49" looks **illustrative, not a real crawl**, even though
   CLAUDE.md currently calls it "seeded real 2026-06-13 data." Correct either the number
   or the claim when the real scrape lands.

## Decisions needed

**1. Automate daily scraping of STG at all?**
Robots-compliant via the sitemap, but still automated collection from the pitch target.
- *Recommend:* **yes, but gentle** (sitemap once/day, optionally job pages). Alternative:
  keep it a manual, occasional run you trigger by hand.

**2. Days-open KPI.**
The sitemap has no posting dates. Either **fetch each job page** (~75 light GETs/crawl)
for real `datePosted`, or **drop days-open** and show live counts only.
- *Recommend:* **fetch the pages** — modest load, keeps "oldest vacancy" honest.

**3. Honest totals / site model.**
Live data is 75 roles, heavily US retail, across locations we don't map.
- (a) Expand the site model to the real footprint;
- (b) **count all 75, break out the strategic sites, bucket the rest as "other (incl. US
  retail)"**;
- (c) scope the feed to "strategic production/office sites" and label it.
- *Recommend:* **(b)** — real total, honest framing, no pretense that retail associates
  are the strategy.

## Recommended bundle (build once approved)

Sitemap source (robots-safe) + per-job `datePosted` (decision 2) + totals option (b) +
a daily GitHub Action (service-role secret stored as an Actions secret). Plus
unconditional robustness regardless of 1–3: request timeout, one retry, descriptive
`User-Agent`, fail-loud, and a same-day **idempotent upsert** (needs a unique index on
`as_of`, or check-then-insert). Also correct the seed number + the CLAUDE.md "seeded
real data" wording to match the real crawl.

## Will NOT be done without explicit sign-off

Pointing any automated / daily job at the robots-disallowed `/services/` API.
