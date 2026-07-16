import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isoDateJakarta } from "@/lib/date";
import EditForm from "./EditForm";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: { id: string };
}) {
  const journal = await prisma.journal
    .findUnique({
      where: { id: params.id },
      select: {
        id: true,
        authorName: true,
        title: true,
        content: true,
        createdAt: true,
        topicId: true,
        tableTopicId: true,
        topic: { select: { title: true } },
        tableTopic: { select: { title: true } },
      },
    })
    .catch(() => null);

  if (!journal) notFound();

  const isTable = !!journal.tableTopicId || !!journal.tableTopic;
  const isEssay = (!!journal.topicId || !!journal.topic) && !isTable;
  const kind = isTable ? "table" : isEssay ? "essay" : "journal";

  return (
    <EditForm
      id={journal.id}
      authorName={journal.authorName}
      kind={kind}
      contextTitle={journal.topic?.title ?? journal.tableTopic?.title ?? null}
      initialContent={journal.content}
      initialDate={isoDateJakarta(journal.createdAt)}
    />
  );
}
