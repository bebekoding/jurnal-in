"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/components/Identity";

export default function ReviewForm({ journalId }: { journalId: string }) {
  const router = useRouter();
  const { name } = useIdentity();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !comment.trim()) {
      setError("A comment is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/journals/${journalId}/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ authorName: name, comment: comment.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setComment("");
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
