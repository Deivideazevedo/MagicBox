// src/core/lancamentos/service.ts
import {
  ResumoFiltros,
  ResumoTodosFiltros,
  ResumoCardFiltros,
} from "./resumo.dto";
import { resumoRepository as repositorio } from "./repository";

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
};

export { resumoServico };
