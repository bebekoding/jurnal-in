import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Blocks separated by a line containing only "---".
// First line of each block: "Category | Title"
// Remaining lines: the markdown table.
type ParsedTable = { category: string | null; title: string; markdown: string };

function parseBlocks(raw: string): ParsedTable[] {
  const blocks = raw
    .split(/\n\s*---\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const out: ParsedTable[] = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    const header = lines[0]?.trim() ?? "";
    const rest = lines.slice(1).join("\n").trim();
    const parts = header.split("|").map((s) => s.trim());
    let category: string | null;
    let title: string;
    if (parts.length >= 2) {
      category = parts[0] || null;
      title = parts.slice(1).join(" | ").trim();
    } else {
      category = null;
      title = header;
    }
    if (title && rest) out.push({ category, title, markdown: rest });
  }
  return out;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid body", { status: 400 });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && body.password !== adminPassword) {
    return new NextResponse("Wrong admin password", { status: 401 });
  }

  const tables = parseBlocks(String(body.raw ?? "")).filter(
    (t) => t.title.length <= 500
  );
  if (tables.length === 0) {
    return new NextResponse(
      "No valid tables. Each block: 'Category | Title' then the markdown, blocks separated by a line with only ---.",
      { status: 400 }
    );
  }
  if (tables.length > 50) {
    return new NextResponse("Maximum 50 tables per submission", { status: 400 });
  }

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];
  for (const t of tables) {
    try {
      const rows = await prisma.$executeRawUnsafe(
        `INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
         SELECT gen_random_uuid()::text, $1, $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = $1)`,
        t.title,
        t.category,
        t.markdown
      );
      if (rows > 0) inserted++;
      else skipped++;
    } catch (e: any) {
      errors.push(`${t.title.slice(0, 40)}: ${e?.message ?? e}`);
    }
  }

  return NextResponse.json({ inserted, skipped, errors });
}
