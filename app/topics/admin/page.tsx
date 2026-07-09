"use client";

import { useState } from "react";

export default function TopicsAdminPage() {
  const [password, setPassword] = useState("");
  const [raw, setRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (lines.length === 0) {
      setError("Add at least one topic.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/topics/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, topics: lines }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setRaw("");
    } catch (err: any) {
      setError(err.message || "Failed to add topics.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <header data-reveal>
        <h1 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink">
          Add topics.
        </h1>
        <p className="mt-3 text-ink-muted text-[15px]">
          One topic per line. Format:{" "}
          <code className="font-mono text-ink text-xs">
            Title | Indonesian title | Description
          </code>
        </p>
      </header>

      <form
        onSubmit={submit}
        className="space-y-6"
        data-reveal
        style={{ "--d": "120ms" } as React.CSSProperties}
      >
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Admin password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full max-w-xs h-10 px-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Topics ({lines.length} lines)
          </label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={14}
            className="w-full px-4 py-3 font-mono text-xs leading-relaxed"
          />
        </div>

        {error && (
          <div className="card bg-accent-soft px-4 py-3 text-sm text-ink whitespace-pre-wrap">
            {error}
          </div>
        )}
        {result && (
          <div className="card bg-lime-soft px-4 py-3 text-sm text-ink font-semibold">
            {result.inserted} topics added to the pool.
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Saving…" : "Add to pool"}
        </button>
      </form>
    </div>
  );
}
