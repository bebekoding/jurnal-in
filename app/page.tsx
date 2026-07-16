import Link from "next/link";
import {
  PencilSimpleLine,
  Target,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { streaksByAuthor } from "@/lib/streak";
import { StreakBadge } from "@/components/StreakBadge";
import { EntryCard, type EntryRow } from "@/components/EntryCard";

const SECTION_LIMIT = 6;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let journals: EntryRow[] = await prisma.journal
    .findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        title: true,
        content: true,
        createdAt: true,
        topicId: true,
        tableTopicId: true,
        _count: { select: { reviews: true } },
        topic: { select: { title: true } },
        tableTopic: { select: { title: true } },
      },
      take: 100,
    })
    .catch(() => null as any);

  if (journals === null) {
    journals = await prisma.journal
      .findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          authorName: true,
          title: true,
          content: true,
          createdAt: true,
          topicId: true,
          _count: { select: { reviews: true } },
          topic: { select: { title: true } },
        },
        take: 100,
      })
      .catch(() => []);
  }

  const tables = journals.filter((j) => j.tableTopicId || j.tableTopic);
  const essays = journals.filter(
    (j) => (j.topicId || j.topic) && !(j.tableTopicId || j.tableTopic)
  );
  const dailies = journals.filter(
    (j) => !j.topicId && !j.topic && !j.tableTopicId && !j.tableTopic
  );

  const streakDict = streaksByAuthor(
    journals.map((j) => ({ authorName: j.authorName, createdAt: j.createdAt }))
  );
  const topStreaks = Object.entries(streakDict)
    .filter(([, days]) => days > 0)
    .map(([name, days]) => ({ name, days }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8">
          <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] tracking-tight text-ink">
            <span className="block" data-reveal>
              A shared notebook
            </span>
            <span
              className="block italic font-reading font-medium"
              data-reveal
              style={{ "--d": "90ms" } as React.CSSProperties}
            >
              for practicing
            </span>
            <span
              className="block"
              data-reveal
              style={{ "--d": "180ms" } as React.CSSProperties}
            >
              IELTS writing.
            </span>
          </h1>
          <div
            className="mt-8 flex flex-wrap items-center gap-4"
            data-reveal
            style={{ "--d": "280ms" } as React.CSSProperties}
          >
            <Link href="/new" className="btn btn-primary">
              <PencilSimpleLine size={16} weight="bold" />
              Write journal
            </Link>
            <Link href="/topics" className="btn btn-secondary">
              <Target size={16} weight="bold" />
              Today&apos;s topic
            </Link>
          </div>
        </div>

        <aside
          className="md:col-span-4 card p-6"
          data-reveal
          style={{ "--d": "360ms" } as React.CSSProperties}
        >
          <div className="grid grid-cols-3 gap-4 tabular">
            <div>
              <div className="font-display text-3xl text-ink">
                {dailies.length}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-muted mt-1">
                Journals
              </div>
            </div>
            <div>
              <div className="font-display text-3xl text-ink">
                {essays.length}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-muted mt-1">
                Essays
              </div>
            </div>
            <div>
              <div className="font-display text-3xl text-ink">
                {tables.length}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-muted mt-1">
                Tables
              </div>
            </div>
          </div>
          <StreakBadge dict={streakDict} top={topStreaks} />
        </aside>
      </section>

      {journals.length === 0 && (
        <div className="card p-10 text-center text-ink-muted" data-reveal>
          Nothing here yet.{" "}
          <Link href="/new" className="link">
            Write the first one
          </Link>
          .
        </div>
      )}

      <Section title="Journals" rows={dailies} type="journal" />
      <Section title="Essays" rows={essays} type="essay" />
      <Section title="Tables" rows={tables} type="table" />
    </div>
  );
}

function Section({
  title,
  rows,
  type,
}: {
  title: string;
  rows: EntryRow[];
  type: "journal" | "essay" | "table";
}) {
  if (rows.length === 0) return null;
  const visible = rows.slice(0, SECTION_LIMIT);
  const overflow = rows.length - visible.length;
  return (
    <section>
      <div
        className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-3 mb-4"
        data-reveal
      >
        <h2 className="font-display text-xl text-ink">{title}</h2>
        <span className="text-xs text-ink-muted tabular">{rows.length}</span>
      </div>
      <ul className="grid gap-5 md:grid-cols-2">
        {visible.map((j, i) => (
          <EntryCard key={j.id} j={j} index={i} />
        ))}
      </ul>
      {overflow > 0 && (
        <div className="mt-6 flex justify-center" data-reveal>
          <Link
            href={`/feed?type=${type}`}
            className="btn btn-secondary"
            aria-label={`See all ${rows.length} ${title.toLowerCase()}`}
          >
            See all {rows.length} {title.toLowerCase()}
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      )}
    </section>
  );
}
