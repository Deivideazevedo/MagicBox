import {
  ResumoParametros,
  ResumoResposta,
} from "@/core/lancamentos/resumo/types";
import { useGetResumoQuery } from "@/services/endpoints/resumoApi";

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

  // Query reativa baseada no estado de filtros
  const { data: responseData, isLoading, isFetching } = 
    useGetResumoQuery(filtros);



  // Estados de modais agrupados
  const [modals, setModals] = useState({
    visualizar: null as ResumoResposta | null,
    editar: null as ResumoResposta | null,
    excluir: null as ResumoResposta | null,
  });

  // Handlers de Filtros
  const handleSearch = useCallback(
    (novosFiltros: Partial<ResumoParametros>) => {
      setFiltros((prev) => ({ ...prev, ...novosFiltros }));
    },
    [],
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
      // Futura implementação de paginação se necessário
    },
    [],
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
