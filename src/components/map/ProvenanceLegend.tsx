"use client";

import Link from "next/link";
import { type Lens, provenanceCounts, provenanceMeta, type Provenance } from "@/lib/lenses";

const order: Provenance[] = ["public", "agent", "internal", "fabricated"];

export function ProvenanceLegend({ lens }: { lens: Lens }) {
  const counts = provenanceCounts(lens);
  const total = lens.markers.length;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">
        {total} marker{total === 1 ? "" : "s"}:
      </span>
      {order.map((p) => {
        const meta = provenanceMeta[p];
        if (!counts[p]) return null;
        return (
          <span key={p} className="inline-flex items-center gap-1.5" title={meta.description}>
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: meta.color }}
              aria-hidden="true"
            />
            {counts[p]} {meta.label}
          </span>
        );
      })}
      <Link href="/transparency" className="ml-auto underline underline-offset-2 hover:text-foreground">
        How we source this →
      </Link>
    </div>
  );
}
