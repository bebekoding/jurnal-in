import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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

export default function Icon() {
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(SVG_LOGO)}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f7f0e6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={26} height={26} alt="" />
      </div>
    ),
    size
  );
}
