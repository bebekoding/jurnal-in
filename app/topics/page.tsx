import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayJakartaISO, formatDateLong } from "@/lib/date";
import { seededShuffle } from "@/lib/random";
import TopicsList from "./TopicsList";

export const dynamic = "force-dynamic";

const DAILY_COUNT = 3;

export default async function TopicsPage() {
  const today = todayJakartaISO();

  const allTopics = await prisma.topic
    .findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        title: true,
        titleId: true,
        description: true,
        _count: { select: { journals: true } },
      },
    })
    .catch(() => [] as any[]);

  // Prioritize topics never chosen yet, then least-used. Deterministic per day.
  // seededShuffle gives per-day random order; stable sort by count keeps that
  // order inside each usage tier (0 essays first, then 1, then 2, ...).
  const shuffled = seededShuffle(allTopics, today);
  const prioritized = [...shuffled].sort(
    (a, b) => a._count.journals - b._count.journals
  );
  const topics = prioritized.slice(0, DAILY_COUNT);

  const freshCount = allTopics.filter((t) => t._count.journals === 0).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.98] tracking-tight text-ink">
            <span className="block" data-reveal>
              Today&apos;s
            </span>
            <span
              className="block italic font-reading font-medium"
              data-reveal
              style={{ "--d": "90ms" } as React.CSSProperties}
            >
              topic.
            </span>
          </h1>
          <p
            className="mt-4 text-ink-muted text-[15px]"
            data-reveal
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            Pick one. Four paragraphs and 200 words minimum, in English.
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
              ? `${freshCount} unused of ${allTopics.length}`
              : `pool of ${allTopics.length}, rotating`}
          </span>
        </div>
      </header>

      {topics.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted" data-reveal>
          The pool is empty. Add topics via{" "}
          <Link href="/topics/admin" className="link">
            /topics/admin
          </Link>
          .
        </div>
      ) : (
        <TopicsList topics={topics} />
      )}

      <div data-reveal>
        <Link href="/topics/archive" className="link text-sm">
          All topics in the pool →
        </Link>
      </div>
    </div>
  );
}
