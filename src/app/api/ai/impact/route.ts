import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getScenario, type Scenario } from "@/lib/impact-data";
import { computeImpact, spreadTriple } from "@/lib/impact-model";
import { validateLineItems, type RawLineItem, type KnownFact } from "@/lib/citation-rail";
import goldenEtd from "@/data/golden/impact-eu-etd.json";

// The Anthropic SDK needs the Node runtime (not edge); the call must stay server-side.
export const runtime = "nodejs";

// CLAUDE.md + docs/build-plan.md §1: latest Sonnet-class for live-demo latency.
// (The claude-api default is Opus; this is a deliberate project override for speed.)
const MODEL = "claude-sonnet-4-6";

type Golden = { narrative: string; lineItems: RawLineItem[] };
const goldens: Record<string, Golden> = { "eu-etd": goldenEtd as unknown as Golden };

/** Recompute the band locally — the AI never produces the number, only the prose around it. */
function bandFor(scenario: Scenario, values: Record<string, number>) {
  const a = Object.fromEntries(scenario.assumptions.map((x) => [x.key, values[x.key] ?? x.default]));
  const pt = scenario.assumptions.find((x) => x.key === "passThrough")!;
  const el = scenario.assumptions.find((x) => x.key === "elasticity")!;
  const exposedBase = scenario.exposedBaseDkkM * (a.exposedShare ?? 0);
  return computeImpact({
    exposedBase,
    priceIncreasePct: a.priceIncreasePct ?? 0,
    contributionMargin: a.contributionMargin ?? 0,
    passThrough: spreadTriple(a.passThrough ?? 0, pt.spread ?? 0.15, pt.min, pt.max),
    elasticity: spreadTriple(a.elasticity ?? 0, el.spread ?? 0.2, el.min, el.max),
  });
}

/** The only values the AI is allowed to cite. Everything else must abstain. */
function knownFacts(scenario: Scenario): KnownFact[] {
  return [
    ...scenario.facts.map((f) => ({ sourceRef: f.sourceRef, value: f.value })),
    { sourceRef: scenario.exposedBaseSourceRef, value: `DKK ${scenario.exposedBaseDkkM}m` },
    { sourceRef: scenario.instrument, value: null }, // qualitative: status/dates only, no figure
  ];
}

const SYSTEM = [
  "You are a regulatory-impact analyst preparing INTERNAL scenario notes for Scandinavian Tobacco Group (STG).",
  "Hard rules, in priority order:",
  "1. Cite ONLY from the facts provided in the user message, by their exact sourceRef and exact value. Never invent, round, or adjust a figure.",
  "2. If a number is not in the provided facts, you MUST abstain: set abstain=true, value=null, sourceRef=null, and a short reason. A wrong figure shown to a CFO is worse than an abstention.",
  "3. The regulation is a PROPOSAL in Council negotiation — describe it as proposed, never as enacted, law, or in force. Use 'would', not 'will'.",
  "4. This is internal decision-support / scenario prep, NOT investor-facing. Produce no earnings guidance or investor-facing language (EU MAR).",
  "5. The DKK band is a model on STG's published splits, not STG's own figure — say so.",
  "Output strictly as the requested JSON: a short narrative (2–4 sentences) and 4–6 line items.",
].join("\n");

function buildPrompt(scenario: Scenario, result: ReturnType<typeof computeImpact>): string {
  const facts = scenario.facts.map((f) => `- ${f.claim}: ${f.value}   [cite as sourceRef: ${f.sourceRef}]`).join("\n");
  const gaps = scenario.abstain.map((a) => `- ${a.claim}`).join("\n");
  return [
    `Scenario: ${scenario.title} — status: ${scenario.status} (instrument: ${scenario.instrument}).`,
    scenario.summary,
    "",
    "Locally computed band (our deterministic model — reference it, do NOT recompute or alter it):",
    `  EBITDA at risk ≈ DKK ${Math.round(result.atRiskBest)}–${Math.round(result.atRiskWorst)}m per year; base ≈ DKK ${Math.round(result.atRiskBase)}m.`,
    "",
    "The ONLY citable facts (cite by exact sourceRef and exact value):",
    facts,
    "",
    "Known gaps — you MUST abstain on these (abstain=true, value=null, sourceRef=null):",
    gaps,
    "- Any France-specific machine-rolled cigar revenue figure (e.g. ~DKK 620m): not in this corpus.",
    "",
    "Write the narrative and the line items now. Cite only from the facts above; abstain on everything else.",
  ].join("\n");
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    narrative: { type: "string" },
    lineItems: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          claim: { type: "string" },
          value: { anyOf: [{ type: "string" }, { type: "null" }] },
          sourceRef: { anyOf: [{ type: "string" }, { type: "null" }] },
          abstain: { type: "boolean" },
          reason: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
        required: ["claim", "value", "sourceRef", "abstain", "reason"],
      },
    },
  },
  required: ["narrative", "lineItems"],
};

export async function POST(req: Request) {
  let body: { eventId?: string; assumptions?: Record<string, number> } = {};
  try {
    body = await req.json();
  } catch {
    // empty/invalid body → defaults
  }
  const scenario = getScenario(body.eventId);
  const values = body.assumptions ?? {};
  const result = bandFor(scenario, values);
  const known = knownFacts(scenario);
  const golden = goldens[scenario.eventId] ?? goldens["eu-etd"];
  const atRisk = { best: result.atRiskBest, base: result.atRiskBase, worst: result.atRiskWorst };

  const offline = process.env.DEMO_MODE === "offline" || !process.env.ANTHROPIC_API_KEY;
  if (offline) {
    return NextResponse.json({
      mode: "offline",
      model: MODEL,
      narrative: golden.narrative,
      lineItems: validateLineItems(golden.lineItems, known),
      atRisk,
    });
  }

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(scenario, result) }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    if (message.stop_reason === "refusal") throw new Error("model refused");
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const parsed = JSON.parse(text) as { narrative: string; lineItems: RawLineItem[] };
    return NextResponse.json({
      mode: "live",
      model: MODEL,
      narrative: parsed.narrative,
      lineItems: validateLineItems(parsed.lineItems, known),
      atRisk,
    });
  } catch {
    // Conference/client wifi is not a dependency we accept — fall back to the
    // golden, labeled honestly so the presenter can say "offline mode".
    return NextResponse.json({
      mode: "offline",
      model: MODEL,
      fallback: true,
      narrative: golden.narrative,
      lineItems: validateLineItems(golden.lineItems, known),
      atRisk,
    });
  }
}
