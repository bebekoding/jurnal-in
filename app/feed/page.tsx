import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { EntryCard, type EntryRow } from "@/components/EntryCard";
import FeedFilters from "./FeedFilters";

export const dynamic = "force-dynamic";

const TYPES = {
  journal: { label: "Journals", singular: "journal", plural: "journals" },
  essay: { label: "Essays", singular: "essay", plural: "essays" },
  table: { label: "Tables", singular: "table", plural: "tables" },
  all: { label: "All entries", singular: "entry", plural: "entries" },
} as const;

type FeedType = keyof typeof TYPES;

function parseType(input: string | string[] | undefined): FeedType {
  const value = Array.isArray(input) ? input[0] : input;
  if (value && value in TYPES) return value as FeedType;
  return "all";
}

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const type = parseType(searchParams.type);
  return { title: TYPES[type].label };
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: {
    type?: string;
    q?: string;
    author?: string;
    from?: string;
    to?: string;
  };
}) {
  const type = parseType(searchParams.type);
  const meta = TYPES[type];
  const q = one(searchParams.q).trim().toLowerCase();
  const author = one(searchParams.author);
  const from = one(searchParams.from);
  const to = one(searchParams.to);
  const fromT = /^\d{4}-\d{2}-\d{2}$/.test(from)
    ? new Date(from + "T00:00:00").getTime()
    : null;
  const toT = /^\d{4}-\d{2}-\d{2}$/.test(to)
    ? new Date(to + "T23:59:59").getTime()
    : null;

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
      })
      .catch(() => []);
  }

  const rows = journals.filter((j) => {
    // type
    if (type === "table" && !(j.tableTopicId || j.tableTopic)) return false;
    if (
      type === "essay" &&
      !((j.topicId || j.topic) && !(j.tableTopicId || j.tableTopic))
    )
      return false;
    if (
      type === "journal" &&
      (j.topicId || j.topic || j.tableTopicId || j.tableTopic)
    )
      return false;
    // author
    if (author && author !== "All" && j.authorName !== author) return false;
    // date range
    const t = new Date(j.createdAt).getTime();
    if (fromT !== null && t < fromT) return false;
    if (toT !== null && t > toT) return false;
    // keyword — title, content, author, and the topic/table prompt
    if (q) {
      const hay = [
        j.title,
        j.content,
        j.authorName,
        j.topic?.title ?? "",
        j.tableTopic?.title ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-10">
      <div data-reveal>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={14} weight="bold" />
          Back home
        </Link>
        <div className="mt-6 flex items-baseline justify-between border-b-[1.5px] border-ink pb-3">
          <h1 className="font-display text-3xl md:text-4xl text-ink tracking-tight">
            {meta.label}
          </h1>
          <span className="text-xs text-ink-muted tabular">
            {rows.length} {rows.length === 1 ? meta.singular : meta.plural}
          </span>
        </div>
      </div>

      <Suspense fallback={<div className="card p-4 h-40" />}>
        <FeedFilters />
      </Suspense>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted" data-reveal>
          No entries match these filters.
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {rows.map((j, i) => (
            <EntryCard key={j.id} j={j} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
