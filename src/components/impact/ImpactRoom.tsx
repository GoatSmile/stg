"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScenarioControls } from "./ScenarioControls";
import { CitationChip } from "./CitationChip";
import { Abstain } from "./Abstain";
import { computeImpact, spreadTriple } from "@/lib/impact-model";
import { type Scenario } from "@/lib/impact-data";
import { dkkM, pct } from "@/lib/format";

function dkkRange(a: number, b: number): string {
  const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
  if (Math.abs(hi) < 1000) return `DKK ${Math.round(lo)}–${Math.round(hi)}m`;
  return `${dkkM(lo)} – ${dkkM(hi)}`;
}

export function ImpactRoom({ scenario }: { scenario: Scenario }) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(scenario.assumptions.map((a) => [a.key, a.default])),
  );

  const ptCfg = scenario.assumptions.find((a) => a.key === "passThrough")!;
  const elCfg = scenario.assumptions.find((a) => a.key === "elasticity")!;

  const result = useMemo(() => {
    const exposedShare = values.exposedShare ?? 0;
    const exposedBase = scenario.exposedBaseDkkM * exposedShare;
    return computeImpact({
      exposedBase,
      priceIncreasePct: values.priceIncreasePct ?? 0,
      contributionMargin: values.contributionMargin ?? 0,
      passThrough: spreadTriple(values.passThrough ?? 0, ptCfg.spread ?? 0.15, ptCfg.min, ptCfg.max),
      elasticity: spreadTriple(values.elasticity ?? 0, elCfg.spread ?? 0.2, elCfg.min, elCfg.max),
    });
  }, [values, scenario, ptCfg, elCfg]);

  const exposedBase = scenario.exposedBaseDkkM * (values.exposedShare ?? 0);
  const denom = Math.max(result.atRiskWorst, 1);
  const bestPct = (result.atRiskBest / denom) * 100;
  const basePct = (result.atRiskBase / denom) * 100;
  const proposed = /propos/i.test(scenario.status);

  return (
    <div className="flex flex-col gap-5">
      {/* scenario header — status is shown, never dressed up as enacted */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium">{scenario.title}</h2>
          <span
            className={
              proposed
                ? "rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                : "rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
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
              {dkkRange(result.atRiskBest, result.atRiskWorst)}
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground tabular-nums">
              base case ≈ {dkkM(result.atRiskBase)} / year
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
          <span>{dkkM(result.atRiskBest)} (best)</span>
          <span>{dkkM(result.atRiskWorst)} (worst)</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Band = the full range of outcomes across the elasticity × pass-through grid, so it always
          brackets the base case. Internal scenario prep — not investor-facing (EU MAR).
        </p>
      </Card>

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
            <div className="flex items-center justify-between gap-2 text-[13px]">
              <span className="text-muted-foreground">EU cigar/pipe base</span>
              <span className="flex items-center gap-2 tabular-nums">
                {dkkM(scenario.exposedBaseDkkM)}
                <CitationChip
                  sourceRef={scenario.exposedBaseSourceRef}
                  derived={scenario.exposedBaseDerived}
                />
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">× exposed share {pct(values.exposedShare ?? 0)}</span>
              <span className="tabular-nums">= {dkkM(exposedBase)} exposed</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Volume lost (after elasticity)</span>
              <span className="tabular-nums">{dkkM(result.walk.volumeLossDkk)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">— margin lost on that volume</span>
              <span className="tabular-nums">{dkkM(result.walk.marginLossOnVol)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">— excise STG absorbs (not passed on)</span>
              <span className="tabular-nums">{dkkM(result.walk.absorbedExcise)}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between border-t border-border pt-1.5 text-[13px] font-medium">
              <span>= EBITDA at risk (base)</span>
              <span className="tabular-nums">{dkkM(result.atRiskBase)} / yr</span>
            </div>
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
