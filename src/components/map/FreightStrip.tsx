"use client";

import { useEffect, useState } from "react";
import { Ship, ExternalLink } from "lucide-react";
import { type FreightPressure } from "@/lib/freight";

type FreightResponse = {
  live: boolean;
  fallback?: boolean;
  asOf: string;
  fetchedAt: string | null;
  source: string;
  sourceUrl: string;
  series: string;
  unit: string;
  date: string;
  value: number;
  priorDate: string;
  priorValue: number;
  changePct: number;
  pressure: FreightPressure;
  note: string;
};

const PRESSURE_CLS: Record<FreightPressure, string> = {
  rising: "bg-red-500/10 text-red-700 dark:text-red-400",
  easing: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  stable: "bg-secondary text-muted-foreground",
};

export function FreightStrip() {
  const [data, setData] = useState<FreightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let on = true;
    fetch("/api/feeds/freight")
      .then((r) => {
        if (!r.ok) throw new Error(`freight feed ${r.status}`);
        return r.json();
      })
      .then((j: FreightResponse) => on && (setData(j), setLoading(false)))
      .catch(() => on && (setError(true), setLoading(false)));
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Ship className="size-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium">Live freight-cost signal</span>
        {data && (
          <span
            className={
              data.live
                ? "inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                : "inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
            }
            title={data.live ? `Fetched live from ${data.source}` : "FRED unreachable / no key — cached snapshot"}
          >
            {data.live ? `live · ${data.asOf}` : `cached · ${data.asOf}`}
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">an agent reads the FRED Brent series</span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Reading the freight-cost signal…</p>}
      {error && !loading && (
        <p className="text-sm text-muted-foreground">Freight-cost signal unavailable — offline.</p>
      )}

      {data && !loading && (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm tabular-nums">
              {data.series} <span className="font-medium">${data.value.toFixed(2)}</span>
              <span className="text-muted-foreground">/{data.unit.replace("USD/", "")}</span>
            </span>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${PRESSURE_CLS[data.pressure]}`}>
              {data.changePct >= 0 ? "+" : ""}
              {data.changePct}% · {data.pressure}
            </span>
            <span className="text-[11px] text-muted-foreground">since {data.priorDate}</span>
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Brent crude is the dominant ocean-freight (bunker fuel) + leaf-transport cost driver — the
            current move means {data.note}. Per-lane Freightos FBX rates stay illustrative*.{" "}
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline underline-offset-2">
              FRED <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
