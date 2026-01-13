import { useCallback, useMemo, useState, useEffect } from "react";
import {
  useGetLancamentosQuery,
  useDeleteLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { Lancamento } from "@/core/lancamentos/types";
import { Despesa } from "@/core/despesas/types";
import { FonteRenda } from "@/core/fontesRenda/types";
import { SwalToast } from "@/utils/swalert";
import axios from "axios";

// Tipo para item com origem e ID único
type ItemComOrigem = (Despesa | FonteRenda) & { 
  origem: "despesa" | "renda";
  uniqueId: string; // Composto: "despesa-{id}" ou "renda-{id}"
};

export interface FiltrosLancamentos {
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: number | "" | null;
  origem?: "despesa" | "renda" | "" | null;
  item?: ItemComOrigem | null;
  tipo?: "pagamento" | "agendamento" | "" | null;
  busca?: string;
}

interface UseLancamentosListProps {
  lancamentos?: Lancamento[];
}

// Função para obter primeiro e último dia do mês atual
const getDefaultDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    dataInicio: firstDay.toISOString().split('T')[0],
    dataFim: lastDay.toISOString().split('T')[0],
  };
};

export function useLancamentosList({ lancamentos: lancamentosProps }: UseLancamentosListProps = {}) {
  const defaultDates = useMemo(() => getDefaultDates(), []);
  
  const [filtros, setFiltros] = useState<FiltrosLancamentos>({
    dataInicio: defaultDates.dataInicio,
    dataFim: defaultDates.dataFim,
    categoriaId: "",
    origem: "",
    item: null,
    tipo: "",
    busca: "",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Construir query params para filtros no backend
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(pageSize));
    
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros.categoriaId && typeof filtros.categoriaId === 'number') params.append('categoriaId', String(filtros.categoriaId));
    if (filtros.tipo && filtros.tipo !== null) params.append('tipo', filtros.tipo);
    if (filtros.busca) params.append('busca', filtros.busca);
    
    // Se item foi selecionado, extrair ID original do uniqueId e usar origem para determinar o parâmetro
    if (filtros.item && filtros.item.uniqueId) {
      // uniqueId formato: "despesa-123" ou "renda-456"
      const [origem, idStr] = filtros.item.uniqueId.split('-');
      const id = Number(idStr);
      
      if (!isNaN(id)) {
        if (origem === "despesa") {
          params.append('despesaId', String(id));
        } else if (origem === "renda") {
          params.append('fonteRendaId', String(id));
        }
      }
    }
    
    return params.toString();
  }, [filtros, page, pageSize]);

  // Se lancamentosProps existir (não é undefined), skip a query RTK
  const { data: responseData, isLoading, refetch } = useGetLancamentosQuery(queryParams, {
    skip: lancamentosProps !== undefined,
  });

  // Extrair dados e meta da resposta paginada
  const isArrayResponse = Array.isArray(responseData);
  const lancamentosFromQuery = isArrayResponse ? responseData : (responseData as any)?.data || [];
  const meta = isArrayResponse ? { total: 0, page: 0, lastPage: 0, limit: pageSize } : (responseData as any)?.meta || { total: 0, page: 0, lastPage: 0, limit: pageSize };
  const totalRows = meta.total;

  // Usa props se fornecido, senão usa resultado da query
  const lancamentos = lancamentosProps ?? lancamentosFromQuery;

  // Estados de modais agrupados
  const [modals, setModals] = useState({
    visualizar: null as Lancamento | null,
    editar: null as Lancamento | null,
    excluir: null as Lancamento | null,
  });

  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handlers de Filtros
  const filtrosHandlers = useMemo(() => ({
    aplicar: (novosFiltros: FiltrosLancamentos) => {
      setFiltros(novosFiltros);
      setPage(0);
      setSelectedIds([]);
    },
    limpar: () => {
      const defaultDates = getDefaultDates();
      setFiltros({
        dataInicio: defaultDates.dataInicio,
        dataFim: defaultDates.dataFim,
        categoriaId: "",
        origem: "",
        item: null,
        tipo: "",
        busca: "",
      });
      setPage(0);
      setSelectedIds([]);
    },
  }), []);

  // Handlers de Modais
  const modalHandlers = useMemo(() => ({
    visualizar: {
      abrir: (lancamento: Lancamento) => setModals(prev => ({ ...prev, visualizar: lancamento })),
      fechar: () => setModals(prev => ({ ...prev, visualizar: null })),
    },
    editar: {
      abrir: (lancamento: Lancamento) => setModals(prev => ({ ...prev, editar: lancamento })),
      fechar: () => setModals(prev => ({ ...prev, editar: null })),
    },
    excluir: {
      abrir: (lancamento: Lancamento) => setModals(prev => ({ ...prev, excluir: lancamento })),
      fechar: () => setModals(prev => ({ ...prev, excluir: null })),
    },
  }), []);

  // Handler de Exclusão (sempre array de IDs)
  const excluirHandlers = useMemo(() => ({
    confirmar: async () => {
      const idsParaExcluir = modals.excluir ? [modals.excluir.id] : selectedIds;
      
      if (idsParaExcluir.length === 0) return;

      setIsDeleting(true);
      try {
        await axios.delete('/api/lancamentos/bulk-delete', {
          data: { ids: idsParaExcluir }
        });
        
        SwalToast.fire({
          icon: "success",
          title: `${idsParaExcluir.length} lançamento(s) excluído(s) com sucesso`,
        });
        
        modalHandlers.excluir.fechar();
        setSelectedIds([]);
        refetch();
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
        setIsDeleting(false);
      }
    },
  }), [modals.excluir, selectedIds, modalHandlers.excluir, refetch]);

  // Handlers de Paginação
  const paginacaoHandlers = useMemo(() => ({
    mudarPagina: (newPage: number) => {
      setPage(newPage);
      setSelectedIds([]);
    },
    mudarTamanho: (newPageSize: number) => {
      setPageSize(newPageSize);
      setPage(0);
      setSelectedIds([]);
    },
  }), []);

  return {
    // Dados
    lancamentos,
    totais,
    isLoading,

    // Paginação
    page,
    pageSize,
    totalRows,
    lastPage: meta.lastPage,
    paginacao: paginacaoHandlers,

    // Filtros
    filtros,
    filtrosHandlers,

    // Modais
    modais: modals,
    modalHandlers,

    // Exclusão
    isDeleting,
    excluirHandlers,
    lancamentoParaExcluirNome: modals.excluir?.descricao || `Lançamento #${modals.excluir?.id}`,

    // Seleção
    selectedIds,
    onSelectionChange: (ids: number[]) => setSelectedIds(ids),
  };
}
