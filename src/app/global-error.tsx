"use client";

// Last-resort boundary: only fires when the ROOT layout itself throws, so it
// replaces the whole document and does NOT get the layout chrome or globals.css.
// Everything here is inline-styled (brand palette: parchment / claret / espresso)
// so it renders correctly even if the stylesheet never loaded — the truly
// bulletproof floor for a forwarded link opened cold.
import { CONTACT } from "@/lib/contact";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdfbf6",
          color: "#3a2e27",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: 520, padding: "48px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ width: 4, height: 28, background: "#950b31", borderRadius: 4 }} />
            <span style={{ fontSize: 22, fontWeight: 600 }}>Varsel for STG</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 12px" }}>Something went wrong</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: "#6b5d52", margin: "0 0 24px" }}>
            A temporary error stopped the page from loading. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#950b31",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "9px 18px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <p style={{ fontSize: 12, color: "#8a7d70", marginTop: 32, lineHeight: 1.55 }}>
            An independent prototype by {CONTACT.name} / valent.dk — not affiliated with or endorsed by
            STG. Public data only; internal scenario-prep, not investor-facing.{" "}
            <a href={`mailto:${CONTACT.email}`} style={{ color: "#950b31" }}>
              {CONTACT.email}
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
