export interface Transaction {
  id: string;
  fitid: string;
  data_transacao: string; // YYYY-MM-DD
  valor: number;
  descricao: string;
  categoria: string;
  categoria_manual: boolean;
}

export type NewTransaction = Omit<Transaction, 'id' | 'categoria' | 'categoria_manual'>;

export interface ImportResult {
  total: number;
  inserted: number;
  ignored: number;
}
