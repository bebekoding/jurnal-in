"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Timer, WarningCircle } from "@phosphor-icons/react";
import { useIdentity } from "@/components/Identity";
import { formatDuration } from "@/lib/time";
import type { ReadingSet, Question, QGroup } from "@/lib/reading-sets";
import { allQuestions } from "@/lib/reading-sets";

const TFNG = ["TRUE", "FALSE", "NOT GIVEN"];

export default function ReadingTest({ set }: { set: ReadingSet }) {
  const router = useRouter();
  const { name } = useIdentity();
  const totalSeconds = set.durationMinutes * 60;

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(totalSeconds);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startedAtRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  const questions = useMemo(() => allQuestions(set), [set]);
  const answeredCount = questions.filter(
    (q) => (answers[String(q.n)] ?? "").trim().length > 0
  ).length;

  function setAnswer(n: number, value: string) {
    setAnswers((prev) => ({ ...prev, [String(n)]: value }));
  }

  // Countdown
  useEffect(() => {
    if (!started) return;
    startedAtRef.current = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - (startedAtRef.current ?? Date.now())) / 1000
      );
      const left = Math.max(0, totalSeconds - elapsed);
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        void submit(true);
      }
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  async function submit(auto = false) {
    if (submittedRef.current) return;
    if (!name) {
      setError("Pick your name in the top bar first.");
      return;
    }
    if (!auto && answeredCount < questions.length) {
      const ok = window.confirm(
        `You've answered ${answeredCount} of ${questions.length}. Submit anyway?`
      );
      if (!ok) return;
    }
    submittedRef.current = true;
    setSubmitting(true);
    const elapsed = totalSeconds - remaining;
    const durationSeconds = auto
      ? totalSeconds
      : Math.min(totalSeconds, Math.max(0, elapsed));
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorName: name,
          setId: set.id,
          answers,
          durationSeconds,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/reading/result/${data.id}`);
    } catch (err: any) {
      submittedRef.current = false;
      setError(err.message || "Failed to submit.");
      setSubmitting(false);
    }
  }

  const low = remaining <= 300; // last 5 minutes

  if (!started) {
    return (
      <div className="max-w-2xl space-y-8">
        <Link
          href="/reading"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
        >
          <ArrowLeft size={14} weight="bold" />
          Reading sets
        </Link>
        <div className="card bg-paper-raised p-8" data-reveal>
          <h1 className="font-display text-3xl text-ink leading-tight">
            {set.title}
          </h1>
          <p className="mt-2 text-ink-muted font-reading">{set.subtitle}</p>
          <ul className="mt-6 space-y-2 text-sm text-ink">
            <li className="flex items-center gap-2">
              <Timer size={16} weight="bold" className="text-accent" />
              {set.durationMinutes}-minute countdown — it starts as soon as you
              begin and auto-submits at zero.
            </li>
            <li className="flex items-center gap-2">
              <WarningCircle size={16} weight="bold" className="text-accent" />
              {set.passages.length} passages · {set.totalQuestions} questions.
              Spelling and case are not marked, but the exact word from the
              passage is safest.
            </li>
          </ul>
          {!name && (
            <p className="mt-5 text-sm text-accent">
              Pick your name in the top bar before you start.
            </p>
          )}
          <button
            onClick={() => setStarted(true)}
            disabled={!name}
            className="btn btn-primary mt-6"
          >
            Start the 40-minute test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sticky timer bar */}
      <div className="sticky top-16 z-20 -mx-6 px-6 py-3 bg-paper/95 backdrop-blur border-b-[1.5px] border-ink">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Timer
              size={18}
              weight="bold"
              className={low ? "text-accent" : "text-ink"}
            />
            <span
              className={`font-display font-semibold tabular text-2xl leading-none ${
                low ? "text-accent" : "text-ink"
              }`}
              aria-live="polite"
            >
              {formatDuration(remaining)}
            </span>
            <span className="text-xs text-ink-muted tabular ml-1">left</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-ink-muted tabular hidden sm:inline">
              {answeredCount}/{questions.length} answered
            </span>
            <button
              onClick={() => submit(false)}
              disabled={submitting}
              className="btn btn-primary h-9"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card bg-accent-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      {set.passages.map((passage) => (
        <section key={passage.n} className="grid lg:grid-cols-2 gap-8">
          {/* Passage text */}
          <div className="card bg-paper-raised p-6 lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-ink-subtle">
              Passage {passage.n} · {passage.category} · {passage.rangeLabel}
            </span>
            <h2 className="mt-1 font-display text-xl text-ink leading-tight">
              {passage.title}
            </h2>
            <p className="mt-1 text-xs text-ink-muted italic">
              {passage.source}
            </p>
            <div className="mt-4 space-y-3 font-reading text-[15px] leading-relaxed text-ink">
              {passage.paragraphs.map((p) => (
                <p key={p.label}>
                  <span className="font-semibold text-ink-muted mr-1">
                    [{p.label}]
                  </span>
                  {p.text}
                </p>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {passage.groups.map((group, gi) => (
              <QuestionGroup
                key={gi}
                group={group}
                answers={answers}
                setAnswer={setAnswer}
                paragraphLetters={passage.paragraphs.map((p) => p.label)}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button
          onClick={() => submit(false)}
          disabled={submitting}
          className="btn btn-primary"
        >
          {submitting ? "Submitting…" : "Submit test"}
        </button>
      </div>
    </div>
  );
}

function QuestionGroup({
  group,
  answers,
  setAnswer,
  paragraphLetters,
}: {
  group: QGroup;
  answers: Record<string, string>;
  setAnswer: (n: number, v: string) => void;
  paragraphLetters: string[];
}) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-ink mb-4">{group.instruction}</p>

      {group.headings && (
        <ul className="mb-4 rounded-lg bg-lime-soft/60 p-3 text-[13px] text-ink space-y-1">
          {group.headings.map((h) => (
            <li key={h.key}>
              <span className="font-semibold mr-1.5 tabular">{h.key}</span>
              {h.text}
            </li>
          ))}
        </ul>
      )}

      <ol className="space-y-4">
        {group.questions.map((q) => (
          <li key={q.n}>
            <QuestionInput
              q={q}
              value={answers[String(q.n)] ?? ""}
              onChange={(v) => setAnswer(q.n, v)}
              headings={group.headings}
              paragraphLetters={paragraphLetters}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function QuestionInput({
  q,
  value,
  onChange,
  headings,
  paragraphLetters,
}: {
  q: Question;
  value: string;
  onChange: (v: string) => void;
  headings?: { key: string; text: string }[];
  paragraphLetters: string[];
}) {
  const label = (
    <span className="flex gap-2">
      <span className="font-display font-semibold text-ink tabular shrink-0">
        {q.n}.
      </span>
      <span className="text-[15px] text-ink leading-snug">{q.prompt}</span>
    </span>
  );

  if (q.type === "tfng") {
    return (
      <div>
        {label}
        <div className="mt-2 flex flex-wrap gap-2">
          {TFNG.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`h-8 px-3 rounded-full border-[1.5px] text-xs font-semibold transition ${
                value === opt
                  ? "bg-lime border-ink text-ink shadow-hard-sm"
                  : "border-ink/30 text-ink-muted hover:border-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (q.type === "mc" && q.options) {
    return (
      <div>
        {label}
        <div className="mt-2 space-y-1.5">
          {q.options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.label)}
              className={`w-full text-left flex gap-2.5 items-start px-3 py-2 rounded-lg border-[1.5px] text-[13px] transition ${
                value === opt.label
                  ? "bg-lime-soft border-ink text-ink"
                  : "border-ink/20 text-ink-muted hover:border-ink/50"
              }`}
            >
              <span className="font-semibold tabular">{opt.label}</span>
              <span>{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (q.type === "heading" && headings) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-display font-semibold text-ink tabular shrink-0">
          {q.n}. {q.prompt}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 px-2 text-sm min-w-[80px]"
        >
          <option value="">—</option>
          {headings.map((h) => (
            <option key={h.key} value={h.key}>
              {h.key}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (q.type === "matching") {
    return (
      <div>
        {label}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 h-9 px-2 text-sm min-w-[80px]"
        >
          <option value="">—</option>
          {paragraphLetters.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // short answer
  return (
    <div>
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-10 px-3 text-sm"
        placeholder="Your answer"
        autoComplete="off"
      />
    </div>
  );
}
