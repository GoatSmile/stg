// Single source of truth for "scenario + assumptions → band + walk + growth anchor".
// The Impact Room, the home engine preview, and the forward-ready one-pager ALL read this, so a
// number can never differ between surfaces (a drift here = a credibility break, which is the pitch).
// Pure: the band math lives in impact-model.ts; this only does the wiring + the human-readable walk.

import { computeImpact, computeRestrictionImpact, spreadTriple } from "@/lib/impact-model";
import { type Scenario } from "@/lib/impact-data";
import { dkkM, pct } from "@/lib/format";

/** A row in the transparent "how the base case is built" walk. */
export type WalkRow = {
  label: string;
  value: string;
  /** when set, the row carries a citation chip (only the sourced base row does) */
  sourceRef?: string;
  derived?: boolean;
  strong?: boolean;
};

export type ScenarioView = {
  band: { best: number; base: number; worst: number };
  walk: WalkRow[];
  bandDrivers: string;
  anchor:
    | { lostRevenue: number; shareOfAmbition: number; ambitionDkkM: number; ambitionSourceRef: string }
    | null;
};

/** Assumption defaults for a scenario, keyed by assumption key. */
export function defaultValues(scenario: Scenario): Record<string, number> {
  return Object.fromEntries(scenario.assumptions.map((a) => [a.key, a.default]));
}

/** Compute the band + walk + growth anchor for a scenario at the given assumption values
 *  (missing keys fall back to the assumption default). */
export function computeScenarioView(
  scenario: Scenario,
  values: Record<string, number>,
): ScenarioView {
  const v = { ...defaultValues(scenario), ...values };
  const cfg = (key: string) => scenario.assumptions.find((a) => a.key === key);

  if (scenario.mechanism === "restriction") {
    const rcCfg = cfg("recapture")!;
    const cmCfg = cfg("contributionMargin")!;
    const marketShare = v.marketShare ?? 0;
    const affectedShare = v.affectedShare ?? 0;
    const marketBase = scenario.exposedBaseDkkM * marketShare;
    const r = computeRestrictionImpact({
      marketBase,
      affectedShare,
      recapture: spreadTriple(v.recapture ?? 0, rcCfg.spread ?? 0.15, rcCfg.min, rcCfg.max),
      contributionMargin: spreadTriple(v.contributionMargin ?? 0, cmCfg.spread ?? 0.1, cmCfg.min, cmCfg.max),
    });
    const market = scenario.marketLabel ?? "this market";
    const walk: WalkRow[] = [
      {
        label: "STG pouch base — NGP net sales",
        value: dkkM(scenario.exposedBaseDkkM),
        sourceRef: scenario.exposedBaseSourceRef,
        derived: scenario.exposedBaseDerived,
      },
      { label: `× ${market} share ${pct(marketShare)}`, value: `= ${dkkM(marketBase)} ${market} base` },
      { label: `× affected share ${pct(affectedShare)}`, value: `= ${dkkM(r.walk.affectedRevenue)} affected` },
      { label: `− recaptured via compliant SKUs ${pct(v.recapture ?? 0)}`, value: dkkM(r.walk.retainedRevenue) },
      { label: "= lost (foreclosed) revenue", value: dkkM(r.walk.lostRevenue) },
      { label: `× contribution margin ${pct(v.contributionMargin ?? 0)}`, value: dkkM(r.walk.ebitdaAtRisk) },
      { label: "= EBITDA at risk (base)", value: `${dkkM(r.atRiskBase)} / yr`, strong: true },
    ];
    const ambition = scenario.ambitionDkkM ?? 0;
    return {
      band: { best: r.atRiskBest, base: r.atRiskBase, worst: r.atRiskWorst },
      walk,
      bandDrivers: "recapture × contribution-margin grid",
      anchor: ambition
        ? {
            lostRevenue: r.lostRevenueBase,
            shareOfAmbition: r.lostRevenueBase / ambition,
            ambitionDkkM: ambition,
            ambitionSourceRef: scenario.ambitionSourceRef ?? "",
          }
        : null,
    };
  }

  // excise (EU-ETD)
  const ptCfg = cfg("passThrough")!;
  const elCfg = cfg("elasticity")!;
  const exposedShare = v.exposedShare ?? 0;
  const exposedBase = scenario.exposedBaseDkkM * exposedShare;
  const r = computeImpact({
    exposedBase,
    priceIncreasePct: v.priceIncreasePct ?? 0,
    contributionMargin: v.contributionMargin ?? 0,
    passThrough: spreadTriple(v.passThrough ?? 0, ptCfg.spread ?? 0.15, ptCfg.min, ptCfg.max),
    elasticity: spreadTriple(v.elasticity ?? 0, elCfg.spread ?? 0.2, elCfg.min, elCfg.max),
  });
  const walk: WalkRow[] = [
    {
      label: "EU cigar/pipe base",
      value: dkkM(scenario.exposedBaseDkkM),
      sourceRef: scenario.exposedBaseSourceRef,
      derived: scenario.exposedBaseDerived,
    },
    { label: `× exposed share ${pct(exposedShare)}`, value: `= ${dkkM(exposedBase)} exposed` },
    { label: "Volume lost (after elasticity)", value: dkkM(r.walk.volumeLossDkk) },
    { label: "— margin lost on that volume", value: dkkM(r.walk.marginLossOnVol) },
    { label: "— excise STG absorbs (not passed on)", value: dkkM(r.walk.absorbedExcise) },
    { label: "= EBITDA at risk (base)", value: `${dkkM(r.atRiskBase)} / yr`, strong: true },
  ];
  return {
    band: { best: r.atRiskBest, base: r.atRiskBase, worst: r.atRiskWorst },
    walk,
    bandDrivers: "elasticity × pass-through grid",
    anchor: null,
  };
}
