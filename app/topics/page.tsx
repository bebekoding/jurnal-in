import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayJakartaISO, formatDateLong } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const today = todayJakartaISO();
  const startOfDay = new Date(today + "T00:00:00Z");
  const endOfDay = new Date(today + "T23:59:59Z");

  const topics = await prisma.topic
    .findMany({
      where: {
        scheduledFor: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { journals: true } } },
      take: 3,
    })
    .catch(() => [] as any[]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="text-center py-6">
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">
          Random Topics
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight">
          Topik hari ini
        </h1>
        <p className="mt-2 text-ink/60 text-sm">
          {formatDateLong(today)} · 3 topik yang bisa kamu pilih. Setoran min
          4 paragraf & 200 kata.
        </p>
      </section>

      {topics.length === 0 ? (
        <div className="border border-dashed border-ink/20 rounded-lg p-10 text-center text-ink/60">
          Belum ada topik untuk hari ini. Admin bisa tambah lewat{" "}
          <Link href="/topics/admin" className="text-accent underline">
            /topics/admin
          </Link>
          .
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {topics.map((t, i) => (
            <li key={t.id}>
              <div className="border border-ink/10 rounded-lg p-5 bg-white h-full flex flex-col">
                <div className="text-xs text-accent uppercase tracking-widest mb-2">
                  Topik {i + 1}
                </div>
                <h2 className="font-serif text-lg font-semibold leading-snug mb-2">
                  {t.title}
                </h2>
                {t.description && (
                  <p className="text-sm text-ink/70 leading-relaxed mb-3">
                    {t.description}
                  </p>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between text-xs">
                  <span className="text-ink/50">
                    ✍️ {t._count.journals} setoran
                  </span>
                  <Link
                    href={`/topics/${t.id}/write`}
                    className="bg-ink text-paper px-3 py-1.5 rounded-full font-medium hover:bg-accent transition"
                  >
                    Tulis →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="text-center pt-4">
        <Link
          href="/topics/archive"
          className="text-sm text-accent hover:underline"
        >
          Lihat arsip topik & setoran →
        </Link>
      </div>
    </div>
  );
}
