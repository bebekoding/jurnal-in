import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_TOKEN = "jurnal-in-seed-2026";

// Safe cleanup of stale topics by exact title prefix. Only deletes rows
// with zero attached journals, so it can never reclassify someone's essay.
// DELETE /api/topics/featured?token=…&titlePrefix=Malnutrition and stunting
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("token") !== ADMIN_TOKEN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const prefix = (url.searchParams.get("titlePrefix") ?? "").trim();
  if (!prefix) {
    return new NextResponse("titlePrefix is required", { status: 400 });
  }
  try {
    const matches = await prisma.topic.findMany({
      where: { title: { startsWith: prefix } },
      select: { id: true, title: true, _count: { select: { journals: true } } },
    });
    const deletable = matches.filter((m) => m._count.journals === 0);
    const skipped = matches
      .filter((m) => m._count.journals > 0)
      .map((m) => ({ title: m.title, journals: m._count.journals }));
    if (deletable.length > 0) {
      await prisma.topic.deleteMany({
        where: { id: { in: deletable.map((d) => d.id) } },
      });
    }
    return NextResponse.json({
      matched: matches.length,
      deleted: deletable.map((d) => d.title),
      skippedWithJournals: skipped,
    });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Delete failed", { status: 500 });
  }
}

// One essay per line: "English title | Indonesian title"
// A single date makes all of them featured for that day.
type ParsedEssay = { title: string; titleId: string | null };

function parseLines(raw: string): ParsedEssay[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split("|").map((s) => s.trim());
      return { title: parts[0] || "", titleId: parts[1] || null };
    })
    .filter((e) => e.title.length > 0 && e.title.length <= 500);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid body", { status: 400 });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && body.password !== adminPassword) {
    return new NextResponse("Wrong admin password", { status: 401 });
  }

  const date = String(body.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new NextResponse("A valid date (YYYY-MM-DD) is required", {
      status: 400,
    });
  }

  const essays = parseLines(String(body.raw ?? ""));
  if (essays.length === 0) {
    return new NextResponse(
      "No valid essays. One per line: 'English title | Indonesian title'.",
      { status: 400 }
    );
  }
  if (essays.length > 20) {
    return new NextResponse("Maximum 20 featured essays", { status: 400 });
  }

  let inserted = 0;
  let refeatured = 0;
  const errors: string[] = [];
  for (const e of essays) {
    try {
      const rows = await prisma.$executeRawUnsafe(
        `INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor", "featuredFor")
         SELECT gen_random_uuid()::text, $1, $2, $3::date, $3::date
         WHERE NOT EXISTS (SELECT 1 FROM "Topic" WHERE "title" = $1)`,
        e.title,
        e.titleId,
        date
      );
      if (rows > 0) {
        inserted++;
      } else {
        // Already exists — just (re)feature it for the given date.
        await prisma.$executeRawUnsafe(
          `UPDATE "Topic" SET "featuredFor" = $2::date WHERE "title" = $1`,
          e.title,
          date
        );
        refeatured++;
      }
    } catch (err: any) {
      errors.push(`${e.title.slice(0, 40)}: ${err?.message ?? err}`);
    }
  }

  return NextResponse.json({ inserted, refeatured, date, errors });
}
