import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import WriteForm from "./WriteForm";

export const dynamic = "force-dynamic";

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/topics" className="text-sm text-ink/60 hover:text-accent">
          ← Kembali ke topik hari ini
        </Link>
      </div>

      <section className="border border-ink/10 rounded-lg p-6 bg-white">
        <div className="text-xs uppercase tracking-widest text-accent mb-1">
          Topik
        </div>
        <h1 className="font-serif text-2xl font-bold leading-snug mb-2">
          {topic.title}
        </h1>
        {topic.description && (
          <p className="text-sm text-ink/70 leading-relaxed">
            {topic.description}
          </p>
        )}
      </section>

      <WriteForm topicId={topic.id} />

      {topic.journals.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-semibold mb-3">
            Setoran peserta ({topic.journals.length})
          </h2>
          <ul className="space-y-2">
            {topic.journals.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/journals/${j.id}`}
                  className="block border border-ink/10 rounded-md p-3 bg-white hover:border-accent text-sm"
                >
                  <div className="flex items-center justify-between">
                    <b className="text-ink/80">{j.authorName}</b>
                    <span className="text-xs text-ink/50">
                      {new Date(j.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-ink/60 text-xs mt-1 line-clamp-2">
                    {j.content.slice(0, 160)}…
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
