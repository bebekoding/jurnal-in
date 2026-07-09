"use client";

import { useState } from "react";

export default function TopicsAdminPage() {
  const [password, setPassword] = useState("");
  const [raw, setRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (lines.length === 0) {
      setError("Masukkan minimal 1 topik.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/topics/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, topics: lines }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setRaw("");
    } catch (err: any) {
      setError(err.message || "Gagal menambah topik");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-10">
      <header className="border-b border-ink pb-6">
        <div className="text-[10px] uppercase tracking-widest text-ink-subtle mb-3">
          Admin
        </div>
        <h1 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink">
          Tambah topik ke pool.
        </h1>
        <p className="mt-4 max-w-lg text-ink-muted text-[15px] leading-relaxed">
          Paste satu topik per baris. Semua masuk ke pool. Sistem pilih tiga
          random per hari, deterministik per tanggal.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-8">
        <div className="pb-6 border-b border-rule">
          <label className="block text-[11px] uppercase tracking-widest text-ink-subtle mb-1.5">
            Password admin
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full max-w-xs h-10 px-3 text-sm"
            placeholder="Kalau ADMIN_PASSWORD di-set"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2 flex-wrap gap-3">
            <label className="text-[11px] uppercase tracking-widest text-ink-subtle">
              Topik ({lines.length} baris)
            </label>
            <span className="text-xs text-ink-subtle">
              Format:{" "}
              <code className="font-mono text-ink">Title</code> atau{" "}
              <code className="font-mono text-ink">
                Title | Judul ID | Deskripsi
              </code>
            </span>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={16}
            className="w-full px-4 py-3 font-mono text-xs leading-relaxed"
            placeholder={`Contoh:
Should schools teach civic values? | Apakah sekolah harus mengajarkan nilai kewarganegaraan?
Remote work advantages and disadvantages | Kelebihan dan kekurangan kerja jarak jauh
`}
          />
        </div>

        {error && (
          <div className="border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm text-ink whitespace-pre-wrap">
            {error}
          </div>
        )}
        {result && (
          <div className="border-l-2 border-ink bg-paper-raised px-4 py-3 text-sm text-ink">
            {result.inserted} topik masuk pool.
          </div>
        )}

        <div className="pt-4 border-t border-rule">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-ink text-paper px-6 h-11 text-sm font-medium hover:bg-accent transition disabled:opacity-40"
          >
            {submitting ? "Menyimpan…" : "Tambah ke pool"}
          </button>
        </div>
      </form>
    </div>
  );
}
