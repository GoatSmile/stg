import Link from "next/link";
import { ImpactRoom } from "@/components/impact/ImpactRoom";
import {
  getScenario,
  isModeled,
  unmodeled,
  modeledScenarios,
  scenariosAsOf,
} from "@/lib/impact-data";

export const metadata = { title: "Impact Room — Varsel for STG" };

export default async function Impact({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;
  const scenario = getScenario(event);
  const requestedUnmodeled =
    event && !isModeled(event) ? unmodeled.find((u) => u.eventId === event) : undefined;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="font-heading text-3xl font-medium tracking-tight">Impact Room</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Regulation → P&amp;L drill-down behind the Regulatory and Finance lenses. As of{" "}
          {scenariosAsOf}.
        </p>
      </div>

      {/* scenario switcher — flip between the worked examples */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs uppercase tracking-wide text-muted-foreground">Threat</span>
        {modeledScenarios.map((s) => {
          const active = s.eventId === scenario.eventId;
          const inForce = !/propos/i.test(s.status);
          return (
            <Link
              key={s.eventId}
              href={`/impact?event=${s.eventId}`}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary/10 px-2.5 py-1 text-[13px] font-medium text-primary"
                  : "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[13px] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }
            >
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${inForce ? "bg-primary" : "bg-amber-500"}`}
              />
              {s.title}
            </Link>
          );
        })}
      </div>

      {requestedUnmodeled && (
        <div className="rounded-md border border-dashed border-border px-3 py-2 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{requestedUnmodeled.label}</span> isn&apos;t
          modeled yet ({requestedUnmodeled.why}). Showing the EU-ETD worked example below.
        </div>
      )}

      <ImpactRoom scenario={scenario} />

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          Worked examples: EU-ETD (proposed, 2028), plus the France ban and Denmark cap that are in
          force now. Spain&apos;s cap and US tariffs model separately — coming.
        </span>
        <span className="flex items-center gap-3">
          <Link href={`/onepager?event=${scenario.eventId}`} className="underline underline-offset-2">
            forward-ready one-pager →
          </Link>
          <Link href="/" className="underline underline-offset-2">
            ← back to the pulse
          </Link>
        </span>
      </div>
    </div>
  );
}
