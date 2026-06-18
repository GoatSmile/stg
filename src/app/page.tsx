import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { PulseDashboard } from "@/components/map/PulseDashboard";
import { RadarSignals } from "@/components/RadarSignals";
import { getScenario } from "@/lib/impact-data";
import { computeImpact, spreadTriple } from "@/lib/impact-model";
import { dkkM } from "@/lib/format";

/** Server-computed EU-ETD band at the scenario defaults — same pure model the Impact Room uses,
 *  so the home preview can never drift from the room it links to. */
function euEtdBand() {
  const s = getScenario("eu-etd");
  const d = Object.fromEntries(s.assumptions.map((a) => [a.key, a.default]));
  const pt = s.assumptions.find((a) => a.key === "passThrough");
  const el = s.assumptions.find((a) => a.key === "elasticity");
  const r = computeImpact({
    exposedBase: s.exposedBaseDkkM * (d.exposedShare ?? 0),
    priceIncreasePct: d.priceIncreasePct ?? 0,
    contributionMargin: d.contributionMargin ?? 0,
    passThrough: spreadTriple(d.passThrough ?? 0, pt?.spread ?? 0.15, pt?.min ?? 0, pt?.max ?? 1),
    elasticity: spreadTriple(d.elasticity ?? 0, el?.spread ?? 0.2, el?.min ?? -2, el?.max ?? 0),
  });
  return { best: r.atRiskBest, base: r.atRiskBase, worst: r.atRiskWorst };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lens?: string }>;
}) {
  const { lens } = await searchParams;

  const band = euEtdBand();
  const denom = Math.max(band.worst, 1);
  const bestPct = (band.best / denom) * 100;
  const basePct = (band.base / denom) * 100;
  const rangeLabel = `DKK ${Math.round(band.best)}–${Math.round(band.worst)}m`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          Where the next surprise to STG&apos;s P&amp;L comes from — sized in kroner, before it lands
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          One map of STG&apos;s whole risk surface — regulation, FX, leaf and climate, the SAP
          rollout, pouch competition, hiring — each a tracked signal on Scandinavian Tobacco
          Group&apos;s own published footprint. The regulatory threat is worked all the way down to a
          DKK EBITDA band — a model you can argue with: every number cites its source, or says so
          when it can&apos;t — the template the other surfaces plug into next. Built on public data
          only, framed strictly as internal scenario prep.
        </p>
      </div>

      {/* The engine leads — the one differentiated thing, sized and live, above the fold. */}
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <span>The worked example — a regulation, sized in kroner</span>
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
            proposed · in Council
          </span>
        </div>
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          The EU tobacco-tax revision, on STG&apos;s cigar &amp; pipe core
        </h2>

        <div className="mt-1 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Annual EBITDA at risk
            </div>
            <div className="mt-1 text-3xl font-semibold tabular-nums sm:text-4xl">{rangeLabel}</div>
            <div className="mt-0.5 text-sm text-muted-foreground tabular-nums">
              base case ≈ {dkkM(band.base)} / year
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            illustrative — public-data model, not STG&apos;s own figure
          </span>
        </div>

        {/* band bar: best → worst, with the base-case marker */}
        <div className="relative mt-1 h-3 w-full rounded-full bg-secondary">
          <div
            className="absolute h-3 rounded-full bg-amber-500/40"
            style={{ left: `${bestPct}%`, width: `${Math.max(0, 100 - bestPct)}%` }}
          />
          <div
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-amber-600"
            style={{ left: `${basePct}%` }}
            title="base case"
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>{dkkM(band.best)} (best)</span>
          <span>{dkkM(band.worst)} (worst)</span>
        </div>

        <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          The band is the full range across the elasticity × pass-through assumptions, so it always
          brackets the base. Every figure cites its source, or abstains when STG hasn&apos;t published
          it — then you move the assumptions yourself and the band moves with you.
        </p>

        <Link
          href="/impact?event=eu-etd"
          className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Open the Impact Room <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <RadarSignals />

      {/* breadth, second: the same engine extended across the rest of the risk surface */}
      <div id="map" className="flex scroll-mt-4 flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-border pt-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            The same engine, across STG&apos;s whole risk surface
          </span>
          <span className="text-[11px] text-muted-foreground">
            seven teams, one map — switch the lens
          </span>
        </div>
        <PulseDashboard key={lens ?? "default"} initialLensId={lens} />
      </div>
    </div>
  );
}
