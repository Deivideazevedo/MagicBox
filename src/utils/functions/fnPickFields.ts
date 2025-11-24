/**
 * Funções utilitárias para selecionar campos de objetos.
 * @module fnPickFields
 */

/**
 * Seleciona campos de um objeto com otimização selecionável.
 * @param obj - Objeto a ser processado
 * @param fieldsToKeep - Chaves a serem mantidas
 * @returns Novo objeto contendo apenas os campos especificados
 * @example
 * fnPickFields(user, ['id', 'name']);
 */
export function fnPickFields<
  T extends Record<string, any>,
  K extends keyof T
>(obj: T, fieldsToKeep: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;

  fieldsToKeep.forEach((field) => {
    if (field in obj) {
      result[field] = obj[field];
    }
  });

  return result;
}