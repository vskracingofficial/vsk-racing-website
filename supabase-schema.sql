-- Run this in Supabase Dashboard → SQL Editor before connecting the live site.
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  email text not null,
  name text not null,
  place text not null,
  date_of_birth date not null,
  phone text not null,
  emergency_phone text not null,
  emergency_contact text not null,
  racing_experience text not null,
  program text not null,
  media_package text not null,
  meal_preference text not null,
  payment_receipt_path text not null,
  driving_license_path text not null,
  status text not null default 'Pending verification'
);

alter table public.registrations enable row level security;
-- Public visitors can only create an entry. Reading registrations must be done by an authenticated admin.
create policy "public can submit registrations" on public.registrations for insert to anon with check (true);
create policy "authenticated admins can read registrations" on public.registrations for select to authenticated using (true);

insert into storage.buckets (id, name, public) values ('vsk-documents', 'vsk-documents', false)
on conflict (id) do nothing;
create policy "public can upload registration documents" on storage.objects for insert to anon
with check (bucket_id = 'vsk-documents');

create policy "authenticated admins can read registration documents" on storage.objects for select to authenticated
using (bucket_id = 'vsk-documents');
