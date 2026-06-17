"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Lock, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScenarioControls } from "./ScenarioControls";
import { AiRead } from "./AiRead";
import { CitationChip } from "./CitationChip";
import { Abstain } from "./Abstain";
import { computeImpact, computeRestrictionImpact, spreadTriple } from "@/lib/impact-model";
import { type Scenario } from "@/lib/impact-data";
import { dkkM, pct } from "@/lib/format";

function dkkRange(a: number, b: number): string {
  const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
  if (Math.abs(hi) < 1000) return `DKK ${Math.round(lo)}–${Math.round(hi)}m`;
  return `${dkkM(lo)} – ${dkkM(hi)}`;
}

/** A row in the transparent "how the base case is built" walk. */
type WalkRow = { label: string; value: string; chip?: React.ReactNode; strong?: boolean };

export function ImpactRoom({ scenario }: { scenario: Scenario }) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(scenario.assumptions.map((a) => [a.key, a.default])),
  );

  const isRestriction = scenario.mechanism === "restriction";

  const view = useMemo(() => {
    const cfg = (key: string) => scenario.assumptions.find((a) => a.key === key);

    if (isRestriction) {
      const rcCfg = cfg("recapture")!;
      const cmCfg = cfg("contributionMargin")!;
      const marketShare = values.marketShare ?? 0;
      const affectedShare = values.affectedShare ?? 0;
      const marketBase = scenario.exposedBaseDkkM * marketShare;
      const r = computeRestrictionImpact({
        marketBase,
        affectedShare,
        recapture: spreadTriple(values.recapture ?? 0, rcCfg.spread ?? 0.15, rcCfg.min, rcCfg.max),
        contributionMargin: spreadTriple(
          values.contributionMargin ?? 0,
          cmCfg.spread ?? 0.1,
          cmCfg.min,
          cmCfg.max,
        ),
      });
      const market = scenario.marketLabel ?? "this market";
      const walk: WalkRow[] = [
        {
          label: "STG pouch base — NGP net sales",
          value: dkkM(scenario.exposedBaseDkkM),
          chip: (
            <CitationChip
              sourceRef={scenario.exposedBaseSourceRef}
              derived={scenario.exposedBaseDerived}
            />
          ),
        },
        { label: `× ${market} share ${pct(marketShare)}`, value: `= ${dkkM(marketBase)} ${market} base` },
        { label: `× affected share ${pct(affectedShare)}`, value: `= ${dkkM(r.walk.affectedRevenue)} affected` },
        { label: `− recaptured via compliant SKUs ${pct(values.recapture ?? 0)}`, value: dkkM(r.walk.retainedRevenue) },
        { label: "= lost (foreclosed) revenue", value: dkkM(r.walk.lostRevenue) },
        { label: `× contribution margin ${pct(values.contributionMargin ?? 0)}`, value: dkkM(r.walk.ebitdaAtRisk) },
        { label: "= EBITDA at risk (base)", value: `${dkkM(r.atRiskBase)} / yr`, strong: true },
      ];
      const ambition = scenario.ambitionDkkM ?? 0;
      return {
        band: { best: r.atRiskBest, base: r.atRiskBase, worst: r.atRiskWorst },
        walk,
        bandDrivers: "recapture × contribution-margin grid",
        anchor: ambition
          ? {
              lostRevenue: r.lostRevenueBase,
              shareOfAmbition: r.lostRevenueBase / ambition,
              ambitionDkkM: ambition,
              ambitionSourceRef: scenario.ambitionSourceRef ?? "",
            }
          : null,
      };
    }

    // excise (EU-ETD)
    const ptCfg = cfg("passThrough")!;
    const elCfg = cfg("elasticity")!;
    const exposedShare = values.exposedShare ?? 0;
    const exposedBase = scenario.exposedBaseDkkM * exposedShare;
    const r = computeImpact({
      exposedBase,
      priceIncreasePct: values.priceIncreasePct ?? 0,
      contributionMargin: values.contributionMargin ?? 0,
      passThrough: spreadTriple(values.passThrough ?? 0, ptCfg.spread ?? 0.15, ptCfg.min, ptCfg.max),
      elasticity: spreadTriple(values.elasticity ?? 0, elCfg.spread ?? 0.2, elCfg.min, elCfg.max),
    });
    const walk: WalkRow[] = [
      {
        label: "EU cigar/pipe base",
        value: dkkM(scenario.exposedBaseDkkM),
        chip: (
          <CitationChip sourceRef={scenario.exposedBaseSourceRef} derived={scenario.exposedBaseDerived} />
        ),
      },
      { label: `× exposed share ${pct(exposedShare)}`, value: `= ${dkkM(exposedBase)} exposed` },
      { label: "Volume lost (after elasticity)", value: dkkM(r.walk.volumeLossDkk) },
      { label: "— margin lost on that volume", value: dkkM(r.walk.marginLossOnVol) },
      { label: "— excise STG absorbs (not passed on)", value: dkkM(r.walk.absorbedExcise) },
      { label: "= EBITDA at risk (base)", value: `${dkkM(r.atRiskBase)} / yr`, strong: true },
    ];
    return {
      band: { best: r.atRiskBest, base: r.atRiskBase, worst: r.atRiskWorst },
      walk,
      bandDrivers: "elasticity × pass-through grid",
      anchor: null as null | {
        lostRevenue: number;
        shareOfAmbition: number;
        ambitionDkkM: number;
        ambitionSourceRef: string;
      },
    };
  }, [values, scenario, isRestriction]);

  const denom = Math.max(view.band.worst, 1);
  const bestPct = (view.band.best / denom) * 100;
  const basePct = (view.band.base / denom) * 100;
  const proposed = /propos/i.test(scenario.status);

  return (
    <div className="flex flex-col gap-5">
      {/* scenario header — status is shown verbatim, never dressed up or down */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-xl font-medium tracking-tight">{scenario.title}</h2>
          <span
            className={
              proposed
                ? "rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                : "rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            }
          >
            {scenario.status}
          </span>
          <CitationChip sourceRef={scenario.instrument} url={scenario.sourceUrl} />
        </div>
        <p className="text-sm text-muted-foreground">{scenario.summary}</p>
        <p className="text-xs text-muted-foreground">Applies: {scenario.appliesFrom}</p>
      </div>

      {/* the headline band + the eye-level illustrative tag */}
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Annual EBITDA at risk
            </div>
            <div className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
              {dkkRange(view.band.best, view.band.worst)}
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground tabular-nums">
              base case ≈ {dkkM(view.band.base)} / year
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            illustrative — public-data model, not STG&apos;s own figure
          </span>
        </div>

        {/* band bar: best → worst, with the base marker */}
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
          <span>{dkkM(view.band.best)} (best)</span>
          <span>{dkkM(view.band.worst)} (worst)</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Band = the full range of outcomes across the {view.bandDrivers}, so it always brackets the
          base case. Internal scenario prep — not investor-facing (EU MAR).
        </p>
      </Card>

      {/* growth-at-risk anchor (restriction scenarios): the small P&L hit is not the point —
          the foreclosed share of the stated pouch ambition is. */}
      {view.anchor && (
        <Card className="flex flex-col gap-1.5 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
            <TrendingDown className="size-3.5" aria-hidden="true" />
            The growth at risk, not just the P&amp;L
          </div>
          <p className="text-sm leading-relaxed">
            The current-year hit is modest because pouches are ~5% of group — but this forecloses{" "}
            <span className="font-semibold tabular-nums">{dkkM(view.anchor.lostRevenue)}/yr</span>{" "}
            of pouch revenue, ≈{" "}
            <span className="font-semibold tabular-nums">{pct(view.anchor.shareOfAmbition)}</span>{" "}
            of STG&apos;s stated{" "}
            <span className="inline-flex items-center gap-1">
              DKK 1bn+ pouch ambition
              <CitationChip sourceRef={view.anchor.ambitionSourceRef} />
            </span>
            {scenario.eventId === "fr-ban"
              ? " — and with no compliant product in France, that revenue is gone, not deferred."
              : " — the growth leg the Focus2030 story leans on."}
          </p>
          <p className="text-[11px] text-muted-foreground">
            The foreclosed figure follows from the editable {`${scenario.marketLabel} share`}{" "}
            assumption — illustrative, not STG&apos;s own number — and is shown against the stated
            future ambition as a sense of scale, not a precise contribution.
          </p>
        </Card>
      )}

      <AiRead eventId={scenario.eventId} assumptions={values} />

      <div className="grid gap-6 md:grid-cols-2">
        <ScenarioControls
          assumptions={scenario.assumptions}
          values={values}
          onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
          onReset={() =>
            setValues(Object.fromEntries(scenario.assumptions.map((a) => [a.key, a.default])))
          }
        />

        <div className="flex flex-col gap-4">
          {/* the contribution-margin walk — the math, in the open */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium">How the base case is built</h3>
            {view.walk.map((row, i) => (
              <div
                key={i}
                className={
                  row.strong
                    ? "mt-0.5 flex items-center justify-between border-t border-border pt-1.5 text-[13px] font-medium"
                    : "flex items-center justify-between gap-2 text-[13px]"
                }
              >
                <span className={row.strong ? undefined : "text-muted-foreground"}>{row.label}</span>
                <span className="flex items-center gap-2 tabular-nums">
                  {row.value}
                  {row.chip}
                </span>
              </div>
            ))}
          </div>

          {/* citation rail */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium">Sourced from public data</h3>
            {scenario.facts.map((f) => (
              <div key={f.claim} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="text-muted-foreground">{f.claim}</span>
                <span className="flex items-center gap-2 tabular-nums">
                  {f.value}
                  <CitationChip sourceRef={f.sourceRef} />
                </span>
              </div>
            ))}
          </div>

          {/* abstention rail */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Where the source is silent</h3>
            {scenario.abstain.map((a) => (
              <Abstain key={a.claim} claim={a.claim} reason={a.reason} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-[13px] text-muted-foreground">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          This models the <em>shape</em> of impact on STG&apos;s published segments. Plug in STG&apos;s
          real volumes and price ladders (behind a data agreement) and the same model returns
          finance-grade, SKU-level precision — the paid step, not a v1 claim.
        </span>
      </div>
    </div>
  );
}
