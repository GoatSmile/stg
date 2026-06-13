import Link from "next/link";

export const metadata = { title: "Pouch Radar — Varsel" };

export default function Radar() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Pouch Radar</h1>
        <p className="mt-1 text-muted-foreground">The live competitive drill-down behind the Sales lens.</p>
      </div>
      <div className="rounded-lg border border-dashed border-border p-6 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">Coming next (Phase 4).</p>
        <p>
          A daily index of XQS vs ZYN vs Velo across Sweden and the UK — price-per-pouch, new-SKU
          launches, and bestseller rank as an online share proxy — crawled from public e-commerce
          (Haypp sitemaps + nicotine-pouches.org), subject to a per-retailer terms-of-service check.
        </p>
      </div>
      <Link href="/" className="text-sm underline underline-offset-2">← back to the pulse</Link>
    </div>
  );
}
