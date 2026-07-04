-- KAS PETANI v1.2 Multi Farmer Beta
-- Aman dijalankan di project yang sudah ada. Tidak drop tabel.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique,
  pin_hash text,
  role text not null default 'farmer' check (role in ('admin', 'farmer')),
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles add column if not exists phone text;
alter table profiles add column if not exists pin_hash text;
alter table profiles add column if not exists role text default 'farmer';
alter table profiles add column if not exists status text default 'aktif';
alter table profiles add column if not exists note text;
alter table profiles add column if not exists updated_at timestamptz default now();

alter table projects add column if not exists farmer_id uuid references profiles(id) on delete set null;
create index if not exists projects_farmer_id_idx on projects(farmer_id);

alter table profiles disable row level security;
alter table projects disable row level security;
alter table records disable row level security;
alter table categories disable row level security;

notify pgrst, 'reload schema';
