// src/core/lancamentos/resumo/service.ts
import {
  ResumoFiltros,
  ResumoTodosFiltros,
  ResumoCardFiltros,
} from "./resumo.dto";
import { resumoRepository as repositorio } from "./repository";
import { withFinanceiroCache } from "@/core/financeiro";

/**
 * Serviço de resumo focado em listagens e totais para a UI (Dashboard/Extrato).
 */
const resumoServico = {
  async listarTodos(filtros: ResumoTodosFiltros) {
    return await repositorio.listarTodos(filtros);
  },
  async obterCardResumo(filtros: ResumoCardFiltros) {
    const userId = Number(filtros.userId);
    const fnCache = withFinanceiroCache(
      async () => repositorio.obterCardResumo(filtros),
      [`resumo-card-${userId}-${filtros.dataInicio}-${filtros.dataFim}`],
      userId
    );
    return await fnCache();
  },
  async obterResumo(filtros: ResumoFiltros) {
    const userId = Number(filtros.userId);
    const fnCache = withFinanceiroCache(
      async () => repositorio.obterResumo(filtros),
      [`resumo-list-${userId}-${filtros.dataInicio}-${filtros.dataFim}`],
      userId
    );
    return await fnCache();
  },
};

export { resumoServico };


