import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
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
    <div className="space-y-8">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
      >
        <ArrowLeft size={14} weight="bold" />
        Topik hari ini
      </Link>

      <header data-reveal>
        <h1 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink">
          Pool topik.
        </h1>
        <p className="mt-3 text-ink-muted text-[15px] tabular">
          {topics.length} topik. Tiga terpilih random setiap hari.
        </p>
      </header>

      {topics.length === 0 && (
        <p className="text-ink-muted italic">Belum ada topik.</p>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {topics.map((t, i) => (
          <li
            key={t.id}
            data-reveal
            style={{ "--d": `${(i % 4) * 60}ms` } as React.CSSProperties}
          >
            <Link href={`/topics/${t.id}/write`} className="card block p-5 h-full">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-display text-lg text-ink-subtle tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-ink-muted tabular">
                  {t._count.journals} setoran
                </span>
              </div>
              <p className="font-display text-base leading-snug text-ink">
                {t.title}
              </p>
              {t.titleId && (
                <p className="mt-1.5 font-reading italic text-sm text-ink-muted leading-snug">
                  {t.titleId}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
