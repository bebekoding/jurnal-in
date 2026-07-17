import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
