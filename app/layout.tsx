import type { Metadata } from "next";
import { bricolage, newsreader } from "./fonts";
import { IdentityProvider } from "@/components/Identity";
import { Shell } from "@/components/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jurnal.in",
  description:
    "IELTS writing practice, together. Daily journals, essay topics, peer review.",
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
