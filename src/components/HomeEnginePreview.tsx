"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, FileDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { getScenario } from "@/lib/impact-data";
import { computeScenarioView, defaultValues } from "@/lib/impact-view";
import { dkkM, pct } from "@/lib/format";

// The worked example lives on the home page so the "argue with the model" moment happens in the
// first 15 seconds — one editable assumption, the band recomputes live, every number still cites
// its source. Same pure model as the Impact Room (computeScenarioView), so it can't drift.
const SC = getScenario("eu-etd");
const DEFAULTS = defaultValues(SC);
const EXPOSED = SC.assumptions.find((a) => a.key === "exposedShare")!;
// Fixed bar scale = the band's worst case at full exposure, so dragging visibly GROWS the band.
const REF_WORST = computeScenarioView(SC, { ...DEFAULTS, exposedShare: EXPOSED.max }).band.worst;

function fmtRange(a: number, b: number): string {
  const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
  return `DKK ${Math.round(lo)}–${Math.round(hi)}m`;
}

export function HomeEnginePreview() {
  const [exposed, setExposed] = useState(EXPOSED.default);
  const { best, base, worst } = computeScenarioView(SC, { ...DEFAULTS, exposedShare: exposed }).band;

  const denom = Math.max(REF_WORST, 1);
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const bestPct = clamp((best / denom) * 100);
  const basePct = clamp((base / denom) * 100);
  const worstPct = clamp((worst / denom) * 100);

  return (
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
            EBITDA at risk — on these assumptions
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums sm:text-4xl">{fmtRange(best, worst)}</div>
          <div className="mt-0.5 text-sm text-muted-foreground tabular-nums">
            base case ≈ {dkkM(base)} / year
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          illustrative — public-data model, not STG&apos;s own figure
        </span>
      </div>

      {/* band bar: best → worst on a fixed scale, with the base-case marker */}
      <div className="relative mt-1 h-3 w-full rounded-full bg-secondary">
        <div
          className="absolute h-3 rounded-full bg-amber-500/40"
          style={{ left: `${bestPct}%`, width: `${Math.max(0, worstPct - bestPct)}%` }}
        />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-amber-600"
          style={{ left: `${basePct}%` }}
          title="base case"
        />
      </div>

      {/* the one live assumption — argue with the model right here */}
      <div className="mt-2 flex flex-col gap-1.5 rounded-md bg-secondary/40 p-3">
        <div className="flex flex-wrap items-center gap-x-2">
          <label className="text-[13px] font-medium">Exposed share of the EU base</label>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            you set it — assumption
          </span>
          <span className="ml-auto text-sm font-medium tabular-nums">{pct(exposed)}</span>
        </div>
        <Slider
          value={[exposed]}
          min={EXPOSED.min}
          max={EXPOSED.max}
          step={EXPOSED.step}
          onValueChange={([n]) => setExposed(n)}
          aria-label="Exposed share of the EU base"
        />
        <p className="text-[11px] leading-snug text-muted-foreground">
          Drag it — the band recomputes, and every number still cites its source or abstains. STG doesn&apos;t
          publish this share, so it&apos;s yours to set. The full room has every assumption.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/impact?event=eu-etd"
          className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Open the Impact Room <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href="/onepager?event=eu-etd"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          <FileDown className="size-4" aria-hidden="true" /> forward-ready one-pager
        </Link>
      </div>
    </section>
  );
}
