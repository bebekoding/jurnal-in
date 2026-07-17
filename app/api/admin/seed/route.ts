import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TABLE_SEEDS } from "@/lib/table-seeds";

// Publicly-known token; endpoint is idempotent so worst case is a no-op.
const TOKEN = "jurnal-in-seed-2026";

const FEATURED_ESSAYS_TODAY = [
  {
    title:
      "Indonesia's government debt has reportedly surpassed Rp 8,000 trillion. What factors have contributed to this rising debt, and what measures can the government take to manage it sustainably?",
    titleId:
      "Utang pemerintah Indonesia dilaporkan telah menembus Rp 8.000 triliun. Faktor apa yang menyebabkan utang ini terus meningkat, dan langkah apa yang bisa diambil pemerintah untuk mengelolanya secara berkelanjutan?",
  },
  {
    title:
      "The president recently called for a full evaluation of the Makan Bergizi Gratis (MBG) program after implementation issues emerged. To what extent do you agree that large social programs should be paused for evaluation once problems arise, rather than continuing while being fixed?",
    titleId:
      "Presiden baru-baru ini meminta evaluasi total terhadap program Makan Bergizi Gratis (MBG) setelah muncul berbagai masalah implementasi. Sejauh mana kamu setuju bahwa program sosial besar sebaiknya dihentikan sementara untuk dievaluasi ketika muncul masalah, dibanding terus berjalan sambil diperbaiki?",
  },
  {
    title:
      "Hosting a mega sports event like the World Cup brings prestige but also high costs and institutional strain to the host country. Discuss both views on whether such events are worth hosting, and give your own opinion.",
    titleId:
      "Menjadi tuan rumah event olahraga besar seperti Piala Dunia membawa prestise, tetapi juga biaya tinggi dan tekanan pada institusi negara tuan rumah. Bahas kedua sisi pandangan tentang apakah event semacam ini layak untuk diselenggarakan, dan berikan pendapatmu sendiri.",
  },
];

