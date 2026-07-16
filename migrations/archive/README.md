# Migration archive

Kumpulan SQL migrasi manual yang pernah dijalankan langsung di Supabase SQL editor sebelum satu-klik admin seed endpoint (`POST /api/admin/seed?token=…`) dipakai untuk semuanya.

Setelah semua peserta sudah migrasi, isi folder ini murni historis — aman dihapus kalau mau bersih-bersih. Dipertahankan sebagai catatan urutan skema.

| File | Isi |
| --- | --- |
| `migration-topics.sql` | Bootstrap tabel `Topic` + seed essay pool awal |
| `migration-duration.sql` | Kolom `Journal.durationSeconds` |
| `migration-featured.sql` | Kolom `Topic.featuredFor` untuk override rotasi |
| `migration-tables.sql` | Bootstrap `TableTopic` + 21 bank tabel Task 1 (di-generate ulang oleh `scripts/gen-tables-sql.js`) |
| `migration-refeature-mbg.sql` | Backfill featuredFor untuk topik MBG lama |

Skema kanonik ada di `prisma/schema.prisma`; untuk deploy baru cukup `prisma db push` + `POST /api/admin/seed`.
