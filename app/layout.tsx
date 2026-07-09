import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jurnal.in — IELTS Writing Practice Journal",
  description:
    "Latihan writing IELTS lewat journaling harian. Baca jurnal teman, review bareng, dan dapat analisis dari Claude.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
              Jurnal<span className="text-accent">.in</span>
            </Link>
            <nav className="flex gap-4 md:gap-6 text-sm">
              <Link href="/" className="hover:text-accent">Beranda</Link>
              <Link href="/new" className="hover:text-accent">Jurnal</Link>
              <Link href="/topics" className="hover:text-accent">Topik</Link>
              <Link href="/export" className="hover:text-accent">Export</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="max-w-5xl mx-auto px-4 py-8 text-xs text-ink/50">
          Dibangun untuk latihan IELTS Writing. Export bulk → paste ke Claude chat untuk review.
        </footer>
      </body>
    </html>
  );
}
