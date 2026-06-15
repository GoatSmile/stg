import Link from "next/link";
import { ArrowRight } from "lucide-react";
import signalsData from "@/data/signals.json";

type Signal = {
  id: string;
  tag: "regulatory" | "growth" | "operations";
  title: string;
  status: string;
  date: string;
  source: string;
  why: string;
  href: string;
  cta: string;
};

const TAG_CLS: Record<Signal["tag"], string> = {
  regulatory: "bg-primary/10 text-primary",
  growth: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  operations: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const TAG_LABEL: Record<Signal["tag"], string> = {
  regulatory: "regulatory",
  growth: "growth",
  operations: "operations",
};

export function RadarSignals() {
  const { signals, asOf } = signalsData as { signals: Signal[]; asOf: string };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-heading text-xl font-medium tracking-tight">On the radar</h2>
        <span className="text-[11px] text-muted-foreground">
          three signals on STG&apos;s footprint · curated, dated, public sources · as of {asOf}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {signals.map((s, i) => (
          <Link
            key={s.id}
            href={s.href}
            className={
              "group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 " +
              (i === 0 ? "border-primary/40" : "border-border")
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TAG_CLS[s.tag]}`}>
                {TAG_LABEL[s.tag]}
              </span>
              <span className="text-[11px] text-muted-foreground">{s.status}</span>
            </div>

            <h3 className="text-[15px] font-medium leading-snug">{s.title}</h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{s.why}</p>

            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground">{s.source}</span>
              <span className="inline-flex items-center gap-1 text-[13px] font-medium text-primary">
                {s.cta}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
