// Pure helpers for the FRED freight-cost feed — Supply lens.
//
// FRED (St. Louis Fed) is free with a key. There's no clean keyless daily
// ocean-freight index, so we use Brent crude (DCOILBRENTEU) as the dominant
// driver of ocean-freight (bunker fuel) + leaf-transport cost — framed honestly
// as a cost DRIVER, not a per-lane rate (the actual Freightos FBX per-lane rate
// stays illustrative*). No network here; fetch + offline fallback live in the
// route. The number is FRED's; the "pressure" label is a stated rule on the
// ~30-trading-day change.

export type FreightPressure = "rising" | "easing" | "stable";

export type FreightState = {
  series: string; // human label, e.g. "Brent crude"
  unit: string; // "USD/bbl"
  date: string; // latest observation date
  value: number;
  priorDate: string;
  priorValue: number;
  changePct: number; // % change over ~30 trading days
  pressure: FreightPressure;
  note: string;
};

export function pressureFor(changePct: number): FreightPressure {
  if (changePct >= 3) return "rising";
  if (changePct <= -3) return "easing";
  return "stable";
}

export function noteFor(p: FreightPressure): string {
  switch (p) {
    case "rising":
      return "fuel cost rising — upward pressure on the DR / HN / NI → US ocean lane";
    case "easing":
      return "fuel cost easing — downward pressure on the inbound lanes";
    default:
      return "fuel cost broadly stable over the past month";
  }
}

type FredObs = { date: string; value: string };

/** Parse FRED observations (sorted desc): latest valid value + the one ~30 trading days prior. */
export function parseFred(
  payload: unknown,
): { date: string; value: number; priorDate: string; priorValue: number; changePct: number } | null {
  const obs = (payload as { observations?: FredObs[] })?.observations ?? [];
  const vals = obs
    .filter((o) => o.value !== "." && o.value !== "")
    .map((o) => ({ date: o.date, v: Number(o.value) }))
    .filter((o) => !Number.isNaN(o.v));
  if (!vals.length) return null;
  const latest = vals[0];
  const prior = vals[Math.min(29, vals.length - 1)];
  const changePct = prior.v ? Math.round(((latest.v - prior.v) / prior.v) * 1000) / 10 : 0;
  return { date: latest.date, value: latest.v, priorDate: prior.date, priorValue: prior.v, changePct };
}
