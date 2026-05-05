import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  RelatorioResponse, 
  DetalheRelatorio, 
  HistoricoMensal,
  CategoriaRelatorio 
} from "@/core/relatorios/relatorio.dto";
import { 
  useGetRelatorioQuery, 
  useGetHistoricoAgrupadoMutation 
} from "@/services/endpoints/relatoriosApi";

export function useRelatorios() {
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  
  // Seleção via composite key: "TIPO-ID"
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [historicoAgrupado, setHistoricoAgrupado] = useState<HistoricoMensal[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  // RTK Query
  const { data, isLoading: loading, error } = useGetRelatorioQuery({
    dataInicio,
    dataFim,
    page,
    limit,
  });

  const [triggerHistorico] = useGetHistoricoAgrupadoMutation();

  // Switch de projeções — filtro client-side
  const [incluirProjecaoTabela, setIncluirProjecaoTabela] = useState(false);

  // ==================== SELEÇÃO ====================
  const toggleSelection = useCallback((idOrIds: string | string[]) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      ids.forEach(id => {
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
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
  
  // Encontra os itens selecionados no relatório para pegar os nomes
  const selectedItemsDetails = useMemo(() => {
    if (!data?.categorias) return [];
    const allDetails: DetalheRelatorio[] = data.categorias.flatMap((c: CategoriaRelatorio) => c.detalhes);
    return allDetails.filter(item => selectedIds.has(`${item.tipo}-${item.id}`));
  }, [data, selectedIds]);

  const selectedNames = useMemo(() => {
    return selectedItemsDetails.map(i => i.nome).join(", ");
  }, [selectedItemsDetails]);

  const titleHistorico = useMemo(() => {
    if (selectedIds.size === 0) return "Geral";
    if (selectedIds.size === 1) return selectedItemsDetails[0]?.nome || "Item";
    return `Múltiplos (${selectedIds.size})`;
  }, [selectedIds, selectedItemsDetails]);

  // ==================== HISTÓRICO ====================
  useEffect(() => {
    const fetchHistorico = async () => {
      if (selectedIds.size === 0) {
        setHistoricoAgrupado([]);
        return;
      }

      setLoadingHistorico(true);
      try {
        const itens = Array.from(selectedIds).map(key => {
          const [tipo, id] = key.split("-");
          return { id: parseInt(id), tipo };
        });

        const ano = new Date(dataInicio).getFullYear();
        const response = await triggerHistorico({ itens, ano }).unwrap();
        setHistoricoAgrupado(response);
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
      } finally {
        setLoadingHistorico(false);
      }
    };

    fetchHistorico();
  }, [selectedIds, triggerHistorico, dataInicio]);

  return {
    data,
    loading,
    error,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    page,
    setPage,
    limit,
    setLimit,
    selectedIds,
    toggleSelection,
    selectItemForHistory,
    historicoItem: historicoAgrupado,
    loadingHistorico,
    incluirProjecaoTabela,
    setIncluirProjecaoTabela,
    selectedNames,
    titleHistorico,
    resumoExibido: data?.resumo
  };
}
