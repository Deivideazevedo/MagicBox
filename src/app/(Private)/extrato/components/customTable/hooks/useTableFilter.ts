import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { fnNormalizedString } from "../utils/comparison";
import { IColumnProps } from "..";

interface UseTableFilterProps<T> {
  data: T[];
  columns?: IColumnProps<T>[];
}

interface UseTableFilterReturn<T> {
  filterText: string;
  setFilterText: (text: string) => void;
  filteredData: T[];
}

/**
 * Hook para gerenciar filtro de busca em tabelas
 * Filtra baseado nas colunas configuradas usando: filterValue > render > valor direto
 * Usa useDeferredValue para otimizar a filtragem durante digitação
 */
export function useTableFilter<T extends object>({
  data,
  columns,
}: UseTableFilterProps<T>): UseTableFilterReturn<T> {
  const [filterText, setFilterText] = useState("");

  // useDeferredValue adia a atualização do valor durante renderizações urgentes
  // Mais eficiente que useDebounce com useEffect
  const deferredFilterText = useDeferredValue(filterText);

  // Função para obter o valor de filtro baseado na prioridade: filterValue > render > valor da coluna
  const getFilterValue = useCallback(
    (row: T, key: keyof T): string => {
      const column = columns?.find(col => col.key === key);

      if (!column) {
        const value = row[key];
        return String(value ?? "");
      }

      // 1. Prioridade: filterValue
      if (column.filterValue) {
        return String(column.filterValue(row));
      }

      // 2. Prioridade: render (retorna string do render)
      if (column.render) {
        const rendered = column.render(row);
        if (typeof rendered === "string" || typeof rendered === "number") {
          return String(rendered);
        }
      }

      // 3. Prioridade: valor da coluna
      const value = row[key];
      return String(value ?? "");
    },
    [columns],
  );

  // Filtrar dados com base no texto de busca (usando valor deferido)
  const filteredData = useMemo(() => {
    const trimmedFilter = deferredFilterText.trim();
    if (!trimmedFilter) return data;

    // Normaliza o texto de busca (remove acentos, lowercase)
    const normalizedFilter = fnNormalizedString(trimmedFilter);

    return data.filter((item) => {
      // Garante que keysToSearch seja SEMPRE um array de chaves de T
      // se passar colum, filtrará apenas pelas chaves configuradas, senão por todas as chaves do objeto
      const keysToSearch = (
        columns ? Object.keys(columns) : Object.keys(item)
      ) as (keyof T)[];

      return keysToSearch.some((key) => {
        const filterValue = getFilterValue(item, key);
        return fnNormalizedString(filterValue).includes(normalizedFilter);
      });
    });
  }, [data, deferredFilterText, columns, getFilterValue]);

  return {
    filterText,
    setFilterText,
    filteredData,
  };
}
