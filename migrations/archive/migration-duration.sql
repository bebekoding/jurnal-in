-- Add writing duration column to Journal (idempotent, safe to re-run)
ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "durationSeconds" INTEGER;
