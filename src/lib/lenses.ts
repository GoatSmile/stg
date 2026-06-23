import operations from "@/data/operations.json";
import regulatory from "@/data/layers/regulatory.json";
import hr from "@/data/layers/hr.json";
import sales from "@/data/layers/sales.json";
import finance from "@/data/layers/finance.json";
import procurement from "@/data/layers/procurement.json";
import supply from "@/data/layers/supply.json";
import sustainability from "@/data/layers/sustainability.json";

/** Provenance drives the legend + the asterisk discipline (see /transparency). */
export type Provenance = "public" | "agent" | "internal" | "fabricated";
export type Flag = "C" | "I" | "fab";
export type SiteType =
  | "hq" | "sales" | "office" | "factory" | "leaf" | "dc" | "superstore" | "lounge" | "pouch";

export type Site = {
  id: string; type: SiteType; country: string; city: string;
  lat: number; lng: number; employees?: number; makes?: string; flag: Flag;
};

export type Kpi = { label: string; value: string; sub?: string; flag: Flag };

export type Marker = {
  id: string; lat: number; lng: number; label: string;
  value?: string; severity?: "high" | "medium" | "low";
  provenance: Provenance; sourceRef?: string; asOf?: string; detail?: string;
  // lens-specific extras
  siteId?: string; employees?: number; openPositions?: number;
  oldestDaysOpen?: number; retirementRisk?: number; impact?: boolean; radar?: boolean;
  // HR open-role counts (openPositions/oldestDaysOpen) are derived live from the
  // careers feed at render time, keyed by siteId — never stored on the marker.
};

export type Regime = { country: string; status: "banned" | "restricted" | "open" };

export type Lens = {
  id: string; dept: string; label: string; icon: string; blurb: string;
  asOf: string; kpis: Kpi[]; markers: Marker[];
  regimes?: Regime[]; agentNote?: string;
  /** A live agent feed to render on this lens: "fx" (Finance), "careers" (HR),
   *  "weather" (Procurement), "enso" (ESG), "freight" (Supply). */
  feed?: string;
};

export const sites = (operations as { sites: Site[] }).sites;
export const operationsAsOf = (operations as { asOf: string }).asOf;

/** Display order. Regulatory is the default (the CEO story); HR is the showcase. */
export const lenses: Lens[] = [
  regulatory as Lens,
  hr as Lens,
  sales as Lens,
  finance as Lens,
  procurement as Lens,
  supply as Lens,
  sustainability as Lens,
];

export const defaultLensId = "regulatory";

export function getLens(id: string): Lens {
  return lenses.find((l) => l.id === id) ?? lenses[0];
}

/** Count markers by provenance for the per-lens legend. */
export function provenanceCounts(lens: Lens): Record<Provenance, number> {
  const counts: Record<Provenance, number> = {
    public: 0, agent: 0, internal: 0, fabricated: 0,
  };
  for (const m of lens.markers) counts[m.provenance]++;
  return counts;
}

export const provenanceMeta: Record<
  Provenance,
  { label: string; description: string; color: string }
> = {
  public: { label: "Public", description: "Published / scrapable today", color: "var(--prov-public)" },
  agent: { label: "Agent-fetched", description: "AI fetches public data on a schedule", color: "var(--prov-agent)" },
  internal: { label: "Needs STG data", description: "Behind a data agreement", color: "var(--prov-internal)" },
  fabricated: { label: "Illustrative*", description: "Plausible placeholder, constructed for the demo", color: "var(--prov-fab)" },
};
