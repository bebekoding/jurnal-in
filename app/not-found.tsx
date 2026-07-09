import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="font-serif text-3xl font-bold mb-2">Jurnal tidak ditemukan</h1>
      <p className="text-ink/60 mb-4">Mungkin sudah dihapus atau URL salah.</p>
      <Link href="/" className="text-accent underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}
