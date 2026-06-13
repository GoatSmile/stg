"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import worldData from "@/data/world-110m.json";
import { type Marker, type Site, provenanceMeta } from "@/lib/lenses";
import { radiusFromEmployees } from "@/lib/format";

const W = 960;
const H = 500;

// Computed once at module load — deterministic, runs identically on server & client
// (d3-geo + topojson are pure JS, no DOM), so the SVG hydrates without mismatch.
const land = feature(
  worldData as never,
  (worldData as unknown as { objects: { countries: never } }).objects.countries,
) as unknown as FeatureCollection<Geometry>;
const projection = geoNaturalEarth1().fitSize([W, H], land);
const geo = geoPath(projection);
const countryPaths: string[] = land.features
  .map((f: Feature<Geometry>) => geo(f) ?? "")
  .filter(Boolean);

function project(lng: number, lat: number): [number, number] | null {
  const p = projection([lng, lat]);
  return p ? [p[0], p[1]] : null;
}

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
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="World map of STG's footprint with the active department layer"
      style={{ display: "block", background: "var(--map-bg)", borderRadius: "var(--radius-lg)" }}
    >
      <g>
        {countryPaths.map((d, i) => (
          <path key={i} d={d} fill="var(--map-land)" stroke="var(--map-stroke)" strokeWidth={0.5} />
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
              onClick={() => onSelect(m)}
              role="button"
              aria-label={`${m.label}${m.value ? `: ${m.value}` : ""}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(m);
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
                />
              )}
              <circle
                r={r}
                fill={provenanceMeta[m.provenance].color}
                fillOpacity={0.85}
                stroke="var(--map-marker-stroke)"
                strokeWidth={selected ? 2.5 : 1}
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
    </svg>
  );
}
