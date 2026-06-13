import { PulseDashboard } from "@/components/map/PulseDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">The pulse of the business</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          One map of Scandinavian Tobacco Group&apos;s global footprint — switch the lens and it
          re-skins for each department. Live where the data is public or agent-fetchable;
          illustrative (marked *) where it needs STG&apos;s own numbers.
        </p>
      </div>
      <PulseDashboard />
    </div>
  );
}
