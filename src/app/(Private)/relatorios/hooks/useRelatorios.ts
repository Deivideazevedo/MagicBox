import { useState, useEffect, useMemo } from "react";
import { RelatorioResponse, ResumoRelatorio, ItemRelatorio, CategoriaRelatorio } from "@/core/relatorios/relatorio.dto";

export function useRelatorios() {
  const [data, setData] = useState<RelatorioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [historicoItem, setHistoricoItem] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/relatorios?dataInicio=${dataInicio}&dataFim=${dataFim}`);
      if (!response.ok) throw new Error("Erro ao buscar dados do relatório");
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataInicio, dataFim]);

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const fetchHistorico = async (itemId: number, tipo: "RECEITA" | "DESPESA") => {
    setLoadingHistorico(true);
    try {
      const response = await fetch(`/api/relatorios?itemId=${itemId}&tipo=${tipo}`);
      if (!response.ok) throw new Error("Erro ao buscar histórico do item");
      const json = await response.json();
      setHistoricoItem(json);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingHistorico(false);
    }
  };

  // Resumo dinâmico baseado na seleção
  const resumoExibido = useMemo(() => {
    if (!data) return null;
    if (selectedIds.size === 0) return data.resumo;

    const allItems: ItemRelatorio[] = data.categorias.flatMap((c: CategoriaRelatorio) => c.itens);
    const selectedItems = allItems.filter(i => selectedIds.has(i.id));

    const resumo: ResumoRelatorio = {
      totalReceitas: selectedItems.filter(i => i.tipo === 'RECEITA').reduce((acc, i) => acc + i.valorPlanejado, 0),
      receitasPagas: selectedItems.filter(i => i.tipo === 'RECEITA').reduce((acc, i) => acc + i.valorRealizado, 0),
      totalDespesas: selectedItems.filter(i => i.tipo === 'DESPESA').reduce((acc, i) => acc + i.valorPlanejado, 0),
      despesasPagas: selectedItems.filter(i => i.tipo === 'DESPESA').reduce((acc, i) => acc + i.valorRealizado, 0),
      totalMetas: data.resumo.totalMetas, // Misto
      metasPorcentagem: data.resumo.metasPorcentagem, // Misto
      saldoLivre: 0,
      saldoProjetado: 0,
      saldoBloqueado: data.resumo.saldoBloqueado,
      dividaPendente: data.resumo.dividaPendente // Misto
    };

    resumo.saldoLivre = resumo.receitasPagas - (resumo.despesasPagas + resumo.totalMetas);
    resumo.saldoProjetado = resumo.totalReceitas - resumo.totalDespesas;

    return resumo;
  }, [data, selectedIds]);

  return {
    data,
    loading,
    error,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    selectedIds,
    toggleSelection,
    resumoExibido,
    historicoItem,
    loadingHistorico,
    fetchHistorico,
    setSelectedIds
  };
}
