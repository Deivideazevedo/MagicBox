type TransformedObject<T> = {
  [K in keyof T]: any;
};

type MapValuesParams<T> = {
  data: T;
  transformer?: (key: keyof T, value: T[keyof T]) => any;
  toNullify?: any[];
};

/**
 * Mapeia os valores de um objeto, permitindo transformação ou anulação de valores específicos.
 *
 * @template T Tipo do objeto de entrada.
 * @param params Objeto de configuração.
 * @param params.data O objeto a ser processado.
 * @param params.transformer Função opcional para transformar cada valor (key, value).
 * @param params.toNullify Lista de valores que devem ser convertidos para null (padrão: [undefined]).
 * @returns Um novo objeto com os valores transformados.
 *
 * @example
 * // Padrão: undefined -> null
 * fnMapValues({ data: { nome: 'Ana', idade: undefined } });
 * // -> { nome: 'Ana', idade: null }
 *
 * // Com transformer
 * fnMapValues({
 *   data: { nome: 'ana' },
 *   transformer: (key, value) => typeof value === 'string' ? value.toUpperCase() : value
 * });
 * // -> { nome: 'ANA' }
 */
export function fnMapValues<T extends Record<string, any>>({
  data,
  transformer,
  toNullify = [undefined],
}: MapValuesParams<T>): TransformedObject<T> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (transformer) return [key, transformer(key as keyof T, value)];

      return [key, toNullify.includes(value) ? null : value];
    })
  ) as TransformedObject<T>;
}
