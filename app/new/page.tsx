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
      setError("Writer, date, and your writing are all required.");
      return;
    }
    if (!sentencesOK) {
      setError(
        `At least ${MIN_SENTENCES} sentences (${sentences} so far). End each sentence with a period, exclamation, or question mark.`
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
      setError(err.message || "Failed to save the journal.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition mb-8"
      >
        <ArrowLeft size={14} weight="bold" />
        Home
      </Link>

      <h1
        className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink"
        data-reveal
      >
        Daily journal.
      </h1>
      <p
        className="mt-3 text-ink-muted text-[15px]"
        data-reveal
        style={{ "--d": "90ms" } as React.CSSProperties}
      >
        Tell your day in English, five sentences minimum.
      </p>

      <form onSubmit={submit} className="mt-10 grid md:grid-cols-12 gap-8">
        <div
          className="md:col-span-8"
          data-reveal
          style={{ "--d": "180ms" } as React.CSSProperties}
        >
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Your writing
            </label>
            <div className="flex items-center gap-4 text-xs tabular">
              <span className="text-ink-muted">{words} words</span>
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
                {sentences}/{MIN_SENTENCES} sentences
              </span>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full h-full min-h-[420px] px-4 py-4 font-reading text-[17px] leading-[1.6]"
            placeholder="Tell a story about your day..."
          />
        </div>

        <aside
          className="md:col-span-4"
          data-reveal
          style={{ "--d": "260ms" } as React.CSSProperties}
        >
          <div className="card p-6 space-y-5 md:sticky md:top-24">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Writer
              </label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 text-sm"
              >
                <option value="">Select name</option>
                {PARTICIPANTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 text-sm tabular"
              />
            </div>

            {error && (
              <div className="rounded-lg border-[1.5px] border-ink bg-accent-soft px-3 py-2.5 text-sm text-ink">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full justify-center"
            >
              {submitting ? "Saving…" : "Submit journal"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
