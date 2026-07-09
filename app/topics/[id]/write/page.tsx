import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import WriteForm from "./WriteForm";
import TopicHeader from "./TopicHeader";

export const dynamic = "force-dynamic";

function formatShort(d: Date) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export default async function WriteTopicPage({
  params,
}: {
  params: { id: string };
}) {
  const topic = await prisma.topic
    .findUnique({
      where: { id: params.id },
      include: {
        journals: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            authorName: true,
            createdAt: true,
            content: true,
          },
        },
      },
    })
    .catch(() => null);

  if (!topic) notFound();

  return (
    <div className="max-w-3xl space-y-10">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
      >
        <ArrowLeft size={14} weight="regular" />
        Kembali ke topik hari ini
      </Link>

      <TopicHeader
        title={topic.title}
        titleId={topic.titleId}
        description={topic.description}
      />

      <WriteForm topicId={topic.id} />

      {topic.journals.length > 0 && (
        <section className="pt-6 border-t border-ink">
          <h2 className="font-display text-lg text-ink mb-4">
            Setoran peserta ({topic.journals.length})
          </h2>
          <ul className="divide-y divide-rule">
            {topic.journals.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/journals/${j.id}`}
                  className="grid grid-cols-12 gap-4 py-4 hover:bg-paper-raised -mx-2 px-2 transition"
                >
                  <div className="col-span-3 text-xs tabular text-ink-subtle">
                    <div className="text-ink">{j.authorName}</div>
                    <div className="mt-0.5">{formatShort(j.createdAt)}</div>
                  </div>
                  <p className="col-span-9 text-sm text-ink-muted font-reading leading-relaxed line-clamp-2">
                    {j.content.slice(0, 220)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
