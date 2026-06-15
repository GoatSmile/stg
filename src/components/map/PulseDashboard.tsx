"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { PulseMap } from "./PulseMap";
import { LensSwitcher } from "./LensSwitcher";
import { LiveFxStrip } from "./LiveFxStrip";
import { CareersStrip } from "./CareersStrip";
import { WeatherStrip } from "./WeatherStrip";
import { EnsoStrip } from "./EnsoStrip";
import { FreightStrip } from "./FreightStrip";
import { ProvenanceLegend } from "./ProvenanceLegend";
import { Card } from "@/components/ui/card";
import {
  lenses, sites, defaultLensId, getLens, provenanceMeta, type Marker,
} from "@/lib/lenses";
import { cn } from "@/lib/utils";

export function PulseDashboard({ initialLensId }: { initialLensId?: string } = {}) {
  const [activeId, setActiveId] = useState(() =>
    lenses.some((l) => l.id === initialLensId) ? (initialLensId as string) : defaultLensId,
  );
  const [selected, setSelected] = useState<Marker | null>(null);
  const lens = getLens(activeId);

  function switchLens(id: string) {
    setActiveId(id);
    setSelected(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LensSwitcher lenses={lenses} activeId={activeId} onChange={switchLens} />
        <span className="text-xs text-muted-foreground">as of {lens.asOf}</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-heading text-xl font-medium tracking-tight">{lens.dept}</h2>
        <p className="text-sm text-muted-foreground">{lens.blurb}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {lens.kpis.map((k) => (
          <div key={k.label} className="rounded-md bg-secondary px-3 py-2.5">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-0.5 text-xl font-medium tabular-nums">{k.value}</div>
            {k.sub && (
              <div className={cn("text-[11px]", k.flag === "fab" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                {k.flag === "fab" ? "* " : ""}{k.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {lens.feed === "fx" && <LiveFxStrip />}
      {lens.feed === "careers" && <CareersStrip />}
      {lens.feed === "weather" && <WeatherStrip />}
      {lens.feed === "enso" && <EnsoStrip />}
      {lens.feed === "freight" && <FreightStrip />}

      <PulseMap sites={sites} markers={lens.markers} selectedId={selected?.id} onSelect={setSelected} />

      <ProvenanceLegend lens={lens} />

      {selected ? (
        <Card className="relative">
          <button
            onClick={() => setSelected(null)}
            aria-label="Close detail"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
          <div className="flex flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{selected.label}</span>
              {selected.value && (
                <span className="rounded bg-secondary px-2 py-0.5 text-xs">{selected.value}</span>
              )}
              <span
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
                title={provenanceMeta[selected.provenance].description}
              >
                <span className="inline-block size-2 rounded-full" style={{ background: provenanceMeta[selected.provenance].color }} />
                {provenanceMeta[selected.provenance].label}
              </span>
            </div>
            {selected.employees != null && (
              <div className="text-sm text-muted-foreground">
                {selected.employees.toLocaleString()} employees
                {selected.openPositions ? ` · ${selected.openPositions} open` : ""}
                {selected.oldestDaysOpen ? ` · oldest ${selected.oldestDaysOpen} days` : ""}
              </div>
            )}
            {selected.detail && <p className="text-sm leading-relaxed">{selected.detail}</p>}
            {selected.roles && selected.roles.length > 0 && (
              <div className="mt-1 flex flex-col gap-1.5">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Open roles ({selected.roles.length})
                </div>
                <ul className="flex max-h-60 flex-col gap-1.5 overflow-auto pr-1">
                  {selected.roles.map((r, i) => (
                    <li key={i} className="rounded-md bg-secondary/60 px-2.5 py-1.5">
                      <div className="text-sm font-medium leading-snug">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.family ?? "—"}
                        {r.standing
                          ? " · standing req"
                          : r.days != null
                            ? ` · open ${r.days} ${r.days === 1 ? "day" : "days"}`
                            : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {selected.sourceRef && <span>source: {selected.sourceRef}</span>}
              {selected.asOf && <span>as of {selected.asOf}</span>}
            </div>
            {selected.impact && (
              <Link
                href={`/impact?event=${selected.id}`}
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
              >
                Open the Impact Room <ArrowRight className="size-4" />
              </Link>
            )}
            {selected.radar && (
              <Link
                href="/radar"
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
              >
                Open the Pouch Radar <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </Card>
      ) : lens.agentNote ? (
        <p className="text-xs italic text-muted-foreground">{lens.agentNote}</p>
      ) : null}
    </div>
  );
}
