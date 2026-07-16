"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Circle, ArrowLeft, Lock } from "@phosphor-icons/react";
import { useIdentity } from "@/components/Identity";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function sentenceCount(text: string) {
  const m = text.trim().match(/[^.!?\n]+[.!?]+/g);
  return m ? m.length : 0;
}
function paragraphCount(text: string) {
  return text
    .trim()
    .split(/\n\s*\n+/)
    .filter((p) => p.trim().length > 0).length;
}

export default function EditForm({
  id,
  authorName,
  isEssay,
  topicTitle,
  initialContent,
  initialDate,
}: {
  id: string;
  authorName: string;
  isEssay: boolean;
  topicTitle: string | null;
  initialContent: string;
  initialDate: string;
}) {
  const router = useRouter();
  const { name, ready } = useIdentity();
  const [content, setContent] = useState(initialContent);
  const [date, setDate] = useState(initialDate);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = name === authorName;

  const words = wordCount(content);
  const sentences = sentenceCount(content);
  const paras = paragraphCount(content);

  const checks = isEssay
    ? [
        { ok: words >= 200, label: `${words}/200 words` },
        { ok: paras >= 4, label: `${paras}/4 paragraphs` },
      ]
    : [
        { ok: sentences >= 5, label: `${sentences}/5 sentences` },
        { ok: true, label: `${words} words` },
      ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/journals/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorName: name,
          content: content.trim(),
          date,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(`/journals/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
      setSubmitting(false);
    }
  }

  if (ready && !isOwner) {
    return (
      <div className="max-w-xl py-16">
        <Lock size={40} weight="bold" className="text-ink-subtle" />
        <h1 className="mt-4 font-display text-2xl text-ink">
          You can only edit your own posts.
        </h1>
        <p className="mt-2 text-ink-muted text-sm">
          This one was written by {authorName}. Switch to that writer from the
          top bar if it&apos;s you.
        </p>
        <Link href={`/journals/${id}`} className="btn btn-secondary mt-6">
          Back to the post
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/journals/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition mb-8"
      >
        <ArrowLeft size={14} weight="bold" />
        Back
      </Link>

      <h1
        className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink"
        data-reveal
      >
        Edit {isEssay ? "essay" : "journal"}.
      </h1>
      {isEssay && topicTitle && (
        <p
          className="mt-3 font-reading italic text-ink-muted leading-relaxed max-w-2xl"
          data-reveal
          style={{ "--d": "90ms" } as React.CSSProperties}
        >
          {topicTitle}
        </p>
      )}

      <form onSubmit={submit} className="mt-10 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-8">
          <div className="flex items-baseline justify-between mb-2 flex-wrap gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Content
            </label>
            <div className="flex items-center gap-5 text-xs tabular">
              {checks.map((c, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 font-semibold ${
                    c.ok ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {c.ok ? (
                    <CheckCircle size={14} weight="fill" className="text-accent" />
                  ) : (
                    <Circle size={14} weight="regular" />
                  )}
                  {c.label}
                </span>
              ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full min-h-[420px] px-4 py-4 font-reading text-[17px] leading-[1.65]"
          />
        </div>

        <aside className="md:col-span-4">
          <div className="card p-6 space-y-5 md:sticky md:top-24">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                Writer
              </div>
              <div className="font-display text-lg text-ink">{authorName}</div>
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
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
