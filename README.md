# Jurnal.in

Web app untuk latihan **IELTS Writing** lewat journaling harian. Setor jurnal Task 1 (tabel) & Task 2 (essay), baca punya teman, review bareng, dan generate rekap markdown untuk analisis mandiri.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · Supabase Postgres · Vercel

---

## 1. Setup lokal

```bash
cd ~/Documents/Jurnal.in
npm install
cp .env.example .env
# isi DATABASE_URL & DIRECT_URL di .env (lihat "Environment variables" di bawah)
npm run db:push       # push schema Prisma ke Supabase
npm run dev           # http://localhost:3000
```

## Environment variables

Semua kecuali dua yang pertama bersifat opsional.

| Nama | Wajib | Dipakai untuk | Contoh |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | Koneksi Prisma runtime (Supabase pooler mode `transaction`, port 6543) | `postgresql://postgres.PROJECT:PASSWORD@aws-…pooler.supabase.com:6543/postgres` |
| `DIRECT_URL` | ✅ | Migrasi Prisma (`prisma db push`, `prisma migrate`) — koneksi direct ke DB, port 5432 | `postgresql://postgres.PROJECT:PASSWORD@aws-…pooler.supabase.com:5432/postgres` |
| `ADMIN_PASSWORD` | ⬜ | Kalau di-set, `/topics/admin` bulk-paste essay pool minta password ini. Kalau kosong, endpoint tetap terbuka. | `s3cr3t-bulk` |

Set semua tiga di **Vercel → Settings → Environment Variables** untuk deploy prod, dan di `.env` untuk dev lokal.

### Endpoint admin dengan token statis

`POST /api/admin/seed?token=jurnal-in-seed-2026` — migrasi idempotent + seed 21 tabel + featured essays. Token-nya hardcoded di [`app/api/admin/seed/route.ts`](app/api/admin/seed/route.ts); ganti nilai konstanta `TOKEN` di sana kalau perlu.

## 2. Bikin database Supabase (gratis)

1. Buka [supabase.com](https://supabase.com) → **New Project**.
2. Nama project: `jurnal-in`, region terdekat (Singapore).
3. Set database password (simpan!).
4. Setelah project ready, buka **Project Settings → Database → Connection string**.
5. Salin **URI** dari section **Connection pooling** (mode `Transaction`) → itu jadi `DATABASE_URL`.
6. Salin **URI** dari section **Direct connection** → itu jadi `DIRECT_URL`.
7. Ganti `[YOUR-PASSWORD]` di kedua URL dengan password database.

## 3. Push ke GitHub

```bash
gh repo create jurnal-in --public --source=. --push
```

## 4. Deploy ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new) → import repo `jurnal-in`.
2. Framework preset: **Next.js** (auto-detect).
3. Di **Environment Variables**, tambahkan `DATABASE_URL` dan `DIRECT_URL` (lihat tabel di atas). Opsional: `ADMIN_PASSWORD`.
4. Klik **Deploy**.

Setiap `git push` ke `main` akan auto-deploy.

---

## Struktur

```
app/
  page.tsx                            # feed home (Journals · Essays · Tables)
  new/page.tsx                        # form journal harian
  topics/                             # essay pool + form (Task 2)
  tables/                             # tabel bank + form (Task 1)
  journals/[id]/                      # detail + peer review + edit
  export/page.tsx                     # recap markdown generator
  api/
    journals/route.ts                 # GET list, POST create
    journals/[id]/                    # PATCH edit, POST review
    admin/seed/route.ts               # migrasi + seed (token-gated)
    topics/bulk/route.ts              # bulk paste essay pool (ADMIN_PASSWORD)
components/
  Shell.tsx  Identity.tsx  Nav.tsx  Fx.tsx  StreakBadge.tsx  Logo.tsx
lib/
  prisma.ts  date.ts  random.ts  streak.ts  participants.ts  ua.ts
prisma/schema.prisma
```

## Model data

- **Journal** — id, authorName, title, content, createdAt, durationSeconds, topicId?, tableTopicId?
- **Topic** — pool essay Task 2 (title, titleId Indonesian, description, scheduledFor, featuredFor)
- **TableTopic** — bank tabel Task 1 (title, category, tableMarkdown, featuredFor)
- **Review** — komentar peer review yang di-anchor ke Journal

## Catatan

- Nama author disimpan di `localStorage`; SSR gate di-skip untuk crawler/bot UA agar OG image + preview render jujur.
- Rotasi 3 essay + 2 tabel per hari deterministik per tanggal Jakarta; featured essay di `Topic.featuredFor` menimpa rotasi.
- Batas input: judul 200 char, jurnal 20k char, review 4k char.
- Rekap markdown (`/export`) menghasilkan prompt siap-paste untuk analisis IELTS eksternal.
