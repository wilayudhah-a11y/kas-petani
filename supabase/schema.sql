-- KAS PETANI v1.0 Beta schema - HST memakai planting_date
-- Untuk project baru/testing: aman dijalankan untuk reset tabel utama.
-- PERINGATAN: drop table akan menghapus data lama.

create extension if not exists pgcrypto;

drop table if exists records cascade;
drop table if exists categories cascade;
drop table if exists projects cascade;

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  crop text not null,
  variety text,
  location text,
  land_size numeric,
  land_unit text default 'm²',
  start_date date not null,
  planting_date date,
  harvest_estimate_days integer not null default 90,
  target_harvest_date date,
  status text not null default 'berjalan' check (status in ('berjalan', 'panen', 'selesai', 'arsip')),
  phase text not null default 'Persiapan Lahan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('expense', 'income', 'activity', 'harvest', 'note')),
  name text not null,
  icon text,
  color text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type text not null check (type in ('expense', 'income', 'activity', 'harvest', 'note')),
  category text not null default 'Lainnya',
  title text not null,
  description text,
  amount numeric not null default 0,
  quantity numeric,
  unit text,
  price_per_unit numeric,
  record_date date not null default current_date,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index records_project_id_idx on records(project_id);
create index records_record_date_idx on records(record_date desc);
create index records_type_idx on records(type);

insert into categories (type, name, icon, color, is_default) values
('expense', 'Bibit', '🌱', 'green', true),
('expense', 'Pupuk', '🧪', 'green', true),
('expense', 'Pestisida', '🛡️', 'green', true),
('expense', 'Mulsa', '⬛', 'green', true),
('expense', 'Tenaga Kerja', '👷', 'green', true),
('expense', 'Transport', '🚚', 'green', true),
('expense', 'Sewa Alat', '🚜', 'green', true),
('expense', 'Lainnya', '📝', 'green', true),
('income', 'Penjualan', '💰', 'green', true),
('income', 'Bonus', '🎁', 'green', true),
('income', 'Lainnya', '📝', 'green', true),
('activity', 'Pengolahan Tanah', '🚜', 'green', true),
('activity', 'Tanam', '🌱', 'green', true),
('activity', 'Pemupukan', '🧪', 'green', true),
('activity', 'Penyemprotan', '💦', 'green', true),
('activity', 'Penyiraman', '💧', 'green', true),
('activity', 'Penyiangan', '🌿', 'green', true),
('activity', 'Lainnya', '📝', 'green', true),
('harvest', 'Panen', '🌾', 'green', true),
('note', 'Catatan', '📝', 'green', true);

alter table projects disable row level security;
alter table categories disable row level security;
alter table records disable row level security;

notify pgrst, 'reload schema';

-- Admin Petani MVP
-- Jalankan bagian ini kalau ingin memakai /admin.
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  role text not null default 'farmer' check (role in ('admin', 'farmer')),
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects
add column if not exists farmer_id uuid references profiles(id) on delete set null;

create index if not exists projects_farmer_id_idx on projects(farmer_id);

alter table profiles disable row level security;
notify pgrst, 'reload schema';
