import type { NewTransaction } from '../types';

// Lê o valor de uma tag tanto em OFX 1.x (SGML, sem fechamento) quanto em XML.
function readTag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}>\\s*([^<\\r\\n]*)`, 'i'));
  return match ? match[1].trim() : '';
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

/** Converte o texto bruto de um arquivo .ofx em uma lista de transações. */
export function parseOfx(raw: string): NewTransaction[] {
  const blocks =
    raw.match(/<STMTTRN>[\s\S]*?(?=<\/STMTTRN>|<STMTTRN>|<\/BANKTRANLIST>|$)/gi) ?? [];

  const byFitid = new Map<string, NewTransaction>();

  for (const block of blocks) {
    const fitid = readTag(block, 'FITID');
    const posted = readTag(block, 'DTPOSTED').slice(0, 8); // 20260115120000[-3:BRT] -> 20260115
    const amount = Number(readTag(block, 'TRNAMT').replace(',', '.'));
    const memo = readTag(block, 'MEMO') || readTag(block, 'NAME');

    if (!fitid || !/^\d{8}$/.test(posted) || Number.isNaN(amount)) continue;

    byFitid.set(fitid, {
      fitid,
      data_transacao: `${posted.slice(0, 4)}-${posted.slice(4, 6)}-${posted.slice(6, 8)}`,
      valor: amount,
      descricao: decodeEntities(memo) || 'Sem descrição',
    });
  }

  return [...byFitid.values()];
}
