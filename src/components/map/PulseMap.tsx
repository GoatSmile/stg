"use client";

import { useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import worldData from "@/data/world-110m.json";
import { type Marker, type Site, sites as allSites, lenses, provenanceMeta } from "@/lib/lenses";
import { radiusFromEmployees, radiusFromCount, compactCount } from "@/lib/format";
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
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

// Bubble-size metric (HR lens): the dot's size + number both reflect ONE measure,
// so size and label never disagree. Default = open positions.
type Metric = "positions" | "headcount";
const METRICS: { id: Metric; label: string; title: string }[] = [
  { id: "positions", label: "Positions", title: "Bubble size = open positions" },
  { id: "headcount", label: "Headcount", title: "Bubble size = employees" },
];

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
  metricToggle,
}: {
  sites: Site[];
  markers: Marker[];
  selectedId?: string | null;
  onSelect: (m: Marker) => void;
  /** Show the Positions/Headcount bubble-size toggle (HR lens only). */
  metricToggle?: boolean;
}) {
  const [regionId, setRegionId] = useState("world");
  const [metric, setMetric] = useState<Metric>("positions");
  // Hover-to-zoom: while a marker is hovered/focused we magnify around it; null
  // shows the plain region view. Region changes use a slower camera tween.
  const [focus, setFocus] = useState<View | null>(null);
  const [durMs, setDurMs] = useState(700);

  const base = REGIONS.find((r) => r.id === regionId)?.view ?? WORLD;
  const view = focus ?? base;

  function setRegion(id: string) {
    setFocus(null);
    setDurMs(700);
    setRegionId(id);
  }

  // Magnify around the marker's *current on-screen point* so the dot stays put
  // under the cursor — recentering it would slide it out from under the pointer
  // and cause hover flicker (mouse-leave → zoom out → mouse-enter → repeat).
  function focusMarker(px: number, py: number) {
    const k = Math.min(base.k * 1.7, 3.2);
    setDurMs(350);
    setFocus({ k, x: base.x + px * (base.k - k), y: base.y + py * (base.k - k) });
  }

  function clearFocus() {
    setDurMs(350);
    setFocus(null);
  }

  return (
    <div className="relative">
      {/* camera presets + (HR) bubble-size metric toggle */}
      <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
        <div className="flex gap-0.5 rounded-md border border-border bg-card/85 p-0.5 backdrop-blur-sm">
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
        {metricToggle && (
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-card/85 p-0.5 backdrop-blur-sm">
            <span className="px-1 text-[10px] uppercase tracking-wide text-muted-foreground">bubble</span>
            {METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetric(m.id)}
                aria-pressed={metric === m.id}
                title={m.title}
                className={cn(
                  "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                  metric === m.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="World map of STG's footprint with the active department layer"
        style={{ display: "block", background: "var(--map-bg)", borderRadius: "var(--radius-lg)" }}
      >
        <g style={{ transform: css(view), transformBox: "view-box", transformOrigin: "0 0", transition: `transform ${durMs}ms ${EASE}` }}>
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
              const headcount = metricToggle && metric === "headcount";
              const r =
                metricToggle && metric === "positions"
                  ? radiusFromCount(m.openPositions)
                  : radiusFromEmployees(m.employees);
              // Number inside the dot reflects the SAME metric as its size. In
              // headcount mode only label dots big enough to hold the figure.
              const badge = headcount
                ? m.employees != null && r >= 11
                  ? compactCount(m.employees)
                  : null
                : m.openPositions
                  ? String(m.openPositions)
                  : null;
              const selected = selectedId === m.id;
              const ring = m.severity ? severityRing[m.severity] : null;
              return (
                <g
                  key={m.id}
                  transform={`translate(${p[0]},${p[1]})`}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelect(m)}
                  onMouseEnter={() => focusMarker(p[0], p[1])}
                  onMouseLeave={clearFocus}
                  onFocus={() => focusMarker(p[0], p[1])}
                  onBlur={clearFocus}
                  role="button"
                  aria-label={`${m.label}${m.value ? `: ${m.value}` : ""}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect(m);
                  }}
                >
                  {/* enlarged transparent hit target for easier hover/click */}
                  <circle r={r + 7} fill="transparent" />
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
                  {badge ? (
                    <text textAnchor="middle" dy="0.32em" fontSize={9} fill="#fff" fontWeight={600}>
                      {badge}
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
