"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, FileText } from "@phosphor-icons/react";

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

type Journal = {
  id: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
};

const REVIEW_PROMPT = `You are an experienced IELTS Writing examiner. Below are journal entries from a study group practicing IELTS-style writing. For each entry, respond in this format:

### {number}. {Author}, {Date}

Estimated band scores (0.0 to 9.0, half-band increments):
- Task Response: X.X
- Coherence and Cohesion: X.X
- Lexical Resource: X.X
- Grammatical Range and Accuracy: X.X
- Overall: X.X

Top grammar corrections (up to 6, quote original then corrected with a brief reason):
- "..." to "..." because ...

Vocabulary upgrades to band 7 to 9 (up to 6, quote original then suggestion with a brief reason):
- "..." to "..." because ...

Structure and coherence feedback (2 to 3 sentences):
...

Improved version at band 8 (preserve the writer's ideas and voice, rewrite the whole entry):
...

Be honest but encouraging. Use Indonesian for the reason and explanation parts if you like, but keep quotes and improved version in English.

---

`;

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ymd(d);
}

function formatDateLong(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text: string) {
  const m = text.trim().match(/[^.!?\n]+[.!?]+/g);
  return m ? m.length : 0;
}

export default function ExportPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState(daysAgo(7));
  const [to, setTo] = useState(ymd(new Date()));
  const [author, setAuthor] = useState("Semua");
  const [includePrompt, setIncludePrompt] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/journals")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data) => setJournals(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const fromT = new Date(from + "T00:00:00").getTime();
    const toT = new Date(to + "T23:59:59").getTime();
    return journals
      .filter((j) => {
        const t = new Date(j.createdAt).getTime();
        if (t < fromT || t > toT) return false;
        if (author !== "Semua" && j.authorName !== author) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [journals, from, to, author]);

  const output = useMemo(() => {
    const header = includePrompt ? REVIEW_PROMPT : "";
    const entries = filtered
      .map((j, i) => {
        const wc = wordCount(j.content);
        const sc = sentenceCount(j.content);
        const date = formatDateLong(new Date(j.createdAt));
        return `### ${i + 1}. ${j.authorName}, ${date} (${wc} words, ${sc} sentences)\n\n${j.content.trim()}`;
      })
      .join("\n\n---\n\n");
    return header + entries;
  }, [filtered, includePrompt]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Gagal copy ke clipboard.");
    }
  }

  const totalWords = filtered.reduce((s, j) => s + wordCount(j.content), 0);

  return (
    <div className="space-y-10">
      <header className="grid md:grid-cols-12 gap-8 border-b border-ink pb-8">
        <div className="md:col-span-8">
          <h1 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink">
            Rekap bulk.
          </h1>
          <p className="mt-4 max-w-lg text-ink-muted text-[15px] leading-relaxed">
            Filter rentang tanggal dan peserta, klik copy, paste ke Claude
            chat untuk minta review IELTS lengkap. Konsumsi Pro subscription,
            bukan API credit.
          </p>
        </div>
        <div className="md:col-span-4 text-sm">
          <div className="flex justify-between border-b border-rule py-1.5 tabular">
            <span className="text-ink-muted">Sumber jurnal</span>
            <span className="text-ink">{journals.length} entri</span>
          </div>
          <div className="flex justify-between border-b border-rule py-1.5 tabular">
            <span className="text-ink-muted">Terpilih</span>
            <span className="text-ink">{filtered.length} entri</span>
          </div>
          <div className="flex justify-between border-b border-rule py-1.5 tabular">
            <span className="text-ink-muted">Total kata</span>
            <span className="text-ink">
              {totalWords.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </header>

      <section className="grid md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-ink-subtle mb-1.5">
            Dari
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full h-10 px-2 text-sm tabular"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-ink-subtle mb-1.5">
            Sampai
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full h-10 px-2 text-sm tabular"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-ink-subtle mb-1.5">
            Peserta
          </label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full h-10 px-2 text-sm"
          >
            <option value="Semua">Semua</option>
            {PARTICIPANTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={includePrompt}
              onChange={(e) => setIncludePrompt(e.target.checked)}
              className="accent-ink"
            />
            Sertakan prompt review
          </label>
        </div>
      </section>

      {error && (
        <div className="border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      <section>
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-2">
          <div className="flex items-baseline gap-2">
            <FileText size={16} weight="regular" className="text-ink" />
            <h2 className="font-display text-lg text-ink">Preview keluaran</h2>
          </div>
          <button
            onClick={copyToClipboard}
            disabled={loading || filtered.length === 0}
            className="inline-flex items-center gap-2 bg-ink text-paper px-4 h-10 text-sm font-medium hover:bg-accent transition disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check size={14} weight="bold" />
                Tersalin
              </>
            ) : (
              <>
                <Copy size={14} weight="regular" />
                Copy ke clipboard
              </>
            )}
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          rows={22}
          className="w-full px-4 py-3 font-mono text-xs leading-relaxed bg-paper-raised"
          placeholder={
            loading ? "Memuat jurnal…" : "Tidak ada jurnal di rentang ini."
          }
        />
      </section>

      <section className="border-l-2 border-ink pl-4 py-2 text-sm text-ink-muted">
        <p>
          <span className="text-ink font-medium">Cara pakai.</span> Buka
          claude.ai, paste hasil di atas. Claude akan kasih band score,
          koreksi grammar, upgrade vocabulary, dan versi perbaikan setiap
          entri. Kalau jurnal banyak, split per batch 3 sampai 5 entri biar
          respons tidak kepotong.
        </p>
      </section>
    </div>
  );
}
