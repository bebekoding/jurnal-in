import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TopicsArchivePage() {
  const topics = await prisma.topic
    .findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        titleId: true,
        _count: { select: { journals: true } },
      },
      take: 200,
    })
    .catch(() => [] as any[]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/topics" className="text-sm text-ink/60 hover:text-accent">
          ← Topik hari ini
        </Link>
      </div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl font-bold">Pool topik</h1>
        <span className="text-xs text-ink/50">{topics.length} topik</span>
      </div>

      {topics.length === 0 && (
        <p className="text-ink/60 italic">Belum ada topik.</p>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {topics.map((t) => (
          <li key={t.id}>
            <Link
              href={`/topics/${t.id}/write`}
              className="block border border-ink/10 rounded-md p-4 bg-white hover:border-accent"
            >
              <p className="font-serif text-sm font-semibold leading-snug">
                {t.title}
              </p>
              {t.titleId && (
                <p className="text-xs text-ink/50 italic mt-1">{t.titleId}</p>
              )}
              <p className="text-xs text-ink/50 mt-2">
                ✍️ {t._count.journals} setoran
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
