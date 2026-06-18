import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CONTACT } from "@/lib/contact";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Editorial heritage serif for the masthead + section headings (see globals.css).
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://stg-azure.vercel.app"),
  title: "Varsel for STG — a public-data regulatory risk model, by valent.dk",
  description:
    "An independent valent.dk prototype that sizes regulatory and market risk on Scandinavian Tobacco Group's own published footprint — the regulatory threat worked down to a DKK EBITDA band. Public data only; internal scenario prep, not investor-facing. Not affiliated with or endorsed by STG.",
  openGraph: {
    title: "Varsel for STG — a public-data regulatory risk model, by valent.dk",
    description:
      "An independent prototype sizing regulatory and leaf risk on STG's own published footprint, in DKK — public data only, internal scenario prep. Not affiliated with or endorsed by STG.",
    siteName: "Varsel for STG",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const nav = [
  { href: "/", label: "Pulse" },
  { href: "/impact", label: "Impact Room" },
  { href: "/radar", label: "Pouch Radar" },
  { href: "/transparency", label: "Transparency" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before paint so there's no flash of the wrong mode. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('varsel-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-border print:hidden">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="flex items-center gap-2.5">
                <span aria-hidden className="h-5 w-[3px] rounded-full bg-primary" />
                <span className="font-heading text-xl font-medium tracking-tight">Varsel for STG</span>
                <span className="text-xs text-muted-foreground">public-data risk model</span>
              </Link>
              <div className="flex items-center gap-1">
                <nav className="flex gap-1 text-sm">
                  {nav.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      className="rounded-md px-2.5 py-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {n.label}
                    </Link>
                  ))}
                </nav>
                <ThemeToggle />
              </div>
            </div>
            <div className="bg-secondary/60 px-4 py-1.5 text-center text-[11px] text-muted-foreground">
              Built on public data · zero STG internal data · some figures are illustrative (marked *) ·{" "}
              <Link href="/transparency" className="underline underline-offset-2">
                how we source everything
              </Link>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

          <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground print:hidden">
            Varsel for STG — a prototype by {CONTACT.name} / valent.dk ·{" "}
            <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-2">
              {CONTACT.email}
            </a>
            {CONTACT.phone ? ` · ${CONTACT.phone}` : ""}. Internal scenario-prep, not
            investor-facing; public data only, illustrative figures marked *.
          </footer>
        </div>
      </body>
    </html>
  );
}
