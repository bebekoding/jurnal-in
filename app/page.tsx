import Link from "next/link";
import { ArrowUpRight, PencilSimpleLine, Target } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function excerpt(text: string, n = 260) {
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
    <div className="space-y-16">
      <section className="grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8">
          <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.95] tracking-tight text-ink">
            Buku catatan
            <br />
            <span className="italic font-reading font-normal">
              untuk latihan
            </span>
            <br />
            writing IELTS.
          </h1>
          <p className="mt-6 max-w-lg text-ink-muted text-[15px] leading-relaxed">
            Setor jurnal harian, jawab topik random, tukar review antar peserta.
            Semua tulisan ke-rekap dan siap dipaste ke Claude untuk audit
            grammar dan upgrade kosakata ke band 7 hingga 9.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/new"
              className="inline-flex items-center gap-2 bg-ink text-paper px-5 h-11 text-sm font-medium hover:bg-accent transition"
            >
              <PencilSimpleLine size={16} weight="regular" />
              Tulis jurnal harian
            </Link>
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 border border-ink px-5 h-11 text-sm font-medium hover:border-accent hover:text-accent transition"
            >
              <Target size={16} weight="regular" />
              Jawab topik hari ini
            </Link>
          </div>
        </div>

        <aside className="md:col-span-4 border-t border-ink pt-6 md:border-t md:pt-6">
          <div className="grid grid-cols-3 gap-4 tabular">
            <div>
              <div className="font-display text-3xl text-ink">
                {journals.length}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-subtle mt-1">
                Tulisan
              </div>
            </div>
            <div>
              <div className="font-display text-3xl text-ink">
                {totalWords.toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-subtle mt-1">
                Kata
              </div>
            </div>
            <div>
              <div className="font-display text-3xl text-ink">
                {distinctAuthors}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-ink-subtle mt-1">
                Penulis
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-2">
          <h2 className="font-display text-xl text-ink">Tulisan terbaru</h2>
          <span className="text-xs text-ink-subtle tabular">
            {journals.length.toString().padStart(2, "0")} entri
          </span>
        </div>

        {journals.length === 0 ? (
          <div className="py-16 text-center text-ink-muted">
            Belum ada yang setor. Jadi yang pertama,{" "}
            <Link href="/new" className="link">
              tulis sekarang
            </Link>
            .
          </div>
        ) : (
          <ul className="divide-y divide-rule">
            {journals.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/journals/${j.id}`}
                  className="group grid md:grid-cols-12 gap-4 py-6 hover:bg-paper-sunken/50 -mx-2 px-2 transition"
                >
                  <div className="md:col-span-2 text-xs text-ink-subtle tabular pt-1">
                    <div>{formatDate(j.createdAt)}</div>
                    <div className="mt-0.5 text-ink-muted">{j.authorName}</div>
                  </div>
                  <div className="md:col-span-8">
                    {j.topic && (
                      <div className="text-[10px] uppercase tracking-widest text-accent mb-1.5">
                        Topik
                      </div>
                    )}
                    <h3 className="font-display text-xl md:text-2xl text-ink leading-tight group-hover:text-accent transition">
                      {j.title}
                    </h3>
                    <p className="mt-2 font-reading text-[15px] text-ink-muted leading-relaxed">
                      {excerpt(j.content)}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex md:justify-end items-start pt-1">
                    <div className="text-xs text-ink-subtle tabular text-right">
                      <div className="text-ink">{wordCount(j.content)} kata</div>
                      <div className="mt-0.5">
                        {j._count.reviews} review
                      </div>
                    </div>
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
