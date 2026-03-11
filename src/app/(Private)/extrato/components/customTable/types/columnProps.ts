import { ReactNode } from 'react';

/**
 * Propriedades de configuração de uma coluna
 */
export type IColumnProps<T> = {
  sortValue?: (row: T) => any;
  render?: (row: T) => ReactNode;
  filterValue?: (row: T) => string | number;
};

/**
 * Tipo para configuração de colunas baseado nas keys do tipo T
 * Permite definir configurações opcionais para cada propriedade do objeto
 */
export type ITableColumns<T> = Partial<Record<keyof T, IColumnProps<T>>>;
