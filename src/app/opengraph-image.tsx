import { ImageResponse } from "next/og";

export const alt = "Varsel for STG — where the next surprise to your P&L comes from, sized in kroner";
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
            Where the next surprise to your P&amp;L comes from
          </div>
          <div style={{ fontSize: "27px", color: "#6b5d52", maxWidth: "920px", lineHeight: 1.35 }}>
            One live map of STG&apos;s risk surface — regulation, FX, leaf, the SAP rollout, pouches, hiring — the regulatory threat sized to a DKK band. Public data only.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "22px", color: "#8a7d70" }}>
          valent.dk · internal scenario-prep, not investor-facing
        </div>
      </div>
    ),
    { ...size },
  );
}
