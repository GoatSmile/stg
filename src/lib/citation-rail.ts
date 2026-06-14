// The citation rail — the credibility spine of the live AI moment (Phase 3).
//
// The AI may *propose* a cited line item, but a number only survives if it
// VALUE-MATCHES the curated corpus — not merely cites a source id that exists
// (key-exists would let a hallucinated euro figure through under a real source).
// Anything unsourced or mismatched is converted to a visible abstention. The
// rail is code, run on every response (live or golden), never prompt vibes.

/** What the model returns per line item (before the rail runs). */
export type RawLineItem = {
  claim: string;
  value: string | null;
  sourceRef: string | null;
  abstain: boolean;
  reason: string | null;
};

/** What the rail emits — every item is either cited (validated) or abstained. */
export type ValidatedLineItem = {
  claim: string;
  value: string | null;
  sourceRef: string | null;
  status: "cited" | "abstained";
  reason: string | null;
};

/** A citable fact from the corpus. `value` is null for qualitative sources (e.g. an instrument id). */
export type KnownFact = { sourceRef: string; value: string | null };

/** Pull the first number out of a value string: "DKK 3,270m" → 3270, "≈ 85%" → 85, "46.8%" → 46.8. */
function numFromValue(v: string): number | null {
  const m = v.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function abstain(item: RawLineItem, reason: string): ValidatedLineItem {
  return { claim: item.claim, value: item.value, sourceRef: item.sourceRef, status: "abstained", reason };
}

export function validateLineItem(item: RawLineItem, known: KnownFact[]): ValidatedLineItem {
  // The model already abstained — honour it, with a default reason.
  if (item.abstain) {
    return {
      claim: item.claim,
      value: null,
      sourceRef: item.sourceRef,
      status: "abstained",
      reason: item.reason ?? "not stated in source — needs human lookup",
    };
  }

  // A cited claim must name a source.
  if (!item.sourceRef) {
    return abstain(item, "no source cited — abstained at the citation rail");
  }

  // A source document (e.g. "AR2025") can legitimately hold several figures, so
  // gather every corpus fact under this sourceRef and accept if ANY one matches.
  const candidates = known.filter((k) => k.sourceRef === item.sourceRef);
  if (candidates.length === 0) {
    return abstain(item, "source not in the curated corpus — abstained at the citation rail");
  }

  // Value-match (not key-exists): if the item asserts a number, it must match the corpus.
  if (item.value != null && item.value.trim() !== "") {
    const claimed = numFromValue(item.value);
    const matches = candidates.some((c) => {
      if (c.value == null) return false; // qualitative source can't back a numeric claim
      const truth = numFromValue(c.value);
      if (claimed != null && truth != null) {
        const tol = Math.max(Math.abs(truth) * 0.01, 1e-6);
        return Math.abs(claimed - truth) <= tol;
      }
      return item.value!.trim().toLowerCase() === c.value.trim().toLowerCase();
    });
    if (!matches) {
      const knownVals = candidates.map((c) => c.value ?? "(qualitative — no figure)").join(", ");
      return abstain(item, `value does not match source (${knownVals}) — abstained at the citation rail`);
    }
  }

  return { claim: item.claim, value: item.value, sourceRef: item.sourceRef, status: "cited", reason: null };
}

export function validateLineItems(items: RawLineItem[], known: KnownFact[]): ValidatedLineItem[] {
  return items.map((i) => validateLineItem(i, known));
}
