"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle } from "@phosphor-icons/react";
import { PARTICIPANTS } from "@/lib/participants";

const MIN_WORDS = 200;
const MIN_PARAGRAPHS = 4;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function paragraphCount(text: string) {
  return text
    .trim()
    .split(/\n\s*\n+/)
    .filter((p) => p.trim().length > 0).length;
}

export default function WriteForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("jurnal.name");
    if (saved && (PARTICIPANTS as readonly string[]).includes(saved)) {
      setName(saved);
    }
  }, []);

  const words = wordCount(content);
  const paras = paragraphCount(content);
  const wordsOK = words >= MIN_WORDS;
  const parasOK = paras >= MIN_PARAGRAPHS;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !content.trim()) {
      setError("Nama dan isi wajib diisi.");
      return;
    }
    if (!wordsOK) {
      setError(`Minimum ${MIN_WORDS} kata (baru ${words}).`);
      return;
    }
    if (!parasOK) {
      setError(
        `Minimum ${MIN_PARAGRAPHS} paragraf (baru ${paras}). Pisahkan paragraf dengan baris kosong.`
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
          topicId,
          content: content.trim(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/journals/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan setoran.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-7"
      data-reveal
      style={{ "--d": "120ms" } as React.CSSProperties}
    >
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
          Penulis
        </label>
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-xs h-11 px-3 text-sm"
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
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Tulisan
          </label>
          <div className="flex items-center gap-5 text-xs tabular">
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                wordsOK ? "text-ink" : "text-ink-muted"
              }`}
            >
              {wordsOK ? (
                <CheckCircle size={14} weight="fill" className="text-accent" />
              ) : (
                <Circle size={14} weight="regular" />
              )}
              {words}/{MIN_WORDS} kata
            </span>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                parasOK ? "text-ink" : "text-ink-muted"
              }`}
            >
              {parasOK ? (
                <CheckCircle size={14} weight="fill" className="text-accent" />
              ) : (
                <Circle size={14} weight="regular" />
              )}
              {paras}/{MIN_PARAGRAPHS} paragraf
            </span>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="w-full px-4 py-4 font-reading text-[17px] leading-[1.65]"
          placeholder="Pisahkan tiap paragraf dengan baris kosong."
        />
      </div>

      {error && (
        <div className="card bg-accent-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? "Menyimpan…" : "Setor jawaban"}
      </button>
    </form>
  );
}
