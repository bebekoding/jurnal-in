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
    <div className="space-y-14">
      <header className="grid md:grid-cols-12 gap-8 items-end border-b border-ink pb-8">
        <div className="md:col-span-8">
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-tight text-ink">
            Tiga topik
            <br />
            <span className="italic font-reading font-normal">random</span>
            <span> untuk hari ini.</span>
          </h1>
          <p className="mt-5 max-w-lg text-ink-muted text-[15px] leading-relaxed">
            Pilih satu, tulis argumen kamu dalam bahasa Inggris. Minimum
            empat paragraf dan dua ratus kata. Topik berganti otomatis
            setiap hari.
          </p>
        </div>
        <div className="md:col-span-4 text-sm tabular text-ink-muted">
          <div className="flex justify-between border-b border-rule py-1.5">
            <span>Tanggal</span>
            <span className="text-ink">{formatDateLong(today)}</span>
          </div>
          <div className="flex justify-between border-b border-rule py-1.5">
            <span>Pool</span>
            <span className="text-ink">{allTopics.length} topik</span>
          </div>
          <div className="flex justify-between border-b border-rule py-1.5">
            <span>Ditampilkan</span>
            <span className="text-ink">{topics.length} dari pool</span>
          </div>
        </div>
      </header>

      {topics.length === 0 ? (
        <div className="py-20 text-center text-ink-muted">
          Belum ada topik di pool. Admin bisa tambah lewat{" "}
          <Link href="/topics/admin" className="link">
            /topics/admin
          </Link>
          .
        </div>
      ) : (
        <TopicsList topics={topics} />
      )}

      <div className="border-t border-rule pt-6">
        <Link
          href="/topics/archive"
          className="text-sm text-ink-muted hover:text-accent transition inline-flex items-center gap-1.5"
        >
          Lihat semua topik di pool
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
