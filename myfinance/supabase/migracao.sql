-- MyFinance: migração para projetos que já têm a tabela "transacoes".
-- Pode ser executada quantas vezes quiser (é idempotente).
-- Supabase > SQL Editor > New query > cole tudo > Run.

-- 1) Coluna que marca categorias escolhidas à mão (para nunca serem sobrescritas).
alter table public.transacoes
  add column if not exists categoria_manual boolean not null default false;

create index if not exists transacoes_data_idx on public.transacoes (data_transacao desc);

-- 2) Permissões. Com RLS ligado, um UPDATE sem política NÃO dá erro: simplesmente não
--    altera nada, e a categoria "volta" ao recarregar. Recriamos uma política por operação.
alter table public.transacoes enable row level security;

drop policy if exists "uso pessoal com chave anon" on public.transacoes;
drop policy if exists transacoes_select_anon on public.transacoes;
drop policy if exists transacoes_insert_anon on public.transacoes;
drop policy if exists transacoes_update_anon on public.transacoes;

create policy transacoes_select_anon on public.transacoes
  for select to anon using (true);

create policy transacoes_insert_anon on public.transacoes
  for insert to anon with check (true);

create policy transacoes_update_anon on public.transacoes
  for update to anon using (true) with check (true);

grant usage on schema public to anon;
grant select, insert, update on public.transacoes to anon;

-- 3) Faz a API enxergar a coluna nova imediatamente (evita "column not found in schema cache").
notify pgrst, 'reload schema';

-- Conferência (opcional): deve listar 3 políticas (SELECT, INSERT, UPDATE) e a coluna categoria_manual.
-- select policyname, cmd from pg_policies where tablename = 'transacoes';
-- select column_name from information_schema.columns
--   where table_name = 'transacoes' and column_name = 'categoria_manual';
