import { Bricolage_Grotesque, Newsreader } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
