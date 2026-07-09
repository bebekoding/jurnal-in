# Jurnal.in

Web app untuk latihan **IELTS Writing** lewat journaling harian. Setor jurnal, baca punya teman, review bareng, dan dapat analisis dari **Claude** (grammar fix, vocab upgrade band 7–9, feedback struktur, estimasi band score).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · Supabase Postgres · Anthropic SDK · Vercel

---

## 1. Setup lokal

```bash
cd ~/Documents/Jurnal.in
npm install
cp .env.example .env
# isi DATABASE_URL, DIRECT_URL, ANTHROPIC_API_KEY di .env
npm run db:push       # push schema Prisma ke Supabase
npm run dev           # http://localhost:3000
```

## 2. Bikin database Supabase (gratis)

1. Buka [supabase.com](https://supabase.com) → **New Project**.
2. Nama project: `jurnal-in`, region terdekat (Singapore).
3. Set database password (simpan!).
4. Setelah project ready, buka **Project Settings → Database → Connection string**.
5. Salin **URI** dari section **Connection pooling** (mode `Transaction`) → itu jadi `DATABASE_URL`.
6. Salin **URI** dari section **Direct connection** → itu jadi `DIRECT_URL`.
7. Ganti `[YOUR-PASSWORD]` di kedua URL dengan password database.

## 3. Dapetin Anthropic API key

1. Buka [console.anthropic.com](https://console.anthropic.com).
2. Login / daftar akun.
3. Menu **Settings → API Keys → Create Key**.
4. Isi saldo di **Plans & Billing** (mulai $5 sudah cukup untuk ribuan analisis).
5. Salin API key → jadi `ANTHROPIC_API_KEY` di `.env`.

## 4. Push ke GitHub

```bash
gh repo create jurnal-in --public --source=. --push
```

## 5. Deploy ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new) → import repo `jurnal-in`.
2. Framework preset: **Next.js** (auto-detect).
3. Di **Environment Variables**, tambahkan:
   - `DATABASE_URL` (dari Supabase pooling)
   - `DIRECT_URL` (dari Supabase direct)
   - `ANTHROPIC_API_KEY` (dari console.anthropic.com)
4. Klik **Deploy**.

Setiap `git push` ke `main` akan auto-deploy.

---

## Struktur

```
app/
  page.tsx                          # list jurnal
  new/page.tsx                      # form tulis jurnal
  journals/[id]/                    # detail + analisis + review
  api/
    journals/route.ts               # GET list, POST create
    journals/[id]/reviews/route.ts  # POST review
    journals/[id]/analyze/route.ts  # POST → Claude
lib/
  prisma.ts
  anthropic.ts
prisma/schema.prisma
```

## Model data

- **Journal** — id, authorName, title, content, createdAt
- **Review** — komentar peer review
- **Analysis** — hasil analisis Claude (band scores, grammarFixes, vocabUpgrades, structureFeedback, improvedText)

## Catatan

- Nama author disimpan di `localStorage` biar nggak perlu ketik ulang.
- Analisis Claude bisa di-*re-run*; hasil terakhir overwrite yang lama.
- Batas input: judul 200 char, jurnal 20k char, review 4k char.
