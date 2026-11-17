export const DEFAULT_CATEGORY = 'Sem Categoria';

export const SPENDING_CATEGORIES = ['Comida', 'Transporte', 'Lazer', 'Bebidas'] as const;

export const CATEGORIES = [
  ...SPENDING_CATEGORIES,
  'Mercado',
  'Restaurantes',
  'Moradia',
  'Contas',
  'Saúde',
  'Educação',
  'Salário',
  'Outros',
  DEFAULT_CATEGORY,
];

const CATEGORY_COLORS: Record<string, string> = {
  Comida: '#E3B75A',
  Transporte: '#1F9A74',
  Lazer: '#58C7A1',
  Bebidas: '#B98A24',
  Mercado: '#8FBFA9',
  Restaurantes: '#D9C58A',
  Moradia: '#5C8F7C',
  Contas: '#9DB5AC',
  Saúde: '#79B6A0',
  Educação: '#A8C9B9',
  Salário: '#13946A',
  Outros: '#B7C4BE',
  [DEFAULT_CATEGORY]: '#C9D3CE',
};

export const categoryColor = (name: string) => CATEGORY_COLORS[name] ?? '#B7C4BE';
