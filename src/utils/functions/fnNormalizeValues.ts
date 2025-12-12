type TransformedObject<T> = {
  [K in keyof T]: any;
};

type NormalizeValuesParams<T> = {
  data: T;
  transformer?: (key: keyof T, value: T[keyof T]) => any;
  toNullify?: any[];
};

/**
 * Normaliza os valores de um objeto, aplicando transformações ou convertendo valores específicos para null.
 *
 * Útil para sanitizar dados antes de envio para APIs ou persistência, garantindo que
 * valores indefinidos ou indesejados sejam padronizados (ex: undefined -> null).
 *
 * @template T Tipo do objeto de entrada.
 * @param params Objeto de configuração.
 * @param params.data O objeto a ser processado.
 * @param params.transformer Função opcional para transformar cada valor (key, value).
 * @param params.toNullify Lista de valores que devem ser convertidos para null (padrão: [undefined]).
 * @returns Um novo objeto com os valores normalizados.
 *
 * @example
 * // Padrão: undefined -> null
 * fnNormalizeValues({ data: { nome: 'Ana', idade: undefined } });
 * // -> { nome: 'Ana', idade: null }
 *
 * // Com transformer
 * fnNormalizeValues({
 *   data: { nome: 'ana' },
 *   transformer: (key, value) => typeof value === 'string' ? value.toUpperCase() : value
 * });
 * // -> { nome: 'ANA' }
 */
export function fnNormalizeValues<T extends Record<string, any>>({
  data,
  transformer,
  toNullify = [undefined],
}: NormalizeValuesParams<T>): TransformedObject<T> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (transformer) return [key, transformer(key as keyof T, value)];

      return [key, toNullify.includes(value) ? null : value];
    })
  ) as TransformedObject<T>;
}
