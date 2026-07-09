import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  if (!body?.authorName || !body?.comment) {
    return new NextResponse("authorName dan comment wajib diisi", { status: 400 });
  }
  const authorName = String(body.authorName).slice(0, 60).trim();
  const comment = String(body.comment).slice(0, 4000).trim();
  if (!authorName || !comment) {
    return new NextResponse("Input tidak valid", { status: 400 });
  }
  const journal = await prisma.journal.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!journal) return new NextResponse("Jurnal tidak ditemukan", { status: 404 });

  const review = await prisma.review.create({
    data: { journalId: params.id, authorName, comment },
  });
  return NextResponse.json(review, { status: 201 });
}
