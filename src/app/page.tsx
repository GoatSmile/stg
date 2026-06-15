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
          What a regulation is worth to STG — in kroner, on its own footprint
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Varsel turns a live tobacco or nicotine regulation into a DKK EBITDA impact band on
          Scandinavian Tobacco Group&apos;s published footprint — built only on public data, framed
          strictly as internal scenario prep. One map, seven departments; click a threat to open the
          worked example and watch the band move on your own assumptions.
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
