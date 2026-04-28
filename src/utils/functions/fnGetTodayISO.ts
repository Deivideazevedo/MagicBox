/**
 * Retorna a data de hoje formatada como YYYY-MM-DD no horário local.
 * Utiliza a localidade 'sv-SE' (Suécia) que segue o padrão ISO 8601,
 * evitando discrepâncias comuns ao usar .toISOString() (que usa UTC).
 * 
 * @returns string no formato 'YYYY-MM-DD'
 */
export const fnGetTodayISO = (): string => {
  return new Date().toLocaleDateString("sv-SE");
};
