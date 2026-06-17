import Link from "next/link";
import { CONTACT } from "@/lib/contact";

export const metadata = { title: "Transparency — Varsel for STG" };

function Dot({ color }: { color: string }) {
  return <span className="mr-2 inline-block size-2.5 rounded-full align-middle" style={{ background: color }} />;
}

export default function Transparency() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-medium tracking-tight">What&apos;s real, what&apos;s not</h1>
        <p className="mt-2 text-muted-foreground">
          Varsel for STG is a prototype. Its whole credibility rests on being honest about where every
          number comes from. So here it is, in full. Nothing on this site is STG internal data —
          it is built from STG&apos;s published disclosures and public regulatory texts, plus
          clearly-marked illustrative figures.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-medium tracking-tight">About this prototype</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Varsel for STG is a working prototype — a regulation→P&amp;L early-warning room that turns a live
          tobacco or nicotine regulation into a DKK impact band on STG&apos;s published footprint.
          One map, seven department lenses, five live public-data feeds. It was built by{" "}
          {CONTACT.name} ({CONTACT.org}) as an independent demonstration: it shows the <em>shape</em>{" "}
          of the impact on public data, so the &quot;plug in your real numbers&quot; story can be
          judged before any data agreement. It is <strong>not</strong> investor-facing material, not
          affiliated with or endorsed by STG, and holds no STG internal data.
        </p>
        <p className="text-sm leading-relaxed">
          Questions, or want it run on STG&apos;s actual figures? Email{" "}
          <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-2">{CONTACT.email}</a>
          {CONTACT.phone ? ` or call ${CONTACT.phone}` : ""}.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium tracking-tight">The three flags you&apos;ll see</h2>
        <ul className="flex flex-col gap-3 text-sm">
          <li className="rounded-lg border border-border p-3">
            <Dot color="var(--prov-public)" />
            <span className="font-medium">Public</span> — published or scrapable today. Source:
            STG&apos;s Annual Report 2025, st-group.com, public regulatory texts (EUR-Lex, national
            gazettes), and public e-commerce. Cited on the marker.
          </li>
          <li className="rounded-lg border border-border p-3">
            <Dot color="var(--prov-agent)" />
            <span className="font-medium">Agent-fetched</span> — public data an AI agent pulls on a
            schedule and keeps current: STG&apos;s SuccessFactors careers feed (open roles), ECB FX
            rates, Open-Meteo weather over leaf regions, Freightos freight rates, competitor
            e-commerce. Real, just not hand-entered.
          </li>
          <li className="rounded-lg border border-border p-3">
            <Dot color="var(--prov-internal)" />
            <span className="font-medium">Needs STG data</span> — would be precise with STG&apos;s
            own numbers behind a data agreement (e.g. per-site turnover, SKU volumes). Shown as
            illustrative until then.
          </li>
          <li className="rounded-lg border border-border p-3">
            <Dot color="var(--prov-fab)" />
            <span className="font-medium">Illustrative (marked *)</span> — plausible figures we
            fabricated to show the app&apos;s ability, because the real data isn&apos;t public.
            Always asterisked, never presented as fact, and likely obtainable in a real engagement.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-medium tracking-tight">Honest by design</h2>
        <ul className="ml-5 list-disc text-sm leading-relaxed text-muted-foreground">
          <li>Every regulatory figure cites its source; where a source is silent, the model says so rather than guessing.</li>
          <li>Derived figures (e.g. a France-specific revenue line STG doesn&apos;t publish) are labelled analyst derivations, never &quot;STG&apos;s number.&quot;</li>
          <li>Estimates are shown as bands, not false-precision point numbers.</li>
          <li>
            This is internal decision-support / scenario prep — not investor-facing material. We
            deliberately generate no earnings-facing copy (EU MAR).
          </li>
          <li>
            The visual language (warm palette + serif) is informed by STG&apos;s own public brand,
            as a courtesy — we deliberately do <em>not</em> use STG&apos;s logo or lion mark, and
            Varsel for STG is not affiliated with or endorsed by STG.
          </li>
          <li>
            Curated data is current as of June 2026; the live feeds (FX, careers, weather, climate,
            freight) refresh on their own schedule. The full fact base lives in the project&apos;s
            <code className="mx-1 rounded bg-secondary px-1 py-0.5 text-[12px]">stg-facts.md</code>.
          </li>
        </ul>
      </section>

      <Link href="/" className="text-sm underline underline-offset-2">← back to the pulse</Link>
    </div>
  );
}
