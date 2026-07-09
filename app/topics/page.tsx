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

  const topics = seededShuffle(allTopics, today).slice(0, DAILY_COUNT);

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
          <span className="text-ink-muted"> · pool of {allTopics.length} topics</span>
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
