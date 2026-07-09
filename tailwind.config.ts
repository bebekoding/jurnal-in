import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#f6f7f8",
          raised: "#ffffff",
          sunken: "#eceff2",
        },
        ink: {
          DEFAULT: "#0b0d0e",
          muted: "#5c6166",
          subtle: "#8a9096",
          faint: "#c3c8cc",
        },
        rule: "#dfe3e6",
        accent: {
          DEFAULT: "#c8102e",
          soft: "#fdebee",
        },
      },
      fontFamily: {
        sans: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        display: ["clamp(2.5rem, 5vw + 1rem, 4.5rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
      },
    },
  },
  plugins: [],
};
export default config;
