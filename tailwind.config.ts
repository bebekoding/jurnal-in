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
          DEFAULT: "#f7f0e6",
          raised: "#f3ebdd",
        },
        ink: {
          DEFAULT: "#1d2b1f",
          muted: "#6b7a6d",
          subtle: "#96a398",
        },
        lime: {
          DEFAULT: "#bfea4b",
          soft: "#e4f7b0",
        },
        accent: {
          DEFAULT: "#c53a20",
          soft: "#f8e3dd",
        },
      },
      fontFamily: {
        sans: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "0.875rem",
      },
      boxShadow: {
        "hard-sm": "2px 2px 0 0 #1d2b1f",
        hard: "4px 4px 0 0 #1d2b1f",
        "hard-lg": "6px 6px 0 0 #1d2b1f",
      },
    },
  },
  plugins: [],
};
export default config;
