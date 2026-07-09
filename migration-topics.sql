-- Random Topics feature migration + seed 21 topics
-- Idempotent: aman dijalankan ulang. Copy paste semua ke Supabase SQL Editor → Run.

-- 1) Buat tabel Topic (kalau belum ada)
CREATE TABLE IF NOT EXISTS "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleId" TEXT,
    "description" TEXT,
    "scheduledFor" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- 2) Tambah kolom titleId kalau tabel sudah ada tapi belum punya
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "titleId" TEXT;

CREATE INDEX IF NOT EXISTS "Topic_scheduledFor_idx" ON "Topic"("scheduledFor");

-- 3) Tambah kolom topicId di Journal + foreign key
ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "topicId" TEXT;
CREATE INDEX IF NOT EXISTS "Journal_topicId_idx" ON "Journal"("topicId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Journal_topicId_fkey'
  ) THEN
    ALTER TABLE "Journal" ADD CONSTRAINT "Journal_topicId_fkey"
      FOREIGN KEY ("topicId") REFERENCES "Topic"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 4) Seed 21 topik, interleaved kategori (Gov/Fin/Sport/Curr) untuk 7 hari
-- Day 1 (2026-07-09) — Gov, Fin, Sport
INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor") VALUES
  (gen_random_uuid()::text, 'Should e-government fully replace face-to-face public services?', 'Apakah e-government sebaiknya sepenuhnya menggantikan layanan publik tatap muka?', '2026-07-09'),
  (gen_random_uuid()::text, 'Should central banks prioritize currency stability over economic growth?', 'Apakah bank sentral seharusnya memprioritaskan stabilitas nilai tukar dibanding pertumbuhan ekonomi?', '2026-07-09'),
  (gen_random_uuid()::text, 'Should government funding favor grassroots sports over elite stadiums?', 'Apakah dana pemerintah seharusnya lebih diprioritaskan untuk olahraga akar rumput dibanding stadion elit?', '2026-07-09');

-- Day 2 (2026-07-10) — Curr, Gov, Fin
INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor") VALUES
  (gen_random_uuid()::text, 'Should gig workers (e.g., ride-hailing drivers) be classified as employees?', 'Apakah pekerja gig (misalnya pengemudi ojol) seharusnya diklasifikasikan sebagai karyawan?', '2026-07-10'),
  (gen_random_uuid()::text, 'Governments should regulate AI more strictly. Agree or disagree?', 'Pemerintah seharusnya mengatur AI lebih ketat. Setuju atau tidak setuju?', '2026-07-10'),
  (gen_random_uuid()::text, 'Are cryptocurrencies too risky to be widely regulated?', 'Apakah cryptocurrency terlalu berisiko untuk diatur secara luas?', '2026-07-10');

-- Day 3 (2026-07-11) — Sport, Curr, Gov
INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor") VALUES
  (gen_random_uuid()::text, 'Are professional athletes'' salaries too high?', 'Apakah gaji atlet profesional terlalu tinggi?', '2026-07-11'),
  (gen_random_uuid()::text, 'Do social media platforms bear responsibility for misinformation?', 'Apakah platform media sosial bertanggung jawab atas penyebaran misinformasi?', '2026-07-11'),
  (gen_random_uuid()::text, 'Should Indonesian state institutions/agencies be privatized?', 'Apakah instansi pemerintahan di Indonesia seharusnya diswastanisasi?', '2026-07-11');

-- Day 4 (2026-07-12) — Fin, Sport, Curr
INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor") VALUES
  (gen_random_uuid()::text, 'Should fuel subsidies be phased out completely?', 'Apakah subsidi BBM seharusnya dihapus sepenuhnya?', '2026-07-12'),
  (gen_random_uuid()::text, 'Should hosting the World Cup be limited to wealthy countries?', 'Apakah tuan rumah Piala Dunia seharusnya dibatasi hanya untuk negara kaya?', '2026-07-12'),
  (gen_random_uuid()::text, 'Should countries reduce reliance on fossil fuels immediately?', 'Apakah negara-negara seharusnya segera mengurangi ketergantungan pada bahan bakar fosil?', '2026-07-12');

-- Day 5 (2026-07-13) — Gov, Fin, Sport
INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor") VALUES
  (gen_random_uuid()::text, 'Is direct democracy more effective than representative democracy?', 'Apakah demokrasi langsung lebih efektif dibanding demokrasi perwakilan?', '2026-07-13'),
  (gen_random_uuid()::text, 'Is de-dollarization beneficial for developing economies?', 'Apakah de-dolarisasi menguntungkan bagi negara berkembang?', '2026-07-13'),
  (gen_random_uuid()::text, 'Is esports as legitimate as traditional sports?', 'Apakah esports selegitimate olahraga tradisional?', '2026-07-13');

-- Day 6 (2026-07-14) — Curr, Gov, Fin
INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor") VALUES
  (gen_random_uuid()::text, 'Is remote work more beneficial than harmful for productivity?', 'Apakah kerja jarak jauh lebih menguntungkan daripada merugikan produktivitas?', '2026-07-14'),
  (gen_random_uuid()::text, 'Should civil servants'' pay be based on performance rather than seniority?', 'Apakah gaji PNS seharusnya berdasarkan kinerja, bukan senioritas?', '2026-07-14'),
  (gen_random_uuid()::text, 'Should banks lend more to small businesses than large corporations?', 'Apakah bank seharusnya lebih banyak memberi pinjaman ke UMKM dibanding korporasi besar?', '2026-07-14');

-- Day 7 (2026-07-15) — Sport, Curr, Curr
INSERT INTO "Topic" ("id", "title", "titleId", "scheduledFor") VALUES
  (gen_random_uuid()::text, 'Should doping violations result in lifetime bans?', 'Apakah pelanggaran doping seharusnya berujung larangan seumur hidup?', '2026-07-15'),
  (gen_random_uuid()::text, 'Data breaches are becoming more frequent. Should governments impose stricter penalties on companies that leak personal data?', 'Kebocoran data semakin sering terjadi. Apakah pemerintah seharusnya menerapkan sanksi lebih ketat pada perusahaan yang membocorkan data pribadi?', '2026-07-15'),
  (gen_random_uuid()::text, 'Are international sanctions effective in resolving geopolitical conflicts?', 'Apakah sanksi internasional efektif dalam menyelesaikan konflik geopolitik?', '2026-07-15');
