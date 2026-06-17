"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, ExternalLink } from "lucide-react";
import { oldestDaysOpen, topHiringSite, strategicOpen, otherOpen, type CareerSnapshot } from "@/lib/careers";

type CareersResponse = CareerSnapshot & {
  live: boolean;
  fallback?: boolean;
  velocity: { deltaOpen: number; fromAsOf: string } | null;
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-lg font-medium tabular-nums">{value}</span>
      {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function CareersStrip() {
  const [data, setData] = useState<CareersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    fetch("/api/feeds/careers")
      .then((r) => r.json())
      .then((j: CareersResponse) => on && (setData(j), setLoading(false)))
      .catch(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, []);

  const oldest = data ? oldestDaysOpen(data.sites) : 0;
  const oldestSite = data?.sites.find((s) => s.oldestDaysOpen === oldest);
  const top = data ? topHiringSite(data.sites) : null;
  const strat = data ? strategicOpen(data.sites) : 0;
  const other = data ? otherOpen(data) : 0;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <BriefcaseBusiness className="size-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium">Live careers</span>
        {data && (
          <span
            className={
              data.live
                ? "inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                : "inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
            }
            title={data.live ? "Latest crawl from Supabase" : "Supabase unreachable/unconfigured — cached snapshot"}
          >
            {data.live ? `live · crawl ${data.asOf}` : `cached · ${data.asOf}`}
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">
          an agent crawls the SuccessFactors feed → Supabase
        </span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading the careers feed…</p>}

      {data && !loading && (
        <>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Stat label="Open roles" value={String(data.totalOpen)} sub={`${strat} strategic · ${other} retail & field`} />
            <Stat
              label="Oldest vacancy"
              value={`${oldest}d`}
              sub={oldestSite ? oldestSite.label : undefined}
            />
            <Stat
              label="Staffing up"
              value={top ? `${top.label.split(" ")[0]} · ${top.openPositions}` : "—"}
              sub="most open roles"
            />
            <Stat
              label="Hiring velocity"
              value={data.velocity ? `${data.velocity.deltaOpen >= 0 ? "+" : ""}${data.velocity.deltaOpen}` : "accruing"}
              sub={data.velocity ? `since ${data.velocity.fromAsOf}` : "needs ≥2 daily crawls"}
            />
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Roles, locations + posting dates come from STG&apos;s public SuccessFactors careers feed
            → days-open. Strategic sites are mapped individually; US retail / cigar-bar roles and
            unmapped EU field roles are bucketed. Snapshots persist in Supabase (EU), so hiring
            velocity is real once history accrues.{" "}
            <a
              href="https://careers.st-group.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 underline underline-offset-2"
            >
              careers.st-group.com <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
