import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import {
  pouchRadar,
  pricesForMarket,
  maxPriceDkk,
  isStgBrand,
  eventsByDate,
  type RadarEventType,
} from "@/lib/radar";
import { CitationChip } from "@/components/impact/CitationChip";

export const metadata = { title: "Pouch Radar — Varsel for STG" };

const KPIS = [
  { label: "XQS share, Sweden", value: "13.6%", sub: "from 7.8% (2024) · #2" },
  { label: "XQS organic growth", value: "+55%", sub: "FY2025 (Q4 +87%)" },
  { label: "Focus markets", value: "SE · UK", sub: "Focus2030 — pouches only" },
  { label: "Pouch ambition", value: "DKK 1bn+", sub: "“larger among the smaller players”" },
];

const EVENT_STYLE: Record<RadarEventType, { label: string; cls: string }> = {
  compliance: { label: "compliance", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  launch: { label: "launch", cls: "bg-primary/10 text-primary" },
  share: { label: "share", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  distribution: { label: "distribution", cls: "bg-secondary text-muted-foreground" },
};

export default function Radar() {
  const max = maxPriceDkk();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="font-heading text-3xl font-medium tracking-tight">Pouch Radar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          XQS vs VELO vs ZYN across STG&apos;s pouch focus markets — price, strength and online
          rank, plus the launch &amp; compliance feed. As of {pouchRadar.asOf}.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[13px] leading-snug">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>
          <span className="font-medium">v1 curated snapshot.</span> Brand/market structure and XQS
          shares are public/sourced; the per-can <span className="text-amber-600 dark:text-amber-400">prices and online ranks are illustrative*</span>{" "}
          until the first ToS-permitted crawl. The crawler (<code className="rounded bg-secondary px-1 py-0.5 text-[12px]">scripts/crawl-radar.ts</code>)
          is built and gated on a per-retailer terms-of-service read.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-md bg-secondary px-3 py-2.5">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-0.5 text-xl font-medium tabular-nums">{k.value}</div>
            <div className="text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      {pouchRadar.markets.map((m) => {
        const prices = pricesForMarket(m.code);
        return (
          <div key={m.code} className="flex flex-col gap-2.5 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="text-base font-medium">{m.name}</h2>
              {m.xqsShare && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                  XQS {m.xqsShare}
                </span>
              )}
              <span className="text-[12px] text-muted-foreground">{m.note}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {prices.map((p) => {
                const stg = isStgBrand(p.brand);
                const width = Math.max(8, Math.round((p.priceDkk / max) * 100));
                return (
                  <div key={p.brand} className="flex items-center gap-3">
                    <span className={`w-28 shrink-0 text-[13px] ${stg ? "font-semibold text-primary" : ""}`}>
                      {p.brand}
                      {stg && <span className="ml-1 text-[10px] font-normal text-muted-foreground">STG</span>}
                    </span>
                    <div className="relative h-5 flex-1 rounded bg-secondary">
                      <div
                        className={`flex h-5 items-center justify-end overflow-hidden rounded pr-2 text-[11px] whitespace-nowrap tabular-nums ${stg ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-foreground"}`}
                        style={{ width: `${width}%` }}
                      >
                        {p.priceLocal}
                      </div>
                    </div>
                    <span className="w-40 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      #{p.rank} · {p.strengthMg} mg · {p.flavours} flavours
                    </span>
                  </div>
                );
              })}
            </div>
            <span className="text-[11px] text-muted-foreground">
              <span className="text-amber-600 dark:text-amber-400">*</span> prices ≈ DKK-converted, and
              online ranks, are illustrative until the live crawl.
            </span>
          </div>
        );
      })}

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-medium">Launches &amp; compliance</h2>
        {eventsByDate.map((e, i) => {
          const s = EVENT_STYLE[e.type];
          return (
            <div key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px]">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${s.cls}`}>{s.label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{e.date}</span>
              <span className="text-xs font-medium">{e.market}</span>
              <span className="flex-1">{e.text}</span>
              <CitationChip sourceRef={e.sourceRef} />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/40 p-4 text-[13px]">
        <h3 className="text-sm font-medium">Sources &amp; terms</h3>
        {pouchRadar.sources.map((src) => (
          <div key={src.name} className="leading-snug">
            <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium underline underline-offset-2">
              {src.name} <ExternalLink className="size-3" aria-hidden="true" />
            </a>{" "}
            — {src.use}. <span className="text-muted-foreground">{src.tos}</span>
          </div>
        ))}
        <p className="text-[12px] text-muted-foreground">
          Internal scenario prep, not investor-facing. Public e-commerce data only; the crawl is
          gated on a per-retailer ToS read (build-plan §4).
        </p>
      </div>

      <Link href="/" className="text-sm underline underline-offset-2">
        ← back to the pulse
      </Link>
    </div>
  );
}
