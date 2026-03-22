import { ExtratoParametros, ExtratoResposta } from "@/core/lancamentos/extrato/types";
import { useLazyGetExtratoQuery } from "@/services/endpoints/extratoApi";
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

export function useExtratoList() {
  const [filtros, setFiltros] = useState<ExtratoParametros>(() => {
    return {
      ...getDefaultDates(),
      page: 0,
      limit: 10,
    };
  });

  // Se extratosProps existir (não é undefined), skip a query RTK
  const [trigger, { data: responseData, isLoading, isFetching }] =
    useLazyGetExtratoQuery();

  useEffect(() => {
    trigger(filtros, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { extratosFromQuery, meta } = useMemo(() => {
    return {
      extratosFromQuery: responseData?.data || [],
      meta: responseData?.meta || { lastPage: 0, total: 0, page: 0, limit: 0 },
    };
  }, [responseData]);


  // Estados de modais agrupados
  const [modals, setModals] = useState({
    visualizar: null as ExtratoResposta | null,
    editar: null as ExtratoResposta | null,
    excluir: null as ExtratoResposta | null,
  });

  // Handlers de Filtros
  const handleSearch = useCallback(
    (novosFiltros: Partial<ExtratoParametros>) => {
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
        abrir: (lancamento: ExtratoResposta) =>
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
        page: params.page ?? filtros.page,
        limit: params.limit ?? filtros.limit,
      };
      trigger(finalFiltros, true);
      setFiltros(finalFiltros);
    },
    [trigger, filtros],
  );

  return {
    // Dados
    extrato: extratosFromQuery,
    isLoading,
    isFetching,

    // Paginação
    page: filtros.page ?? 0,
    pageSize: filtros.limit ?? 10,
    totalRows: meta.total,
    lastPage: meta.lastPage,
    onUpdatePaginationParams,

    // Filtros
    filtros,
    handleSearch,

    // Modais
    modais: modals,
    modalHandlers,

  };
}
