import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChatCircleText } from "@phosphor-icons/react/dist/ssr";
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
        topic: { select: { id: true, title: true, description: true } },
      },
    })
    .catch(() => null);

  if (!journal) notFound();

  return (
    <div className="grid md:grid-cols-12 gap-10">
      <div className="md:col-span-8 space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
        >
          <ArrowLeft size={14} weight="regular" />
          Semua tulisan
        </Link>

        <article>
          {journal.topic && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-accent">
                Random Topic
              </span>
            </div>
          )}
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-ink">
            {journal.title}
          </h1>
          {journal.topic?.description && (
            <p className="mt-4 font-reading italic text-lg text-ink-muted leading-relaxed max-w-2xl">
              {journal.topic.description}
            </p>
          )}

          <div className="mt-6 pb-6 border-b border-ink flex flex-wrap items-center gap-x-6 gap-y-2 text-xs tabular text-ink-subtle">
            <span>
              Oleh <span className="text-ink">{journal.authorName}</span>
            </span>
            <span>{formatDate(journal.createdAt)}</span>
            <span>{wordCount(journal.content)} kata</span>
          </div>

          <div className="prose-journal mt-10 max-w-none">
            {journal.content}
          </div>
        </article>

        <section className="pt-8 border-t border-rule">
          <div className="flex items-baseline gap-2 mb-6">
            <ChatCircleText size={18} weight="regular" className="text-ink" />
            <h2 className="font-display text-xl text-ink">
              Review dari peserta
            </h2>
            <span className="text-xs text-ink-subtle tabular ml-1">
              ({journal.reviews.length})
            </span>
          </div>

          {journal.reviews.length === 0 ? (
            <p className="text-sm text-ink-subtle italic">
              Belum ada review. Jadi yang pertama kasih feedback.
            </p>
          ) : (
            <ul className="space-y-6">
              {journal.reviews.map((r) => (
                <li key={r.id} className="border-l-2 border-rule pl-4">
                  <div className="flex items-baseline justify-between text-xs tabular text-ink-subtle mb-1">
                    <span className="text-ink font-medium">{r.authorName}</span>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-[15px] whitespace-pre-wrap leading-relaxed text-ink">
                    {r.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <ReviewForm journalId={journal.id} />
          </div>
        </section>
      </div>

      <aside className="md:col-span-4">
        <div className="md:sticky md:top-24 space-y-4 border-t border-ink pt-4 text-sm">
          <div className="flex justify-between tabular">
            <span className="text-ink-muted">Penulis</span>
            <span className="text-ink">{journal.authorName}</span>
          </div>
          <div className="flex justify-between tabular">
            <span className="text-ink-muted">Kata</span>
            <span className="text-ink">{wordCount(journal.content)}</span>
          </div>
          <div className="flex justify-between tabular">
            <span className="text-ink-muted">Review</span>
            <span className="text-ink">{journal.reviews.length}</span>
          </div>
          {journal.topic && (
            <div className="pt-4 border-t border-rule">
              <div className="text-xs uppercase tracking-widest text-ink-subtle mb-2">
                Dari topik
              </div>
              <p className="font-reading italic text-ink-muted leading-relaxed">
                {journal.topic.title}
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
