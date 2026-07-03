# KAS PETANI

Buku kas dan jurnal usaha tani ringan untuk HP. Target awal: gratis, mobile-first, simpel, dan bisa dipakai cepat di kebun.

## Fitur Sprint 0

- Next.js + Tailwind CSS 4.
- Tampilan mobile-first seperti aplikasi Android.
- Multi proyek tanam.
- Catat pengeluaran, pemasukan, panen, kegiatan, dan catatan.
- Kategori default + kategori custom manual di form.
- Dashboard modal / pemasukan / laba.
- Detail proyek + timeline.
- PWA manifest dasar.
- Supabase schema disiapkan.
- Mode lokal dulu memakai localStorage, jadi bisa dites tanpa biaya dan tanpa login.

## Cara Install

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Supabase Free

1. Buat project baru di Supabase Free.
2. Buka SQL Editor.
3. Buka file `supabase/schema.sql` di project ini.
4. Copy semua isi file tersebut.
5. Paste ke SQL Editor Supabase.
6. Klik Run.
7. Copy URL dan anon key Supabase.
8. Buat file `.env.local` dari `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=isi_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key_supabase
```

Catatan: Sprint 0 masih localStorage agar cepat dites. Sprint berikutnya baru kita aktifkan full sync Supabase.

## Struktur

```text
app/
components/
lib/
types/
supabase/
public/
```

## Prinsip

- Nol biaya dulu.
- Jangan berat.
- Tombol besar.
- Input cepat.
- Semua catatan masuk tabel `records`.


## Sprint 6
Bottom sheet quick catat, timeline feed, dan phase stepper sudah masuk.
