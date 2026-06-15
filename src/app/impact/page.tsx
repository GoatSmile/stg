import Link from "next/link";
import { ImpactRoom } from "@/components/impact/ImpactRoom";
import { getScenario, isModeled, unmodeled, scenariosAsOf } from "@/lib/impact-data";

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

      {requestedUnmodeled && (
        <div className="rounded-md border border-dashed border-border px-3 py-2 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{requestedUnmodeled.label}</span> isn&apos;t
          modeled yet ({requestedUnmodeled.why}). Showing the EU-ETD worked example below.
        </div>
      )}

      <ImpactRoom scenario={scenario} />

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          Worked example: EU-ETD. Other tracked threats (France ban, DK cap, ES cap, US tariffs)
          model separately — coming.
        </span>
        <Link href="/" className="underline underline-offset-2">
          ← back to the pulse
        </Link>
      </div>
    </div>
  );
}
