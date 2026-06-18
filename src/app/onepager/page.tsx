import Link from "next/link";
import { getScenario, scenariosAsOf } from "@/lib/impact-data";
import { computeScenarioView, defaultValues } from "@/lib/impact-view";
import { PrintButton } from "@/components/PrintButton";
import { CONTACT } from "@/lib/contact";
import { dkkM, pct } from "@/lib/format";

export const metadata = { title: "Varsel for STG — forward-ready one-pager" };

function fmtRange(a: number, b: number): string {
  const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
  if (Math.abs(hi) < 1000) return `DKK ${Math.round(lo)}–${Math.round(hi)}m`;
  return `${dkkM(lo)} – ${dkkM(hi)}`;
}

// A self-contained, print-clean snapshot of one scenario — the artifact a recipient forwards as an
// attachment (Save as PDF) rather than a login-gated URL. Shown at the scenario defaults; the live
// app is where you tune the assumptions. Same model as everywhere else (computeScenarioView).
export default async function OnePager({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;
  const scenario = getScenario(event);
  const view = computeScenarioView(scenario, defaultValues(scenario));
  const { best, base, worst } = view.band;
  const proposed = /propos/i.test(scenario.status);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 print:max-w-none print:gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={`/impact?event=${scenario.eventId}`} className="text-sm underline underline-offset-2">
          ← back to the Impact Room
        </Link>
        <PrintButton />
      </div>

      {/* masthead — carried on the page itself so it survives print (the app header is print-hidden) */}
      <div className="flex items-baseline gap-2.5 border-b border-border pb-3">
        <span aria-hidden className="h-5 w-[3px] rounded-full bg-primary" />
        <span className="font-heading text-xl font-medium tracking-tight">Varsel for STG</span>
        <span className="text-xs text-muted-foreground">public-data risk model · valent.dk</span>
        <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">as of {scenariosAsOf}</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-medium tracking-tight">{scenario.title}</h1>
          <span
            className={
              proposed
                ? "rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                : "rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            }
          >
            {scenario.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{scenario.summary}</p>
        <p className="text-xs text-muted-foreground">
          {scenario.instrument} · applies: {scenario.appliesFrom}
        </p>
      </div>

      {/* the band */}
      <div className="flex flex-wrap items-end justify-between gap-2 rounded-lg border border-border p-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            EBITDA at risk — on the public-data default assumptions
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">{fmtRange(best, worst)}</div>
          <div className="mt-0.5 text-sm text-muted-foreground tabular-nums">base case ≈ {dkkM(base)} / year</div>
        </div>
        <span className="text-[11px] text-amber-700 dark:text-amber-400">
          illustrative — public-data model, not STG&apos;s own figure
        </span>
      </div>

      {/* growth-at-risk anchor (restriction scenarios) */}
      {view.anchor && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed">
          <span className="font-medium">The growth at risk, not just the P&amp;L: </span>
          this forecloses <span className="font-semibold tabular-nums">{dkkM(view.anchor.lostRevenue)}/yr</span> of
          pouch revenue, ≈ <span className="font-semibold tabular-nums">{pct(view.anchor.shareOfAmbition)}</span>{" "}
          of STG&apos;s stated DKK 1bn+ pouch ambition ({scenario.ambitionSourceRef}). A sense of scale from the editable
          market-share assumption — not STG&apos;s own number.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 print:grid-cols-2">
        {/* the math walk */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-sm font-medium">How the base case is built</h2>
          {view.walk.map((row, i) => (
            <div
              key={i}
              className={
                row.strong
                  ? "mt-0.5 flex items-center justify-between border-t border-border pt-1.5 text-[13px] font-medium"
                  : "flex items-center justify-between gap-2 text-[13px]"
              }
            >
              <span className={row.strong ? undefined : "text-muted-foreground"}>{row.label}</span>
              <span className="tabular-nums">
                {row.value}
                {row.sourceRef ? <span className="ml-1 text-[10px] text-muted-foreground">[{row.sourceRef}]</span> : null}
              </span>
            </div>
          ))}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Band = the full range over the {view.bandDrivers}, so it always brackets the base case.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* sourced facts */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm font-medium">Sourced from public data</h2>
            {scenario.facts.map((f) => (
              <div key={f.claim} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="text-muted-foreground">{f.claim}</span>
                <span className="tabular-nums">
                  {f.value} <span className="text-[10px] text-muted-foreground">[{f.sourceRef}]</span>
                </span>
              </div>
            ))}
          </div>

          {/* abstentions */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm font-medium">Where the source is silent (not guessed)</h2>
            {scenario.abstain.map((a) => (
              <div key={a.claim} className="text-[12px] leading-snug">
                <span className="font-medium">{a.claim}</span>{" "}
                <span className="text-muted-foreground">— {a.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-3 text-[11px] leading-snug text-muted-foreground">
        Built on public data · zero STG internal data · figures marked illustrative are placeholders, never
        presented as fact. An independent prototype by {CONTACT.name} / valent.dk — not affiliated with or
        endorsed by STG. Internal scenario prep, not investor-facing; not for external distribution.{" "}
        <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-2">{CONTACT.email}</a>
        {CONTACT.phone ? ` · ${CONTACT.phone}` : ""}
      </div>
    </div>
  );
}
