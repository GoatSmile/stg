"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X, ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import type { CareerRole } from "@/lib/careers";
import { cn } from "@/lib/utils";

// A role open > 1 year reads as a "standing req", not "open N days" (matches the
// careers feed's oldest-vacancy rule). The sentinel siteId for the US retail/bar
// marker that collects every role with no strategic-site mapping.
const STANDING_DAYS = 365;
const RETAIL_SITE_ID = "us-retail";

function roleMeta(r: CareerRole): string {
  const fam = r.family || "—";
  if (r.daysOpen != null && r.daysOpen > STANDING_DAYS) return `${fam} · standing req`;
  if (r.daysOpen != null) return `${fam} · open ${r.daysOpen} ${r.daysOpen === 1 ? "day" : "days"}`;
  return fam;
}

export function PulseDashboard({ initialLensId }: { initialLensId?: string } = {}) {
  const [activeId, setActiveId] = useState(() =>
    lenses.some((l) => l.id === initialLensId) ? (initialLensId as string) : defaultLensId,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openRole, setOpenRole] = useState<CareerRole | null>(null);
  const [roles, setRoles] = useState<CareerRole[] | null>(null);
  const lens = getLens(activeId);

  // Roles are live-only from the DB (single source of truth — no JSON copy).
  // Fetch once, the first time the HR lens is shown.
  useEffect(() => {
    if (lens.id !== "hr" || roles !== null) return;
    let on = true;
    fetch("/api/feeds/careers?roles=1")
      .then((r) => r.json())
      .then((j: { roles?: CareerRole[] }) => { if (on) setRoles(j.roles ?? []); })
      .catch(() => { if (on) setRoles([]); });
    return () => { on = false; };
  }, [lens.id, roles]);

  // Group the live roles by siteId (always a bucket key: a strategic site,
  // "us-retail" or "eu-other"; the ?? below is just a defensive fallback).
  const rolesBySite = useMemo(() => {
    const map = new Map<string, CareerRole[]>();
    for (const r of roles ?? []) {
      const key = r.siteId ?? RETAIL_SITE_ID;
      const arr = map.get(key);
      if (arr) arr.push(r); else map.set(key, [r]);
    }
    return map;
  }, [roles]);

  // On the HR lens, derive each marker's open-count + oldest vacancy from those
  // same roles, so the map dot badge and the detail role-list can never disagree.
  const markers = useMemo(() => {
    if (lens.id !== "hr") return lens.markers;
    return lens.markers.map((m) => {
      const rs = m.siteId ? rolesBySite.get(m.siteId) : undefined;
      if (!rs || rs.length === 0) return m;
      const oldest = rs.reduce(
        (mx, r) => (r.daysOpen != null && r.daysOpen <= STANDING_DAYS ? Math.max(mx, r.daysOpen) : mx),
        0,
      );
      return { ...m, openPositions: rs.length, oldestDaysOpen: oldest };
    });
  }, [lens, rolesBySite]);

  // `selected` is derived (not stored) so it always reflects the live-enriched marker.
  const selected = useMemo(() => markers.find((m) => m.id === selectedId) ?? null, [markers, selectedId]);
  const rolesForSelected = selected?.siteId ? rolesBySite.get(selected.siteId) ?? [] : [];

  function switchLens(id: string) {
    setActiveId(id);
    setSelectedId(null);
    setOpenRole(null);
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

      <PulseMap sites={sites} markers={markers} selectedId={selectedId} onSelect={(m) => setSelectedId(m.id)} metricToggle={lens.id === "hr"} />

      <ProvenanceLegend lens={lens} />

      {selected ? (
        <Card className="relative">
          <button
            onClick={() => setSelectedId(null)}
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
            {rolesForSelected.length > 0 && (
              <div className="mt-1 flex flex-col gap-1.5">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Open roles ({rolesForSelected.length})
                </div>
                <ul className="flex max-h-60 flex-col gap-1.5 overflow-auto pr-1">
                  {rolesForSelected.map((r) => (
                    <li key={r.gid}>
                      {r.description ? (
                        <button
                          type="button"
                          onClick={() => setOpenRole(r)}
                          className="group flex w-full items-center gap-2 rounded-md bg-secondary/60 px-2.5 py-1.5 text-left transition-colors hover:bg-secondary"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium leading-snug">{r.title}</span>
                            <span className="text-[11px] text-muted-foreground">{roleMeta(r)}</span>
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                        </button>
                      ) : (
                        <div className="rounded-md bg-secondary/60 px-2.5 py-1.5">
                          <div className="text-sm font-medium leading-snug">{r.title}</div>
                          <div className="text-[11px] text-muted-foreground">{roleMeta(r)}</div>
                        </div>
                      )}
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

      <Dialog open={!!openRole} onOpenChange={(o) => !o && setOpenRole(null)}>
        {openRole && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{openRole.title}</DialogTitle>
              <DialogDescription>
                {[
                  openRole.family,
                  selected?.label,
                  openRole.daysOpen != null && openRole.daysOpen > STANDING_DAYS
                    ? "standing req"
                    : openRole.daysOpen != null
                      ? `open ${openRole.daysOpen} ${openRole.daysOpen === 1 ? "day" : "days"}`
                      : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {openRole.description}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-[11px] text-muted-foreground">
                Public — STG careers feed
              </span>
              {openRole.applyUrl && (
                <a
                  href={openRole.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
                >
                  View full posting <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
