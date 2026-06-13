// Pure, deterministic impact model for the Impact Room (Surface A).
//
// Phase 2 = the STATIC contribution-margin walk. No AI here (that's Phase 3 —
// docs/build-plan.md §2/§3). The math is repeated to a CFO, so it lives in one
// pure, unit-checkable place with no unit/sign traps.
//
// The band is the min/max of ΔEBITDA over the full {elasticity × pass-through}
// grid — this GUARANTEES the band brackets the base point and can never invert
// (a ±x% shortcut applied to the output could). See the sanity check in
// docs/build-plan.md §2.

export type Triple = { low: number; base: number; high: number };

export type ImpactInputs = {
  /** DKK m of revenue actually sitting below the new excise floor (NOT the whole category). */
  exposedBase: number;
  /** Excise-driven retail price rise, as a fraction (0.15 = +15%). */
  priceIncreasePct: number;
  /** Contribution margin on lost volume, as a fraction (0.45 = 45%). */
  contributionMargin: number;
  /** Share of the excise that reaches the shelf vs STG absorbs, 0..1. */
  passThrough: Triple;
  /** Own-price demand elasticity — negative. */
  elasticity: Triple;
};

/** The contribution-margin walk, reported at the base assumptions (for the line items). */
export type ImpactWalk = {
  effPriceUp: number; // priceIncreasePct × passThrough
  retainedVolFactor: number; // 1 + elasticity × effPriceUp  (< 1)
  volumeLossDkk: number; // exposedBase × (1 − retainedVolFactor)
  marginLossOnVol: number; // volumeLossDkk × contributionMargin
  absorbedExcise: number; // exposedBase × priceIncreasePct × (1 − passThrough)
};

export type ImpactResult = {
  // ΔEBITDA in DKK m — negative means EBITDA at risk.
  ebitdaBase: number;
  ebitdaBest: number; // least negative corner of the band
  ebitdaWorst: number; // most negative corner of the band
  // Positive "at-risk" magnitudes for display (= −ebitda*).
  atRiskBase: number;
  atRiskBest: number; // smallest at-risk DKK
  atRiskWorst: number; // largest at-risk DKK
  walk: ImpactWalk;
};

function deltaEbitda(
  exposedBase: number,
  priceIncreasePct: number,
  contributionMargin: number,
  passThrough: number,
  elasticity: number,
): number {
  const effPriceUp = priceIncreasePct * passThrough;
  const retainedVolFactor = 1 + elasticity * effPriceUp; // < 1 because elasticity < 0
  const volumeLossDkk = exposedBase * (1 - retainedVolFactor);
  const marginLossOnVol = volumeLossDkk * contributionMargin;
  const absorbedExcise = exposedBase * priceIncreasePct * (1 - passThrough);
  return -(marginLossOnVol + absorbedExcise); // negative = at risk
}

export function computeImpact(inp: ImpactInputs): ImpactResult {
  const elasticities = [inp.elasticity.low, inp.elasticity.base, inp.elasticity.high];
  const passThroughs = [inp.passThrough.low, inp.passThrough.base, inp.passThrough.high];

  let worst = Infinity; // most negative
  let best = -Infinity; // least negative
  for (const e of elasticities) {
    for (const pt of passThroughs) {
      const d = deltaEbitda(inp.exposedBase, inp.priceIncreasePct, inp.contributionMargin, pt, e);
      if (d < worst) worst = d;
      if (d > best) best = d;
    }
  }

  const ebitdaBase = deltaEbitda(
    inp.exposedBase,
    inp.priceIncreasePct,
    inp.contributionMargin,
    inp.passThrough.base,
    inp.elasticity.base,
  );

  // The walk at base assumptions, for the transparent line items.
  const effPriceUp = inp.priceIncreasePct * inp.passThrough.base;
  const retainedVolFactor = 1 + inp.elasticity.base * effPriceUp;
  const volumeLossDkk = inp.exposedBase * (1 - retainedVolFactor);
  const marginLossOnVol = volumeLossDkk * inp.contributionMargin;
  const absorbedExcise = inp.exposedBase * inp.priceIncreasePct * (1 - inp.passThrough.base);

  // base is one of the grid corners (base,base), so it is already bracketed — be explicit anyway.
  const ebitdaWorst = Math.min(worst, ebitdaBase);
  const ebitdaBest = Math.max(best, ebitdaBase);

  return {
    ebitdaBase,
    ebitdaBest,
    ebitdaWorst,
    atRiskBase: -ebitdaBase,
    atRiskBest: -ebitdaBest, // smallest at-risk
    atRiskWorst: -ebitdaWorst, // largest at-risk
    walk: { effPriceUp, retainedVolFactor, volumeLossDkk, marginLossOnVol, absorbedExcise },
  };
}

/** Build a low/base/high triple from a base value ± spread, clamped to [min,max]. */
export function spreadTriple(base: number, spread: number, min: number, max: number): Triple {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return { low: clamp(base - spread), base: clamp(base), high: clamp(base + spread) };
}
