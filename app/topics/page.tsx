import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayJakartaISO, formatDateLong } from "@/lib/date";
import { seededShuffle } from "@/lib/random";
import TopicsList from "./TopicsList";

export const dynamic = "force-dynamic";

const DAILY_COUNT = 3;

type TopicRow = {
  id: string;
  title: string;
  titleId: string | null;
  description: string | null;
  featuredFor: Date | null;
  _count: { journals: number };
};

function dateIso(d: Date | null | undefined): string | null {
  if (!d) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function fetchAllTopics(): Promise<{
  rows: TopicRow[];
  supportsFeatured: boolean;
}> {
  try {
    const rows = await prisma.topic.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        title: true,
        titleId: true,
        description: true,
        featuredFor: true,
        _count: { select: { journals: true } },
      },
    });
    return { rows: rows as TopicRow[], supportsFeatured: true };
  } catch {
    const rows = await prisma.topic.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        title: true,
        titleId: true,
        description: true,
        _count: { select: { journals: true } },
      },
    });
    return {
      rows: rows.map((r) => ({ ...r, featuredFor: null }) as TopicRow),
      supportsFeatured: false,
    };
  }
}

export default async function TopicsPage() {
  const today = todayJakartaISO();
  const { rows: allTopics } = await fetchAllTopics().catch(() => ({
    rows: [] as TopicRow[],
    supportsFeatured: false,
  }));

  const featuredToday = allTopics.filter(
    (t) => dateIso(t.featuredFor) === today
  );

  let topics: TopicRow[];
  let mode: "featured" | "rotation";
  let freshCount = 0;

  if (featuredToday.length > 0) {
    topics = featuredToday;
    mode = "featured";
  } else {
    // Normal rotation: exclude any topic ever marked as featured
    const poolTopics = allTopics.filter((t) => t.featuredFor === null);
    const shuffled = seededShuffle(poolTopics, today);
    const prioritized = [...shuffled].sort(
      (a, b) => a._count.journals - b._count.journals
    );
    topics = prioritized.slice(0, DAILY_COUNT);
    mode = "rotation";
    freshCount = poolTopics.filter((t) => t._count.journals === 0).length;
  }

  const poolSize = allTopics.filter((t) => t.featuredFor === null).length;

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
              {mode === "featured"
                ? topics.length > 1
                  ? "essays."
                  : "essay."
                : "topic."}
            </span>
          </h1>
          <p
            className="mt-4 text-ink-muted text-[15px]"
            data-reveal
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            {mode === "featured"
              ? topics.length > 1
                ? "Featured essays for today, picked from this week's news. Four paragraphs and 200 words minimum, in English."
                : "Featured essay only for today. Four paragraphs and 200 words minimum, in English."
              : "Pick one. Four paragraphs and 200 words minimum, in English."}
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
            {mode === "featured"
              ? topics.length > 1
                ? `${topics.length} featured essays`
                : "featured essay"
              : freshCount > 0
                ? `${freshCount} unused of ${poolSize}`
                : `pool of ${poolSize}, rotating`}
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
        <TopicsList topics={topics} variant={mode} />
      )}

      <div data-reveal>
        <Link href="/topics/archive" className="link text-sm">
          All topics in the pool →
        </Link>
      </div>
    </div>
  );
}
