/**
 * Utilitários para comparação e ordenação de valores
 * Usado tanto no sistema de ordenação quanto no filtro para garantir consistência
 */

/**
 * Normaliza string removendo acentos e convertendo para minúsculas
 * @param str - String para normalizar
 * @returns String normalizada
 */
export function fnNormalizedString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Compara dois valores de forma inteligente considerando tipos
 *
 * @description
 * Esta função implementa a lógica de comparação unificada usada tanto
 * no sistema de ordenação quanto no agrupamento, garantindo consistência.
 *
 * Ordem de prioridade:
 * 1. Números: comparação numérica direta
 * 2. Datas (Date objects): comparação por timestamp
 * 3. Strings que são datas válidas: parsing + comparação por timestamp
 * 4. Strings: comparação normalizada (sem acentos, case-insensitive)
 * 5. Fallback: conversão para string + comparação normalizada
 *
 * @param a - Primeiro valor
 * @param b - Segundo valor
 * @returns Número negativo se a < b, positivo se a > b, 0 se iguais
 *
 * @example
 * ```typescript
 * // Números
 * compareValues(10, 5); // 5
 *
 * // Datas
 * compareValues(new Date('2023-01-01'), new Date('2023-01-02')); // negativo
 *
 * // Strings como datas
 * compareValues('2023-01-01', '2023-01-02'); // negativo
 *
 * // Strings com acentos
 * compareValues('João', 'jose'); // negativo (normalizado)
 *
 * // Tipos mistos
 * compareValues(null, 'text'); // positivo (null vai para o final)
 * ```
 */
export function compareValues(a: any, b: any): number {
  // Tratamento de valores nulos/undefined
  if (a == null && b == null) return 0;
  if (a == null) return 1; // null vai para o final
  if (b == null) return -1; // null vai para o final

  // 1. Números - comparação direta
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // 2. Datas (Date objects) - comparação por timestamp
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // 3. Strings que são datas válidas - parsing + comparação por timestamp
  if (
    typeof a === 'string' &&
    typeof b === 'string' &&
    !isNaN(Date.parse(a)) &&
    !isNaN(Date.parse(b))
  ) {
    return new Date(a).getTime() - new Date(b).getTime();
  }

  // 4. Strings - comparação normalizada (sem acentos, case-insensitive)
  if (typeof a === 'string' && typeof b === 'string') {
    return fnNormalizedString(a).localeCompare(fnNormalizedString(b));
  }

  // 5. Fallback - conversão para string + comparação normalizada
  return fnNormalizedString(String(a)).localeCompare(
    fnNormalizedString(String(b)),
  );
}