async function run(): Promise<any> {
  const result = {
    tables: { created: 0, skipped: 0, errors: [] as string[] },
    featuredEssays: { created: 0, skipped: 0, errors: [] as string[] },
    schema: { steps: [] as string[], errors: [] as string[] },
  };

  // 1. Schema migration
  const schemaStmts: [string, string][] = [
    [
      "create TableTopic",
      `CREATE TABLE IF NOT EXISTS "TableTopic" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "category" TEXT,
        "tableMarkdown" TEXT NOT NULL,
        "featuredFor" DATE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TableTopic_pkey" PRIMARY KEY ("id")
      )`,
    ],
    [
      "index TableTopic.featuredFor",
      `CREATE INDEX IF NOT EXISTS "TableTopic_featuredFor_idx" ON "TableTopic"("featuredFor")`,
    ],
    [
      "add Journal.tableTopicId",
      `ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "tableTopicId" TEXT`,
    ],
    [
      "index Journal.tableTopicId",
      `CREATE INDEX IF NOT EXISTS "Journal_tableTopicId_idx" ON "Journal"("tableTopicId")`,
    ],
    [
      "add Topic.featuredFor",
      `ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "featuredFor" DATE`,
    ],
    [
      "index Topic.featuredFor",
      `CREATE INDEX IF NOT EXISTS "Topic_featuredFor_idx" ON "Topic"("featuredFor")`,
    ],
    [
      "create ReadingResult",
      `CREATE TABLE IF NOT EXISTS "ReadingResult" (
        "id" TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "setId" TEXT NOT NULL,
        "rawScore" INTEGER NOT NULL,
        "band" TEXT NOT NULL,
        "durationSeconds" INTEGER,
        "answers" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ReadingResult_pkey" PRIMARY KEY ("id")
      )`,
    ],
    [
      "index ReadingResult.authorName",
      `CREATE INDEX IF NOT EXISTS "ReadingResult_authorName_idx" ON "ReadingResult"("authorName")`,
    ],
    [
      "index ReadingResult.createdAt",
      `CREATE INDEX IF NOT EXISTS "ReadingResult_createdAt_idx" ON "ReadingResult"("createdAt")`,
    ],
    [
      "add Review.rubricTask",
      `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "rubricTask" DOUBLE PRECISION`,
    ],
    [
      "add Review.rubricCoherence",
      `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "rubricCoherence" DOUBLE PRECISION`,
    ],
    [
      "add Review.rubricLexical",
      `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "rubricLexical" DOUBLE PRECISION`,
    ],
    [
      "add Review.rubricGrammar",
      `ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "rubricGrammar" DOUBLE PRECISION`,
    ],
    [
      "create VocabItem",
      `CREATE TABLE IF NOT EXISTS "VocabItem" (
        "id" TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "term" TEXT NOT NULL,
        "meaning" TEXT,
        "example" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "VocabItem_pkey" PRIMARY KEY ("id")
      )`,
    ],
    [
      "index VocabItem.authorName",
      `CREATE INDEX IF NOT EXISTS "VocabItem_authorName_idx" ON "VocabItem"("authorName")`,
    ],
    [
      "index VocabItem.createdAt",
      `CREATE INDEX IF NOT EXISTS "VocabItem_createdAt_idx" ON "VocabItem"("createdAt")`,
    ],
  ];
  for (const [label, sql] of schemaStmts) {
    try {
      await prisma.$executeRawUnsafe(sql);
      result.schema.steps.push(label);
    } catch (e: any) {
      result.schema.errors.push(`${label}: ${e?.message ?? e}`);
    }
  }

  // FK: conditional so it doesn't fail if constraint already exists
  try {
    const check = await prisma.$queryRawUnsafe<{ n: number }[]>(
      `SELECT 1 AS n FROM information_schema.table_constraints WHERE constraint_name = 'Journal_tableTopicId_fkey'`
    );
    if (check.length === 0) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Journal" ADD CONSTRAINT "Journal_tableTopicId_fkey"
         FOREIGN KEY ("tableTopicId") REFERENCES "TableTopic"("id")
         ON DELETE SET NULL ON UPDATE CASCADE`
      );
      result.schema.steps.push("add FK Journal_tableTopicId_fkey");
    } else {
      result.schema.steps.push("FK already exists");
    }
  } catch (e: any) {
    result.schema.errors.push(`fk: ${e?.message ?? e}`);
  }

  // 2. Insert 21 tables (idempotent by title)
  for (const t of TABLE_SEEDS) {
    try {
      const rows = await prisma.$executeRawUnsafe(
        `INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
         SELECT gen_random_uuid()::text, $1, $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = $1)`,
        t.title,
        t.category,
        t.markdown
      );
      if (rows > 0) result.tables.created++;
      else result.tables.skipped++;
    } catch (e: any) {
      result.tables.errors.push(`${t.title.slice(0, 40)}: ${e?.message ?? e}`);
    }
  }

  // 3. Insert 3 essay topics featured for today (idempotent by title)
  for (const e of FEATURED_ESSAYS_TODAY) {
    try {
      const rows = await prisma.$executeRawUnsafe(
        `INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor", "featuredFor")
         SELECT gen_random_uuid()::text, $1, $2, CURRENT_DATE, CURRENT_DATE
         WHERE NOT EXISTS (SELECT 1 FROM "Topic" WHERE "title" = $1)`,
        e.title,
        e.titleId
      );
      if (rows > 0) result.featuredEssays.created++;
      else result.featuredEssays.skipped++;
    } catch (err: any) {
      result.featuredEssays.errors.push(
        `${e.title.slice(0, 40)}: ${err?.message ?? err}`
      );
    }
  }

  // Also refresh featuredFor for the 3 to today even if already inserted (so
  // running the endpoint on a later day re-features them for that day)
  for (const e of FEATURED_ESSAYS_TODAY) {
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Topic" SET "featuredFor" = CURRENT_DATE WHERE "title" = $1`,
        e.title
      );
    } catch {
      // ignore
    }
  }

  return result;
}

async function guard(req: Request) {
  const url = new URL(req.url);
  return url.searchParams.get("token") === TOKEN;
}

export async function POST(req: Request) {
  if (!(await guard(req))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const result = await run();
  return NextResponse.json(result);
}

export async function GET(req: Request) {
  if (!(await guard(req))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const result = await run();
  return NextResponse.json(result);
}
