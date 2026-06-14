import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Editorial heritage serif for the masthead + section headings (see globals.css).
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Varsel — STG operations pulse",
  description:
    "A department-switchable map of Scandinavian Tobacco Group's footprint. Built on public data; some figures are illustrative.",
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
          <header className="border-b border-border">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="flex items-center gap-2.5">
                <span aria-hidden className="h-5 w-[3px] rounded-full bg-primary" />
                <span className="font-heading text-xl font-medium tracking-tight">Varsel</span>
                <span className="text-xs text-muted-foreground">STG operations pulse</span>
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

          <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
            Varsel — a prototype by Nazar Taras / valent.dk. Internal scenario-prep, not
            investor-facing. Public data only; illustrative figures marked *.
          </footer>
        </div>
      </body>
    </html>
  );
}
