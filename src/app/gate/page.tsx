import { redirect } from "next/navigation";

export const metadata = { title: "Varsel — private preview" };

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
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <div className="mb-1 flex items-center gap-2.5">
          <span aria-hidden className="h-5 w-[3px] rounded-full bg-primary" />
          <span className="font-heading text-xl font-medium tracking-tight">Varsel</span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          This preview is private. Enter the password from your invitation to continue.
        </p>
        <form action="/api/gate" method="POST" className="flex flex-col gap-3">
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
        <p className="mt-4 text-[11px] leading-snug text-muted-foreground">
          Varsel — a prototype by Nazar Taras / valent.dk. Built on public data; internal
          scenario-prep, not investor-facing.
        </p>
      </div>
    </div>
  );
}
