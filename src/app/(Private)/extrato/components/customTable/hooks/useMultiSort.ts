import { useCallback, useEffect, useMemo, useState } from 'react';
import { compareValues } from '../utils/comparison';
import { isEqual } from 'lodash';
import { IColumnProps } from '..';

/**
 * 🎯 Hook de ordenação MÚLTIPLA - Ordena por VÁRIAS colunas simultaneamente
 *
 * Funcionalidade:
 * - Clique simples: Adiciona/alterna ordenação (ASC -> DESC -> remove)
 * - Mantém múltiplas colunas ordenadas com prioridade
 * - Primeira coluna tem maior prioridade, depois segunda, etc.
 * - Suporta sincronização externa para persistência (Redux, URL params, estado do pai)
 *
 * @example
 * const columns = {
 *   nome: { sortable: true },
 *   email: { sortable: true },
 *   produtos: { sortable: true, sortValue: (row) => row.produtos.length }
 * };
 *
 * const { sortedData, requestSort, getSortIcon } = useMultiSort(clientes, columns);
 *
 * // No onClick do header da tabela:
 * <TableCell onClick={() => requestSort('nome')}>Nome</TableCell>
 */

export type SortOrder = 'ASC' | 'DESC';

export interface MultiSortConfig<T> {
  key: keyof T;
  order: SortOrder;
}

export function useMultiSort<T>(
  data: T[],
  columns: IColumnProps<T>[],
  externalSort?: MultiSortConfig<T>[],
  onExternalSort?: (sort: MultiSortConfig<T>[]) => void,
  initialSort?: MultiSortConfig<T>[], // Usado em resetSort
) {
  const [sortConfigs, setSortConfigs] = useState<MultiSortConfig<T>[]>(
    externalSort || [],
  );

  // Sincronização com ordenação externa (vinda do pai)
  useEffect(() => {
    if (externalSort && !isEqual(externalSort, sortConfigs)) {
      setSortConfigs(externalSort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSort]);

  // Função para obter o valor de ordenação baseado na prioridade: sortValue > render > valor da coluna
  const getSortValue = useCallback(
    (row: T, key: keyof T) => {
      const column = columns?.find(col => col.key === key);

      if (!column) {
        return row[key];
      }

      // 1. Prioridade: sortValue
      if (column.sortValue) {
        return column.sortValue(row);
      }

      // 2. Prioridade: render (retorna string/number do render)
      if (column.render) {
        const rendered = column.render(row);
        if (typeof rendered === 'string' || typeof rendered === 'number') {
          return rendered;
        }
      }

      // 3. Prioridade: valor da coluna
      return row[key];
    },
    [columns],
  );

  // Função de ordenação múltipla
  const sortedData = useMemo(() => {
    if (sortConfigs.length === 0) {
      return data; // Sem ordenação
    }

    const sorted = [...data].sort((a, b) => {
      // Itera por todas as configurações de ordenação em ordem de prioridade
      for (const config of sortConfigs) {
        const aValue = getSortValue(a, config.key);
        const bValue = getSortValue(b, config.key);

        const comparison = compareValues(aValue, bValue);

        // Se houver diferença, retorna baseado na ordem
        if (comparison !== 0) {
          return config.order === 'ASC' ? comparison : -comparison;
        }
        // Se forem iguais, continua para próxima configuração
      }

      return 0; // Todos os valores comparados são iguais
    });

    return sorted;
  }, [data, sortConfigs, getSortValue]);

  // Função para alternar ordenação: ASC -> DESC -> remove
  const requestSort = useCallback(
    (key: keyof T) => {
      // Calcula o novo array de configurações
      const newConfigs: MultiSortConfig<T>[] = (() => {
        const existingIndex = sortConfigs.findIndex(
          (config) => config.key === key,
        );

        // Se a coluna já está sendo ordenada
        if (existingIndex !== -1) {
          const existingConfig = sortConfigs[existingIndex];
          const updated = [...sortConfigs];

          // ASC -> DESC
          if (existingConfig.order === 'ASC') {
            updated[existingIndex] = { key, order: 'DESC' };
            return updated;
          }
          // DESC -> remove
          else if (existingConfig.order === 'DESC') {
            return sortConfigs.filter((_, index) => index !== existingIndex);
          }
        }

        // Nova coluna -> adiciona com ASC
        return [...sortConfigs, { key, order: 'ASC' }];
      })();

      // Atualiza estado local
      setSortConfigs(newConfigs);

      // Notifica o pai (mesmo padrão do DataTable)
      if (onExternalSort) {
        onExternalSort(newConfigs);
      }
    },
    [sortConfigs, onExternalSort],
  );

  // Função para obter o ícone e posição de uma coluna
  const getSortIcon = useCallback(
    (key: keyof T) => {
      const configIndex = sortConfigs.findIndex((config) => config.key === key);

      if (configIndex === -1) {
        return null; // Não está ordenando por esta coluna
      }

      return {
        order: sortConfigs[configIndex].order,
        position: configIndex + 1, // Posição na ordem de prioridade (1-based)
        total: sortConfigs.length,
      };
    },
    [sortConfigs],
  );

  // Função para resetar todas as ordenações (volta para initialSort se fornecido)
  const resetSort = useCallback(() => {
    const resetValue = initialSort ?? [];
    setSortConfigs(resetValue);
    if (onExternalSort) {
      onExternalSort(resetValue);
    }
  }, [onExternalSort, initialSort]);

  return {
    sortedData,
    sortConfigs,
    setSortConfigs,
    requestSort,
    getSortIcon,
    resetSort,
  };
}
