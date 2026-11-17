import { supabase } from '../lib/supabase';
import { categorizeTransaction } from '../lib/categorization';
import { DEFAULT_CATEGORY } from '../constants/categories';
import type { ImportResult, NewTransaction, Transaction } from '../types';

const PAGE = 1000; // limite padrão de linhas por requisição do Supabase
const MIGRATION_HINT = 'Rode o arquivo supabase/migracao.sql no SQL Editor do Supabase.';

/** Traduz erros do Supabase para algo que diga o que fazer. */
function explain(message: string): Error {
  if (message.includes('categoria_manual')) {
    return new Error(`A coluna categoria_manual não existe no banco. ${MIGRATION_HINT}`);
  }
  if (/permission denied|row-level security/i.test(message)) {
    return new Error(`O banco negou a operação (permissões). ${MIGRATION_HINT}`);
  }
  return new Error(message);
}

/** Categoria exibida: escolha manual vence sempre; senão a salva; senão a inferida pela descrição. */
function resolveCategory(t: Transaction): string {
  if (t.categoria_manual) return t.categoria;
  if (t.categoria && t.categoria !== DEFAULT_CATEGORY) return t.categoria;
  return categorizeTransaction(t.descricao);
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const all: Transaction[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('data_transacao', { ascending: false })
      .order('fitid', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw explain(error.message);
    all.push(...((data ?? []) as Transaction[]));
    if (!data || data.length < PAGE) break;
  }

  return all
    .map((t) => ({ ...t, valor: Number(t.valor) }))
    .filter((t) => Number.isFinite(t.valor))
    .map((t) => ({ ...t, categoria_manual: Boolean(t.categoria_manual), categoria: resolveCategory(t) }));
}

/** Insere só o que é novo: FITIDs já existentes são ignorados (e mantêm a categoria). */
export async function importTransactions(rows: NewTransaction[]): Promise<ImportResult> {
  const categorized = rows.map((row) => ({
    ...row,
    categoria: categorizeTransaction(row.descricao),
    categoria_manual: false,
  }));

  let inserted = 0;
  for (let i = 0; i < categorized.length; i += 500) {
    const { data, error } = await supabase
      .from('transacoes')
      .upsert(categorized.slice(i, i + 500), { onConflict: 'fitid', ignoreDuplicates: true })
      .select('id');
    if (error) throw explain(error.message);
    inserted += data?.length ?? 0;
  }
  return { total: categorized.length, inserted, ignored: categorized.length - inserted };
}

/**
 * Salva a categoria escolhida e CONFIRMA que o banco gravou.
 * Com RLS, um UPDATE sem permissão não dá erro: afeta 0 linhas em silêncio. Por isso
 * pedimos a linha de volta e falhamos de forma visível se ela não vier.
 */
export async function updateCategory(id: string, categoria: string): Promise<void> {
  const { data, error } = await supabase
    .from('transacoes')
    .update({ categoria, categoria_manual: true })
    .eq('id', id)
    .select('id, categoria');
  if (error) throw explain(error.message);
  if (!data || data.length === 0) {
    throw new Error(`O banco não gravou a alteração (nenhuma linha atualizada). ${MIGRATION_HINT}`);
  }
  if (data[0].categoria !== categoria) {
    throw new Error('O banco devolveu uma categoria diferente da escolhida. Tente novamente.');
  }
}
