import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TablesArchivePage() {
  const tables = await prisma.tableTopic
    .findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        category: true,
        _count: { select: { journals: true } },
      },
      take: 200,
    })
    .catch(() => [] as any[]);

  const byCat = new Map<string, typeof tables>();
  for (const t of tables) {
    const key = t.category || "Other";
    if (!byCat.has(key)) byCat.set(key, [] as any);
    byCat.get(key)!.push(t);
  }

  return (
    <div className="space-y-8">
      <Link
        href="/tables"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
      >
        <ArrowLeft size={14} weight="bold" />
        Task 1 tables
      </Link>

      <header data-reveal>
        <h1 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink">
          Table bank.
        </h1>
        <p className="mt-3 text-ink-muted text-[15px] tabular">
          {tables.length} tables. Three picked at random every day.
        </p>
      </header>

      {tables.length === 0 && (
        <p className="text-ink-muted italic">No tables yet.</p>
      )}

      {Array.from(byCat.entries()).map(([cat, list]) => (
        <section key={cat}>
          <div className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-2 mb-3">
            <h2 className="font-display text-lg text-ink">{cat}</h2>
            <span className="text-xs text-ink-muted tabular">
              {list.length}
            </span>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {list.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tables/${t.id}/write`}
                  className="card block p-4 h-full"
                >
                  <div className="flex items-baseline justify-between text-[10px] uppercase tracking-widest text-ink-muted tabular mb-1">
                    <span>{t.category}</span>
                    <span>{t._count.journals} done</span>
                  </div>
                  <p className="font-display text-sm leading-snug text-ink">
                    {t.title}
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
