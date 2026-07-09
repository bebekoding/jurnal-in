import Link from "next/link";
import { PencilSimpleLine, Target } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  let journals: any[] = await prisma.journal
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
      take: 50,
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
          _count: { select: { reviews: true } },
        },
        take: 50,
      })
      .catch(() => []);
  }

  const totalWords = journals.reduce((s, j) => s + wordCount(j.content), 0);
  const distinctAuthors = new Set(journals.map((j) => j.authorName)).size;

  return (
    <div className="space-y-14">
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
                {journals.length}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-muted mt-1">
                Entries
              </div>
            </div>
            <div>
              <div className="font-display text-3xl text-ink">
                {totalWords.toLocaleString("en-US")}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-muted mt-1">
                Words
              </div>
            </div>
            <div>
              <div className="font-display text-3xl text-ink">
                {distinctAuthors}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-muted mt-1">
                Writers
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <div
          className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-3 mb-4"
          data-reveal
        >
          <h2 className="font-display text-xl text-ink">Latest entries</h2>
          <span className="text-xs text-ink-muted tabular">
            {journals.length} entries
          </span>
        </div>

        {journals.length === 0 ? (
          <div className="card p-10 text-center text-ink-muted" data-reveal>
            Nothing here yet.{" "}
            <Link href="/new" className="link">
              Write the first one
            </Link>
            .
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {journals.map((j, i) => (
              <li
                key={j.id}
                data-reveal
                style={{ "--d": `${(i % 4) * 70}ms` } as React.CSSProperties}
              >
                <Link href={`/journals/${j.id}`} className="card block p-6 h-full">
                  <div className="flex items-center justify-between text-xs text-ink-muted tabular mb-3">
                    <span className="font-semibold text-ink">
                      {j.authorName}
                    </span>
                    <span>{formatDate(j.createdAt)}</span>
                  </div>
                  {j.topic && (
                    <span className="inline-block text-[10px] uppercase tracking-widest font-semibold text-accent mb-1.5">
                      Essay
                    </span>
                  )}
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
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
