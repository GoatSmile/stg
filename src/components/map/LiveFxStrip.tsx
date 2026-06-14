"use client";

import { useEffect, useState } from "react";
import { Activity, ExternalLink } from "lucide-react";
import { usdSalesSensitivityDkkM, type DkkCrossRates } from "@/lib/fx";
import { dkkM } from "@/lib/format";

type FxResponse = {
  live: boolean;
  fallback?: boolean;
  asOf: string;
  fetchedAt: string | null;
  source: string;
  sourceUrl: string;
  cross: DkkCrossRates;
};

function hhmm(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function Pair({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-lg font-medium tabular-nums">
        {Number.isFinite(value) ? value.toFixed(3) : "—"}
      </span>
    </div>
  );
}

export function LiveFxStrip() {
  const [fx, setFx] = useState<FxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let on = true;
    fetch("/api/feeds/fx")
      .then((r) => r.json())
      .then((j: FxResponse) => on && (setFx(j), setLoading(false)))
      .catch(() => on && (setError(true), setLoading(false)));
    return () => {
      on = false;
    };
  }, []);

  const exposure = usdSalesSensitivityDkkM(0.1); // a 10% USD/DKK move on US net sales

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Activity className="size-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium">Live FX</span>
        {fx && (
          <span
            className={
              fx.live
                ? "inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                : "inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
            }
            title={fx.live ? `Fetched live from ${fx.source}` : "Live fetch unavailable — cached ECB snapshot"}
          >
            {fx.live ? `live · fetched ${hhmm(fx.fetchedAt)}` : `cached · ECB ${fx.asOf}`}
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">
          an agent refreshes this from the ECB
        </span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Fetching ECB rates…</p>}
      {error && !loading && <p className="text-sm text-muted-foreground">FX feed unavailable.</p>}

      {fx && !loading && (
        <>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Pair label="USD / DKK" value={fx.cross.usdDkk} />
            <Pair label="EUR / DKK (peg)" value={fx.cross.eurDkk} />
            <Pair label="GBP / DKK" value={fx.cross.gbpDkk} />
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            USD ≈ half of group sales (US net sales DKK 4,230m). A 10% USD/DKK move ≈{" "}
            <span className="text-amber-600 dark:text-amber-400">{dkkM(exposure)}*</span> of net-sales
            exposure — <span className="text-amber-600 dark:text-amber-400">*</span> first-order
            translation sensitivity, pre-hedging, illustrative.{" "}
            <a href={fx.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline underline-offset-2">
              ECB <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
