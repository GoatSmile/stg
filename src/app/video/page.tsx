import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// The outreach walkthrough video, self-hosted so it opens on corporate networks
// that block consumer file-sharing hosts (the Google Drive link in the original
// email didn't open at STG). Deliberately ungated (proxy ALWAYS_ALLOW, like
// /opengraph-image): the video is the forwardable artifact — the app behind it
// stays behind the gate. The root-layout UsageTracker logs views/dwell here too.
const TITLE = "Varsel for STG — the walkthrough video";
const DESCRIPTION =
  "A short walkthrough of Varsel for STG: what a tobacco regulation could mean for the P&L, sized on public data. Independent prototype by valent.dk — not affiliated with or endorsed by STG.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, siteName: "Varsel for STG", type: "video.other" },
  twitter: { card: "summary_large_image" },
};

export default function VideoPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 py-4">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          The walkthrough — 2¾ minutes, no deck
        </div>
        <h1 className="mt-1 font-heading text-2xl font-medium tracking-tight">
          What a regulation on the horizon could mean for the P&amp;L — shown, not described
        </h1>
      </div>

      <video
        src="/varsel-for-stg.mp4"
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-lg border border-border bg-black"
      >
        Your browser can&apos;t play this video inline.{" "}
        <a href="/varsel-for-stg.mp4" className="underline">Download it instead.</a>
      </video>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Everything shown is built from Scandinavian Tobacco Group&apos;s published filings and public
        regulatory texts — nothing internal. Figures are banded ranges that cite their public source,
        or say so plainly when a source doesn&apos;t state one. Internal scenario-prep only, never
        investor-facing. An independent prototype by valent.dk, not affiliated with or endorsed by STG.
      </p>

      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
      >
        Open the live prototype <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
