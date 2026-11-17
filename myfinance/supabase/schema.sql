-- MyFinance: criação do zero. Supabase > SQL Editor > New query.
-- (Se a tabela já existe, use o arquivo migracao.sql.)

create table if not exists public.transacoes (
  id               uuid primary key default gen_random_uuid(),
  fitid            text unique not null,        -- UNIQUE: impede lançamentos repetidos
  data_transacao   date not null,
  valor            numeric not null,            -- negativo = saída, positivo = entrada
  descricao        text not null,
  categoria        text not null default 'Sem Categoria',
  categoria_manual boolean not null default false  -- true = categoria escolhida pelo usuário
);

create index if not exists transacoes_data_idx on public.transacoes (data_transacao desc);

-- Uso pessoal: libera a chave "anon" embutida no app. Veja "Segurança" no README.
alter table public.transacoes enable row level security;

drop policy if exists transacoes_select_anon on public.transacoes;
drop policy if exists transacoes_insert_anon on public.transacoes;
drop policy if exists transacoes_update_anon on public.transacoes;

create policy transacoes_select_anon on public.transacoes for select to anon using (true);
create policy transacoes_insert_anon on public.transacoes for insert to anon with check (true);
create policy transacoes_update_anon on public.transacoes for update to anon using (true) with check (true);

grant usage on schema public to anon;
grant select, insert, update on public.transacoes to anon;

notify pgrst, 'reload schema';
