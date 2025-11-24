/**
 * Funções utilitárias para remover campos de objetos.
 * @module fnOmitFields
 */

/**
 * Remove campos de um objeto (otimizado para objetos pequenos).
 * @param obj - Objeto a ser processado
 * @param fieldsToRemove - Chaves a serem removidas
 * @returns Novo objeto sem os campos especificados
 */
function fnOmitFieldsSmall<
  T extends Record<string, any>,
  K extends keyof T
>(obj: T, fieldsToRemove: K[]): Omit<T, K> {
  const result = { ...obj };
  fieldsToRemove.forEach((field) => delete result[field]);
  return result;
}

/**
 * Remove campos de um objeto (otimizado para objetos grandes).
 * @param obj - Objeto a ser processado
 * @param fieldsToRemove - Chaves a serem removidas
 * @returns Novo objeto sem os campos especificados
 */
function fnOmitFieldsLarge<
  T extends Record<string, any>,
  K extends keyof T
>(obj: T, fieldsToRemove: K[]): Omit<T, K> {
  // 1. Cria um Set para lookup em O(1)
  const fieldsSet = new Set(fieldsToRemove as string[]);

  // 2. Itera sobre as chaves e constrói o novo objeto
  return Object.keys(obj).reduce((acc, key) => {
    if (!fieldsSet.has(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as any) as Omit<T, K>;
}

/**
 * Remove campos de um objeto com otimização selecionável.
 * @param obj - Objeto a ser processado
 * @param fieldsToRemove - Chaves a serem removidas
 * @param optimize - Estratégia: 'small' (padrão) ou 'large'
 * @returns Novo objeto sem os campos especificados
 * @example
 * fnOmitFields(user, ['password', 'token']);
 * fnOmitFields(largeData, ['field1', 'field2'], 'large');
 */
export const fnOmitFields = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  fieldsToRemove: K[],
  optimize: 'small' | 'large' = 'small'
): Omit<T, K> => {
  return optimize === 'small'
    ? fnOmitFieldsSmall(obj, fieldsToRemove)
    : fnOmitFieldsLarge(obj, fieldsToRemove);
};
