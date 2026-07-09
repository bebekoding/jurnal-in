import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import ReviewForm from "./ReviewForm";

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
  const journal = await prisma.journal
    .findUnique({
      where: { id: params.id },
      include: {
        reviews: { orderBy: { createdAt: "asc" } },
        topic: { select: { id: true, title: true } },
      },
    })
    .catch(() => null);

  if (!journal) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
      >
        <ArrowLeft size={14} weight="bold" />
        Home
      </Link>

      <article className="card bg-paper-raised p-6 md:p-10" data-reveal>
        {journal.topic && (
          <span className="inline-block text-[10px] uppercase tracking-widest font-semibold text-accent mb-2">
            Essay
          </span>
        )}
        <h1 className="font-display text-3xl md:text-4xl leading-[1.05] tracking-tight text-ink">
          {journal.title}
        </h1>
        {journal.topic && (
          <p className="mt-3 font-reading italic text-ink-muted leading-relaxed">
            {journal.topic.title}
          </p>
        )}

        <div className="mt-5 pb-5 border-b-[1.5px] border-ink flex flex-wrap gap-x-5 gap-y-1 text-xs tabular text-ink-muted">
          <span className="font-semibold text-ink">{journal.authorName}</span>
          <span>{formatDate(journal.createdAt)}</span>
          <span>{wordCount(journal.content)} words</span>
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
            {journal.reviews.map((r) => (
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
