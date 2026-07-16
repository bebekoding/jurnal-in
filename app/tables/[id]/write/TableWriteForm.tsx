"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Timer } from "@phosphor-icons/react";
import { useIdentity } from "@/components/Identity";
import { formatDuration } from "@/lib/time";

const MIN_WORDS = 150;
const MIN_PARAGRAPHS = 3;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function paragraphCount(text: string) {
  return text
    .trim()
    .split(/\n\s*\n+/)
    .filter((p) => p.trim().length > 0).length;
}

export default function TableWriteForm({
  tableTopicId,
}: {
  tableTopicId: string;
}) {
  const router = useRouter();
  const { name } = useIdentity();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    startedAtRef.current = startedAt;
    const tick = () =>
      setElapsed(Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  function handleContentChange(next: string) {
    setContent(next);
    if (!startedAt && next.trim().length > 0) setStartedAt(Date.now());
  }

  const words = wordCount(content);
  const paras = paragraphCount(content);
  const wordsOK = words >= MIN_WORDS;
  const parasOK = paras >= MIN_PARAGRAPHS;

  const startedLabel = startedAt
    ? new Date(startedAt).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !content.trim()) {
      setError("Your description is required.");
      return;
    }
    if (!wordsOK) {
      setError(`At least ${MIN_WORDS} words (${words} so far).`);
      return;
    }
    if (!parasOK) {
      setError(
        `At least ${MIN_PARAGRAPHS} paragraphs (${paras} so far). Separate paragraphs with a blank line.`
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorName: name,
          tableTopicId,
          content: content.trim(),
          durationSeconds: startedAt ? elapsed : null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/journals/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save the description.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid md:grid-cols-12 gap-8"
      data-reveal
      style={{ "--d": "120ms" } as React.CSSProperties}
    >
      <div className="md:col-span-8">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Your description
          </label>
          <div className="flex items-center gap-5 text-xs tabular">
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                wordsOK ? "text-ink" : "text-ink-muted"
              }`}
            >
              {wordsOK ? (
                <CheckCircle size={14} weight="fill" className="text-accent" />
              ) : (
                <Circle size={14} weight="regular" />
              )}
              {words}/{MIN_WORDS} words
            </span>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                parasOK ? "text-ink" : "text-ink-muted"
              }`}
            >
              {parasOK ? (
                <CheckCircle size={14} weight="fill" className="text-accent" />
              ) : (
                <Circle size={14} weight="regular" />
              )}
              {paras}/{MIN_PARAGRAPHS} paragraphs
            </span>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={18}
          className="w-full min-h-[380px] px-4 py-4 font-reading text-[17px] leading-[1.65]"
          placeholder="The table illustrates... Overall,..."
        />
      </div>

      <aside className="md:col-span-4">
        <div className="card p-6 space-y-5 md:sticky md:top-24">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted inline-flex items-center gap-1.5">
                <Timer size={12} weight="bold" />
                Time on task
              </label>
              {startedAt && (
                <span className="text-[10px] text-ink-muted tabular">
                  started {startedLabel}
                </span>
              )}
            </div>
            <div
              className={`font-display font-semibold tabular text-4xl leading-none ${
                startedAt ? "text-ink" : "text-ink-subtle"
              }`}
              aria-live="polite"
            >
              {formatDuration(elapsed)}
            </div>
            <p className="mt-1.5 text-[11px] text-ink-muted">
              Task 1 target: 20 minutes.
            </p>
          </div>

          <div className="border-t border-ink/15 pt-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Writer
            </div>
            <div className="font-display text-lg text-ink">{name}</div>
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
            {submitting ? "Saving…" : "Submit description"}
          </button>
        </div>
      </aside>
    </form>
  );
}
