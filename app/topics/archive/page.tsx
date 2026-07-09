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

  const totalSetoran = topics.reduce((s, t) => s + t._count.journals, 0);

  return (
    <div className="space-y-10">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
      >
        <ArrowLeft size={14} weight="regular" />
        Topik hari ini
      </Link>

      <header className="grid md:grid-cols-12 gap-8 items-end border-b border-ink pb-8">
        <div className="md:col-span-8">
          <h1 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink">
            Pool topik.
          </h1>
          <p className="mt-4 max-w-lg text-ink-muted text-[15px] leading-relaxed">
            Semua topik yang pernah masuk. Sistem pilih 3 random dari pool ini
            setiap hari.
          </p>
        </div>
        <div className="md:col-span-4 text-sm">
          <div className="flex justify-between border-b border-rule py-1.5 tabular">
            <span className="text-ink-muted">Total topik</span>
            <span className="text-ink">{topics.length}</span>
          </div>
          <div className="flex justify-between border-b border-rule py-1.5 tabular">
            <span className="text-ink-muted">Total setoran</span>
            <span className="text-ink">{totalSetoran}</span>
          </div>
        </div>
      </header>

      {topics.length === 0 && (
        <p className="text-ink-muted italic py-10">Belum ada topik.</p>
      )}

      <ul className="divide-y divide-rule border-y border-rule">
        {topics.map((t, i) => (
          <li key={t.id}>
            <Link
              href={`/topics/${t.id}/write`}
              className="group grid md:grid-cols-12 gap-4 py-5 hover:bg-paper-raised -mx-2 px-2 transition"
            >
              <div className="md:col-span-1 font-display text-xl text-ink-subtle tabular">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="md:col-span-9">
                <p className="font-display text-base leading-snug text-ink group-hover:text-accent transition">
                  {t.title}
                </p>
                {t.titleId && (
                  <p className="mt-1 font-reading italic text-sm text-ink-muted leading-snug">
                    {t.titleId}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 text-xs text-ink-subtle tabular md:text-right">
                {t._count.journals} setoran
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
