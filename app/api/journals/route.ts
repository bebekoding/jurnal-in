import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTICIPANTS } from "@/lib/participants";
import { paragraphCount, sentenceCount } from "@/lib/text";
import { parseWrittenAt } from "@/lib/date";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export async function GET() {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        title: true,
        content: true,
        createdAt: true,
        topicId: true,
        tableTopicId: true,
        _count: { select: { reviews: true } },
        topic: { select: { id: true, title: true } },
        tableTopic: { select: { id: true, title: true, tableMarkdown: true } },
      },
      take: 100,
    });
    return NextResponse.json(journals);
  } catch {
    const journals = await prisma.journal.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        title: true,
        content: true,
        createdAt: true,
        topicId: true,
        _count: { select: { reviews: true } },
        topic: { select: { id: true, title: true } },
      },
      take: 100,
    });
    return NextResponse.json(journals);
  }
}

export async function POST(req: Request) {
  // Max 5 new entries per minute per client — enough for legitimate use,
  // stops loop-spam. Identity is spoofable so key on IP too.
  const limit = rateLimit(`journal:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body?.authorName || !body?.content) {
    return new NextResponse("Writer and content are required", {
      status: 400,
    });
  }

  const authorName = String(body.authorName).slice(0, 60).trim();
  const content = String(body.content).slice(0, 20000).trim();
  if (!authorName || !content) {
    return new NextResponse("Invalid input", { status: 400 });
  }
  if (!(PARTICIPANTS as readonly string[]).includes(authorName)) {
    return new NextResponse("Writer must be one of the participants", { status: 400 });
  }

  const topicId: string | undefined = body.topicId;
  const tableTopicId: string | undefined = body.tableTopicId;
  let title: string;

  if (tableTopicId) {
    const table = await prisma.tableTopic.findUnique({
      where: { id: tableTopicId },
      select: { id: true, title: true },
    });
    if (!table) {
      return new NextResponse("Table not found", { status: 404 });
    }
    title = table.title;

    const words = content.split(/\s+/).filter(Boolean).length;
    const paras = paragraphCount(content);
    if (words < 150) {
      return new NextResponse(
        `Task 1 needs at least 150 words (${words} so far).`,
        { status: 400 }
      );
    }
    if (paras < 3) {
      return new NextResponse(
        `Task 1 needs at least 3 paragraphs (${paras} so far). Separate paragraphs with a blank line.`,
        { status: 400 }
      );
    }
  } else if (topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { id: true, title: true },
    });
    if (!topic) {
      return new NextResponse("Topic not found", { status: 404 });
    }
    title = topic.title;

    const words = content.split(/\s+/).filter(Boolean).length;
    const paras = paragraphCount(content);
    if (words < 200) {
      return new NextResponse(
        `Essays need at least 200 words (${words} so far).`,
        { status: 400 }
      );
    }
    if (paras < 4) {
      return new NextResponse(
        `Essays need at least 4 paragraphs (${paras} so far). Separate paragraphs with a blank line.`,
        { status: 400 }
      );
    }
  } else {
    title = String(body.title || "").slice(0, 200).trim();
    if (!title) {
      return new NextResponse("Title is required for a daily journal", {
        status: 400,
      });
    }
    const sentences = sentenceCount(content);
    if (sentences < 5) {
      return new NextResponse(
        `Journals need at least 5 sentences (${sentences} so far).`,
        { status: 400 }
      );
    }
  }

  let durationSeconds: number | null = null;
  if (typeof body.durationSeconds === "number") {
    const d = Math.floor(body.durationSeconds);
    if (d >= 0 && d < 60 * 60 * 24) durationSeconds = d;
  }

  const writtenAt = parseWrittenAt(body.writtenAt);

  try {
    const journal = await prisma.journal.create({
      data: {
        authorName,
        title,
        content,
        topicId: topicId || null,
        tableTopicId: tableTopicId || null,
        ...(durationSeconds !== null ? { durationSeconds } : {}),
        ...(writtenAt ? { createdAt: writtenAt } : {}),
      },
      select: { id: true },
    });
    return NextResponse.json(journal, { status: 201 });
  } catch {
    // Fallback: durationSeconds / tableTopicId column may not exist yet
    const journal = await prisma.journal.create({
      data: {
        authorName,
        title,
        content,
        topicId: topicId || null,
        ...(writtenAt ? { createdAt: writtenAt } : {}),
      },
      select: { id: true },
    });
    return NextResponse.json(journal, { status: 201 });
  }
}
