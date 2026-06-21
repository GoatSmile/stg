// Branded 404 — renders inside the root layout, so a stale/typo'd forwarded path
// keeps the masthead, banner and disclaimers instead of Next's bare 404.
import Link from "next/link";
import { CONTACT } from "@/lib/contact";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 py-16">
      <span aria-hidden className="h-6 w-[3px] rounded-full bg-primary" />
      <h1 className="font-heading text-2xl font-medium tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        That link doesn&apos;t point to a live page. The risk map, the Impact Room and Pouch Radar are
        all reachable from the start page.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Back to start
      </Link>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Varsel for STG — an independent prototype by {CONTACT.name} / valent.dk, not affiliated with or
        endorsed by STG. Public data only.
      </p>
    </div>
  );
}
