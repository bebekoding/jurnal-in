import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { MarkdownTable } from "@/components/MarkdownTable";
import TableWriteForm from "./TableWriteForm";

export const dynamic = "force-dynamic";

function formatShort(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default async function TableWritePage({
  params,
}: {
  params: { id: string };
}) {
  const table = await prisma.tableTopic
    .findUnique({
      where: { id: params.id },
      include: {
        journals: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            authorName: true,
            createdAt: true,
            content: true,
          },
        },
      },
    })
    .catch(() => null);

  if (!table) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/tables"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
      >
        <ArrowLeft size={14} weight="bold" />
        Task 1 tables
      </Link>

      <section className="card bg-paper-raised p-6 md:p-8" data-reveal>
        {table.category && (
          <span className="text-[10px] uppercase tracking-widest font-semibold text-ink-subtle">
            {table.category}
          </span>
        )}
        <h1 className="mt-1 font-display text-2xl md:text-3xl leading-tight text-ink">
          {table.title}
        </h1>
        <div className="mt-6">
          <MarkdownTable markdown={table.tableMarkdown} />
        </div>
      </section>

      <TableWriteForm tableTopicId={table.id} />

      {table.journals.length > 0 && (
        <section data-reveal>
          <h2 className="font-display text-lg text-ink mb-4">
            Descriptions ({table.journals.length})
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {table.journals.map((j) => (
              <li key={j.id}>
                <Link href={`/journals/${j.id}`} className="card block p-4 h-full">
                  <div className="flex items-baseline justify-between text-xs tabular mb-1.5">
                    <span className="font-semibold text-ink">
                      {j.authorName}
                    </span>
                    <span className="text-ink-muted">
                      {formatShort(j.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted font-reading leading-relaxed line-clamp-2">
                    {j.content.slice(0, 220)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
