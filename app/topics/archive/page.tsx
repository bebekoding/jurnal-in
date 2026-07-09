import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateLong } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function TopicsArchivePage() {
  const topics = await prisma.topic
    .findMany({
      orderBy: { scheduledFor: "desc" },
      include: { _count: { select: { journals: true } } },
      take: 60,
    })
    .catch(() => [] as any[]);

  const byDate = new Map<string, typeof topics>();
  for (const t of topics) {
    const key = new Date(t.scheduledFor).toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, [] as any);
    byDate.get(key)!.push(t);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/topics" className="text-sm text-ink/60 hover:text-accent">
          ← Topik hari ini
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-bold">Arsip topik</h1>

      {byDate.size === 0 && (
        <p className="text-ink/60 italic">Belum ada topik.</p>
      )}

      {Array.from(byDate.entries()).map(([date, list]) => (
        <section key={date}>
          <h2 className="font-serif text-lg font-semibold mb-2">
            {formatDateLong(date)}
          </h2>
          <ul className="grid gap-3 md:grid-cols-3">
            {list.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/topics/${t.id}/write`}
                  className="block border border-ink/10 rounded-md p-3 bg-white hover:border-accent"
                >
                  <p className="font-serif text-sm font-semibold leading-snug">
                    {t.title}
                  </p>
                  <p className="text-xs text-ink/50 mt-2">
                    {t._count.journals} setoran
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
