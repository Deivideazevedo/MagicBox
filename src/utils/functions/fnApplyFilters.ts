/**
 * Aplica filtros dinâmicos a um array de objetos.
 * Filtra objetos que correspondem a todos os critérios especificados.
 *
 * @template T - Tipo do objeto que será filtrado
 * @param data - Array de objetos a ser filtrado
 * @param filters - Objeto com os filtros a serem aplicados (chaves opcionais)
 * @returns Novo array contendo apenas os objetos que atendem a todos os filtros
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: 'João', age: 25, active: true },
 *   { id: 2, name: 'Maria', age: 30, active: false },
 *   { id: 3, name: 'Pedro', age: 25, active: true }
 * ];
 *
 * // Filtrar por idade
 * fnApplyFilters(users, { age: 25 });
 * // Resultado: [{ id: 1, name: 'João', age: 25, active: true }, { id: 3, name: 'Pedro', age: 25, active: true }]
 *
 * // Filtrar por idade E status ativo
 * fnApplyFilters(users, { age: 25, active: true });
 * // Resultado: [{ id: 1, name: 'João', age: 25, active: true }, { id: 3, name: 'Pedro', age: 25, active: true }]
 *```
 */
export function fnApplyFilters<T extends Record<string, any>>(
  data: T[],
  filters: Partial<T>
): T[] {
  return data.filter((object) => {
    const arrayFilters = Object.entries(filters);

    const isValid = arrayFilters.every(([key, valueFilter]) => {
      // valor do campo do filtro não enviado -> ignora
      if (valueFilter === undefined) {
        return true;
      }

      const valueObject = object[key as keyof T];

      // comparação simples
      return valueObject == valueFilter;
    });

    return isValid;
  });
}
