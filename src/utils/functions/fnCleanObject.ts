/**
 * Limpa um objeto removendo chaves ou valores específicos.
 *
 * Por padrão, remove chaves cujo valor seja `undefined`.
 * Permite configurar quais valores ou chaves devem ser removidos,
 * ou utilizar uma função de limpeza personalizada.
 *
 * @template T Tipo do objeto.
 * @param params Objeto de configuração.
 * @param params.dataForm Objeto de origem.
 * @param params.valuesToRemove Lista de valores a serem removidos (padrão: [undefined]).
 * @param params.keysToRemove Lista de chaves a serem removidas explicitamente.
 * @param params.customClean Função opcional para validação personalizada. Se fornecida, assume o controle total da filtragem.
 * @returns Novo objeto limpo.
 */

type CleanObjectParams<T> = {
  dataForm: T;
  valuesToRemove?: any[];
  keysToRemove?: (keyof T)[];
  customClean?: (key: keyof T, value: T[keyof T]) => boolean;
};
export function fnCleanObject<T extends Record<string, any>>({
  dataForm,
  valuesToRemove = [undefined],
  keysToRemove = [],
  customClean,
}: CleanObjectParams<T>): T {
  const keysToRemoveSet = new Set(keysToRemove); // <-- Set para chaves a remover
  const valuesToRemoveSet = new Set(valuesToRemove);

  return Object.fromEntries(
    Object.entries(dataForm).filter(([key, value]) => {
      // Se existir, usar o removedor customizado
      if (customClean) return customClean(key as keyof T, value as T[keyof T]);

      // Se a chave está na lista de remoção, remove imediatamente
      if (keysToRemoveSet.has(key as keyof T)) return false;

      // Se o valor está na lista de remoção, remove imediatamente
      if (valuesToRemoveSet.has(value)) return false;

      // Se passou por todas as verificações de remoção, mantém o item.
      return true;
    })
  ) as T;
}
