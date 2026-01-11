import { useCallback, useMemo, useState } from "react";
import {
  useGetLancamentosQuery,
  useDeleteLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { Lancamento } from "@/core/lancamentos/types";
import { SwalToast } from "@/utils/swalert";
import axios from "axios";

export interface FiltrosLancamentos {
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: number;
  despesaId?: number;
  fonteRendaId?: number;
  tipo?: "pagamento" | "agendamento" | "";
  busca?: string;
}

interface UseLancamentosListProps {
  lancamentos?: Lancamento[];
}

export function useLancamentosList({ lancamentos: lancamentosProps }: UseLancamentosListProps = {}) {
  const [filtros, setFiltros] = useState<FiltrosLancamentos>({});
  const [lancamentoParaVisualizar, setLancamentoParaVisualizar] = useState<Lancamento | null>(null);
  const [lancamentoParaEditar, setLancamentoParaEditar] = useState<Lancamento | null>(null);
  const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState<Lancamento | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Construir query params para filtros no backend
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(pageSize));
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros.categoriaId) params.append('categoriaId', String(filtros.categoriaId));
    if (filtros.despesaId) params.append('despesaId', String(filtros.despesaId));
    if (filtros.fonteRendaId) params.append('fonteRendaId', String(filtros.fonteRendaId));
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.busca) params.append('busca', filtros.busca);
    return params.toString();
  }, [filtros, page, pageSize]);

  // Se lancamentosProps existir (não é undefined), skip a query RTK
  const { data: responseData, isLoading, refetch } = useGetLancamentosQuery(queryParams, {
    skip: lancamentosProps !== undefined,
  });

  // Extrair dados e meta da resposta paginada
  const lancamentosFromQuery = Array.isArray(responseData) ? responseData : (responseData as { data: Lancamento[]; meta: { total: number; page: number; lastPage: number; limit: number } })?.data || [];
  const totalRows = Array.isArray(responseData) ? 0 : (responseData as { data: Lancamento[]; meta: { total: number; page: number; lastPage: number; limit: number } })?.meta?.total || 0;

  // Usa props se fornecido, senão usa resultado da query
  const lancamentos = lancamentosProps ?? lancamentosFromQuery;

  const [deleteLancamento, { isLoading: isDeleting }] = useDeleteLancamentoMutation();

  // Calcular totais com base nos dados do backend (já filtrados)
  const totais = useMemo(() => {
    const totalLancamentos = lancamentos.length;
    const valorTotal = lancamentos.reduce(
      (acc: number, l: Lancamento) => acc + Number(l.valor),
      0
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

  // Handlers
  const handleAplicarFiltros = useCallback((novosFiltros: FiltrosLancamentos) => {
    setFiltros(novosFiltros);
  }, []);

  const handleLimparFiltros = useCallback(() => {
    setFiltros({});
  }, []);

  const handleVisualizarLancamento = useCallback((lancamento: Lancamento) => {
    setLancamentoParaVisualizar(lancamento);
  }, []);

  const handleFecharVisualizacao = useCallback(() => {
    setLancamentoParaVisualizar(null);
  }, []);

  const handleEditarLancamento = useCallback((lancamento: Lancamento) => {
    setLancamentoParaEditar(lancamento);
  }, []);

  const handleFecharEdicao = useCallback(() => {
    setLancamentoParaEditar(null);
  }, []);

  const handleAbrirDialogExclusao = useCallback((lancamento: Lancamento) => {
    setLancamentoParaExcluir(lancamento);
  }, []);

  const handleFecharDialogExclusao = useCallback(() => {
    setLancamentoParaExcluir(null);
  }, []);

  const handleConfirmarExclusao = useCallback(async () => {
    if (!lancamentoParaExcluir) return;

    try {
      await deleteLancamento(String(lancamentoParaExcluir.id)).unwrap();
      SwalToast.fire({
        icon: "success",
        title: "Lançamento excluído com sucesso",
      });
      handleFecharDialogExclusao();
    } catch (error) {
      SwalToast.fire({
        icon: "error",
        title: "Erro ao excluir lançamento",
      });
    }
  }, [lancamentoParaExcluir, deleteLancamento, handleFecharDialogExclusao]);

  const handleSelectionChange = useCallback((ids: number[]) => {
    setSelectedIds(ids);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    setIsBulkDeleting(true);
    try {
      await axios.delete('/api/lancamentos/bulk-delete', {
        data: { ids: selectedIds }
      });
      
      SwalToast.fire({
        icon: "success",
        title: `${selectedIds.length} lançamento(s) excluído(s) com sucesso`,
      });
      
      setSelectedIds([]);
      refetch();
    } catch (error) {
      SwalToast.fire({
        icon: "error",
        title: "Erro ao excluir lançamentos",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  }, [selectedIds, refetch]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setSelectedIds([]); // Limpar seleção ao mudar de página
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Voltar para primeira página ao mudar o tamanho
    setSelectedIds([]); // Limpar seleção
  }, []);

  return {
    // Dados
    lancamentos,
    totais,
    isLoading,

    // Paginação
    page,
    pageSize,
    totalRows,
    handlePageChange,
    handlePageSizeChange,

    // Filtros
    filtros,
    handleAplicarFiltros,
    handleLimparFiltros,

    // Visualização
    lancamentoParaVisualizar,
    handleVisualizarLancamento,
    handleFecharVisualizacao,

    // Edição
    lancamentoParaEditar,
    handleEditarLancamento,
    handleFecharEdicao,

    // Exclusão
    lancamentoParaExcluir,
    lancamentoParaExcluirNome: lancamentoParaExcluir?.descricao || `Lançamento #${lancamentoParaExcluir?.id}`,
    handleAbrirDialogExclusao,
    handleFecharDialogExclusao,
    handleConfirmarExclusao,
    isDeleting,

    // Seleção e Bulk Delete
    selectedIds,
    handleSelectionChange,
    handleBulkDelete,
    isBulkDeleting,
  };
}
