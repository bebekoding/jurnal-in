import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTICIPANTS } from "@/lib/participants";
import { paragraphCount, sentenceCount } from "@/lib/text";

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
        _count: { select: { reviews: true } },
        topic: { select: { id: true, title: true } },
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
        _count: { select: { reviews: true } },
      },
      take: 100,
    });
    return NextResponse.json(journals);
  }
}

export async function POST(req: Request) {
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
  let title: string;

  if (topicId) {
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

  const journal = await prisma.journal.create({
    data: {
      authorName,
      title,
      content,
      topicId: topicId || null,
    },
    select: { id: true },
  });
  return NextResponse.json(journal, { status: 201 });
}
