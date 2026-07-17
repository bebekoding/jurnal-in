import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PARTICIPANTS } from "@/lib/participants";
import { formatDurationLong } from "@/lib/time";
import { isoDateJakarta, todayJakartaISO, addDaysISO } from "@/lib/date";

export const dynamic = "force-dynamic";

type Row = {
  authorName: string;
  content: string;
  createdAt: Date;
  durationSeconds: number | null;
  topicId: string | null;
  tableTopicId: string | null;
};

function words(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function kind(r: Row): "journal" | "essay" | "table" {
  if (r.tableTopicId) return "table";
  if (r.topicId) return "essay";
  return "journal";
}

export default async function StatsPage() {
  let journals: Row[] = await prisma.journal
    .findMany({
      select: {
        authorName: true,
        content: true,
        createdAt: true,
        durationSeconds: true,
        topicId: true,
        tableTopicId: true,
      },
    })
    .catch(() => null as any);

  if (journals === null) {
    journals = await prisma.journal
      .findMany({
        select: {
          authorName: true,
          content: true,
          createdAt: true,
          topicId: true,
        },
      })
      .then((rows) =>
        rows.map((r) => ({ ...r, durationSeconds: null, tableTopicId: null }))
      )
      .catch(() => []);
  }

  const reading = await prisma.readingResult
    .findMany({ select: { authorName: true, rawScore: true, createdAt: true } })
    .catch(() => [] as { authorName: string; rawScore: number; createdAt: Date }[]);

  const weekAgo = addDaysISO(todayJakartaISO(), -7);

  // Per-writer aggregates.
  const stats = PARTICIPANTS.map((name) => {
    const mine = journals.filter((j) => j.authorName === name);
    const totalWords = mine.reduce((s, j) => s + words(j.content), 0);
    const durations = mine
      .map((j) => j.durationSeconds)
      .filter((d): d is number => typeof d === "number" && d > 0);
    const totalDuration = durations.reduce((s, d) => s + d, 0);
    const thisWeek = mine.filter(
      (j) => isoDateJakarta(j.createdAt) >= weekAgo
    ).length;
    const myReading = reading.filter((r) => r.authorName === name);
    return {
      name,
      entries: mine.length,
      journals: mine.filter((j) => kind(j) === "journal").length,
      essays: mine.filter((j) => kind(j) === "essay").length,
      tables: mine.filter((j) => kind(j) === "table").length,
      totalWords,
      avgWords: mine.length ? Math.round(totalWords / mine.length) : 0,
      totalDuration,
      thisWeek,
      readingCount: myReading.length,
      bestReading: myReading.length
        ? Math.max(...myReading.map((r) => r.rawScore))
        : null,
    };
  });

  const active = stats.filter((s) => s.entries > 0);
  const totalEntries = journals.length;
  const totalWords = journals.reduce((s, j) => s + words(j.content), 0);
  const maxEntries = Math.max(1, ...stats.map((s) => s.entries));
  const maxWords = Math.max(1, ...stats.map((s) => s.totalWords));

  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.98] tracking-tight text-ink">
          <span className="block" data-reveal>
            Group
          </span>
          <span
            className="block italic font-reading font-medium"
            data-reveal
            style={{ "--d": "90ms" } as React.CSSProperties}
          >
            analytics.
          </span>
        </h1>
        <div
          className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm tabular"
          data-reveal
          style={{ "--d": "180ms" } as React.CSSProperties}
        >
          <Stat label="Total entries" value={totalEntries} />
          <Stat label="Total words" value={totalWords.toLocaleString("en-US")} />
          <Stat label="Writers active" value={active.length} />
          <Stat label="Reading tests" value={reading.length} />
        </div>
      </header>

      {totalEntries === 0 ? (
        <div className="card p-10 text-center text-ink-muted" data-reveal>
          No data yet. Once the group starts writing, charts will appear here.
        </div>
      ) : (
        <>
          <Section title="Entries by writer">
            <div className="space-y-3">
              {stats.map((s) => (
                <BarRow
                  key={s.name}
                  label={s.name}
                  value={s.entries}
                  max={maxEntries}
                  caption={
                    s.entries > 0
                      ? `${s.journals}J · ${s.essays}E · ${s.tables}T`
                      : "—"
                  }
                />
              ))}
            </div>
          </Section>

          <Section title="Words written">
            <div className="space-y-3">
              {[...stats]
                .sort((a, b) => b.totalWords - a.totalWords)
                .map((s) => (
                  <BarRow
                    key={s.name}
                    label={s.name}
                    value={s.totalWords}
                    max={maxWords}
                    accent
                    caption={
                      s.entries > 0
                        ? `${s.totalWords.toLocaleString("en-US")} · avg ${s.avgWords}`
                        : "—"
                    }
                  />
                ))}
            </div>
          </Section>

          <Section title="Time on task">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {active
                .filter((s) => s.totalDuration > 0)
                .sort((a, b) => b.totalDuration - a.totalDuration)
                .map((s) => (
                  <div key={s.name} className="card p-4">
                    <div className="font-display text-lg text-ink">{s.name}</div>
                    <div className="mt-1 font-display text-2xl text-ink tabular">
                      {formatDurationLong(s.totalDuration)}
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      total timed writing
                    </div>
                  </div>
                ))}
              {active.filter((s) => s.totalDuration > 0).length === 0 && (
                <p className="text-sm text-ink-muted">
                  No timed sessions recorded yet.
                </p>
              )}
            </div>
          </Section>

          <Section title="This week">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {active
                .sort((a, b) => b.thisWeek - a.thisWeek)
                .map((s) => (
                  <div key={s.name} className="card p-4 text-center">
                    <div className="font-display text-3xl text-ink tabular">
                      {s.thisWeek}
                    </div>
                    <div className="text-xs text-ink-muted mt-1">{s.name}</div>
                  </div>
                ))}
            </div>
          </Section>

          {reading.length > 0 && (
            <Section title="Reading best (raw / 40)">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {active
                  .filter((s) => s.bestReading !== null)
                  .sort((a, b) => (b.bestReading ?? 0) - (a.bestReading ?? 0))
                  .map((s) => (
                    <div key={s.name} className="card p-4 text-center">
                      <div className="font-display text-3xl text-ink tabular">
                        {s.bestReading}
                      </div>
                      <div className="text-xs text-ink-muted mt-1">
                        {s.name} · {s.readingCount}×
                      </div>
                    </div>
                  ))}
              </div>
            </Section>
          )}
        </>
      )}

      <div data-reveal>
        <Link href="/" className="link text-sm">
          ← Back home
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="font-display text-2xl text-ink">{value}</span>
      <span className="text-ink-muted ml-2 text-xs uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section data-reveal>
      <h2 className="font-display text-xl text-ink border-b-[1.5px] border-ink pb-3 mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BarRow({
  label,
  value,
  max,
  caption,
  accent = false,
}: {
  label: string;
  value: number;
  max: number;
  caption: string;
  accent?: boolean;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 shrink-0 text-sm font-semibold text-ink">{label}</div>
      <div className="flex-1 h-7 rounded-full bg-paper-raised border border-ink/15 overflow-hidden">
        <div
          className={`h-full rounded-full border-[1.5px] border-ink ${
            accent ? "bg-accent-soft" : "bg-lime"
          }`}
          style={{ width: `${value > 0 ? Math.max(pct, 6) : 0}%` }}
        />
      </div>
      <div className="w-40 shrink-0 text-right text-xs text-ink-muted tabular">
        {caption}
      </div>
    </div>
  );
}
