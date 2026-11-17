import type { Transaction } from '../types';
import { DEFAULT_CATEGORY } from '../constants/categories';
import { monthLabel } from './format';

export interface EvolutionPoint {
  key: string;
  label: string;
  balance: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  share: number; // 0..1 do total de saídas do mês
}

export interface MonthSummary {
  balance: number;
  income: number;
  expense: number;
  evolution: EvolutionPoint[];
  categorySpending: CategorySpending[];
  transactions: Transaction[];
}

export const monthKeyOf = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** Meses que têm transações, do mais recente para o mais antigo. */
export function listMonths(items: Transaction[]): string[] {
  return [...new Set(items.map((t) => t.data_transacao.slice(0, 7)))].sort().reverse();
}

/**
 * Mês exibido por padrão: o mês atual, se ele tiver transações; senão o mais recente
 * que tiver. (Era aqui o problema: o app só olhava o mês do calendário, então um
 * extrato de outubro importado em novembro aparecia zerado.)
 */
export function defaultMonth(months: string[], now = new Date()): string {
  const current = monthKeyOf(now);
  return months.includes(current) ? current : (months[0] ?? current);
}

export function computeSummary(items: Transaction[], month: string): MonthSummary {
  let balance = 0;
  let income = 0;
  let expense = 0;
  const byMonth = new Map<string, number>();
  const spending = new Map<string, number>();
  const transactions: Transaction[] = [];

  for (const t of items) {
    const value = Number(t.valor);
    if (!Number.isFinite(value)) continue;

    balance += value;
    const key = t.data_transacao.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + value);

    if (key !== month) continue;
    transactions.push(t);
    if (value >= 0) {
      income += value;
    } else {
      expense += -value;
      const category = t.categoria?.trim() || DEFAULT_CATEGORY;
      spending.set(category, (spending.get(category) ?? 0) + -value);
    }
  }

  // Patrimônio acumulado; o gráfico mostra os 6 meses que terminam no mês selecionado.
  let running = 0;
  const evolution: EvolutionPoint[] = [...byMonth.keys()]
    .sort()
    .map((key) => {
      running += byMonth.get(key) ?? 0;
      return { key, label: monthLabel(key), balance: running };
    })
    .filter((p) => p.key <= month)
    .slice(-6);

  const categorySpending: CategorySpending[] = [...spending.entries()]
    .map(([category, amount]) => ({ category, amount, share: expense > 0 ? amount / expense : 0 }))
    .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category, 'pt-BR'));

  return { balance, income, expense, evolution, categorySpending, transactions };
}
