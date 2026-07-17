import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTICIPANTS } from "@/lib/participants";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const author = new URL(req.url).searchParams.get("author");
  try {
    const items = await prisma.vocabItem.findMany({
      where: author ? { authorName: author } : undefined,
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const limit = rateLimit(`vocab:${clientIp(req)}`, 30, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body?.authorName || !body?.term) {
    return new NextResponse("Writer and term are required", { status: 400 });
  }
  const authorName = String(body.authorName).slice(0, 60).trim();
  if (!(PARTICIPANTS as readonly string[]).includes(authorName)) {
    return new NextResponse("Unknown writer", { status: 400 });
  }
  const term = String(body.term).slice(0, 120).trim();
  const meaning = body.meaning ? String(body.meaning).slice(0, 500).trim() : null;
  const example = body.example ? String(body.example).slice(0, 500).trim() : null;
  if (!term) return new NextResponse("Term is required", { status: 400 });

  try {
    const item = await prisma.vocabItem.create({
      data: { authorName, term, meaning, example },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return new NextResponse(
      "Could not save. The VocabItem table may not exist yet — run /api/admin/seed.",
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const author = url.searchParams.get("author");
  if (!id || !author) {
    return new NextResponse("id and author are required", { status: 400 });
  }
  try {
    // Owner-only delete: the row must belong to the requesting author.
    const res = await prisma.vocabItem.deleteMany({
      where: { id, authorName: author },
    });
    return NextResponse.json({ deleted: res.count });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Delete failed", { status: 500 });
  }
}
