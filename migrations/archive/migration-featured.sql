-- Featured-topic support + today's MBG stunting essay (idempotent)

-- 1. Add featuredFor column so a topic can be pinned to a specific date
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "featuredFor" DATE;
CREATE INDEX IF NOT EXISTS "Topic_featuredFor_idx" ON "Topic"("featuredFor");

-- 2. Insert today's featured essay (safe to re-run; skips if already inserted)
INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor", "featuredFor")
SELECT
  gen_random_uuid()::text,
  'Malnutrition and stunting remain serious problems among children in Indonesia. What are the causes of this issue, and how effective are government solutions such as the Makan Bergizi Gratis (MBG) program in addressing it?',
  'Malnutrisi dan stunting masih menjadi masalah serius di kalangan anak-anak Indonesia. Apa penyebab masalah ini, dan seberapa efektif solusi pemerintah seperti program Makan Bergizi Gratis (MBG) dalam mengatasinya?',
  CURRENT_DATE,
  CURRENT_DATE
WHERE NOT EXISTS (
  SELECT 1 FROM "Topic"
  WHERE "featuredFor" = CURRENT_DATE
    AND "title" LIKE 'Malnutrition and stunting%'
);
