"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ journalId }: { journalId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("jurnal.name");
    if (saved) setName(saved);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !comment.trim()) {
      setError("Nama dan komentar wajib diisi.");
      return;
    }
    setSubmitting(true);
    localStorage.setItem("jurnal.name", name.trim());
    try {
      const res = await fetch(`/api/journals/${journalId}/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ authorName: name.trim(), comment: comment.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setComment("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal mengirim review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="border border-ink/10 rounded-lg p-4 bg-white space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1">Nama kamu</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-ink/20 rounded-md focus:border-accent focus:outline-none"
          placeholder="Nama"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Review / feedback</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-ink/20 rounded-md focus:border-accent focus:outline-none"
          placeholder="Kasih feedback yang membangun…"
        />
      </div>
      {error && <div className="text-xs text-red-700">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-ink text-paper px-4 py-2 rounded-full text-sm font-medium hover:bg-accent transition disabled:opacity-50"
      >
        {submitting ? "Mengirim…" : "Kirim review"}
      </button>
    </form>
  );
}
