"use client";

import { useEffect, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import worldData from "@/data/world-110m.json";
import { type Marker, type Site, sites as allSites, lenses, provenanceMeta } from "@/lib/lenses";
import { radiusFromEmployees } from "@/lib/format";
import { cn } from "@/lib/utils";

const W = 960;
const H = 340;

// Computed once at module load — deterministic, runs identically on server & client
// (d3-geo + topojson are pure JS, no DOM), so the SVG hydrates without mismatch.
const land = feature(
  worldData as never,
  (worldData as unknown as { objects: { countries: never } }).objects.countries,
) as unknown as FeatureCollection<Geometry>;

// Frame the map to STG's actual footprint, not the whole globe. We fit the
// projection to the union of every site + every lens marker — so the viewport
// crops the empty Pacific + Antarctica a whole-world fit wastes half the canvas
// on, yet still contains every marker on every lens (it never jumps when you
// switch lenses, because the extent is the same for all of them).
const PAD = 0.07;
const footprint = {
  type: "MultiPoint" as const,
  coordinates: [
    ...allSites.map((s) => [s.lng, s.lat] as [number, number]),
    ...lenses.flatMap((l) => l.markers.map((m) => [m.lng, m.lat] as [number, number])),
  ],
};
const projection = geoNaturalEarth1().fitExtent(
  [
    [W * PAD, H * PAD],
    [W * (1 - PAD), H * (1 - PAD)],
  ],
  footprint,
);
const geo = geoPath(projection);
const countryPaths: string[] = land.features
  .map((f: Feature<Geometry>) => geo(f) ?? "")
  .filter(Boolean);

function project(lng: number, lat: number): [number, number] | null {
  const p = projection([lng, lat]);
  return p ? [p[0], p[1]] : null;
}

// ── Camera presets ──────────────────────────────────────────────────────────
// World is the default full-footprint frame (the projection already fits it).
// Americas / Europe are a static zoom+pan transform laid over that frame: we fit
// the bounding box of each region's projected points into the viewport, so the
// regions "fit nicely" with no hand-tuning. The transform is applied to one
// wrapper <g> with a CSS transition, which is what animates the camera.
type View = { k: number; x: number; y: number };
const WORLD: View = { k: 1, x: 0, y: 0 };

function projectedPoints(within: (lng: number, lat: number) => boolean): [number, number][] {
  return footprint.coordinates
    .filter(([lng, lat]) => within(lng, lat))
    .map(([lng, lat]) => projection([lng, lat]))
    .filter((p): p is [number, number] => !!p);
}

function fitView(pts: [number, number][], pad = 0.12, maxK = 2.8): View {
  if (pts.length < 2) return WORLD;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
  const bw = Math.max(maxX - minX, 1);
  const bh = Math.max(maxY - minY, 1);
  const k = Math.max(1, Math.min(maxK, (W * (1 - 2 * pad)) / bw, (H * (1 - 2 * pad)) / bh));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return { k, x: W / 2 - k * cx, y: H / 2 - k * cy };
}

const REGIONS: { id: string; label: string; view: View }[] = [
  { id: "world", label: "World", view: WORLD },
  { id: "americas", label: "Americas", view: fitView(projectedPoints((lng) => lng < -30)) },
  {
    id: "europe",
    label: "Europe",
    view: fitView(projectedPoints((lng, lat) => lng >= -30 && lng < 60 && lat > 30)),
  },
];

const css = (v: View) => `translate(${v.x}px, ${v.y}px) scale(${v.k})`;
const TRANSITION = "transform 750ms cubic-bezier(0.4, 0, 0.2, 1)";

const severityRing: Record<string, string> = {
  high: "var(--threat-high)",
  medium: "var(--threat-medium)",
  low: "var(--threat-low)",
};

export function PulseMap({
  sites,
  markers,
  selectedId,
  onSelect,
}: {
  sites: Site[];
  markers: Marker[];
  selectedId?: string | null;
  onSelect: (m: Marker) => void;
}) {
  const [regionId, setRegionId] = useState("world");
  // Transient click-zoom: zoom in on the clicked marker, then settle back to the
  // active region view. null = no transient zoom (showing the region view).
  const [focus, setFocus] = useState<View | null>(null);
  const timer = useRef<number | null>(null);

  const base = REGIONS.find((r) => r.id === regionId)?.view ?? WORLD;
  const view = focus ?? base;

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function setRegion(id: string) {
    if (timer.current) window.clearTimeout(timer.current);
    setFocus(null);
    setRegionId(id);
  }

  function handleSelect(m: Marker, px: number, py: number) {
    onSelect(m);
    const k = Math.max(base.k * 1.7, 2.3);
    if (timer.current) window.clearTimeout(timer.current);
    setFocus({ k, x: W / 2 - k * px, y: H / 2 - k * py });
    timer.current = window.setTimeout(() => setFocus(null), 1150);
  }

  return (
    <div className="relative">
      {/* camera presets */}
      <div className="absolute right-2 top-2 z-10 flex gap-0.5 rounded-md border border-border bg-card/85 p-0.5 backdrop-blur-sm">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            aria-pressed={regionId === r.id}
            className={cn(
              "rounded px-2 py-1 text-[11px] font-medium transition-colors",
              regionId === r.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="World map of STG's footprint with the active department layer"
        style={{ display: "block", background: "var(--map-bg)", borderRadius: "var(--radius-lg)" }}
      >
        <g style={{ transform: css(view), transformBox: "view-box", transformOrigin: "0 0", transition: TRANSITION }}>
          <g>
            {countryPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="var(--map-land)"
                stroke="var(--map-stroke)"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {/* faint base context: every site, always */}
          <g aria-hidden="true">
            {sites.map((s) => {
              const p = project(s.lng, s.lat);
              if (!p) return null;
              return <circle key={s.id} cx={p[0]} cy={p[1]} r={2.4} fill="var(--map-dot)" />;
            })}
          </g>

          {/* active lens markers */}
          <g>
            {markers.map((m) => {
              const p = project(m.lng, m.lat);
              if (!p) return null;
              const r = radiusFromEmployees(m.employees);
              const selected = selectedId === m.id;
              const ring = m.severity ? severityRing[m.severity] : null;
              return (
                <g
                  key={m.id}
                  transform={`translate(${p[0]},${p[1]})`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelect(m, p[0], p[1])}
                  role="button"
                  aria-label={`${m.label}${m.value ? `: ${m.value}` : ""}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleSelect(m, p[0], p[1]);
                  }}
                >
                  {ring && (
                    <circle
                      r={r + 5}
                      fill="none"
                      stroke={ring}
                      strokeWidth={1.5}
                      className={m.severity === "high" ? "pulse-ring" : undefined}
                      opacity={0.8}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  <circle
                    r={r}
                    fill={provenanceMeta[m.provenance].color}
                    fillOpacity={0.85}
                    stroke="var(--map-marker-stroke)"
                    strokeWidth={selected ? 2.5 : 1}
                    vectorEffect="non-scaling-stroke"
                  />
                  {m.openPositions ? (
                    <text textAnchor="middle" dy="0.32em" fontSize={9} fill="#fff" fontWeight={600}>
                      {m.openPositions}
                    </text>
                  ) : null}
                  <title>{`${m.label}${m.value ? ` — ${m.value}` : ""}`}</title>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
