create table if not exists public.students (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'student')),
  registration_date timestamptz not null,
  completed_lessons text[] not null default '{}',
  remaining_lessons integer not null default 0,
  progress_pct integer not null default 0,
  assigned_courses text[] not null default '{}',
  last_login timestamptz,
  last_activity timestamptz,
  status text not null check (status in ('active', 'disabled'))
);

alter table public.students enable row level security;

create policy if not exists "Allow read/write for authenticated users"
on public.students
for all
to authenticated
using (true)
with check (true);
