import Link from "next/link";
import { Info, ExternalLink, ShieldCheck } from "lucide-react";
import {
  pouchRadar,
  pricesForMarket,
  maxPriceDkk,
  maxRepStrengthMg,
  pricePerMg,
  isStgBrand,
  eventsByDate,
  trackedBrands,
  brandWithOwner,
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
  const maxStrength = maxRepStrengthMg();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="font-heading text-3xl font-medium tracking-tight">Pouch Radar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          XQS vs VELO, ZYN &amp; Nordic Spirit across STG&apos;s pouch focus markets — sourced
          strength, flavour &amp; per-can price, the derived price-per-mg, plus the launch &amp;
          compliance feed. As of {pouchRadar.asOf}.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-[13px] leading-snug">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span>
          <span className="font-medium">v1 curated snapshot, {pouchRadar.asOf}.</span> Brand/market
          structure, XQS shares, <span className="font-medium text-foreground">strengths, flavours, pack counts</span>{" "}
          and <span className="font-medium text-foreground">per-can prices</span> are all public/sourced — a citation
          per row. <span className="text-foreground">UK, Denmark &amp; Sweden prices were each independently
          cross-verified</span> against a second shop. Prices are single-can <span className="font-medium text-foreground">list</span>{" "}
          prices and reflect one shop&apos;s listing (multibuy is cheaper; cross-shop variation ~±10%); DKK uses ECB
          cross-rates (GBP 8.72, SEK 0.66). Price-per-mg is derived = price ÷ (pouches × mg). This was an
          owner-cleared one-time snapshot — the live crawler
          (<code className="rounded bg-secondary px-1 py-0.5 text-[12px]">scripts/crawl-radar.ts</code>) stays gated.
        </span>
      </div>

      <p className="text-[12px] leading-snug text-muted-foreground">
        <span className="font-medium text-foreground">Tracked:</span>{" "}
        {trackedBrands.map(brandWithOwner).join(", ")}.{" "}
        <span className="font-medium text-foreground">Known gaps, disclosed:</span>{" "}
        Nordic Spirit&apos;s Denmark availability post-cap is unconfirmed, so it&apos;s left out of the
        DK board rather than guessed; On! (Altria) and smaller brands aren&apos;t tracked yet.
      </p>

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
          <div key={m.code} className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="text-base font-medium">{m.name}</h2>
              {m.xqsShare && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                  XQS {m.xqsShare}
                </span>
              )}
              <span className="text-[12px] text-muted-foreground">{m.note}</span>
            </div>

            {/* real, sourced block — strength + flavour */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Strength &amp; flavour · sourced
              </div>
              {prices.map((p) => {
                const stg = isStgBrand(p.brand);
                const w = Math.max(6, Math.round((p.repStrengthMg / maxStrength) * 100));
                return (
                  <div key={p.brand} className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                    <span className={`w-28 shrink-0 text-[13px] ${stg ? "font-semibold text-primary" : ""}`}>
                      {p.brand}
                      {stg && <span className="ml-1 text-[10px] font-normal text-muted-foreground">STG</span>}
                    </span>
                    <div className="h-2.5 w-20 shrink-0 overflow-hidden rounded bg-secondary sm:w-28" title={`representative ${p.repStrengthMg} mg/pouch`}>
                      <div
                        className={`h-2.5 rounded ${stg ? "bg-primary" : "bg-muted-foreground/40"}`}
                        style={{ width: `${w}%` }}
                      />
                    </div>
                    <span className="text-[12px] tabular-nums">{p.strengthMg}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      · {p.flavourCount != null && <span className="tabular-nums">≈{p.flavourCount} flavours · </span>}
                      {p.flavourStyle}
                      <CitationChip sourceRef={p.specSource} />
                    </span>
                  </div>
                );
              })}
            </div>

            {/* price & price-per-mg — real, sourced snapshot */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Price &amp; price-per-mg · sourced · single-can list
              </div>
              {prices.map((p) => {
                const stg = isStgBrand(p.brand);
                const width = Math.max(8, Math.round((p.priceDkk / max) * 100));
                const ppm = pricePerMg(p);
                return (
                  <div key={p.brand} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3">
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
                      <span className="w-28 shrink-0 text-right text-[12px] font-medium tabular-nums">
                        {ppm != null ? ppm.toFixed(2) : "—"}
                        <span className="text-[10px] font-normal text-muted-foreground"> DKK/mg</span>
                      </span>
                    </div>
                    <div className="ml-[7.75rem] flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span>{p.pricedSku}</span>
                      {p.priceVerified && (
                        <span
                          className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400"
                          title="price independently cross-verified against a second shop"
                        >
                          <ShieldCheck className="size-3" aria-hidden="true" /> verified
                        </span>
                      )}
                      <CitationChip sourceRef={p.priceSource} />
                      {p.priceNote && (
                        <span className="text-amber-600 dark:text-amber-400">— {p.priceNote}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
          Internal scenario prep, not investor-facing. Public data only; the price crawl is gated on a
          per-retailer ToS read (build-plan §4).
        </p>
      </div>

      <Link href="/" className="text-sm underline underline-offset-2">
        ← back to the pulse
      </Link>
    </div>
  );
}
