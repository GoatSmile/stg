import { PulseDashboard } from "@/components/map/PulseDashboard";
import { RadarSignals } from "@/components/RadarSignals";
import { HomeEnginePreview } from "@/components/HomeEnginePreview";
import { HindsightCard } from "@/components/HindsightCard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lens?: string }>;
}) {
  const { lens } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          What the next regulation is worth to STG&apos;s P&amp;L — sized in kroner
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Every signal sits on Scandinavian Tobacco Group&apos;s own published footprint, built on
          public data only — and every number cites its source, or says so when it can&apos;t. The
          regulatory threat is worked all the way down to a DKK EBITDA band you can argue with; the
          rest of the risk surface plugs into the same engine. Internal scenario prep, never
          investor-facing.
        </p>
      </div>

      {/* The engine leads — the one differentiated thing, sized and live (drag a real assumption). */}
      <HomeEnginePreview />

      {/* the "before it lands" proof — lead time inherent in the public record */}
      <HindsightCard />

      <RadarSignals />

      {/* breadth, second: the same engine extended across the rest of the risk surface */}
      <div id="map" className="flex scroll-mt-4 flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-border pt-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            The same engine, across STG&apos;s whole risk surface
          </span>
          <span className="text-[11px] text-muted-foreground">
            the same DKK discipline, extended across the surface
          </span>
        </div>
        <PulseDashboard key={lens ?? "default"} initialLensId={lens} />
      </div>
    </div>
  );
}
