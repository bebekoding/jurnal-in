import type { Metadata } from "next";
import { bricolage, newsreader } from "./fonts";
import { IdentityProvider } from "@/components/Identity";
import { Shell } from "@/components/Shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jurnal-in.vercel.app"),
  title: {
    default: "Jurnal.in",
    template: "%s · Jurnal.in",
  },
  description:
    "A shared notebook for practicing IELTS writing. Daily journals, Task 1 tables, Task 2 essays, and peer review.",
  applicationName: "Jurnal.in",
  openGraph: {
    title: "Jurnal.in",
    description:
      "A shared notebook for practicing IELTS writing. Daily journals, Task 1 tables, Task 2 essays, and peer review.",
    url: "https://jurnal-in.vercel.app",
    siteName: "Jurnal.in",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jurnal.in",
    description:
      "A shared notebook for practicing IELTS writing.",
  },
  themeColor: "#f7f0e6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${newsreader.variable}`}>
      <body className="font-sans">
        <IdentityProvider>
          <Shell>{children}</Shell>
        </IdentityProvider>
      </body>
    </html>
  );
}
