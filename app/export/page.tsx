"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";
import { PARTICIPANTS } from "@/lib/participants";

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
  const [author, setAuthor] = useState("All");
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
        if (author !== "All" && j.authorName !== author) return false;
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
      setError("Could not copy to clipboard.");
    }
  }

  const totalWords = filtered.reduce((s, j) => s + wordCount(j.content), 0);

  return (
    <div className="space-y-8">
      <header>
        <h1
          className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink"
          data-reveal
        >
          Recap.
        </h1>
        <p
          className="mt-3 text-ink-muted text-[15px]"
          data-reveal
          style={{ "--d": "90ms" } as React.CSSProperties}
        >
          Filter, copy, then paste into Claude chat for a full review.
        </p>
      </header>

      <section
        className="card p-5 grid md:grid-cols-4 gap-4"
        data-reveal
        style={{ "--d": "180ms" } as React.CSSProperties}
      >
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full h-10 px-2 text-sm tabular"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full h-10 px-2 text-sm tabular"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Writer
          </label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full h-10 px-2 text-sm"
          >
            <option value="All">All</option>
            {PARTICIPANTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={includePrompt}
              onChange={(e) => setIncludePrompt(e.target.checked)}
              className="accent-[#1d2b1f] w-4 h-4"
            />
            Include prompt
          </label>
        </div>
      </section>

      {error && (
        <div className="card bg-accent-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      <section data-reveal style={{ "--d": "260ms" } as React.CSSProperties}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-ink-muted tabular">
            {loading
              ? "Loading…"
              : `${filtered.length} entries · ${totalWords.toLocaleString("en-US")} words`}
          </span>
          <button
            onClick={copyToClipboard}
            disabled={loading || filtered.length === 0}
            className="btn btn-primary h-10"
          >
            {copied ? (
              <>
                <Check size={14} weight="bold" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} weight="bold" />
                Copy
              </>
            )}
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          rows={20}
          className="w-full px-4 py-3 font-mono text-xs leading-relaxed"
          placeholder={loading ? "Loading…" : "No entries in this range."}
        />
      </section>
    </div>
  );
}
