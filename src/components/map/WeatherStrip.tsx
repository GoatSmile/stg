"use client";

import { useEffect, useState } from "react";
import { CloudSunRain, ExternalLink } from "lucide-react";
import { type RegionWeather, type WeatherRisk } from "@/lib/weather";

type RegionRow = RegionWeather & { risk: WeatherRisk };
type WeatherResponse = {
  live: boolean;
  fallback?: boolean;
  asOf: string;
  fetchedAt: string | null;
  source: string;
  sourceUrl: string;
  regions: RegionRow[];
};

const RISK_CLS: Record<WeatherRisk["level"], string> = {
  low: "bg-secondary text-muted-foreground",
  elevated: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function WeatherStrip() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    fetch("/api/feeds/weather")
      .then((r) => r.json())
      .then((j: WeatherResponse) => on && (setData(j), setLoading(false)))
      .catch(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <CloudSunRain className="size-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium">Live leaf-region weather</span>
        {data && (
          <span
            className={
              data.live
                ? "inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                : "inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
            }
            title={data.live ? `Fetched live from ${data.source}` : "Open-Meteo unreachable — cached snapshot"}
          >
            {data.live ? `live · ${data.asOf}` : `cached · ${data.asOf}`}
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">an agent refreshes crop risk from Open-Meteo</span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Fetching leaf-region weather…</p>}

      {data && !loading && (
        <>
          <div className="flex flex-col gap-1">
            {data.regions.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px]">
                <span className="w-44 shrink-0 font-medium">{r.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {Math.round(r.tempC)}°C · 7-day rain {r.weekPrecipMm}mm
                </span>
                <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${RISK_CLS[r.risk.level]}`} title={r.risk.note}>
                  {r.risk.kind} · {r.risk.level}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Risk is a stated rule on Open-Meteo&apos;s 7-day forecast (dry &lt; 5mm · heat ≥ 35°C · wet
            &gt; 120mm), not a black box. Weather is live; the leaf-price (FRED/USDA) and water-stress
            (WRI Aqueduct) overlays are next.{" "}
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline underline-offset-2">
              Open-Meteo <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
