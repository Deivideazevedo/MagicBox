// src/core/lancamentos/service.ts
import {
  ResumoFiltros,
  ResumoTodosFiltros,
  ResumoCardFiltros,
} from "./resumo.dto";
import { ResumoMiniCardsProps, ResumoResposta, TotaisHistoricos } from "./types";
import { resumoRepository as repositorio } from "./repository";
import { metasRepository } from "@/core/metas/repository";
import { dividasRepository } from "@/core/despesas/dividasRepository";
import { DiagnosticoFinanceiro } from "@/core/chat/types";

/**
 * Gera a observação automática para lançamentos parcelados
 * Formato: "descrição informada (nº da parcela / nº total de parcela) - R$ valor (dia/mês)"
 */

const resumoServico = {
  async listarTodos(filtros: ResumoTodosFiltros) {
    // Sempre usa listarTodos com paginação
    return await repositorio.listarTodos(filtros);
  },
  async obterCardResumo(filtros: ResumoCardFiltros) {
    // Sempre usa listarTodos com paginação
    return await repositorio.obterCardResumo(filtros);
  },
  async obterResumo(filtros: ResumoFiltros) {
    // Sempre usa listarTodos com paginação
    return await repositorio.obterResumo(filtros);
  },

  /**
   * Orquestra dados de múltiplos pilares (Receita, Despesa, Metas, Dívidas)
   * para fornecer um diagnóstico completo para o Chat ou Dashboard.
   */
  async obterDiagnosticoCompleto(userId: number, filtros?: ResumoCardFiltros): Promise<DiagnosticoFinanceiro> {
    const [historico, resumoMetas, resumoDividas, dadosPeriodo] = await Promise.all([
      repositorio.obterTotaisHistoricos(userId),
      metasRepository.obterResumoMetas(userId),
      dividasRepository.obterResumoDividas(userId, filtros),
      filtros ? repositorio.obterCardResumo(filtros) : null
    ]);

    // Cálculo de Saldos com base no contexto (Período vs Absoluto)
    const saldoBruto = filtros && dadosPeriodo 
      ? dadosPeriodo.totalSaldo 
      : (historico.receitas - historico.despesas + historico.metas);

    const saldoBloqueado = filtros && dadosPeriodo
      ? dadosPeriodo.saldoBloqueado
      : historico.metas;

    return {
      periodo: filtros ? { inicio: filtros.dataInicio, fim: filtros.dataFim } : undefined,
      contexto: filtros ? "MENSAL_PROJETADO" : "ABSOLUTO_HISTORICO",
      pilarReceitas: {
        totalHistorico: historico.receitas,
        pagoNoPeriodo: dadosPeriodo ? Number(dadosPeriodo.entradasPagas) : 0,
        previstoNoPeriodo: dadosPeriodo ? Number(dadosPeriodo.entradasAgendadas) : 0,
        totalProjetadoNoPeriodo: dadosPeriodo ? Number(dadosPeriodo.totalEntradas) : 0,
        mediaMensalHistorica: historico.receitas / 12,
      },
      pilarDespesas: {
        totalHistorico: historico.despesas,
        pagoNoPeriodo: dadosPeriodo ? Number(dadosPeriodo.saidasPagas) : 0,
        previstoNoPeriodo: dadosPeriodo ? Number(dadosPeriodo.saidasAgendadas) : 0,
        totalProjetadoNoPeriodo: dadosPeriodo ? Number(dadosPeriodo.totalSaidas) : 0,
        totalDevedorDividas: resumoDividas.saldoDevedorTotal,
        detalheDividas: resumoDividas.listagem.map(d => ({
          id: d.id,
          nome: d.nome,
          valorTotal: Number(d.valorTotal) || 0,
          valorPago: Number(d.valorPago) || 0,
          saldoDevedor: Number(d.valorRestante) || 0,
          status: d.isPaga ? 'QUITADA' : 'ATIVA',
        }))
      },
      pilarMetas: {
        totalAcumulado: resumoMetas.totalAcumulado || 0,
        totalObjetivadoAtivas: resumoMetas.totalObjetivado || 0,
        totalFaltanteAtivas: resumoMetas.totalFaltante || 0,
        totalAtivas: resumoMetas.totalAtivas || 0,
        totalConcluidas: resumoMetas.metasConcluidas || 0,
        metas: resumoMetas.metas.map(m => ({
          id: m.id,
          nome: m.nome,
          valorAcumulado: m.valorAcumulado ?? 0,
          valorMeta: m.valorMeta,
          progresso: m.progresso ?? null,
          concluida: m.concluida ?? false,
          icone: m.icone || null,
          cor: m.cor || null,
          dataAlvo: m.dataAlvo || null,
        }))
      },
      saldos: {
        saldoBruto,
        saldoBloqueado,
        saldoLivre: saldoBruto - saldoBloqueado
      }
    };
  }
}
;

export { resumoServico };
