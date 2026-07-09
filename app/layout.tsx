import type { Metadata } from "next";
import Link from "next/link";
import { bricolage, newsreader } from "./fonts";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jurnal.in / IELTS Writing Study Group",
  description:
    "Buku catatan bersama untuk latihan writing IELTS. Setor jurnal harian, jawab topik, tukar review.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${bricolage.variable} ${newsreader.variable}`}>
      <body className="font-sans">
        <header className="border-b border-rule bg-paper/85 backdrop-blur sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-baseline gap-1 font-display text-lg text-ink"
            >
              <span className="tracking-tight">Jurnal</span>
              <span className="text-accent">.in</span>
            </Link>
            <Nav />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-14 md:py-20">{children}</main>

        <footer className="border-t border-rule mt-24">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-subtle">
            <div className="tabular">
              9 penulis · Ivan, Rafa, Fadli, Adhy, Robi, Maul, Rully, Frans,
              Yogi
            </div>
            <div>
              Rekap bulk siap-paste ke Claude chat untuk review.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
