import { ImageResponse } from "next/og";

export const alt = "Varsel for STG — a public-data regulatory risk model, by valent.dk";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded share card for forwarded links (parchment + claret + espresso). Uses
// the default font (no fetch dependency); the brand reads through the palette.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdfbf6",
          color: "#3a2e27",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ width: "12px", height: "60px", background: "#950b31", borderRadius: "6px" }} />
          <div style={{ fontSize: "60px", fontWeight: 700, letterSpacing: "-0.01em" }}>Varsel for STG</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "54px", fontWeight: 700, lineHeight: 1.1, maxWidth: "960px" }}>
            Regulatory and leaf risk on STG&apos;s footprint — sized in DKK
          </div>
          <div style={{ fontSize: "27px", color: "#6b5d52", maxWidth: "920px", lineHeight: 1.35 }}>
            An independent valent.dk prototype: the regulatory threat worked down to a DKK EBITDA band on STG&apos;s own published footprint. Public data only, internal scenario-prep.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "22px", color: "#8a7d70" }}>
          valent.dk · not affiliated with or endorsed by STG · public data only
        </div>
      </div>
    ),
    { ...size },
  );
}
