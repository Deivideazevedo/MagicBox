import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma string de data "ingênua" (Naive Date) que não possui fuso horário inerente
 * ou cujo fuso horário deve ser explicitamente ignorado na renderização visual.
 *
 * Esta função é a resposta arquitetural oficial do projeto para datas como:
 * - dataNascimento
 * - dataAlvo (Metas)
 * - data (Lançamentos / Vencimentos)
 * 
 * Como funciona: Remove o 'Z' ou offset da string retornada pelo Prisma/Banco, impedindo
 * que o objeto Date do JavaScript converta os dias da data baseando-se no avanço/atraso
 * de localidade atual.
 *
 * @param date - Data como string (ISO) ou objeto Date (convertido para ISO primeiro).
 * @param formatStr - O formato desejado do date-fns (ex: 'dd/MM/yyyy' ou 'dd MMM yy').
 *                    O padrão é 'dd/MM/yyyy'.
 * 
 * @example
 * // O banco devolveu 19 de Abril de 2026 como:
 * // '2026-04-19T00:00:00.000Z'
 * 
 * // Retorna '19/04/2026', ignorando o impacto do fuso -03:00 do Brasil (que transformaria em 18/04).
 * fnFormatNaiveDate('2026-04-19T00:00:00.000Z')
 */
export const fnFormatNaiveDate = (
  date: string | Date | null | undefined,
  formatStr: string = 'dd/MM/yyyy'
): string => {
  if (!date) return '';

  // Garante uma string padronizada. Se for Date object gravado já pelo sistema, pegamos seu string ISO.
  const inputStr = date instanceof Date ? date.toISOString() : String(date);

  // Extrai exatamente o que está gravado descartando qualquer fuso horário atrelado após o segundo 23 (.000)
  // ou cortando o 'Z'
  const naiveDateString = inputStr.substring(0, 19); // YYYY-MM-DDTHH:mm:ss 

  const dateObject = parseISO(naiveDateString);

  if (isNaN(dateObject.getTime())) return '';

  return format(dateObject, formatStr, { locale: ptBR });
};
