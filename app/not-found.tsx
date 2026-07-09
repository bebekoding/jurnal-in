import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl py-16">
      <div className="font-display text-7xl text-ink leading-none">404</div>
      <p className="mt-4 text-ink-muted">Halaman tidak ditemukan.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Kembali ke feed
      </Link>
    </div>
  );
}
