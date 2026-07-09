"use client";

import { useEffect, useMemo, useState } from "react";

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

### {number}. {Author} — {Date}

**Estimated band scores** (0.0–9.0, half-band increments):
- Task Response: X.X
- Coherence & Cohesion: X.X
- Lexical Resource: X.X
- Grammatical Range & Accuracy: X.X
- **Overall: X.X**

**Top grammar corrections** (up to 6, quote original → corrected + brief why):
- "..." → "..." — reason

**Vocabulary upgrades to band 7–9** (up to 6, quote original → suggestion + brief reason):
- "..." → "..." — reason

**Structure & coherence feedback** (2–3 sentences):
...

**Improved version at band 8** (preserve the writer's ideas & voice, rewrite the whole entry):
...

Be honest but encouraging. Use Indonesian for the reason/explanation parts if you like, but keep quotes and improved version in English.

---

`;

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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
        return `### ${i + 1}. ${j.authorName} — ${date} (${wc} words, ${sc} sentences)\n\n${j.content.trim()}`;
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">Export bulk</h1>
        <p className="text-ink/60 text-sm">
          Filter rentang tanggal & peserta, klik <b>Copy</b>, paste ke Claude
          chat untuk minta review IELTS lengkap.
        </p>
      </div>

      <div className="border border-ink/10 rounded-lg p-4 bg-white grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Dari tanggal</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-ink/20 rounded-md bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Sampai tanggal</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-ink/20 rounded-md bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Peserta</label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-ink/20 rounded-md bg-white"
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
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={includePrompt}
              onChange={(e) => setIncludePrompt(e.target.checked)}
            />
            Sertakan prompt review
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-ink/70">
          {loading
            ? "Memuat…"
            : `${filtered.length} jurnal · ${totalWords} kata total`}
        </div>
        <button
          onClick={copyToClipboard}
          disabled={loading || filtered.length === 0}
          className="bg-ink text-paper px-4 py-2 rounded-full text-sm font-medium hover:bg-accent transition disabled:opacity-50"
        >
          {copied ? "✓ Tersalin" : "📋 Copy ke clipboard"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Preview</label>
        <textarea
          value={output}
          readOnly
          rows={22}
          className="w-full px-3 py-2 border border-ink/20 rounded-md font-mono text-xs leading-relaxed bg-white"
          placeholder={loading ? "Memuat jurnal…" : "Tidak ada jurnal di rentang ini."}
        />
      </div>

      <div className="text-xs text-ink/50 bg-amber-50 border border-amber-200 rounded p-3">
        <b>Cara pakai:</b> buka Claude chat (claude.ai) → paste hasil di atas →
        Claude akan kasih band score + koreksi grammar + upgrade vocabulary + versi
        perbaikan untuk setiap jurnal. Kalau jurnal banyak, split per batch 3–5
        jurnal biar respons tidak kepotong.
      </div>
    </div>
  );
}
