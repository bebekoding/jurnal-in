import Link from "next/link";

export type EntryRow = {
  id: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: Date;
  topicId?: string | null;
  tableTopicId?: string | null;
  _count: { reviews: number };
  topic?: { title: string } | null;
  tableTopic?: { title: string } | null;
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function excerpt(text: string, n = 200) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > n ? clean.slice(0, n) + "…" : clean;
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function kindOf(j: EntryRow): { label: string; accent: boolean } {
  if (j.tableTopicId || j.tableTopic) return { label: "Table", accent: false };
  if (j.topicId || j.topic) return { label: "Essay", accent: true };
  return { label: "Journal", accent: false };
}

export function EntryCard({ j, index }: { j: EntryRow; index: number }) {
  const kind = kindOf(j);
  return (
    <li
      data-reveal
      style={{ "--d": `${(index % 4) * 70}ms` } as React.CSSProperties}
    >
      <Link href={`/journals/${j.id}`} className="card block p-6 h-full">
        <div className="flex items-center justify-between text-xs text-ink-muted tabular mb-3">
          <span className="font-semibold text-ink">{j.authorName}</span>
          <span>{formatDate(j.createdAt)}</span>
        </div>
        <span
          className={`inline-block text-[10px] uppercase tracking-widest font-semibold mb-1.5 ${
            kind.accent ? "text-accent" : "text-ink-subtle"
          }`}
        >
          {kind.label}
        </span>
        <h3 className="font-display text-xl text-ink leading-tight">
          {j.title}
        </h3>
        <p className="mt-2 font-reading text-[15px] text-ink-muted leading-relaxed">
          {excerpt(j.content)}
        </p>
        <div className="mt-4 pt-3 border-t border-ink/15 flex justify-between text-xs text-ink-muted tabular">
          <span>{wordCount(j.content)} words</span>
          <span>{j._count.reviews} reviews</span>
        </div>
      </Link>
    </li>
  );
}
