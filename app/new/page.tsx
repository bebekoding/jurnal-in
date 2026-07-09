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
        `Minimal ${MIN_SENTENCES} kalimat (baru ${sentences}). Akhiri kalimat dengan titik, tanda seru, atau tanda tanya.`
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
        <ArrowLeft size={14} weight="bold" />
        Feed
      </Link>

      <h1
        className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink"
        data-reveal
      >
        Jurnal bebas.
      </h1>
      <p
        className="mt-3 text-ink-muted text-[15px]"
        data-reveal
        style={{ "--d": "90ms" } as React.CSSProperties}
      >
        Cerita harimu dalam bahasa Inggris, minimum lima kalimat.
      </p>

      <form
        onSubmit={submit}
        className="mt-10 space-y-7"
        data-reveal
        style={{ "--d": "180ms" } as React.CSSProperties}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
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
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Tulisan
            </label>
            <div className="flex items-center gap-4 text-xs tabular">
              <span className="text-ink-muted">{words} kata</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  sentencesOK ? "text-ink" : "text-ink-muted"
                }`}
              >
                {sentencesOK ? (
                  <CheckCircle size={14} weight="fill" className="text-accent" />
                ) : (
                  <Circle size={14} weight="regular" />
                )}
                {sentences}/{MIN_SENTENCES} kalimat
              </span>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full px-4 py-4 font-reading text-[17px] leading-[1.6]"
            placeholder="Tell a story about your day..."
          />
        </div>

        {error && (
          <div className="card bg-accent-soft px-4 py-3 text-sm text-ink">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Menyimpan…" : "Setor jurnal"}
        </button>
      </form>
    </div>
  );
}
