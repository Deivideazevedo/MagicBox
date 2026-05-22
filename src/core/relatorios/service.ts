import { relatoriosRepository } from "@/core/relatorios/repository";
import {
  RelatorioResponse,
  CategoriaRelatorio,
  DetalheRelatorio,
  HistoricoMensal,
  RawDadosBrutosCategoria,
  RawTotaisMetas,
  RawHistoricoAgrupado,
  RawMetasProgresso,
  EvolucaoMensalItem,
  EvolucaoAnualResponse,
} from "@/core/relatorios/relatorio.dto";
import { format, differenceInCalendarMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";

// Função auxiliar para contar meses distintos entre duas datas
const contarMesesNoPeriodo = (inicio: Date, fim: Date) => {
  if (!inicio || !fim || inicio > fim) return 0;
  // Neutraliza o fuso convertendo para string ISO e removendo o 'Z'
  const toNaive = (d: Date) => parseISO(d.toISOString().substring(0, 19));
  return differenceInCalendarMonths(toNaive(fim), toNaive(inicio)) + 1;
};

export const relatoriosService = {
  async gerarRelatorio(
    userId: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<RelatorioResponse> {
    const [dadosBrutos, dadosMetasCompletos, contagensETotais] =
      await Promise.all([
        relatoriosRepository.obterDadosBrutosPorCategoria(
          userId,
          dataInicio,
          dataFim,
        ) as Promise<RawDadosBrutosCategoria[]>,
        relatoriosRepository.obterDadosCompletosMetas(
          userId,
          dataInicio,
          dataFim,
        ),
        relatoriosRepository.obterContagensETotaisHistoricos(userId),
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
          detalhes: [],
        });
      }

      const categoria = categoriasMap.get(db.categoriaId)!;

      // Cálculo de meses ativos dentro do período (desde a criação do item até o fim do período)
      const dataInicioEfetiva =
        db.itemCreatedAt > dataInicio ? db.itemCreatedAt : dataInicio;
      const mesesAtivos = contarMesesNoPeriodo(dataInicioEfetiva, dataFim);

      // Se for FIXA, o planejado é o valor mensal acumulado pelos meses ativos no período
      // Caso contrário, usa o valor agendado (ou o valor planejado unitário se for agendamento)
      let planejado =
        db.origemTipo === "FIXA"
          ? db.valorPlanejado * mesesAtivos
          : db.valorAgendado > 0
            ? db.valorAgendado
            : 0;

      // Se houver agendamentos manuais que superam a projeção fixa, priorizamos o agendamento
      if (db.origemTipo === "FIXA" && db.valorAgendado > Math.abs(planejado)) {
        planejado = db.valorAgendado;
      }

      let realizado = db.valorRealizado;
      let mediaMensal = db.mediaMensal;

      // Se for despesa, tanto o previsto quanto o realizado devem ser negativos (débitos)
      if (db.itemTipo === "DESPESA") {
        planejado = -Math.abs(planejado);
        realizado = -Math.abs(realizado);
        mediaMensal = -Math.abs(mediaMensal);
      } else {
        planejado = Math.abs(planejado);
        realizado = Math.abs(realizado);
        mediaMensal = Math.abs(mediaMensal);
      }

      // Diferença = Realizado - Planejado (impacto no saldo)
      const restante = realizado - planejado;
      const agendadoSinalizado =
        db.itemTipo === "DESPESA"
          ? -Math.abs(db.valorAgendado)
          : Math.abs(db.valorAgendado);

      const detalhe: DetalheRelatorio = {
        id: db.itemId,
        nome: db.itemName,
        tipo: db.itemTipo,
        valorPlanejado: planejado,
        valorRealizado: realizado,
        valorAgendado: agendadoSinalizado,
        restante,
        mediaMensal,
        isProjecao:
          db.origemTipo === "FIXA" &&
          db.valorAgendado === 0 &&
          db.valorRealizado === 0 &&
          db.valorPlanejado > 0,
        status:
          Math.abs(realizado) >= Math.abs(planejado)
            ? "OK"
            : Math.abs(realizado) > 0
              ? "PARCIAL"
              : "PENDENTE",
        diaVencimento: db.diaVencimento,
      };

      categoria.detalhes.push(detalhe);
      categoria.valorPlanejado += planejado;
      categoria.valorRealizado += realizado;
      categoria.restante += restante;
    });

    // Metas
    const metasDetalhes: DetalheRelatorio[] = dadosMetasCompletos.detalhes.map(
      (m: RawMetasProgresso) => {
        const planejado = -Math.abs(m.planejado);
        const realizado = -Math.abs(m.realizado);
        // Para metas (tratadas como dívida), se planejado -100 e realizado -20, restante = -80 (Red)
        const restante = planejado - realizado;

        return {
          id: m.id,
          nome: m.nome,
          tipo: "META" as const,
          valorPlanejado: planejado,
          valorRealizado: realizado,
          valorAgendado: realizado, // Metas usam o realizado como base para visão não projetada
          restante,
          mediaMensal: -Math.abs(m.mediaMensal),
          isProjecao: false,
          status: m.status || "A",
        };
      },
    );

    if (metasDetalhes.length > 0) {
      categoriasMap.set(-1, {
        id: -1,
        nome: "Metas e Investimentos",
        icone: "Target",
        cor: "#1976d2",
        valorPlanejado: metasDetalhes.reduce(
          (acc, i) => acc + i.valorPlanejado,
          0,
        ),
        valorRealizado: metasDetalhes.reduce(
          (acc, i) => acc + i.valorRealizado,
          0,
        ),
        restante: metasDetalhes.reduce((acc, i) => acc + i.restante, 0),
        detalhes: metasDetalhes,
      });
    }

    const categorias = Array.from(categoriasMap.values());

    // Resumo
    const totalReceitasPagas = categorias.reduce(
      (acc, c) =>
        acc +
        c.detalhes
          .filter((i) => i.tipo === "RECEITA")
          .reduce((sum, i) => sum + i.valorRealizado, 0),
      0,
    );
    const totalDespesasPagas = categorias.reduce(
      (acc, c) =>
        acc +
        c.detalhes
          .filter((i) => i.tipo === "DESPESA")
          .reduce((sum, i) => sum + i.valorRealizado, 0),
      0,
    );
    const totalMetasPagas = dadosMetasCompletos.totais?.valorAlcancadoMeta || 0;

    const totalReceitasPlanejadas = categorias.reduce(
      (acc, c) =>
        acc +
        c.detalhes
          .filter((i) => i.tipo === "RECEITA")
          .reduce((sum, i) => sum + i.valorPlanejado, 0),
      0,
    );
    const totalDespesasPlanejadas = categorias.reduce(
      (acc, c) =>
        acc +
        c.detalhes
          .filter((i) => i.tipo === "DESPESA")
          .reduce((sum, i) => sum + i.valorPlanejado, 0),
      0,
    );

    let dividaPendente = 0;
    dadosBrutos.forEach((db) => {
      if (
        db.itemTipo === "DESPESA" &&
        db.valorAgendado > 0 &&
        db.valorRealizado === 0
      ) {
        dividaPendente++;
      }
    });

    let somaRealizadoMetas = 0;
    let somaPlanejadoMetas = 0;
    let somaRealizadoTotalMetas = 0;

    metasDetalhes.forEach((m) => {
      somaRealizadoTotalMetas += Math.abs(m.valorRealizado);
      if (Math.abs(m.valorPlanejado) > 0) {
        somaRealizadoMetas += Math.abs(m.valorRealizado);
        somaPlanejadoMetas += Math.abs(m.valorPlanejado);
      }
    });

    const somaRealizadoMetasSemAlvo =
      somaRealizadoTotalMetas - somaRealizadoMetas;
    const metasPorcentagem =
      somaPlanejadoMetas > 0
        ? (somaRealizadoMetas / somaPlanejadoMetas) * 100
        : 0;

    const qtdMetasTotal = metasDetalhes.length;
    const qtdMetasConcluidas = metasDetalhes.filter(
      (m) => m.status === "I",
    ).length;
    const qtdMetasEmAndamento = metasDetalhes.filter(
      (m) => m.status === "A",
    ).length;

    const totaisGerais = contagensETotais.totaisHistoricos;
    const recPagasGeral = totaisGerais.receitasPagas;
    const despPagasGeral = totaisGerais.despesasPagas;
    const metasPagasGeral = totaisGerais.metas;

    const saldoLivreGeral = recPagasGeral - despPagasGeral - metasPagasGeral;
    const saldoBrutoLiquido = saldoLivreGeral + metasPagasGeral;

    const receitasPagasPeriodo = totalReceitasPagas;
    const metasPagasPeriodo = totalMetasPagas;
    const saldoLivrePeriodo =
      totalReceitasPagas + totalDespesasPagas - totalMetasPagas;

    const taxaEconomiaPeriodo =
      receitasPagasPeriodo > 0
        ? Math.max(
            0,
            ((saldoLivrePeriodo + metasPagasPeriodo) / receitasPagasPeriodo) *
              100,
          )
        : 0;

    let qtdDespesasPendentes = 0;
    let qtdDespesasTotalPeriodo = 0;
    let qtdDespesasProjetadasPendentes = 0;
    let qtdDespesasProjetadasTotalPeriodo = 0;

    categorias.forEach((c) => {
      c.detalhes.forEach((d) => {
        if (d.tipo === "DESPESA") {
          if (Math.abs(d.valorPlanejado) === 0 && Math.abs(d.valorRealizado) === 0) {
            return;
          }
          if (d.isProjecao) {
            qtdDespesasProjetadasTotalPeriodo++;
            if (d.status === "PENDENTE" || d.status === "PARCIAL") {
              qtdDespesasProjetadasPendentes++;
            }
          } else {
            qtdDespesasTotalPeriodo++;
            if (d.status === "PENDENTE" || d.status === "PARCIAL") {
              qtdDespesasPendentes++;
            }
          }
        }
      });
    });

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
      dividaPendente,
      saldoLivreGeral,
      saldoBrutoLiquido,
      taxaEconomiaPeriodo,
      totalAcumuladoMetas: somaRealizadoTotalMetas,
      totalPlanejadoMetas: somaPlanejadoMetas,
      totalAcumuladoMetasComAlvo: somaRealizadoMetas,
      totalAcumuladoMetasSemAlvo: somaRealizadoMetasSemAlvo,
      qtdMetasAtivas: qtdMetasEmAndamento, // Metas Ativas referem-se àquelas em andamento
      qtdMetasTotal,
      qtdMetasConcluidas,
      qtdMetasEmAndamento,
      qtdReceitasAtivas: contagensETotais.receitasAtivas,
      qtdReceitasInativas: contagensETotais.receitasInativas,
      qtdReceitasTotal: contagensETotais.receitasTotal,
      qtdDespesasAtivas: contagensETotais.despesasAtivas,
      qtdDespesasInativas: contagensETotais.despesasInativas,
      qtdDespesasTotal: contagensETotais.despesasTotal,
      qtdDespesasPendentes,
      qtdDespesasTotalPeriodo,
      qtdDespesasProjetadasPendentes,
      qtdDespesasProjetadasTotalPeriodo,
    };

    return {
      periodo: {
        dataInicio: dataInicio.toISOString().split("T")[0],
        dataFim: dataFim.toISOString().split("T")[0],
      },
      resumo,
      categorias,
      totalCategorias: categorias.length,
    };
  },

  async obterHistoricoAgrupado(
    userId: number,
    itens: { id: number; tipo: string }[],
    ano: number,
  ): Promise<HistoricoMensal[]> {
    const historicoRaw = (await relatoriosRepository.obterHistoricoAgrupado(
      userId,
      itens,
      ano,
    )) as RawHistoricoAgrupado[];

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
      dataRef: format(h.mes, "yyyy-MM-dd"),
    }));
  },

  async obterEvolucaoAnual(
    userId: number,
    ano: number,
  ): Promise<EvolucaoAnualResponse> {
    const dados = await relatoriosRepository.obterEvolucaoAnual(userId, ano);

    return dados.map((item) => {
      const date = parseISO(item.dataReferencia);
      return {
        ...item,
        mes: format(date, "MMM", { locale: ptBR }),
        receitas: Math.abs(item.receitas),
        despesas: Math.abs(item.despesas),
        metas: Math.abs(item.metas),
        receitasPrevistas: Math.abs(item.receitasPrevistas),
        despesasPrevistas: Math.abs(item.despesasPrevistas),
      };
    });
  },
};
