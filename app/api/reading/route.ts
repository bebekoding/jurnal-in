import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTICIPANTS } from "@/lib/participants";
import { getReadingSet, scoreSet } from "@/lib/reading-sets";
import { parseWrittenAt } from "@/lib/date";

export async function GET() {
  try {
    const results = await prisma.readingResult.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.authorName || !body?.setId) {
    return new NextResponse("Writer and set are required", { status: 400 });
  }

  const authorName = String(body.authorName).slice(0, 60).trim();
  if (!(PARTICIPANTS as readonly string[]).includes(authorName)) {
    return new NextResponse("Writer must be one of the participants", {
      status: 400,
    });
  }

  const set = getReadingSet(String(body.setId));
  if (!set) {
    return new NextResponse("Reading set not found", { status: 404 });
  }

  // Only keep string answers keyed by question number — never trust a
  // client-supplied score; recompute it here.
  const rawAnswers =
    body.answers && typeof body.answers === "object" ? body.answers : {};
  const answers: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawAnswers)) {
    if (typeof v === "string" && v.trim()) {
      answers[String(k)] = String(v).slice(0, 200);
    }
  }

  const scored = scoreSet(set, answers);

  let durationSeconds: number | null = null;
  if (typeof body.durationSeconds === "number") {
    const d = Math.floor(body.durationSeconds);
    if (d >= 0 && d < 60 * 60 * 24) durationSeconds = d;
  }

  const writtenAt = parseWrittenAt(body.writtenAt);

  try {
    const result = await prisma.readingResult.create({
      data: {
        authorName,
        setId: set.id,
        rawScore: scored.raw,
        band: scored.band,
        answers: JSON.stringify(answers),
        ...(durationSeconds !== null ? { durationSeconds } : {}),
        ...(writtenAt ? { createdAt: writtenAt } : {}),
      },
      select: { id: true },
    });
    return NextResponse.json(
      { id: result.id, raw: scored.raw, band: scored.band },
      { status: 201 }
    );
  } catch (e: any) {
    return new NextResponse(
      "Could not save result. The ReadingResult table may not exist yet — run /api/admin/seed.",
      { status: 500 }
    );
  }
}
