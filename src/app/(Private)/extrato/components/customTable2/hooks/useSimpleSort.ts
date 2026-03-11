import { ReactNode, useCallback, useMemo, useState } from "react";
import { compareValues } from "../utils/comparison";

/**
 * 🎯 Hook de ordenação SIMPLES - Ordena por UMA coluna por vez
 *
 * @example
 * const columns = {
 *   nome: { sortable: true },
 *   email: { sortable: true },
 *   produtos: { sortable: true, sortValue: (row) => row.produtos.length }
 * };
 *
 * const { sortedData, requestSort, getSortIcon } = useSimpleSort(clientes, columns);
 *
 * // No onClick do header da tabela:
 * <TableCell onClick={() => requestSort('nome')}>Nome</TableCell>
 */
type IColumnProps<T> = {
  sortValue?: (row: T) => any;
  render?: (row: T) => ReactNode;
  filterValue?: (row: T) => string | number;
};

type ITableColumns<T> = Partial<Record<keyof T, IColumnProps<T>>>;

export type SortOrder = "ASC" | "DESC" | null;

export interface SortConfig<T> {
  key: keyof T;
  order: SortOrder;
}

export function useSimpleSort<T>(
  data: T[],
  columns?: ITableColumns<T>,
  initialSortConfig?: SortConfig<T>,
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    initialSortConfig || null,
  );

  // Função para obter o valor de ordenação baseado na prioridade: sortValue > render > valor da coluna
  const getSortValue = useCallback(
    (row: T, key: keyof T) => {
      // Encontra a configuração da coluna
      const column = columns?.[key];

      if (!column) {
        return row[key]; // Se não encontrar coluna, usa valor direto
      }

      // 1. Prioridade: sortValue
      if (column.sortValue) {
        return column.sortValue(row);
      }

      // 2. Prioridade: render (retorna string/number do render)
      if (column.render) {
        const rendered = column.render(row);
        // Se render retorna string ou number, usa para ordenação
        if (typeof rendered === "string" || typeof rendered === "number") {
          return rendered;
        }
      }

      // 3. Prioridade: valor da coluna
      return row[key];
    },
    [columns],
  );

  // Função de ordenação
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortConfig.order) {
      return data; // Sem ordenação
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      // Usa a função utilitária compareValues que trata:
      // - null/undefined
      // - números
      // - datas (Date objects e strings)
      // - strings (normalizado sem acentos)
      // - tipos mistos
      const comparison = compareValues(aValue, bValue);
      return sortConfig.order === "ASC" ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig, getSortValue]);

  // Função para alternar ordenação: null -> ASC -> DESC -> null
  const requestSort = (key: keyof T) => {
    setSortConfig((current) => {
      // Se já está ordenando por esta coluna
      if (current?.key === key) {
        if (current.order === "ASC") {
          return { key, order: "DESC" };
        }
        if (current.order === "DESC") {
          return null; // Remove ordenação
        }
      }
      // Nova coluna ou null -> começa com ASC
      return { key, order: "ASC" };
    });
  };

  // Função para obter o ícone atual de uma coluna
  const getSortIcon = (key: keyof T) => {
    if (sortConfig?.key !== key) {
      return null; // Não está ordenando por esta coluna
    }
    return sortConfig.order; // Retorna 'ASC' ou 'DESC'
  };

  return {
    sortedData,
    sortConfig,
    setSortConfig,
    requestSort,
    getSortIcon,
  };
}
