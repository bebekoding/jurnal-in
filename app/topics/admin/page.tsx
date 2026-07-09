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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-1">
          Admin — Tambah topik ke pool
        </h1>
        <p className="text-ink/60 text-sm">
          Paste topik satu per baris. Semua masuk ke pool; sistem pilih 3
          random tiap hari (deterministik per tanggal).
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Password admin
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none"
            placeholder="Isi kalau ADMIN_PASSWORD di-set"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">
              Topik ({lines.length} baris)
            </label>
            <span className="text-xs text-ink/50">
              Format: <code>Title</code> atau{" "}
              <code>Title | Judul Indonesia | Deskripsi</code>
            </span>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={16}
            className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none font-mono text-xs leading-relaxed"
            placeholder={`Contoh:
Should schools teach civic values? | Apakah sekolah harus mengajarkan nilai kewarganegaraan?
Remote work advantages and disadvantages | Kelebihan dan kekurangan kerja jarak jauh
Impact of social media on teenagers | Dampak media sosial pada remaja
...
`}
          />
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 whitespace-pre-wrap">
            {error}
          </div>
        )}
        {result && (
          <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-3">
            ✓ {result.inserted} topik masuk pool.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent transition disabled:opacity-50"
        >
          {submitting ? "Menyimpan…" : "Tambah ke pool"}
        </button>
      </form>
    </div>
  );
}
