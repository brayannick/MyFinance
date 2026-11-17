const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTHS_LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export const formatBRL = (value: number) => brl.format(value);

export function formatCompact(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1).replace('.', ',')} mil`;
  return `${sign}${Math.round(abs)}`;
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** '2026-10' -> 'out/26' */
export function monthLabel(key: string) {
  const [y, m] = key.split('-');
  return `${MONTHS[Number(m) - 1]}/${y.slice(2)}`;
}

/** '2026-10' -> 'Outubro de 2026' */
export function monthLongLabel(key: string) {
  const [y, m] = key.split('-');
  const name = MONTHS_LONG[Number(m) - 1] ?? '';
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${y}`;
}

/** '2026-10' -> 'outubro' */
export function monthName(key: string) {
  return MONTHS_LONG[Number(key.split('-')[1]) - 1] ?? '';
}
