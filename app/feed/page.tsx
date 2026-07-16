import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { EntryCard, type EntryRow } from "@/components/EntryCard";

export const dynamic = "force-dynamic";

const TYPES = {
  journal: { label: "Journals", singular: "journal" },
  essay: { label: "Essays", singular: "essay" },
  table: { label: "Tables", singular: "table" },
  all: { label: "All entries", singular: "entry" },
} as const;

type FeedType = keyof typeof TYPES;

function parseType(input: string | string[] | undefined): FeedType {
  const value = Array.isArray(input) ? input[0] : input;
  if (value && value in TYPES) return value as FeedType;
  return "all";
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
  searchParams: { type?: string };
}) {
  const type = parseType(searchParams.type);
  const meta = TYPES[type];

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
    if (type === "all") return true;
    if (type === "table") return j.tableTopicId || j.tableTopic;
    if (type === "essay")
      return (j.topicId || j.topic) && !(j.tableTopicId || j.tableTopic);
    return !j.topicId && !j.topic && !j.tableTopicId && !j.tableTopic;
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
            {rows.length} {rows.length === 1 ? meta.singular : `${meta.singular}s`}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted" data-reveal>
          Nothing here yet.
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
