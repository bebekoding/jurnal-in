import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Timer } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { formatDurationLong } from "@/lib/time";
import ReviewForm from "./ReviewForm";
import OwnerActions from "./OwnerActions";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default async function JournalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let journal: any = await prisma.journal
    .findUnique({
      where: { id: params.id },
      select: {
        id: true,
        authorName: true,
        title: true,
        content: true,
        createdAt: true,
        topicId: true,
        durationSeconds: true,
        reviews: { orderBy: { createdAt: "asc" } },
        topic: { select: { id: true, title: true } },
      },
    })
    .catch(() => null);

  if (journal === null) {
    journal = await prisma.journal
      .findUnique({
        where: { id: params.id },
        select: {
          id: true,
          authorName: true,
          title: true,
          content: true,
          createdAt: true,
          topicId: true,
          reviews: { orderBy: { createdAt: "asc" } },
          topic: { select: { id: true, title: true } },
        },
      })
      .catch(() => null);
  }

  if (!journal) notFound();

  const isEssay = !!journal.topicId || !!journal.topic;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
        >
          <ArrowLeft size={14} weight="bold" />
          Home
        </Link>
        <OwnerActions journalId={journal.id} authorName={journal.authorName} />
      </div>

      <article className="card bg-paper-raised p-6 md:p-10" data-reveal>
        <span
          className={`inline-block text-[10px] uppercase tracking-widest font-semibold mb-2 ${
            isEssay ? "text-accent" : "text-ink-subtle"
          }`}
        >
          {isEssay ? "Essay" : "Journal"}
        </span>
        <h1 className="font-display text-3xl md:text-4xl leading-[1.05] tracking-tight text-ink">
          {journal.title}
        </h1>
        {isEssay && journal.topic && (
          <p className="mt-3 font-reading italic text-ink-muted leading-relaxed">
            {journal.topic.title}
          </p>
        )}

        <div className="mt-5 pb-5 border-b-[1.5px] border-ink flex flex-wrap gap-x-5 gap-y-1 text-xs tabular text-ink-muted">
          <span className="font-semibold text-ink">{journal.authorName}</span>
          <span>{formatDate(journal.createdAt)}</span>
          <span>{wordCount(journal.content)} words</span>
          {typeof journal.durationSeconds === "number" &&
            journal.durationSeconds > 0 && (
              <span className="inline-flex items-center gap-1">
                <Timer size={12} weight="bold" />
                {formatDurationLong(journal.durationSeconds)}
              </span>
            )}
        </div>

        <div className="prose-journal mt-8">{journal.content}</div>
      </article>

      <section data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
        <h2 className="font-display text-xl text-ink mb-5">
          Reviews{" "}
          <span className="text-ink-muted text-sm tabular">
            ({journal.reviews.length})
          </span>
        </h2>

        {journal.reviews.length === 0 ? (
          <p className="text-sm text-ink-muted italic mb-6">No reviews yet.</p>
        ) : (
          <ul className="space-y-4 mb-6">
            {journal.reviews.map((r: any) => (
              <li key={r.id} className="card p-4">
                <div className="flex items-baseline justify-between text-xs tabular mb-1.5">
                  <span className="font-semibold text-ink">{r.authorName}</span>
                  <span className="text-ink-muted">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                <p className="text-[15px] whitespace-pre-wrap leading-relaxed text-ink">
                  {r.comment}
                </p>
              </li>
            ))}
          </ul>
        )}

        <ReviewForm journalId={journal.id} />
      </section>
    </div>
  );
}
