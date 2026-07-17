import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp, tooMany } from "@/lib/rate-limit";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Max 10 reviews per minute per client.
  const limit = rateLimit(`review:${clientIp(req)}`, 10, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body?.authorName || !body?.comment) {
    return new NextResponse("Name and comment are required", { status: 400 });
  }
  const authorName = String(body.authorName).slice(0, 60).trim();
  const comment = String(body.comment).slice(0, 4000).trim();
  if (!authorName || !comment) {
    return new NextResponse("Invalid input", { status: 400 });
  }
  const journal = await prisma.journal.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!journal) return new NextResponse("Journal not found", { status: 404 });

  // Optional IELTS rubric bands (0–9, half-band steps).
  function band(v: unknown): number | null {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return null;
    if (n < 0 || n > 9) return null;
    return Math.round(n * 2) / 2;
  }
  const rubric = {
    rubricTask: band(body.rubricTask),
    rubricCoherence: band(body.rubricCoherence),
    rubricLexical: band(body.rubricLexical),
    rubricGrammar: band(body.rubricGrammar),
  };

  try {
    const review = await prisma.review.create({
      data: { journalId: params.id, authorName, comment, ...rubric },
    });
    return NextResponse.json(review, { status: 201 });
  } catch {
    // Fallback for DBs without the rubric columns yet.
    const review = await prisma.review.create({
      data: { journalId: params.id, authorName, comment },
    });
    return NextResponse.json(review, { status: 201 });
  }
}
