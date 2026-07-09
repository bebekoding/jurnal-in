"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const IELTS_PROMPTS = [
  "Some people think schools should teach children how to be good citizens. Others believe school should focus on academic subjects. Discuss both views.",
  "Describe a memorable trip you took. Where did you go, who did you go with, and why is it memorable?",
  "Many people believe that social media has more negative effects than positive ones. To what extent do you agree or disagree?",
  "Nowadays more people prefer to work from home. Discuss the advantages and disadvantages.",
  "Some argue that governments should invest more in public transportation rather than building new roads. Discuss.",
  "Describe a skill you would like to learn. Why do you want to learn it? How will you learn it?",
];

export default function NewJournalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(IELTS_PROMPTS[0]);

  useEffect(() => {
    const saved = localStorage.getItem("jurnal.name");
    if (saved) setName(saved);
    setPrompt(IELTS_PROMPTS[Math.floor(Math.random() * IELTS_PROMPTS.length)]);
  }, []);

  const words = content.trim().split(/\s+/).filter(Boolean).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !title.trim() || !content.trim()) {
      setError("Nama, judul, dan isi jurnal wajib diisi.");
      return;
    }
    if (words < 30) {
      setError("Minimal 30 kata biar analisis Claude berguna.");
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
          title: title.trim(),
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
    <div className="max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl font-bold mb-2">Tulis jurnal hari ini</h1>
      <p className="text-ink/60 text-sm mb-6">
        Tulis dalam bahasa Inggris. Target ideal IELTS Task 2: 250+ kata.
      </p>

      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
        <div className="font-medium text-amber-900 mb-1">💡 Ide topik hari ini</div>
        <p className="text-amber-800">{prompt}</p>
        <button
          type="button"
          onClick={() =>
            setPrompt(
              IELTS_PROMPTS[Math.floor(Math.random() * IELTS_PROMPTS.length)]
            )
          }
          className="mt-2 text-xs text-amber-900 underline"
        >
          Ganti topik
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama kamu</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none"
            placeholder="Misal: Ivan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Judul jurnal</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none"
            placeholder="Contoh: Should schools teach civic values?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Isi jurnal ({words} kata)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none font-serif leading-relaxed"
            placeholder="Start writing here..."
          />
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
            {submitting ? "Menyimpan…" : "Setor jurnal"}
          </button>
          <span className="text-xs text-ink/50">
            Kamu bisa analisis dengan Claude setelah jurnal disimpan.
          </span>
        </div>
      </form>
    </div>
  );
}
