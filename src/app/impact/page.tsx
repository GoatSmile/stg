import Link from "next/link";

export const metadata = { title: "Impact Room — Varsel" };

export default function Impact() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Impact Room</h1>
        <p className="mt-1 text-muted-foreground">
          The regulation → P&amp;L drill-down behind the Regulatory and Finance lenses.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-border p-6 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">Coming next (Phase 2).</p>
        <p>
          Turns the EU&apos;s proposed tobacco-tax revision (COM(2025) 580) into a DKK EBITDA band
          on the exposed share of STG&apos;s cigar &amp; pipe base, with editable elasticity and
          pass-through sliders, citation rails, and visible abstention where a source is silent.
          The design is specced in <code className="rounded bg-secondary px-1 py-0.5 text-[12px]">docs/mockups/README.md</code>.
        </p>
      </div>
      <Link href="/" className="text-sm underline underline-offset-2">← back to the pulse</Link>
    </div>
  );
}
