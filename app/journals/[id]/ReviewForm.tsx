"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PARTICIPANTS } from "@/lib/participants";

export default function ReviewForm({ journalId }: { journalId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("jurnal.name");
    if (saved && (PARTICIPANTS as readonly string[]).includes(saved)) {
      setName(saved);
    }
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
    <form onSubmit={submit} className="card bg-lime-soft p-5 space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Kamu
          </label>
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-2 text-sm"
          >
            <option value="">Pilih nama</option>
            {PARTICIPANTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Feedback
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm leading-relaxed"
          />
        </div>
      </div>
      {error && <div className="text-xs text-accent font-semibold">{error}</div>}
      <button type="submit" disabled={submitting} className="btn btn-ink h-10">
        {submitting ? "Mengirim…" : "Kirim review"}
      </button>
    </form>
  );
}
