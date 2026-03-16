import { useCallback, useMemo, useState, useEffect } from "react";
import {
  useGetLancamentosQuery,
  useDeleteLancamentoMutation,
  useLazyGetLancamentosQuery,
} from "@/services/endpoints/lancamentosApi";
import { Lancamento } from "@/core/lancamentos/types";
import { Despesa } from "@/core/despesas/types";
import { FonteRenda } from "@/core/fontesRenda/types";
import { SwalToast } from "@/utils/swalert";
import axios from "axios";
import { FindAllFilters } from "@/dtos";

interface UseLancamentosListProps {
  lancamentos?: Lancamento[];
}

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

export function useLancamentosList({
  lancamentos: lancamentosProps,
}: UseLancamentosListProps = {}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filtros, setFiltros] = useState<FindAllFilters>(() => {
    return {
      ...getDefaultDates(),
      page: 0,
      limit: 10,
    };
  });

  // Se lancamentosProps existir (não é undefined), skip a query RTK
  const [trigger, { data: responseData, isLoading }] =
    useLazyGetLancamentosQuery();

  useEffect(() => {
    trigger(filtros, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { lancamentosFromQuery, meta } = useMemo(() => {
    return {
      lancamentosFromQuery: responseData?.data || [],
      meta: responseData?.meta || { lastPage: 0, total: 0, page: 0, limit: 0 },
    };
  }, [responseData]);

  // Usa props se fornecido, senão usa resultado da query
  const lancamentos = lancamentosProps ?? lancamentosFromQuery;

  // Estados de modais agrupados
  const [modals, setModals] = useState({
    visualizar: null as Lancamento | null,
    editar: null as Lancamento | null,
    excluir: null as Lancamento | null,
  });

  // Calcular totais com base nos dados do backend (já filtrados)
  const totais = useMemo(() => {
    const totalLancamentos = lancamentos.length;
    const valorTotal = lancamentos.reduce(
      (acc: number, l: Lancamento) => acc + Number(l.valor),
      0,
    );
    const valorPagamentos = lancamentos
      .filter((l: Lancamento) => l.tipo === "pagamento")
      .reduce((acc: number, l: Lancamento) => acc + Number(l.valor), 0);
    const valorAgendamentos = lancamentos
      .filter((l: Lancamento) => l.tipo === "agendamento")
      .reduce((acc: number, l: Lancamento) => acc + Number(l.valor), 0);

    return {
      totalLancamentos,
      valorTotal,
      valorPagamentos,
      valorAgendamentos,
    };
  }, [lancamentos]);

  // Handlers de Filtros
  const handleSearch = useCallback(
    (novosFiltros: Partial<FindAllFilters>) => {
      const finalFiltros = { ...filtros, ...novosFiltros };
      trigger(finalFiltros, true);
      setFiltros(finalFiltros);
      setSelectedIds([]);
    },
    [filtros, trigger],
  );

  // Handlers de Modais
  const modalHandlers = useMemo(
    () => ({
      visualizar: {
        abrir: (lancamento: Lancamento) =>
          setModals((prev) => ({ ...prev, visualizar: lancamento })),
        fechar: () => setModals((prev) => ({ ...prev, visualizar: null })),
      },
      editar: {
        abrir: (lancamento: Lancamento) =>
          setModals((prev) => ({ ...prev, editar: lancamento })),
        fechar: () => setModals((prev) => ({ ...prev, editar: null })),
      },
      excluir: {
        abrir: (lancamento: Lancamento) =>
          setModals((prev) => ({ ...prev, excluir: lancamento })),
        fechar: () => setModals((prev) => ({ ...prev, excluir: null })),
      },
    }),
    [],
  );

  // Handler de Exclusão (sempre array de IDs)
  const excluirHandlers = useMemo(
    () => ({
      confirmar: async () => {
        const idsParaExcluir = modals.excluir
          ? [modals.excluir.id]
          : selectedIds;

        if (idsParaExcluir.length === 0) return;

        setIsDeleting(true);
        try {
          await axios.delete("/api/lancamentos/bulk-delete", {
            data: { ids: idsParaExcluir },
          });

          SwalToast.fire({
            icon: "success",
            title: `${idsParaExcluir.length} lançamento(s) excluído(s) com sucesso`,
          });

          modalHandlers.excluir.fechar();
          setSelectedIds([]);
        } catch (error) {
          SwalToast.fire({
            icon: "error",
            title: "Erro ao excluir lançamento(s)",
          });
        } finally {
          setIsDeleting(false);
        }
      },
      bulk: async () => {
        if (selectedIds.length === 0) return;

        setIsDeleting(true);
        try {
          await axios.delete("/api/lancamentos/bulk-delete", {
            data: { ids: selectedIds },
          });

          SwalToast.fire({
            icon: "success",
            title: `${selectedIds.length} lançamento(s) excluído(s) com sucesso`,
          });

          setSelectedIds([]);
        } catch {
        } finally {
          setIsDeleting(false);
        }
      },
    }),
    [modals.excluir, selectedIds, modalHandlers.excluir],
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

      setSelectedIds([]);
    },
    [trigger, filtros],
  );

  return {
    // Dados
    lancamentos,
    totais,
    isLoading,

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

    // Exclusão
    isDeleting,
    excluirHandlers,
    lancamentoParaExcluirNome:
      modals.excluir?.observacao || `Lançamento #${modals.excluir?.id}`,

    // Seleção
    selectedIds,
    onSelectionChange: (ids: number[]) => setSelectedIds(ids),
  };
}
