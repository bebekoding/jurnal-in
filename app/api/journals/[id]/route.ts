import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTICIPANTS } from "@/lib/participants";
import { formatDateLong } from "@/lib/date";
import { paragraphCount, sentenceCount } from "@/lib/text";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  if (!body?.authorName || !body?.content) {
    return new NextResponse("Writer and content are required", { status: 400 });
  }

  const authorName = String(body.authorName).slice(0, 60).trim();
  const content = String(body.content).slice(0, 20000).trim();
  if (!authorName || !content) {
    return new NextResponse("Invalid input", { status: 400 });
  }
  if (!(PARTICIPANTS as readonly string[]).includes(authorName)) {
    return new NextResponse("Unknown writer", { status: 400 });
  }

  const existing = await prisma.journal.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      authorName: true,
      topicId: true,
      tableTopicId: true,
      createdAt: true,
    },
  });
  if (!existing) return new NextResponse("Not found", { status: 404 });
  if (existing.authorName !== authorName) {
    return new NextResponse("You can only edit your own posts", {
      status: 403,
    });
  }

  const isEssay = !!existing.topicId;
  const isTable = !!existing.tableTopicId;
  if (isTable) {
    const words = content.split(/\s+/).filter(Boolean).length;
    const paras = paragraphCount(content);
    if (words < 150) {
      return new NextResponse(`Task 1 needs at least 150 words (${words}).`, {
        status: 400,
      });
    }
    if (paras < 3) {
      return new NextResponse(
        `Task 1 needs at least 3 paragraphs (${paras}). Separate paragraphs with a blank line.`,
        { status: 400 }
      );
    }
  } else if (isEssay) {
    const words = content.split(/\s+/).filter(Boolean).length;
    const paras = paragraphCount(content);
    if (words < 200) {
      return new NextResponse(`Essays need at least 200 words (${words}).`, {
        status: 400,
      });
    }
    if (paras < 4) {
      return new NextResponse(
        `Essays need at least 4 paragraphs (${paras}). Separate paragraphs with a blank line.`,
        { status: 400 }
      );
    }
  } else {
    const sentences = sentenceCount(content);
    if (sentences < 5) {
      return new NextResponse(
        `Journals need at least 5 sentences (${sentences}).`,
        { status: 400 }
      );
    }
  }

  const data: Record<string, unknown> = { content };

  const date: string | undefined = body.date;
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // Preserve the original time-of-day; only shift the calendar date.
    const orig = existing.createdAt;
    const [y, m, d] = date.split("-").map(Number);
    const next = new Date(orig);
    next.setUTCFullYear(y, m - 1, d);
    data.createdAt = next;
    if (!isEssay && !isTable) {
      // Daily journals show the date as their title.
      data.title = formatDateLong(date);
    }
  }

  const updated = await prisma.journal.update({
    where: { id: params.id },
    data,
    select: { id: true },
  });

  return NextResponse.json(updated);
}
