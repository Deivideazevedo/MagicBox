/**
 * Normaliza string removendo acentos e convertendo para minúsculas
 * @param str - String para normalizar
 * @returns String normalizada
 */
export function fnNormalizedString(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Reutiliza um único collator para evitar custo de criar/comparar locale a cada chamada.
const ptBrCollator = new Intl.Collator("pt-BR", {
  sensitivity: "base",
  numeric: true,
});

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
 * 4. Strings comuns: comparação usando Intl.Collator com locale pt-BR
 *
 * @param a - Primeiro valor
 * @param b - Segundo valor
 * @returns Número: negativo se a < b, positivo se a > b, 0 se iguais
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
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  // 2. Datas (Date objects) - comparação por timestamp
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // 3. Strings que são datas - AQUI sim vale testar
  if (typeof a === "string" && typeof b === "string") {
    const aTime = Date.parse(a); // ← Só strings chegam aqui
    const bTime = Date.parse(b);

    // Se ambos são datas válidas, compara por timestamp
    if (!isNaN(aTime) && !isNaN(bTime)) {
      return aTime - bTime;
    }

    // Se não for data, continua com normalização
    return ptBrCollator.compare(a, b);
  }

  // 4. Fallback
  return ptBrCollator.compare(String(a), String(b));
}
