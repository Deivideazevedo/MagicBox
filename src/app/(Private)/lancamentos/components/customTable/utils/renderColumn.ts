import { ReactNode } from 'react';

/**
 * Propriedades de configuração de uma coluna (formato array)
 */
export type IColumnProps<T> = {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  isSortable?: boolean;
  sortValue?: (row: T) => any;
  render?: (row: T) => ReactNode;
  filterValue?: (row: T) => string | number;
};

/**
 * Pré-calcula um mapa de colunas para acesso O(1)
 */
function createColumnMap<T>(
  columns?: IColumnProps<T>[],
): Map<keyof T | string, IColumnProps<T>> {
  const map = new Map<keyof T | string, IColumnProps<T>>();
  if (columns) {
    columns.forEach((col) => map.set(col.key, col));
  }
  return map;
}

/**
 * Função utilitária para renderizar uma coluna da tabela
 *
 * @description
 * Retorna uma função que pode ser usada para renderizar qualquer coluna da tabela.
 * A lógica de renderização segue esta prioridade:
 * 1. Se a coluna tem `render` customizado, usa ele
 * 2. Se o valor é string ou number, retorna direto
 * 3. Se for array ou objeto complexo, retorna "-"
 *
 * @example
 * ```tsx
 * const renderCol = createRenderColumn(lancamento, TABLE_COLUMNS);
 *
 * <TableCell>{renderCol('nome')}</TableCell>
 * ```
 */
export function createRenderColumn<T>(row: T, columns?: IColumnProps<T>[]) {
  // 🚀 Pré-calcula map de colunas uma vez (em vez de .find() para cada célula)
  const columnMap = createColumnMap(columns);

  return (key: keyof T | string): ReactNode => {
    const column = columnMap.get(key); // ← O(1)

    const value = row[key as keyof T];

    // 1. Prioridade: render customizado
    if (column?.render) {
      return column.render(row);
    }

    // 2. Valores simples: string ou number
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    // 3. Array ou objeto complexo precisa de render customizado
    return '-';
  };
}
