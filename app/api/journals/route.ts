import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTICIPANTS } from "@/lib/participants";
import { paragraphCount, sentenceCount } from "@/lib/text";

export async function GET() {
  const journals = await prisma.journal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { reviews: true } },
      topic: { select: { id: true, title: true } },
    },
    take: 100,
  });
  return NextResponse.json(journals);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.authorName || !body?.content) {
    return new NextResponse("authorName dan content wajib diisi", {
      status: 400,
    });
  }

  const authorName = String(body.authorName).slice(0, 60).trim();
  const content = String(body.content).slice(0, 20000).trim();
  if (!authorName || !content) {
    return new NextResponse("Input tidak valid", { status: 400 });
  }
  if (!(PARTICIPANTS as readonly string[]).includes(authorName)) {
    return new NextResponse("Nama harus dari daftar peserta", { status: 400 });
  }

  const topicId: string | undefined = body.topicId;
  let title: string;

  if (topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { id: true, title: true },
    });
    if (!topic) {
      return new NextResponse("Topik tidak ditemukan", { status: 404 });
    }
    title = topic.title;

    const words = content.split(/\s+/).filter(Boolean).length;
    const paras = paragraphCount(content);
    if (words < 200) {
      return new NextResponse(
        `Setoran topik minimal 200 kata (baru ${words}).`,
        { status: 400 }
      );
    }
    if (paras < 4) {
      return new NextResponse(
        `Setoran topik minimal 4 paragraf (baru ${paras}). Pisahkan dengan baris kosong.`,
        { status: 400 }
      );
    }
  } else {
    title = String(body.title || "").slice(0, 200).trim();
    if (!title) {
      return new NextResponse("Judul wajib diisi untuk jurnal bebas", {
        status: 400,
      });
    }
    const sentences = sentenceCount(content);
    if (sentences < 5) {
      return new NextResponse(
        `Isi jurnal minimal 5 kalimat (baru ${sentences}).`,
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
