import { relatoriosRepository } from "@/core/relatorios/repository";
import {
  RelatorioResponse, CategoriaRelatorio, DetalheRelatorio, HistoricoMensal,
  RawDadosBrutosCategoria, RawTotaisMetas, RawHistoricoAgrupado, RawMetasProgresso
} from "@/core/relatorios/relatorio.dto";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";

export const relatoriosService = {
  async gerarRelatorio(userId: number, dataInicio: Date, dataFim: Date): Promise<RelatorioResponse> {
    const [dadosBrutos, totalMetas, metasComProgresso] = await Promise.all([
      relatoriosRepository.obterDadosBrutosPorCategoria(userId, dataInicio, dataFim) as Promise<RawDadosBrutosCategoria[]>,
      relatoriosRepository.obterTotaisMetas(userId, dataInicio, dataFim) as Promise<RawTotaisMetas[]>,
      relatoriosRepository.obterMetasComProgresso(userId) as Promise<RawMetasProgresso[]>
    ]);

    const categoriasMap = new Map<number, CategoriaRelatorio>();

    dadosBrutos.forEach((db) => {
      if (!categoriasMap.has(db.categoriaId)) {
        categoriasMap.set(db.categoriaId, {
          id: db.categoriaId,
          nome: db.categoriaNome,
          icone: db.categoriaIcone,
          cor: db.categoriaCor,
          valorPlanejado: 0,
          valorRealizado: 0,
          restante: 0,
          detalhes: []
        });
      }

      const categoria = categoriasMap.get(db.categoriaId)!;

      let planejado = db.valorAgendado > 0 ? db.valorAgendado : (db.origemTipo === 'FIXA' ? db.valorPlanejado : 0);
      let realizado = db.valorRealizado;
      let mediaMensal = db.mediaMensal;

      // Se for despesa, tanto o previsto quanto o realizado devem ser negativos (débitos)
      if (db.itemTipo === 'DESPESA') {
        if (planejado > 0) planejado = -planejado;
        if (realizado > 0) realizado = -realizado;
        if (mediaMensal > 0) mediaMensal = -mediaMensal;
      }

      // Diferença = Realizado - Planejado (impacto no saldo)
      const restante = realizado - planejado;

      const detalhe: DetalheRelatorio = {
        id: db.itemId,
        nome: db.itemName,
        tipo: db.itemTipo,
        valorPlanejado: planejado,
        valorRealizado: realizado,
        restante,
        mediaMensal,
        isProjecao: db.origemTipo === 'FIXA' && db.valorAgendado === 0 && db.valorRealizado === 0 && db.valorPlanejado > 0,
        status: Math.abs(realizado) >= Math.abs(planejado) && Math.abs(planejado) > 0 ? "OK" : (Math.abs(realizado) > 0 ? "PARCIAL" : "PENDENTE"),
      };

      categoria.detalhes.push(detalhe);
      categoria.valorPlanejado += planejado;
      categoria.valorRealizado += realizado;
      categoria.restante += restante;
    });

    // Metas
    const metasDetalhes: DetalheRelatorio[] = metasComProgresso.map((m) => {
      const planejado = m.planejado > 0 ? -m.planejado : m.planejado;
      const realizado = m.realizado > 0 ? -m.realizado : m.realizado;
      const restante = realizado - planejado;
      
      return {
        id: m.id,
        nome: m.nome,
        tipo: 'META' as const,
        valorPlanejado: planejado,
        valorRealizado: realizado,
        restante,
        mediaMensal: 0,
        isProjecao: false,
        status: Math.abs(realizado) >= Math.abs(planejado) && Math.abs(planejado) > 0 ? "OK" : "PENDENTE",
      };
    });

    if (metasDetalhes.length > 0) {
      categoriasMap.set(-1, {
        id: -1,
        nome: "Metas e Investimentos",
        icone: "Target",
        cor: "#1976d2",
        valorPlanejado: metasDetalhes.reduce((acc, i) => acc + i.valorPlanejado, 0),
        valorRealizado: metasDetalhes.reduce((acc, i) => acc + i.valorRealizado, 0),
        restante: metasDetalhes.reduce((acc, i) => acc + i.restante, 0),
        detalhes: metasDetalhes
      });
    }

    const categorias = Array.from(categoriasMap.values());

    // Resumo
    const totalReceitasPagas = categorias.reduce((acc, c) => acc + c.detalhes.filter(i => i.tipo === 'RECEITA').reduce((sum, i) => sum + i.valorRealizado, 0), 0);
    const totalDespesasPagas = categorias.reduce((acc, c) => acc + c.detalhes.filter(i => i.tipo === 'DESPESA').reduce((sum, i) => sum + i.valorRealizado, 0), 0);
    const totalMetasPagas = totalMetas?.[0]?.valorAlcancadoMeta || 0;

    const totalReceitasPlanejadas = categorias.reduce((acc, c) => acc + c.detalhes.filter(i => i.tipo === 'RECEITA').reduce((sum, i) => sum + i.valorPlanejado, 0), 0);
    const totalDespesasPlanejadas = categorias.reduce((acc, c) => acc + c.detalhes.filter(i => i.tipo === 'DESPESA').reduce((sum, i) => sum + i.valorPlanejado, 0), 0);

    let dividaPendente = 0;
    dadosBrutos.forEach(db => {
      if (db.itemTipo === 'DESPESA' && db.valorAgendado > 0 && db.valorRealizado === 0) {
        dividaPendente++;
      }
    });

    let somaRealizadoMetas = 0;
    let somaPlanejadoMetas = 0;
    metasDetalhes.forEach(m => {
      if (Math.abs(m.valorPlanejado) > 0) {
        somaRealizadoMetas += Math.abs(m.valorRealizado);
        somaPlanejadoMetas += Math.abs(m.valorPlanejado);
      }
    });
    const metasPorcentagem = somaPlanejadoMetas > 0 ? (somaRealizadoMetas / somaPlanejadoMetas) * 100 : 0;

    const resumo = {
      totalReceitas: totalReceitasPlanejadas,
      receitasPagas: totalReceitasPagas,
      totalDespesas: totalDespesasPlanejadas,
      despesasPagas: totalDespesasPagas,
      totalMetas: totalMetasPagas,
      metasPorcentagem: metasPorcentagem > 100 ? 100 : metasPorcentagem,
      saldoLivre: totalReceitasPagas + totalDespesasPagas - totalMetasPagas,
      saldoProjetado: totalReceitasPlanejadas + totalDespesasPlanejadas,
      saldoBloqueado: somaRealizadoMetas,
      dividaPendente
    };

    const evolucao = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(dataInicio, 5 - i);
      return {
        mes: format(d, "MMM", { locale: ptBR }),
        receitas: resumo.totalReceitas * (0.8 + Math.random() * 0.4),
        despesas: resumo.totalDespesas * (0.8 + Math.random() * 0.4),
        investimentos: resumo.totalMetas * (0.8 + Math.random() * 0.4)
      };
    });

    return {
      periodo: { dataInicio: dataInicio.toISOString().split('T')[0], dataFim: dataFim.toISOString().split('T')[0] },
      resumo,
      categorias,
      totalCategorias: categorias.length,
      evolucao
    };
  },

  async obterHistoricoAgrupado(userId: number, itens: { id: number; tipo: string }[], ano: number): Promise<HistoricoMensal[]> {
    const historicoRaw = await relatoriosRepository.obterHistoricoAgrupado(userId, itens, ano) as RawHistoricoAgrupado[];

    return historicoRaw.map((h) => ({
      mes: fnFormatNaiveDate(h.mes, "MMM").toUpperCase(),
      referencia: `${fnFormatNaiveDate(h.mes, "MMM").toUpperCase()} ${h.ano}`,
      ano: h.ano,
      totalPago: h.totalPago,
      realAgendado: h.realAgendado,
      totalProjetado: h.totalProjetado,
      totalPrevisto: h.totalPrevisto,
      totalPrevistoComProjecao: h.totalPrevistoComProjecao,
      restanteReal: h.restanteReal,
      restanteComProjecao: h.restanteComProjecao,
      dataRef: format(h.mes, 'yyyy-MM-dd')
    }));
  },
};
