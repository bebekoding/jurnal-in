import { Bricolage_Grotesque, Newsreader } from "next/font/google";

// Only the weights actually used are requested (basic Latin subset):
// Bricolage 400/500/600 (.font-display = 600, no bold/light in use),
// Newsreader 400/500 + italic (.font-reading = 400, only medium used).
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});
