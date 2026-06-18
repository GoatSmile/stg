import { redirect } from "next/navigation";
import { CONTACT } from "@/lib/contact";

export const metadata = { title: "Varsel for STG — private preview" };

export default async function Gate({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  // No password configured → nothing to gate; don't show a wall.
  if (!process.env.SITE_PASSWORD) redirect("/");

  const sp = await searchParams;
  const from = sp.from && sp.from.startsWith("/") && !sp.from.startsWith("//") ? sp.from : "/";
  const error = sp.error === "1";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
        <div className="mb-3 flex items-center gap-2.5">
          <span aria-hidden className="h-5 w-[3px] rounded-full bg-primary" />
          <span className="font-heading text-xl font-medium tracking-tight">Varsel for STG</span>
        </div>

        <p className="text-sm leading-relaxed">
          What the next regulation is worth to your P&amp;L — the regulatory threat sized to a DKK band
          on Scandinavian Tobacco Group&apos;s own published footprint, on public data only. A model
          you can argue with, built to be discussed internally.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          This is a private preview. Enter the password from your invitation to continue.
        </p>

        <form action="/api/gate" method="POST" className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="from" value={from} />
          <input
            type="password"
            name="password"
            autoFocus
            required
            placeholder="Password"
            aria-label="Password"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {error && <p className="text-sm text-destructive">Incorrect password — please try again.</p>}
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Enter
          </button>
        </form>

        <p className="mt-4 border-t border-border pt-3 text-[11px] leading-snug text-muted-foreground">
          An independent prototype by {CONTACT.name} / valent.dk — not affiliated with or endorsed by
          STG. Public data only, no STG figures; internal scenario-prep, not for external distribution.
          Questions? <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-2">{CONTACT.email}</a>.
        </p>
      </div>
    </div>
  );
}
