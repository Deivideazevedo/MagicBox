import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { IColumnProps } from "..";
import { fnNormalizedString } from "../utils/comparison";

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

  const columnsMap = useMemo(() => {
    const map = new Map<keyof T, IColumnProps<T>>();
    columns?.forEach((col) => map.set(col.key, col));
    return map;
  }, [columns]);

  // Função para obter o valor de filtro baseado na prioridade: filterValue > render > valor da coluna
  const getFilterValue = useCallback(
    (row: T, key: keyof T): string => {
      const column = columnsMap.get(key);

      // 1. Prioridade: filterValue
      if (column?.filterValue) {
        return String(column.filterValue(row));
      }

      // 2. Prioridade: render (retorna string do render)
      if (column?.render) {
        const rendered = column.render(row);
        if (typeof rendered === "string" || typeof rendered === "number") {
          return String(rendered);
        }
      }

      // 3. Prioridade: valor da coluna
      return row[key] ? String(row[key]) : "";
    },
    [columnsMap],
  );

  // Filtrar dados com base no texto de busca (usando valor deferido)
  const filteredData = useMemo(() => {
    const trimmedFilter = deferredFilterText.trim();
    if (!trimmedFilter) return data;

    // (remove acentos, lowercase)
    const normalizedFilter = fnNormalizedString(trimmedFilter);
    
    const keysToFilter =
      columnsMap.size > 0
        ? Array.from(columnsMap.keys())
        : data.length
          ? (Object.keys(data[0]) as (keyof T)[])
          : [];

    return data.filter((item) => {
      for (const key of keysToFilter) {
        const value = getFilterValue(item, key);

        // verifica se alguma coluna contém o texto de busca (normalizado)
        if (fnNormalizedString(value).includes(normalizedFilter)) {
          return true;
        }
      }
      return false; // Nenhuma correspondência, exclui do resultado
    });
  }, [data, deferredFilterText, getFilterValue, columnsMap]);

  return {
    filterText,
    setFilterText,
    filteredData,
  };
}
