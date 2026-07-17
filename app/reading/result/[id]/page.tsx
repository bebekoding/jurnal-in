import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Timer,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { formatDurationLong } from "@/lib/time";
import {
  getReadingSet,
  scoreSet,
  allQuestions,
  bandForRaw,
} from "@/lib/reading-sets";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ReadingResultPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await prisma.readingResult
    .findUnique({ where: { id: params.id } })
    .catch(() => null);

  if (!result) notFound();

  const set = getReadingSet(result.setId);

  let answers: Record<string, string> = {};
  try {
    answers = JSON.parse(result.answers);
  } catch {
    answers = {};
  }

  // Re-score from the stored answers so the review always matches the key.
  const scored = set ? scoreSet(set, answers) : null;
  const band = scored ? bandForRaw(scored.raw) : bandForRaw(result.rawScore);
  const questions = set ? allQuestions(set) : [];
  const perByN = new Map(scored?.perQuestion.map((p) => [p.n, p]) ?? []);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/reading"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
        >
          <ArrowLeft size={14} weight="bold" />
          Reading
        </Link>
      </div>

      {/* Score hero */}
      <section className="card bg-paper-raised p-6 md:p-10" data-reveal>
        <span className="text-[10px] uppercase tracking-widest font-semibold text-ink-subtle">
          Reading band
        </span>
        <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-2">
          <span className="font-display text-6xl md:text-7xl leading-none text-ink tabular">
            {band.band}
          </span>
          <div className="pb-1">
            <div className="font-display text-2xl text-ink tabular">
              {result.rawScore}
              <span className="text-ink-muted text-lg">/40 correct</span>
            </div>
            <div className="text-sm text-ink-muted">{band.interpretation}</div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t-[1.5px] border-ink flex flex-wrap gap-x-5 gap-y-1 text-xs tabular text-ink-muted">
          <span className="font-semibold text-ink">{result.authorName}</span>
          <span>{formatDate(result.createdAt)}</span>
          {typeof result.durationSeconds === "number" &&
            result.durationSeconds > 0 && (
              <span className="inline-flex items-center gap-1">
                <Timer size={12} weight="bold" />
                {formatDurationLong(result.durationSeconds)} of{" "}
                {set?.durationMinutes ?? 40}m
              </span>
            )}
          {set && <span>{set.subtitle}</span>}
        </div>
      </section>

      {/* Per-question review */}
      {set ? (
        <section data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
          <h2 className="font-display text-xl text-ink mb-4">
            Answer review & explanations
          </h2>
          <ul className="space-y-2">
            {questions.map((q) => {
              const p = perByN.get(q.n);
              const given = (answers[String(q.n)] ?? "").trim();
              const correct = p?.correct ?? false;
              return (
                <li
                  key={q.n}
                  className={`card p-4 ${
                    correct ? "" : "bg-accent-soft/40"
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="shrink-0 mt-0.5">
                      {correct ? (
                        <CheckCircle
                          size={20}
                          weight="fill"
                          className="text-accent"
                        />
                      ) : (
                        <XCircle
                          size={20}
                          weight="fill"
                          className="text-[#c53a20]"
                        />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] text-ink leading-snug">
                        <span className="font-display font-semibold tabular mr-1">
                          {q.n}.
                        </span>
                        {q.prompt}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs tabular">
                        <span className="text-ink-muted">
                          Your answer:{" "}
                          <span
                            className={
                              correct
                                ? "text-ink font-semibold"
                                : "text-[#c53a20] font-semibold"
                            }
                          >
                            {given || "—"}
                          </span>
                        </span>
                        {!correct && (
                          <span className="text-ink-muted">
                            Correct:{" "}
                            <span className="text-ink font-semibold">
                              {q.answer}
                            </span>
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-ink-subtle">{q.note}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <p className="text-sm text-ink-muted">
          This set is no longer available, so the per-question review can&apos;t
          be shown.
        </p>
      )}

      <div data-reveal>
        <Link href="/reading" className="btn btn-secondary">
          Back to reading
        </Link>
      </div>
    </div>
  );
}
