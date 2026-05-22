import { useState, useMemo, useCallback } from "react";
import {
  RelatorioResponse,
  DetalheRelatorio,
  HistoricoMensal,
  CategoriaRelatorio,
  ResumoRelatorio,
  EvolucaoAnualResponse,
} from "@/core/relatorios/relatorio.dto";
import {
  useGetRelatorioQuery,
  useGetHistoricoAgrupadoQuery,
  useGetEvolucaoAnualQuery,
} from "@/services/endpoints/relatoriosApi";

export function useRelatorios() {
  const [datas, setDatas] = useState(() => {
    const now = new Date();
    return {
      dataInicio: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      dataFim: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
    };
  });
  // Seleção via composite key: "TIPO-ID"
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // RTK Query
  const { data, isLoading: loading, error, isFetching } = useGetRelatorioQuery({
    dataInicio: datas.dataInicio,
    dataFim: datas.dataFim,
  });

  // Switch de projeções — GLOBAL (afeta tabela, cards, gráficos)
  const [incluirProjecaoTabela, setIncluirProjecaoTabela] = useState(true);

  // Filtro por tipo (DESPESA, RECEITA, META) — global
  const [tiposFiltro, setTiposFiltro] = useState<string[]>([]);

  const toggleTipoFiltro = useCallback((tipo: string) => {
    setTiposFiltro(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  }, []);

  // ==================== ANO DE REFERÊNCIA ====================
  const anoReferencia = useMemo(() => {
    return new Date(datas.dataInicio).getUTCFullYear();
  }, [datas.dataInicio]);

  // ==================== EVOLUÇÃO ANUAL ====================
  const {
    data: evolucaoAnual,
    isLoading: isLoadingEvolucao,
    isFetching: isFetchingEvolucao,
  } = useGetEvolucaoAnualQuery({ ano: anoReferencia });

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
    if (selectedItemsDetails.length === 0) return "Nenhum selecionado";
    if (selectedItemsDetails.length <= 2) return selectedItemsDetails.map(d => d.nome).join(', ');
    return `${selectedItemsDetails.length} itens selecionados`;
  }, [selectedItemsDetails]);

  const titleHistorico = useMemo(() => {
    if (selectedItemsDetails.length === 1) return selectedItemsDetails[0].nome;
    return "Consolidado";
  }, [selectedItemsDetails]);

  // ==================== HISTÓRICO ====================
  const paramsHistorico = useMemo(() => {
    if (selectedItemsDetails.length === 0) return null;

    return {
      itens: selectedItemsDetails.map(item => `${item.tipo}-${item.id}`).join(','),
      ano: anoReferencia
    };
  }, [selectedItemsDetails, anoReferencia]);

  const {
    data: historicoAgrupado,
    isFetching: isFetchingHistorico,
    isLoading: isLoadingHistorico
  } = useGetHistoricoAgrupadoQuery(
    paramsHistorico!,
    { skip: !paramsHistorico }
  );

  // ==================== RESUMO COM/SEM PROJEÇÃO ====================
  const resumoExibido = useMemo((): ResumoRelatorio | undefined => {
    if (!data?.resumo || !data?.categorias) return data?.resumo;

    const baseResumo = data.resumo;
    const incluirProjecao = incluirProjecaoTabela;

    // Se incluirProjecao estiver marcado, soma as despesas projetadas ativas às agendadas. Caso contrário, exibe apenas as agendadas.
    const finalPendentes = (baseResumo.qtdDespesasPendentes ?? 0) + (incluirProjecao ? (baseResumo.qtdDespesasProjetadasPendentes ?? 0) : 0);
    const finalTotal = (baseResumo.qtdDespesasTotalPeriodo ?? 0) + (incluirProjecao ? (baseResumo.qtdDespesasProjetadasTotalPeriodo ?? 0) : 0);

    if (incluirProjecao) {
      return {
        ...baseResumo,
        qtdDespesasPendentes: finalPendentes,
        qtdDespesasTotalPeriodo: finalTotal,
      };
    }

    // Sem projeção: recalcular usando valorAgendado em vez de valorPlanejado
    const categorias = data.categorias;
    const totalReceitasAgendadas = categorias.reduce((acc, c) =>
      acc + c.detalhes
        .filter(i => i.tipo === 'RECEITA' && !i.isProjecao)
        .reduce((sum, i) => sum + Math.abs(i.valorAgendado), 0),
    0);
    const totalDespesasAgendadas = categorias.reduce((acc, c) =>
      acc + c.detalhes
        .filter(i => i.tipo === 'DESPESA' && !i.isProjecao)
        .reduce((sum, i) => sum + Math.abs(i.valorAgendado), 0),
    0);

    return {
      ...baseResumo,
      totalReceitas: totalReceitasAgendadas,
      totalDespesas: -totalDespesasAgendadas,
      saldoProjetado: totalReceitasAgendadas - totalDespesasAgendadas,
      qtdDespesasPendentes: finalPendentes,
      qtdDespesasTotalPeriodo: finalTotal,
    };
  }, [data, incluirProjecaoTabela]);

  const resetFilters = useCallback(() => {
    setIncluirProjecaoTabela(true);
    setTiposFiltro([]);
  }, []);

  const setPeriodo = useCallback((dataInicio: string, dataFim: string) => {
    setDatas({ dataInicio, dataFim });
  }, []);

  return {
    data,
    loading,
    isFetching,
    error,
    dataInicio: datas.dataInicio,
    dataFim: datas.dataFim,
    setPeriodo,
    selectedIds,
    toggleSelection,
    selectItemForHistory,
    historicoItem: historicoAgrupado || [],
    isLoadingHistorico,
    isFetchingHistorico,
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
    resumoExibido,
    // Nova API de Evolução
    evolucaoAnual: evolucaoAnual || [],
    isLoadingEvolucao,
    isFetchingEvolucao,
    anoReferencia,
  };
}

