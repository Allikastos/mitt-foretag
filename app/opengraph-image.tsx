import { ImageResponse } from "next/og";

export const alt = "Altura Nova - din personliga webbstudio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#f3f0e8",
        color: "#173f35",
        display: "flex",
        height: "100%",
        padding: 48,
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#173f35",
          borderRadius: 42,
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "54px 64px",
          position: "relative",
        }}
      >
        <div style={{ color: "#f3b89f", display: "flex", fontSize: 23, fontWeight: 700, letterSpacing: 7, textTransform: "uppercase" }}>
          Altura Nova
        </div>
        <div style={{ color: "white", display: "flex", flexDirection: "column", maxWidth: 850 }}>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 700, letterSpacing: -4, lineHeight: 1.02 }}>
            Din personliga webbstudio
          </div>
          <div style={{ color: "rgba(255,255,255,.68)", display: "flex", fontSize: 28, lineHeight: 1.35, marginTop: 24 }}>
            Moderna hemsidor för företag, personligt framtagna till ett tydligt fast pris.
          </div>
        </div>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <div style={{ color: "rgba(255,255,255,.52)", display: "flex", fontSize: 21 }}>alturanova.se</div>
          <div style={{ background: "#e86f44", borderRadius: 999, display: "flex", height: 64, width: 176 }} />
        </div>
        <div style={{ border: "22px solid rgba(243,184,159,.13)", borderRadius: "50%", display: "flex", height: 280, position: "absolute", right: -80, top: -110, transform: "rotate(-12deg)", width: 420 }} />
      </div>
    </div>,
    size,
  );
}
