"use client";

import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { CitationChip } from "./CitationChip";
import { type Assumption } from "@/lib/impact-data";
import { pct } from "@/lib/format";

function kindChip(kind: Assumption["kind"]) {
  if (kind === "no-consensus") {
    return (
      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
        no public consensus
      </span>
    );
  }
  return (
    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
      {kind === "scenario" ? "scenario" : "assumption"}
    </span>
  );
}

function fmtValue(a: Assumption, v: number) {
  return a.unit === "pct" ? pct(v) : v.toFixed(2);
}

export function ScenarioControls({
  assumptions,
  values,
  onChange,
  onReset,
}: {
  assumptions: Assumption[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Assumptions — you co-own the model</h3>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" aria-hidden="true" /> reset
        </button>
      </div>

      {assumptions.map((a) => {
        const v = values[a.key] ?? a.default;
        return (
          <div key={a.key} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <label className="text-[13px] font-medium">{a.label}</label>
              {kindChip(a.kind)}
              {a.sourceRef && <CitationChip sourceRef={a.sourceRef} />}
              <span className="ml-auto text-sm font-medium tabular-nums">{fmtValue(a, v)}</span>
            </div>
            <Slider
              value={[v]}
              min={a.min}
              max={a.max}
              step={a.step}
              onValueChange={([n]) => onChange(a.key, n)}
              aria-label={a.label}
            />
            <p className="text-[11px] leading-snug text-muted-foreground">{a.note}</p>
          </div>
        );
      })}
    </div>
  );
}
