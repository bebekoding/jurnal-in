const fs = require("fs");

const src = fs.readFileSync(
  "/Users/960075/Downloads/IELTS_Task1_Table_Data_Bank_1.md",
  "utf8"
);

const CATEGORY_MAP = {
  "RETAIL STORES": "Retail",
  "BANK PERFORMANCE": "Banking",
  "NATIONAL ECONOMY": "Economy",
  "OTHER INTERESTING TOPICS": "Other",
};

const lines = src.split("\n");
let category = null;
const topics = [];
let current = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const catMatch = line.match(/^##\s+(.+?)\s*$/);
  if (catMatch && !line.startsWith("###")) {
    const name = catMatch[1].trim();
    if (CATEGORY_MAP[name]) category = CATEGORY_MAP[name];
    continue;
  }
  const topicMatch = line.match(/^###\s+\d+\.\s+(.+?)\s*$/);
  if (topicMatch) {
    if (current) topics.push(current);
    current = { title: topicMatch[1].trim(), category, table: [] };
    continue;
  }
  if (current && line.trim().startsWith("|")) {
    current.table.push(line.trim());
  } else if (current && current.table.length > 0 && line.trim() === "") {
    // table finished when a blank line follows table rows
    // (keep collecting only contiguous table lines)
  }
}
if (current) topics.push(current);

// keep only topics that actually captured a table
const clean = topics.filter((t) => t.table.length >= 2);

function esc(s) {
  return s.replace(/'/g, "''");
}

let sql = `-- IELTS Task 1 table bank: schema + 21 tables (idempotent)

CREATE TABLE IF NOT EXISTS "TableTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "tableMarkdown" TEXT NOT NULL,
    "featuredFor" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TableTopic_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TableTopic_featuredFor_idx" ON "TableTopic"("featuredFor");

ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "tableTopicId" TEXT;
CREATE INDEX IF NOT EXISTS "Journal_tableTopicId_idx" ON "Journal"("tableTopicId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Journal_tableTopicId_fkey'
  ) THEN
    ALTER TABLE "Journal" ADD CONSTRAINT "Journal_tableTopicId_fkey"
      FOREIGN KEY ("tableTopicId") REFERENCES "TableTopic"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

`;

for (const t of clean) {
  const md = t.table.join("\n");
  sql += `INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, '${esc(t.title)}', '${esc(
    t.category || "Other"
  )}', '${esc(md)}'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = '${esc(
    t.title
  )}');\n\n`;
}

fs.writeFileSync(
  "/Users/960075/Documents/Jurnal.in/migration-tables.sql",
  sql
);
console.log(`Parsed ${clean.length} tables`);
clean.forEach((t, i) =>
  console.log(`  ${i + 1}. [${t.category}] ${t.title.slice(0, 55)}`)
);
