import type { Metadata } from "next";
import Link from "next/link";
import { bricolage, newsreader } from "./fonts";
import { Nav } from "@/components/Nav";
import { Fx } from "@/components/Fx";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jurnal.in",
  description: "Latihan writing IELTS bersama. Jurnal harian, topik random, peer review.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${bricolage.variable} ${newsreader.variable}`}>
      <body className="font-sans">
        <Fx />
        <header className="sticky top-0 z-30 border-b-[1.5px] border-ink bg-paper/90 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-display text-xl text-ink">
              Jurnal<span className="text-accent">.in</span>
            </Link>
            <Nav />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">{children}</main>

        <footer className="border-t-[1.5px] border-ink mt-24 bg-paper-raised">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-ink-muted">
            <span className="font-display text-ink">Jurnal.in</span>
            <span>Latihan writing IELTS bersama.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
