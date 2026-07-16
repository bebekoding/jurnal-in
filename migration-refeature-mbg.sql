-- Re-feature the MBG stunting essay for today (idempotent, safe to re-run)
-- Works whether the topic already exists from before or not.

DO $$
DECLARE
  v_id text;
BEGIN
  SELECT id INTO v_id FROM "Topic" WHERE "title" LIKE 'Malnutrition and stunting%' LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor", "featuredFor")
    VALUES (
      gen_random_uuid()::text,
      'Malnutrition and stunting remain serious problems among children in Indonesia. What are the causes of this issue, and how effective are government solutions such as the Makan Bergizi Gratis (MBG) program in addressing it?',
      'Malnutrisi dan stunting masih menjadi masalah serius di kalangan anak-anak Indonesia. Apa penyebab masalah ini, dan seberapa efektif solusi pemerintah seperti program Makan Bergizi Gratis (MBG) dalam mengatasinya?',
      CURRENT_DATE,
      CURRENT_DATE
    );
  ELSE
    UPDATE "Topic" SET "featuredFor" = CURRENT_DATE WHERE "id" = v_id;
  END IF;
END $$;
