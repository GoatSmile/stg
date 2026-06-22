import Link from "next/link";
import { CalendarClock, ArrowRight } from "lucide-react";
import data from "@/data/hindsight.json";
import { CitationChip } from "@/components/impact/CitationChip";
import { HindsightTimeline } from "@/components/HindsightTimeline";

type HindsightItem = {
  eventId: string;
  label: string;
  shortLabel?: string;
  signalDate: string;
  signalWhat: string;
  effectDate: string;
  effectWhat: string;
  leadLabel: string;
  status: string;
  sourceRef: string;
  note?: string;
};

const items = (data as { items: HindsightItem[] }).items;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-09-05" → "Sep 2025"; a bare year ("2028") passes through. */
function monthYear(d: string): string {
  const parts = d.split("-");
  if (parts.length < 2) return d;
  const m = MONTHS[Number(parts[1]) - 1] ?? "";
  return `${m} ${parts[0]}`.trim();
}

// The "before it lands" proof: each in-force / proposed measure was in the public record months
// ahead of its effect date. Honest framing — this is the lead time inherent in the public record
// Varsel reads, not a claim that the tool ran historically. Dates are public + cited.
export function HindsightCard() {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <CalendarClock className="size-4 text-primary" aria-hidden="true" />
        Before it lands — the lead time is in the public record
      </div>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Each of these was public — a decree, an adopted rule, a tabled EU proposal — months before it took
        effect. Varsel reads that same public record, so the exposure surfaces when a rule appears, not when
        it hits the P&amp;L.
      </p>

      <HindsightTimeline items={items} />

      <div className="mt-1 flex flex-col divide-y divide-border">
        {items.map((it) => {
          const proposed = /propos/i.test(it.status);
          return (
            <Link
              key={it.eventId}
              href={`/impact?event=${it.eventId}`}
              className="group flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 hover:bg-accent/40"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[13px] font-medium">{it.label}</span>
                <span
                  className={
                    proposed
                      ? "rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                      : "rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                  }
                >
                  {it.status}
                </span>
                <CitationChip sourceRef={it.sourceRef} />
                <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[12px] font-medium tabular-nums">
                  {it.leadLabel}
                </span>
              </div>

              {/* signal → effect mini-timeline */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
                <span className="tabular-nums">
                  <span className="font-medium text-foreground">{monthYear(it.signalDate)}</span> · {it.signalWhat}
                </span>
                <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  <span className="font-medium text-foreground">{monthYear(it.effectDate)}</span> · {it.effectWhat}
                </span>
              </div>

              {it.note && <p className="text-[11px] leading-snug text-muted-foreground">{it.note}</p>}
            </Link>
          );
        })}
      </div>

      <p className="text-[11px] leading-snug text-muted-foreground">
        Lead time = the gap between a measure entering the public record and taking effect. Varsel didn&apos;t
        run historically — this shows the head-start the public record gives a monitor like this. Every date is
        public and cited.
      </p>
    </section>
  );
}
