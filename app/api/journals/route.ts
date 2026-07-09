import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const journals = await prisma.journal.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reviews: true } }, analysis: true },
    take: 100,
  });
  return NextResponse.json(journals);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.authorName || !body?.title || !body?.content) {
    return new NextResponse("authorName, title, content wajib diisi", {
      status: 400,
    });
  }
  const authorName = String(body.authorName).slice(0, 60).trim();
  const title = String(body.title).slice(0, 200).trim();
  const content = String(body.content).slice(0, 20000).trim();
  if (!authorName || !title || !content) {
    return new NextResponse("Input tidak valid", { status: 400 });
  }
  const journal = await prisma.journal.create({
    data: { authorName, title, content },
    select: { id: true },
  });
  return NextResponse.json(journal, { status: 201 });
}
