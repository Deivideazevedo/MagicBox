// src/core/financeiro/cache.ts
import { unstable_cache, revalidateTag } from "next/cache";

/**
 * Retorna a tag padrão de invalidação financeira para um usuário
 */
export function getFinanceiroUserTag(userId: number): string {
  return `financeiro-${userId}`;
}

/**
 * Invalida todo o cache financeiro e relatórios de um usuário sob demanda
 */
export function revalidateFinanceiroCache(userId: number): void {
  try {
    const tag = getFinanceiroUserTag(userId);
    revalidateTag(tag);
  } catch (error) {
    // Ignora em contextos fora do runtime Next.js (ex: CLI / testes)
    console.warn(`[FinanceCache] revalidateTag ignorado fora do runtime web:`, error);
  }
}

/**
 * Envelopa uma função com unstable_cache do Next.js, mantendo fallback
 * seguro para execução direta em testes unitários e scripts CLI (onde incrementalCache não existe).
 */
export function withFinanceiroCache<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyParts: string[],
  userId: number
): (...args: Args) => Promise<T> {
  const cachedFn = unstable_cache(fn, keyParts, {
    revalidate: false,
    tags: [getFinanceiroUserTag(userId)],
  });

  return async (...args: Args): Promise<T> => {
    try {
      return await cachedFn(...args);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("incrementalCache")) {
        // Ambiente de teste/CLI fora do Next.js App Server
        return await fn(...args);
      }
      throw error;
    }
  };
}

