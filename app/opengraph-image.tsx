import { ImageResponse } from "next/og";

export const alt = "Jurnal.in — IELTS writing practice, together";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SVG_LOGO = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="8" width="16" height="22" rx="2" fill="#1d2b1f"/>
  <rect x="21" y="8" width="16" height="22" rx="2" fill="#1d2b1f"/>
  <rect x="6" y="12" width="10" height="1.5" rx="0.75" fill="#f7f0e6"/>
  <rect x="6" y="16" width="10" height="1.5" rx="0.75" fill="#f7f0e6"/>
  <rect x="6" y="20" width="8" height="1.5" rx="0.75" fill="#f7f0e6"/>
  <rect x="24" y="12" width="10" height="1.5" rx="0.75" fill="#f7f0e6"/>
  <rect x="24" y="16" width="10" height="1.5" rx="0.75" fill="#f7f0e6"/>
  <rect x="24" y="20" width="8" height="1.5" rx="0.75" fill="#f7f0e6"/>
  <path d="M15 27 L15 37 L20 33 L25 37 L25 27 Z" fill="#c53a20" stroke="#c53a20" stroke-width="0.5" stroke-linejoin="round"/>
</svg>`;

export default function OG() {
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(SVG_LOGO)}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f7f0e6",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          position: "relative",
        }}
      >
        {/* decorative accent bar on left edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 12,
            bottom: 0,
            background: "#c53a20",
            display: "flex",
          }}
        />
        {/* top: logo + wordmark row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUri} width={80} height={80} alt="" />
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#1d2b1f",
            }}
          >
            Jurnal
            <span style={{ color: "#c53a20" }}>.in</span>
          </div>
        </div>

        {/* center: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 108,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 0.98,
              color: "#1d2b1f",
            }}
          >
            <span>A shared notebook</span>
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 500,
                fontFamily: "Georgia, serif",
              }}
            >
              for practicing
            </span>
            <span>IELTS writing.</span>
          </div>
        </div>

        {/* bottom: tag pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {["Daily journals", "Task 1 tables", "Task 2 essays", "Peer review"].map(
            (t) => (
              <div
                key={t}
                style={{
                  border: "2px solid #1d2b1f",
                  borderRadius: 999,
                  padding: "10px 20px",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#1d2b1f",
                  background: "#bfea4b",
                  boxShadow: "3px 3px 0 0 #1d2b1f",
                  display: "flex",
                }}
              >
                {t}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
