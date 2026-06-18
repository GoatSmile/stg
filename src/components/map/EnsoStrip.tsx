"use client";

import { useEffect, useState } from "react";
import { Waves, ExternalLink } from "lucide-react";
import { ENSO_REGIONS, type EnsoPhase } from "@/lib/enso";

type EnsoResponse = {
  live: boolean;
  fallback?: boolean;
  asOf: string;
  fetchedAt: string | null;
  source: string;
  sourceUrl: string;
  season: string;
  oni: number;
  phase: EnsoPhase;
  note: string;
};

const PHASE_CLS: Record<EnsoPhase, string> = {
  "El Niño": "bg-red-500/10 text-red-700 dark:text-red-400",
  "La Niña": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Neutral: "bg-secondary text-muted-foreground",
};

export function EnsoStrip() {
  const [data, setData] = useState<EnsoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    fetch("/api/feeds/enso")
      .then((r) => r.json())
      .then((j: EnsoResponse) => on && (setData(j), setLoading(false)))
      .catch(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Waves className="size-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium">Live leaf-region climate (ENSO)</span>
        {data && (
          <span
            className={
              data.live
                ? "inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                : "inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
            }
            title={data.live ? `Fetched live from ${data.source}` : "NOAA unreachable — cached snapshot"}
          >
            {data.live ? `live · ${data.asOf}` : `cached · ${data.asOf}`}
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">an agent reads the NOAA ENSO index</span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Reading the ENSO index…</p>}

      {data && !loading && (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className={`rounded px-2 py-0.5 text-sm font-medium ${PHASE_CLS[data.phase]}`}>{data.phase}</span>
            <span className="text-sm tabular-nums text-muted-foreground">
              ONI {data.oni >= 0 ? "+" : ""}{data.oni.toFixed(2)}°C · {data.season}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground">
              watching {ENSO_REGIONS.length} leaf regions
            </span>
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            ENSO is the dominant climate swing over the tropical leaf base — the current state {data.note}.
            Phase is NOAA&apos;s ±0.5°C ONI threshold; per-site water stress (WRI Aqueduct 4.0) is already on the leaf markers.{" "}
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline underline-offset-2">
              NOAA CPC <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
