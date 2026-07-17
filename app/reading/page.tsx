import Link from "next/link";
import { ArrowRight, Timer, ListChecks } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { READING_SETS } from "@/lib/reading-sets";
import { formatDurationLong } from "@/lib/time";

export const dynamic = "force-dynamic";

function formatShort(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default async function ReadingPage() {
  const results = await prisma.readingResult
    .findMany({ orderBy: { createdAt: "desc" }, take: 30 })
    .catch(() => [] as any[]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.98] tracking-tight text-ink">
          <span className="block" data-reveal>
            Academic
          </span>
          <span
            className="block italic font-reading font-medium"
            data-reveal
            style={{ "--d": "90ms" } as React.CSSProperties}
          >
            reading.
          </span>
        </h1>
        <p
          className="mt-4 text-ink-muted text-[15px] max-w-xl"
          data-reveal
          style={{ "--d": "180ms" } as React.CSSProperties}
        >
          3 passages, 40 questions, a 40-minute countdown. Submit to see your
          band score with the answer key and paragraph citations for every
          question.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        {READING_SETS.map((set, i) => (
          <div
            key={set.id}
            data-reveal
            style={{ "--d": `${i * 100}ms` } as React.CSSProperties}
          >
            <Link
              href={`/reading/${set.id}`}
              className="card group flex flex-col h-full p-6 bg-paper-raised"
            >
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-display text-4xl text-ink tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-accent">
                  <Timer size={13} weight="bold" />
                  {set.durationMinutes} min
                </span>
              </div>
              <h3 className="font-display text-xl leading-snug text-ink">
                {set.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted font-reading leading-relaxed">
                {set.subtitle}
              </p>
              <div className="mt-4 flex items-center gap-4 text-[11px] uppercase tracking-widest text-ink-subtle font-semibold">
                <span className="inline-flex items-center gap-1">
                  <ListChecks size={13} weight="bold" />
                  {set.totalQuestions} questions
                </span>
                <span>{set.passages.length} passages</span>
              </div>
              <div className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                Start test
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          </div>
        ))}

        <div
          className="card p-6 grid place-items-center text-center text-sm text-ink-muted border-dashed"
          data-reveal
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          More sets coming soon.
          <br />
          Only one set is available for now.
        </div>
      </section>

      {results.length > 0 && (
        <section data-reveal>
          <div className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-3 mb-4">
            <h2 className="font-display text-xl text-ink">Recent results</h2>
            <span className="text-xs text-ink-muted tabular">
              {results.length}
            </span>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/reading/result/${r.id}`}
                  className="card block p-4 h-full"
                >
                  <div className="flex items-baseline justify-between text-xs tabular mb-2">
                    <span className="font-semibold text-ink">
                      {r.authorName}
                    </span>
                    <span className="text-ink-muted">
                      {formatShort(r.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl text-ink tabular">
                      {r.band}
                    </span>
                    <span className="text-sm text-ink-muted tabular">
                      {r.rawScore}/40
                    </span>
                    {typeof r.durationSeconds === "number" &&
                      r.durationSeconds > 0 && (
                        <span className="ml-auto inline-flex items-center gap-1 text-xs text-ink-muted tabular">
                          <Timer size={12} weight="bold" />
                          {formatDurationLong(r.durationSeconds)}
                        </span>
                      )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
