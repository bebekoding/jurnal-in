import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl py-20">
      <div className="font-display text-6xl text-ink leading-none">404.</div>
      <h1 className="mt-6 font-display text-2xl text-ink">
        Halaman tidak ditemukan.
      </h1>
      <p className="mt-2 text-ink-muted">
        Mungkin sudah dihapus atau URL salah.
      </p>
      <Link href="/" className="link mt-6 inline-block">
        Kembali ke feed
      </Link>
    </div>
  );
}
