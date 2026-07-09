"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      setError(`Minimal ${MIN_WORDS} kata (baru ${words}).`);
      return;
    }
    if (!parasOK) {
      setError(
        `Minimal ${MIN_PARAGRAPHS} paragraf (baru ${paras}). Pisahkan paragraf dengan baris kosong.`
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
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nama</label>
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none bg-white"
        >
          <option value="">— pilih nama —</option>
          {PARTICIPANTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium">Tulisan kamu</label>
          <div className="text-xs flex gap-3">
            <span className={wordsOK ? "text-emerald-700" : "text-ink/60"}>
              {wordsOK ? "✓" : "•"} {words}/{MIN_WORDS} kata
            </span>
            <span className={parasOK ? "text-emerald-700" : "text-ink/60"}>
              {parasOK ? "✓" : "•"} {paras}/{MIN_PARAGRAPHS} paragraf
            </span>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none font-serif leading-relaxed"
          placeholder="Tulis argumenmu di sini. Pisahkan tiap paragraf dengan baris kosong (dua kali enter)."
        />
        <p className="mt-1 text-xs text-ink/50">
          Minimal {MIN_PARAGRAPHS} paragraf & {MIN_WORDS} kata. Struktur ideal:
          intro → 2 body paragraf → kesimpulan.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent transition disabled:opacity-50"
        >
          {submitting ? "Menyimpan…" : "Setor jawaban"}
        </button>
      </div>
    </form>
  );
}
