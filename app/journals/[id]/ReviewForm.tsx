"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/components/Identity";

const BANDS = ["", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"];

const CRITERIA: { key: string; short: string; label: string }[] = [
  { key: "rubricTask", short: "TR", label: "Task" },
  { key: "rubricCoherence", short: "CC", label: "Coherence" },
  { key: "rubricLexical", short: "LR", label: "Lexical" },
  { key: "rubricGrammar", short: "GRA", label: "Grammar" },
];

export default function ReviewForm({ journalId }: { journalId: string }) {
  const router = useRouter();
  const { name } = useIdentity();
  const [comment, setComment] = useState("");
  const [rubric, setRubric] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rated = CRITERIA.map((c) => rubric[c.key]).filter(Boolean).map(Number);
  const overall = rated.length
    ? (Math.round((rated.reduce((a, b) => a + b, 0) / rated.length) * 2) / 2).toFixed(1)
    : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !comment.trim()) {
      setError("A comment is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        authorName: name,
        comment: comment.trim(),
      };
      for (const c of CRITERIA) {
        if (rubric[c.key]) payload[c.key] = Number(rubric[c.key]);
      }
      const res = await fetch(`/api/journals/${journalId}/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setComment("");
      setRubric({});
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to send the review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="card bg-lime-soft p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Feedback as <span className="text-ink">{name}</span>
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Band rubric (optional)
          </span>
          {overall && (
            <span className="text-xs tabular text-ink">
              Overall{" "}
              <span className="font-display font-semibold">{overall}</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CRITERIA.map((c) => (
            <label key={c.key} className="block">
              <span className="block text-[10px] uppercase tracking-wider text-ink-muted mb-1">
                {c.label}
              </span>
              <select
                value={rubric[c.key] ?? ""}
                onChange={(e) =>
                  setRubric((r) => ({ ...r, [c.key]: e.target.value }))
                }
                className="w-full h-9 px-2 text-sm tabular"
                aria-label={`${c.label} band`}
              >
                {BANDS.map((b) => (
                  <option key={b} value={b}>
                    {b === "" ? "—" : b}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-sm leading-relaxed"
        placeholder="Give constructive feedback."
      />
      {error && <div className="text-xs text-accent font-semibold">{error}</div>}
      <button type="submit" disabled={submitting} className="btn btn-ink h-10">
        {submitting ? "Sending…" : "Send review"}
      </button>
    </form>
  );
}
