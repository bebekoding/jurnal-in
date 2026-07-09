"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Circle, ArrowLeft } from "@phosphor-icons/react";
import { PARTICIPANTS } from "@/lib/participants";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateLong(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function countSentences(text: string) {
  const matches = text.trim().match(/[^.!?\n]+[.!?]+/g);
  return matches ? matches.length : 0;
}

const MIN_SENTENCES = 5;

export default function NewJournalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayISO());
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("jurnal.name");
    if (saved && (PARTICIPANTS as readonly string[]).includes(saved)) {
      setName(saved);
    }
  }, []);

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const sentences = countSentences(content);
  const sentencesOK = sentences >= MIN_SENTENCES;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !date.trim() || !content.trim()) {
      setError("Nama, tanggal, dan isi jurnal wajib diisi.");
      return;
    }
    if (!sentencesOK) {
      setError(
        `Minimal ${MIN_SENTENCES} kalimat (baru ${sentences} kalimat terdeteksi). Pastikan setiap kalimat diakhiri titik, tanda seru, atau tanda tanya.`
      );
      return;
    }
    setSubmitting(true);
    localStorage.setItem("jurnal.name", name.trim());
    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorName: name.trim(),
          title: formatDateLong(date),
          content: content.trim(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/journals/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan jurnal.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition mb-8"
      >
        <ArrowLeft size={14} weight="regular" />
        Kembali ke feed
      </Link>

      <h1 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink">
        Jurnal bebas.
      </h1>
      <p className="mt-4 text-ink-muted text-[15px] leading-relaxed max-w-lg">
        Cerita bebas tentang harimu. Tulis dalam bahasa Inggris. Minimum lima
        kalimat. Kalau bingung mau nulis apa, coba{" "}
        <Link href="/topics" className="link">
          topik hari ini
        </Link>
        .
      </p>

      <form onSubmit={submit} className="mt-10 space-y-8">
        <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-rule">
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink-subtle mb-2">
              Penulis
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 text-sm"
            >
              <option value="">Pilih nama</option>
              {PARTICIPANTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink-subtle mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-3 text-sm tabular"
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs uppercase tracking-widest text-ink-subtle">
              Tulisan kamu
            </label>
            <div className="flex items-center gap-4 text-xs tabular">
              <span className="text-ink-muted">{words} kata</span>
              <span
                className={`inline-flex items-center gap-1 ${
                  sentencesOK ? "text-ink" : "text-ink-muted"
                }`}
              >
                {sentencesOK ? (
                  <CheckCircle size={14} weight="fill" />
                ) : (
                  <Circle size={14} weight="regular" />
                )}
                {sentences} / {MIN_SENTENCES} kalimat
              </span>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full px-4 py-4 font-reading text-[17px] leading-[1.6]"
            placeholder="Tell a story about your day..."
          />
        </div>

        {error && (
          <div className="border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm text-ink">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-rule">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-ink text-paper px-6 h-11 text-sm font-medium hover:bg-accent transition disabled:opacity-40"
          >
            {submitting ? "Menyimpan…" : "Setor jurnal"}
          </button>
          <span className="text-xs text-ink-subtle">
            Muncul di feed setelah tersimpan.
          </span>
        </div>
      </form>
    </div>
  );
}
