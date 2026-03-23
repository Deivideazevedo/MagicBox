import {
  ResumoParametros,
  ResumoResposta,
} from "@/core/lancamentos/resumo/types";
import { useLazyGetResumoQuery } from "@/services/endpoints/resumoApi";
import { useCallback, useEffect, useMemo, useState } from "react";

// Função para obter primeiro e último dia do mês atual
const getDefaultDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    dataInicio: firstDay.toISOString().split("T")[0],
    dataFim: lastDay.toISOString().split("T")[0],
  };
};

export function useResumo() {
  const [filtros, setFiltros] = useState<ResumoParametros>(() => {
    return {
      ...getDefaultDates(),
    };
  });

  // Se extratosProps existir (não é undefined), skip a query RTK
  const [trigger, { data: responseData, isLoading, isFetching }] =
    useLazyGetResumoQuery();

    console.log('responseData', responseData);
  useEffect(() => {
    trigger(filtros, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Estados de modais agrupados
  const [modals, setModals] = useState({
    visualizar: null as ResumoResposta | null,
    editar: null as ResumoResposta | null,
    excluir: null as ResumoResposta | null,
  });

  // Handlers de Filtros
  const handleSearch = useCallback(
    (novosFiltros: Partial<ResumoParametros>) => {
      const finalFiltros = { ...filtros, ...novosFiltros };
      trigger(finalFiltros, true);
      setFiltros(finalFiltros);
    },
    [filtros, trigger],
  );

  // Handlers de Modais
  const modalHandlers = useMemo(
    () => ({
      visualizar: {
        abrir: (lancamento: ResumoResposta) =>
          setModals((prev) => ({ ...prev, visualizar: lancamento })),
        fechar: () => setModals((prev) => ({ ...prev, visualizar: null })),
      },
    }),
    [],
  );

  const onUpdatePaginationParams = useCallback(
    (params: { page?: number; limit?: number }) => {
      const finalFiltros = {
        ...filtros,
      };
      trigger(finalFiltros, true);
      setFiltros(finalFiltros);
    },
    [trigger, filtros],
  );

  return {
    // Dados
    resumo: responseData ?? [],
    isLoading,
    isFetching,

    // Paginação
    page: 0,
    pageSize: 10,
    totalRows: 0,//meta?.total,
    lastPage: 0, //meta?.lastPage,
    onUpdatePaginationParams,

    // Filtros
    filtros,
    handleSearch,

    // Modais
    modais: modals,
    modalHandlers,
  };
}
