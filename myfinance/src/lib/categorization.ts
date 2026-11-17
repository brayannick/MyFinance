import { DEFAULT_CATEGORY } from '../constants/categories';

// Palavra com * no fim = prefixo (ex.: 'restaurant*' pega 'restaurante'). Sem * = palavra inteira.
// A ordem importa: a primeira categoria que casar vence.
const KEYWORDS: Record<string, string[]> = {
  Bebidas: [
    'adega*', 'bebid*', 'cervej*', 'chopp*', 'chope*', 'vinh*', 'wine', 'liquor', 'drink*',
    'bar', 'boteco', 'pub', 'ambev', 'heineken', 'skol', 'brahma', 'whisk*', 'vodka', 'cachaca',
  ],
  Comida: [
    'ifood', 'uber eats', 'rappi', 'restaurant*', 'lanchonet*', 'lanche*', 'pizzari*', 'pizza*',
    'padari*', 'supermercad*', 'mercadinho', 'mercearia', 'hortifruti', 'acoug*', 'cafeteri*', 'cafe',
    'mcdonald*', 'burger king', 'hamburguer*', 'burguer*', 'subway', 'habib*', 'sushi', 'comida',
    'doceri*', 'confeitari*', 'pastel*', 'acai', 'sorvet*', 'churrasc*', 'marmit*', 'atacadao',
    'assai', 'carrefour', 'pao de acucar', 'outback', 'giraffas', 'spoleto', 'madero', 'starbucks',
    'kfc', 'dominos', 'popeyes', 'china in box',
  ],
  Transporte: [
    'uber', '99', 'taxi', 'cabify', 'indriver', 'metro', 'onibus', 'bilhete unico', 'riocard',
    'sptrans', 'cptm', 'posto*', 'gasolina', 'combustiv*', 'shell', 'ipiranga', 'petrobras',
    'estacionament*', 'pedagio*', 'sem parar', 'veloe', 'conectcar', 'localiza', 'movida',
    'rodoviaria', 'passagem', 'buser', 'clickbus', 'latam', 'transporte',
  ],
  Lazer: [
    'cinema*', 'cinemark', 'ingresso', 'sympla', 'teatro', 'show', 'parque', 'museu', 'boliche',
    'netflix', 'spotify', 'deezer', 'youtube', 'disney', 'prime video', 'globoplay', 'paramount',
    'crunchyroll', 'hbo', 'playstation', 'xbox', 'steam', 'nintendo', 'epic games', 'roblox',
    'ticketmaster', 'eventim',
  ],
};

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchesKeyword(normalizedDescription: string, keyword: string): boolean {
  const isPrefix = keyword.endsWith('*');
  const normalizedKeyword = normalize(isPrefix ? keyword.slice(0, -1) : keyword);
  if (!isPrefix) return normalizedDescription.includes(` ${normalizedKeyword} `);

  return normalizedDescription
    .trim()
    .split(' ')
    .some((word) => word.startsWith(normalizedKeyword));
}

/** Infere uma categoria pelo nome do estabelecimento contido na descrição do OFX. */
export function categorizeTransaction(description: string): string {
  const normalizedDescription = ` ${normalize(description)} `;

  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some((keyword) => matchesKeyword(normalizedDescription, keyword))) {
      return category;
    }
  }

  return DEFAULT_CATEGORY;
}
