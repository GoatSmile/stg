"use client";

// Route-segment error boundary. Renders INSIDE the root layout, so it inherits
// the masthead, the public-data banner and the footer disclaimers — a thrown
// render error stays branded instead of dropping to Next's naked 500 page.
import Link from "next/link";
import { CONTACT } from "@/lib/contact";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 py-16">
      <span aria-hidden className="h-6 w-[3px] rounded-full bg-primary" />
      <h1 className="font-heading text-2xl font-medium tracking-tight">Something went wrong on this page</h1>
      <p className="text-sm text-muted-foreground">
        A temporary error stopped this view from rendering. The figures behind it are unchanged — try
        again, or head back to the start.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Back to start
        </Link>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Varsel for STG is an independent prototype by {CONTACT.name} / valent.dk — not affiliated with
        or endorsed by STG. Public data only.{" "}
        <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-2">
          {CONTACT.email}
        </a>
      </p>
    </div>
  );
}
