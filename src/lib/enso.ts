// Pure helpers for the NOAA CPC ENSO (ONI) feed — ESG lens (leaf-region climate).
//
// NOAA's Oceanic Niño Index (ONI) is free + keyless (a public ascii table). ENSO
// is the dominant year-to-year climate driver over STG's tropical leaf regions
// (rainfall / drought in the Caribbean, Central America and SE Asia), so it's a
// real, sourced climate-risk signal for the ESG lens. No network here — the fetch
// + offline fallback live in the route. The ONI value is NOAA's; the phase label
// is the standard ±0.5 °C threshold; the leaf-region note is a stated climatology,
// not a per-region forecast.

export type EnsoPhase = "El Niño" | "La Niña" | "Neutral";

export type EnsoState = {
  season: string; // e.g. "MAM 2026" (the 3-month period NOAA last published)
  oni: number; // the Oceanic Niño Index anomaly, °C
  phase: EnsoPhase;
  note: string; // what this state tends to mean for the leaf base (stated climatology)
};

/** Leaf regions whose climate ENSO swings — shown alongside the live state. */
export const ENSO_REGIONS = [
  "Dominican Republic",
  "Honduras / Nicaragua",
  "Indonesia",
  "Sri Lanka",
];

export function phaseFor(oni: number): EnsoPhase {
  if (oni >= 0.5) return "El Niño";
  if (oni <= -0.5) return "La Niña";
  return "Neutral";
}

export function noteFor(phase: EnsoPhase): string {
  switch (phase) {
    case "El Niño":
      return "tends to bring drier, hotter spells to Indonesia / SE Asia and parts of Central America — drought risk for leaf";
    case "La Niña":
      return "tends to bring wetter conditions to SE Asia and drier spells to the southern Americas — curing / harvest variability";
    default:
      return "no strong El Niño / La Niña signal — near-baseline leaf-region climate";
  }
}

/**
 * Parse NOAA CPC oni.ascii.txt. Rows are "SEAS YR TOTAL ANOM" (whitespace-
 * separated); the header has a non-numeric year, so it's filtered out. The last
 * data row is the most recent published period.
 */
export function parseOni(text: string): EnsoState | null {
  const rows = text
    .trim()
    .split("\n")
    .map((l) => l.trim().split(/\s+/))
    .filter((c) => c.length === 4 && /^\d{4}$/.test(c[1]));
  const last = rows[rows.length - 1];
  if (!last) return null;
  const oni = Number(last[3]);
  if (Number.isNaN(oni)) return null;
  const phase = phaseFor(oni);
  return { season: `${last[0]} ${last[1]}`, oni, phase, note: noteFor(phase) };
}
