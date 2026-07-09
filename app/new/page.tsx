"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PARTICIPANTS = [
  "Ivan",
  "Rafa",
  "Fadli",
  "Adhy",
  "Robi",
  "Maul",
  "Rully",
  "Frans",
  "Yogi",
];

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

export default function NewJournalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayISO());
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("jurnal.name");
    if (saved && PARTICIPANTS.includes(saved)) setName(saved);
  }, []);

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const sentences = countSentences(content);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !date.trim() || !content.trim()) {
      setError("Nama, tanggal, dan isi jurnal wajib diisi.");
      return;
    }
    if (sentences < 5) {
      setError(
        `Minimal 5 kalimat (baru ${sentences} kalimat terdeteksi). Pastikan setiap kalimat diakhiri titik/tanda seru/tanya.`
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
    <div className="max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl font-bold mb-2">Tulis jurnal hari ini</h1>
      <p className="text-ink/60 text-sm mb-6">
        Cerita bebas tentang kejadian pribadi hari ini. Tulis dalam bahasa
        Inggris, minimal 5 kalimat.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none bg-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Isi jurnal ({words} kata · {sentences} kalimat)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full px-3 py-2 border border-ink/20 rounded-md focus:border-accent focus:outline-none font-serif leading-relaxed"
            placeholder="Tell a story about your day..."
          />
          <p className="mt-1 text-xs text-ink/50">
            Minimal 5 kalimat. Pisahkan tiap kalimat dengan titik (.), tanda seru
            (!), atau tanda tanya (?).
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
