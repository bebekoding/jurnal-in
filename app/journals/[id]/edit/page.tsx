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
        topic: { select: { title: true } },
      },
    })
    .catch(() => null);

  if (!journal) notFound();

  const isEssay = !!journal.topicId || !!journal.topic;

  return (
    <EditForm
      id={journal.id}
      authorName={journal.authorName}
      isEssay={isEssay}
      topicTitle={journal.topic?.title ?? null}
      initialContent={journal.content}
      initialDate={isoDateJakarta(journal.createdAt)}
    />
  );
}
