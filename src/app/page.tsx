import { PulseDashboard } from "@/components/map/PulseDashboard";
import { RadarSignals } from "@/components/RadarSignals";

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
          Where the next surprise to STG&apos;s P&amp;L comes from — sized in kroner, before it lands
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          One live map of STG&apos;s whole risk surface — regulation, FX, leaf and climate, the SAP
          rollout, pouch competition, hiring — each a tracked signal on Scandinavian Tobacco
          Group&apos;s own published footprint. The regulatory threat is worked all the way down to a
          DKK EBITDA band — a model you can argue with: every number cites its source, or says so
          when it can&apos;t — the template the other surfaces plug into next. Built on public data
          only, framed strictly as internal scenario prep. Click the EU tobacco-tax threat to open
          the worked example and watch the band move on your own assumptions.
        </p>
      </div>

      <RadarSignals />

      <div id="map" className="flex scroll-mt-4 flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-border pt-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            The live map — by department
          </span>
          <span className="text-[11px] text-muted-foreground">switch the lens; it re-skins for each team</span>
        </div>
        <PulseDashboard key={lens ?? "default"} initialLensId={lens} />
      </div>
    </div>
  );
}
