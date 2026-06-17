import data from "@/data/impact-scenarios.json";

/** How a slider input is framed in the rails: a soft assumption, a scenario lever, or a no-consensus range. */
export type AssumptionKind = "assumption" | "scenario" | "no-consensus";

export type Assumption = {
  key: string;
  label: string;
  kind: AssumptionKind;
  default: number;
  min: number;
  max: number;
  step: number;
  unit: "pct" | "raw";
  note: string;
  sourceRef?: string;
  /** For levers that drive the band, the ± spread used to build the low/high triple. */
  spread?: number;
};

export type ScenarioFact = { claim: string; value: string; sourceRef: string; provenance: string };
export type ScenarioAbstain = { claim: string; reason: string };

/** "excise" = the EU-ETD price-rise walk; "restriction" = an in-force ban/cap (lost revenue × margin). */
export type ScenarioMechanism = "excise" | "restriction";

export type Scenario = {
  eventId: string;
  mechanism: ScenarioMechanism;
  /** For restriction scenarios: the market name shown in the walk ("France", "Denmark"). */
  marketLabel?: string;
  title: string;
  instrument: string;
  celex?: string;
  status: string;
  sourceUrl: string;
  appliesFrom: string;
  summary: string;
  exposedBaseDkkM: number;
  exposedBaseSourceRef: string;
  exposedBaseDerived: boolean;
  exposedBaseNote: string;
  /** For restriction scenarios: the cited pouch ambition the foreclosed revenue is measured against. */
  ambitionDkkM?: number;
  ambitionSourceRef?: string;
  assumptions: Assumption[];
  facts: ScenarioFact[];
  abstain: ScenarioAbstain[];
};

export type Unmodeled = { eventId: string; label: string; why: string };

const scenarios = (data as { scenarios: Record<string, Scenario> }).scenarios;
export const scenariosAsOf = (data as { asOf: string }).asOf;
export const unmodeled = (data as { unmodeled: Unmodeled[] }).unmodeled;
export const defaultEventId = "eu-etd";

/** The modeled scenarios, for the Impact-Room switcher (insertion order: EU-ETD, France, Denmark). */
export const modeledScenarios: { eventId: string; title: string; status: string }[] = Object.values(
  scenarios,
).map((s) => ({ eventId: s.eventId, title: s.title, status: s.status }));

export function getScenario(eventId?: string): Scenario {
  return (eventId ? scenarios[eventId] : undefined) ?? scenarios[defaultEventId];
}

export function isModeled(eventId?: string): boolean {
  return !!eventId && eventId in scenarios;
}
