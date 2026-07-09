import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function excerpt(text: string, n = 220) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > n ? clean.slice(0, n) + "…" : clean;
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default async function HomePage() {
  const journals = await prisma.journal
    .findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { reviews: true } },
        topic: { select: { title: true } },
      },
      take: 50,
    })
    .catch(() => []);

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
          Latih writing IELTS-mu, satu jurnal setiap hari.
        </h1>
        <p className="mt-4 text-ink/70 max-w-2xl mx-auto">
          Setor jurnal harian, baca tulisan teman, dan review bareng. Rekap
          bulk siap-paste ke Claude chat untuk analisis grammar & upgrade
          vocabulary ke band 7–9.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/new"
            className="bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent transition"
          >
            + Jurnal harian
          </Link>
          <Link
            href="/topics"
            className="bg-white border border-ink/20 text-ink px-5 py-2.5 rounded-full text-sm font-medium hover:border-accent hover:text-accent transition"
          >
            🎯 Random topic
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-2xl font-semibold">Jurnal terbaru</h2>
          <span className="text-xs text-ink/50">{journals.length} entri</span>
        </div>

        {journals.length === 0 ? (
          <div className="border border-dashed border-ink/20 rounded-lg p-10 text-center text-ink/60">
            Belum ada jurnal. Jadilah yang pertama menyetor —{" "}
            <Link href="/new" className="text-accent underline">
              tulis sekarang
            </Link>
            .
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {journals.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/journals/${j.id}`}
                  className="block border border-ink/10 rounded-lg p-5 bg-white hover:border-accent hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between text-xs text-ink/50 mb-2">
                    <span>
                      {j.authorName} · {formatDate(j.createdAt)}
                    </span>
                    <span>{wordCount(j.content)} kata</span>
                  </div>
                  {j.topic && (
                    <div className="mb-2 inline-block bg-indigo-50 text-accent border border-indigo-100 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Topic
                    </div>
                  )}
                  <h3 className="font-serif text-lg font-semibold leading-snug">
                    {j.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink/70 leading-relaxed">
                    {excerpt(j.content)}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <span className="text-ink/50">
                      💬 {j._count.reviews} review
                    </span>
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
