# UPDATE - HST mengikuti Tanggal Tanam

Perubahan utama:

- HST tidak lagi dihitung dari tanggal mulai proyek/lahan.
- Proyek sekarang punya 2 tanggal:
  - `start_date` = tanggal mulai lahan/proyek, misalnya olah tanah.
  - `planting_date` = tanggal tanam, dari sinilah HST dihitung.
- Saat buat lahan baru tersedia pilihan:
  - Masih Persiapan Lahan
  - Sudah Tanam dari Awal
  - Tanaman Sudah Berjalan
- Kalau masih persiapan, HST tampil sebagai `Belum Tanam` / `Belum HST`.
- Jika user mencatat kegiatan dengan kategori/judul `Tanam`, aplikasi otomatis mengisi `planting_date` kalau masih kosong.

SQL update untuk Supabase existing:

```sql
alter table projects
add column if not exists planting_date date;

notify pgrst, 'reload schema';
```

Kalau project masih beta dan ingin reset total, pakai `supabase/schema.sql`.

Build: aman.
