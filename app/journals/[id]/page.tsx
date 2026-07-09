import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewForm from "./ReviewForm";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
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
      },
    })
    .catch(() => null);

  if (!journal) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/" className="text-sm text-ink/60 hover:text-accent">
          ← Semua jurnal
        </Link>
      </div>

      <article className="bg-white border border-ink/10 rounded-lg p-6 md:p-8">
        <div className="flex items-center justify-between text-xs text-ink/50 mb-3">
          <span>
            oleh <b className="text-ink/80">{journal.authorName}</b> ·{" "}
            {formatDate(journal.createdAt)}
          </span>
          <span>{wordCount(journal.content)} kata</span>
        </div>
        <h1 className="font-serif text-3xl font-bold leading-tight mb-4">
          {journal.title}
        </h1>
        <div className="prose-journal">{journal.content}</div>
      </article>

      <section>
        <h2 className="font-serif text-xl font-semibold mb-3">
          Review dari teman ({journal.reviews.length})
        </h2>
        <div className="space-y-3">
          {journal.reviews.length === 0 && (
            <p className="text-sm text-ink/50 italic">
              Belum ada review. Jadi yang pertama kasih feedback.
            </p>
          )}
          {journal.reviews.map((r) => (
            <div
              key={r.id}
              className="border border-ink/10 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center justify-between text-xs text-ink/50 mb-1">
                <b className="text-ink/80">{r.authorName}</b>
                <span>{formatDate(r.createdAt)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {r.comment}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <ReviewForm journalId={journal.id} />
        </div>
      </section>
    </div>
  );
}
