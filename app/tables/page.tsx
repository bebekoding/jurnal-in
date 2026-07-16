import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { todayJakartaISO, formatDateLong } from "@/lib/date";
import { seededShuffle } from "@/lib/random";

export const dynamic = "force-dynamic";

const DAILY_COUNT = 2;

export default async function TablesPage() {
  const today = todayJakartaISO();

  const all = await prisma.tableTopic
    .findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        title: true,
        category: true,
        _count: { select: { journals: true } },
      },
    })
    .catch(() => [] as any[]);

  const shuffled = seededShuffle(all, "table-" + today);
  const prioritized = [...shuffled].sort(
    (a, b) => a._count.journals - b._count.journals
  );
  const tables = prioritized.slice(0, DAILY_COUNT);
  const freshCount = all.filter((t) => t._count.journals === 0).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.98] tracking-tight text-ink">
            <span className="block" data-reveal>
              Task 1
            </span>
            <span
              className="block italic font-reading font-medium"
              data-reveal
              style={{ "--d": "90ms" } as React.CSSProperties}
            >
              table description.
            </span>
          </h1>
          <p
            className="mt-4 text-ink-muted text-[15px] max-w-lg"
            data-reveal
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            Describe the data in 150 words minimum. Cover an overview of the
            main trends, then support it with selective figures.
          </p>
        </div>
        <div
          className="card px-5 py-3 text-sm tabular"
          data-reveal
          style={{ "--d": "260ms" } as React.CSSProperties}
        >
          <span className="text-ink font-semibold">{formatDateLong(today)}</span>
          <span className="text-ink-muted">
            {" · "}
            {freshCount > 0
              ? `${freshCount} unused of ${all.length}`
              : `bank of ${all.length}, rotating`}
          </span>
        </div>
      </header>

      {tables.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted" data-reveal>
          No tables in the bank yet.
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-6">
          {tables.map((t, i) => (
            <li
              key={t.id}
              data-reveal
              style={{ "--d": `${i * 100}ms` } as React.CSSProperties}
            >
              <Link
                href={`/tables/${t.id}/write`}
                className="card group flex flex-col h-full p-6 bg-paper-raised"
              >
                <div className="flex items-baseline justify-between mb-5">
                  <span className="font-display text-4xl text-ink tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t._count.journals === 0 ? (
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-accent tabular">
                      Unused
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-ink-muted tabular">
                      {t._count.journals} done
                    </span>
                  )}
                </div>
                {t.category && (
                  <span className="text-[10px] uppercase tracking-widest text-ink-subtle font-semibold mb-1.5">
                    {t.category}
                  </span>
                )}
                <h3 className="font-display text-base leading-snug text-ink">
                  {t.title}
                </h3>
                <div className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                  Describe it
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div data-reveal>
        <Link href="/tables/archive" className="link text-sm">
          All tables in the bank →
        </Link>
      </div>
    </div>
  );
}
