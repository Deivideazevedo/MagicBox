import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  RelatorioResponse, 
  DetalheRelatorio, 
  HistoricoMensal,
  CategoriaRelatorio 
} from "@/core/relatorios/relatorio.dto";
import { 
  useGetRelatorioQuery, 
  useGetHistoricoAgrupadoQuery 
} from "@/services/endpoints/relatoriosApi";

export function useRelatorios() {
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );
  const [limit] = useState(999); // Exibição acumulativa, sem paginação real no UI
  
  // Seleção via composite key: "TIPO-ID"
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // RTK Query
  const { data, isLoading: loading, error } = useGetRelatorioQuery({
    dataInicio,
    dataFim,
    page: 0,
    limit,
  });

  // Switch de projeções — filtro client-side
  const [incluirProjecaoTabela, setIncluirProjecaoTabela] = useState(true);

  // Filtro por tipo (DESPESA, RECEITA, META) — global
  const [tiposFiltro, setTiposFiltro] = useState<string[]>([]);

  const toggleTipoFiltro = useCallback((tipo: string) => {
    setTiposFiltro(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  }, []);

  // ==================== SELEÇÃO ====================
  const toggleSelection = useCallback((idOrIds: string | string[], forceState?: boolean) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      
      const shouldSelect = forceState !== undefined 
        ? forceState 
        : !ids.every(id => prev.has(id));

      ids.forEach(id => {
        if (shouldSelect) {
          newSelection.add(id);
        } else {
          newSelection.delete(id);
        }
      });
      return newSelection;
    });
  }, []);

  const selectItemForHistory = useCallback((id: number, tipo: "RECEITA" | "DESPESA" | "META") => {
    const key = `${tipo}-${id}`;
    setSelectedIds(new Set([key]));
  }, []);

  // ==================== METADADOS DINÂMICOS ====================
  
  // Encontra os itens selecionados no relatório para pegar os nomes, respeitando os filtros ativos
  const selectedItemsDetails = useMemo(() => {
    if (!data?.categorias) return [];
    const allDetails: DetalheRelatorio[] = data.categorias.flatMap((c: CategoriaRelatorio) => c.detalhes);
    return allDetails.filter(item => {
      const isSelected = selectedIds.has(`${item.tipo}-${item.id}`);
      const matchesType = tiposFiltro.length === 0 || tiposFiltro.includes(item.tipo);
      const matchesProjecao = incluirProjecaoTabela || !item.isProjecao;
      return isSelected && matchesType && matchesProjecao;
    });
  }, [data, selectedIds, tiposFiltro, incluirProjecaoTabela]);

  const selectedNames = useMemo(() => {
    return selectedItemsDetails.map(i => i.nome).join(", ");
  }, [selectedItemsDetails]);

  const titleHistorico = useMemo(() => {
    if (selectedIds.size === 0 || selectedItemsDetails.length === 0) return "Geral";
    if (selectedItemsDetails.length === 1) return selectedItemsDetails[0]?.nome || "Item";
    return `Múltiplos (${selectedItemsDetails.length})`;
  }, [selectedIds.size, selectedItemsDetails]);

  // ==================== HISTÓRICO ====================
  const anoReferencia = useMemo(() => new Date(dataInicio).getFullYear(), [dataInicio]);

  const paramsHistorico = useMemo(() => {
    if (selectedItemsDetails.length === 0) return null;
    
    return {
      itens: selectedItemsDetails.map(item => `${item.tipo}-${item.id}`).join(','),
      ano: anoReferencia
    };
  }, [selectedItemsDetails, anoReferencia]);

  const { data: historicoAgrupado, isFetching: loadingHistorico } = useGetHistoricoAgrupadoQuery(
    paramsHistorico!,
    { skip: !paramsHistorico }
  );

  const resetFilters = useCallback(() => {
    setIncluirProjecaoTabela(true);
    setTiposFiltro([]);
  }, []);

  return {
    data,
    loading,
    error,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    limit,
    selectedIds,
    toggleSelection,
    selectItemForHistory,
    historicoItem: historicoAgrupado || [],
    loadingHistorico,
    incluirProjecaoTabela,
    setIncluirProjecaoTabela,
    tiposFiltro,
    toggleTipoFiltro,
    resetFilters,
    tiposExistentes: useMemo(() => {
      if (!data?.categorias) return new Set<string>();
      const tipos = new Set<string>();
      data.categorias.forEach((c: CategoriaRelatorio) => {
        c.detalhes.forEach(d => tipos.add(d.tipo));
      });
      return tipos;
    }, [data]),
    selectedNames,
    titleHistorico,
    resumoExibido: data?.resumo
  };
}
