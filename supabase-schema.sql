create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher text not null default '',
  room text not null default '',
  schedule text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  guardian text not null default '',
  class_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time time not null,
  class_name text not null default '',
  type text not null default 'Aula',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  text text not null default '',
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.events enable row level security;
alter table public.notices enable row level security;

drop policy if exists "Permitir leitura publica de turmas" on public.classes;
drop policy if exists "Permitir leitura publica de alunos" on public.students;
drop policy if exists "Permitir leitura publica de eventos" on public.events;
drop policy if exists "Permitir leitura publica de avisos" on public.notices;
drop policy if exists "Permitir cadastro publico de turmas" on public.classes;
drop policy if exists "Permitir cadastro publico de alunos" on public.students;
drop policy if exists "Permitir cadastro publico de eventos" on public.events;
drop policy if exists "Permitir cadastro publico de avisos" on public.notices;
drop policy if exists "Permitir edicao publica de avisos" on public.notices;
drop policy if exists "Permitir exclusao publica de eventos" on public.events;
drop policy if exists "Permitir exclusao publica de turmas" on public.classes;
drop policy if exists "Permitir exclusao publica de alunos" on public.students;
drop policy if exists "Permitir exclusao publica de avisos" on public.notices;

create policy "Permitir leitura publica de turmas"
on public.classes for select
to anon, authenticated
using (true);

create policy "Permitir leitura publica de alunos"
on public.students for select
to anon, authenticated
using (true);

create policy "Permitir leitura publica de eventos"
on public.events for select
to anon, authenticated
using (true);

create policy "Permitir leitura publica de avisos"
on public.notices for select
to anon, authenticated
using (true);

create policy "Permitir cadastro publico de turmas"
on public.classes for insert
to anon, authenticated
with check (true);

create policy "Permitir cadastro publico de alunos"
on public.students for insert
to anon, authenticated
with check (true);

create policy "Permitir cadastro publico de eventos"
on public.events for insert
to anon, authenticated
with check (true);

create policy "Permitir cadastro publico de avisos"
on public.notices for insert
to anon, authenticated
with check (true);

create policy "Permitir edicao publica de avisos"
on public.notices for update
to anon, authenticated
using (true)
with check (true);

create policy "Permitir exclusao publica de eventos"
on public.events for delete
to anon, authenticated
using (true);

create policy "Permitir exclusao publica de turmas"
on public.classes for delete
to anon, authenticated
using (true);

create policy "Permitir exclusao publica de alunos"
on public.students for delete
to anon, authenticated
using (true);

create policy "Permitir exclusao publica de avisos"
on public.notices for delete
to anon, authenticated
using (true);

insert into public.classes (name, teacher, room, schedule)
values
  ('Maternal', 'Prof. Bia', 'Sala 1', 'Seg, Qua e Sex - 13:00'),
  ('Jardim I', 'Prof. Camila', 'Sala 2', 'Seg a Sex - 08:00'),
  ('Pre II', 'Prof. Renata', 'Sala 3', 'Ter e Qui - 14:00')
on conflict do nothing;

insert into public.students (name, guardian, class_name, phone)
values
  ('Ana Clara', 'Mariana', 'Jardim I', '(11) 99999-1200'),
  ('Miguel Santos', 'Carlos', 'Pre II', '(11) 98888-3311'),
  ('Livia Rocha', 'Patricia', 'Maternal', '(11) 97777-2040')
on conflict do nothing;

insert into public.events (title, event_date, event_time, class_name, type, note)
values
  ('Aula de alfabetizacao', current_date, '08:00', 'Jardim I', 'Aula', 'Atividade com letras e cartazes coloridos.'),
  ('Reuniao com responsaveis', current_date + 2, '17:30', 'Pre II', 'Reuniao', 'Entrega dos relatorios do bimestre.')
on conflict do nothing;

insert into public.notices (title, text, pinned)
values
  ('Levar garrafinha de agua', 'Nesta semana teremos atividades no patio.', true),
  ('Festa junina', 'Ensaios toda sexta-feira depois do lanche.', false)
on conflict do nothing;
