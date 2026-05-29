import { prisma } from "@/lib/prisma";
import { relatoriosRepository } from "@/core/relatorios/repository";
import { divergenciasRepository } from "./repository";
import { DiagnosticoFinanceiro, ResumoAuditoria, LancamentoAtrasado, HistoricoDiscrepancia } from "./divergencia.dto";

function formatarMesAno(mesAnoStr: string): string {
  const [ano, mes] = mesAnoStr.split("-");
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const mesIndex = parseInt(mes, 10) - 1;
  return `${meses[mesIndex]} de ${ano}`;
}

export const divergenciasService = {
  /**
   * Executa a auditoria completa de anomalias e conciliação bancária
   */
  async obterCentralDivergencias(userId: number, saldoRealBancario?: number): Promise<ResumoAuditoria> {
        // 1. Totais históricos gerais
    const totaisGerais = await relatoriosRepository.obterContagensETotaisHistoricos(userId);
    const recPagasGeral = totaisGerais.totaisHistoricos.receitasPagas ?? 0;
    const despPagasGeral = totaisGerais.totaisHistoricos.despesasPagas ?? 0;
    const metasPagasGeral = totaisGerais.totaisHistoricos.metas ?? 0;

    const saldoLivreGeral = recPagasGeral - despPagasGeral - metasPagasGeral;
    const saldoBrutoLiquido = saldoLivreGeral + metasPagasGeral;
    const saldoDigital = saldoBrutoLiquido;

    // 2. Buscar lançamentos atrasados
    const vencidosRaw = await divergenciasRepository.obterLancamentosVencidosNaoPagos(userId);
    const lancamentosAtrasados: LancamentoAtrasado[] = vencidosRaw.map((v) => {
      let tipo: "RECEITA" | "DESPESA" | "META" = "DESPESA";
      let nome = "Lançamento";
      let cor = "#94a3b8";

      if (v.receita) {
        tipo = "RECEITA";
        nome = v.receita.nome;
        cor = v.receita.cor ?? "#22c55e";
      } else if (v.despesa) {
        tipo = "DESPESA";
        nome = v.despesa.nome;
        cor = v.despesa.cor ?? "#ef4444";
      } else if (v.objetivo) {
        tipo = "META";
        nome = v.objetivo.nome;
        cor = v.objetivo.cor ?? "#3b82f6";
      }

      return {
        id: v.id,
        nome,
        tipo,
        valor: Number(v.valor),
        data: v.data.toISOString(),
        categoriaCor: cor,
      };
    });

    // 3. Buscar fluxo mensal histórico
    const fluxoRaw = await divergenciasRepository.obterFluxoMensalHistorico(userId);
    const historico: HistoricoDiscrepancia[] = [];
    let saldoCalculadoAcumulado = 0;

    for (const f of fluxoRaw) {
      const rec = f.receitas ?? 0;
      const desp = f.despesas ?? 0;
      const meta = f.metas ?? 0;
      saldoCalculadoAcumulado += (rec - desp - meta);

      historico.push({
        mes: f.mes,
        receitas: rec,
        despesas: desp,
        metas: meta,
        saldoCalculado: saldoCalculadoAcumulado,
      });
    }

    // 4. Executar os diagnósticos
    const diagnosticos: DiagnosticoFinanceiro[] = [];
    let score = 100;

    // Diagnóstico A: Lançamentos Atrasados
    if (lancamentosAtrasados.length > 0) {
      const totalAtrasadosVal = lancamentosAtrasados.reduce((acc, curr) => acc + curr.valor, 0);
      const penalidadeAtrasados = Math.min(30, lancamentosAtrasados.length * 3);
      score -= penalidadeAtrasados;

      diagnosticos.push({
        id: "lanca_atrasado",
        tipo: "LANCA_ATRASADO",
        severity: lancamentosAtrasados.length > 5 ? "high" : "medium",
        titulo: `${lancamentosAtrasados.length} Lançamentos Atrasados`,
        descricao: `Você possui transações planejadas que já venceram e não foram quitadas (somando R$ ${totalAtrasadosVal.toFixed(2)}). Isso distorce seu saldo real atual.`,
        diferenca: totalAtrasadosVal,
      });
    }

    // Diagnóstico B: Deficits em meses anteriores
    const mesesComDeficit = fluxoRaw.filter(f => (f.receitas) < (f.despesas + f.metas));
    if (mesesComDeficit.length > 0) {
      const penalidadeDeficits = Math.min(30, mesesComDeficit.length * 10);
      score -= penalidadeDeficits;

      mesesComDeficit.forEach((item) => {
        const furoValor = (item.despesas + item.metas) - item.receitas;
        const nomeMesFormatado = formatarMesAno(item.mes);
        diagnosticos.push({
          id: `deficit_passado_${item.mes}`,
          tipo: "DEFICIT_PASSADO",
          severity: furoValor > 500 ? "high" : "medium",
          titulo: `Furo de Orçamento em ${nomeMesFormatado}`,
          descricao: `Detectamos que em ${nomeMesFormatado} suas despesas e metas de poupança (totalizando R$ ${(item.despesas + item.metas).toFixed(2)}) superaram suas receitas (R$ ${item.receitas.toFixed(2)}), gerando um furo de R$ ${furoValor.toFixed(2)} neste mês. Esse deficit consome o saldo livre atual.`,
          mesReferencia: item.mes,
          diferenca: furoValor,
        });
      });
    }

    // Diagnóstico C: Vazamento / Inconsistência Bancária (Se informado saldoRealBancario)
    if (saldoRealBancario !== undefined) {
      const diferenca = saldoRealBancario - saldoLivreGeral;
      if (Math.abs(diferenca) > 0.01) {
        const severity = Math.abs(diferenca) > 500 ? "high" : Math.abs(diferenca) > 100 ? "medium" : "low";
        const penalidadeDesvio = Math.abs(diferenca) > 500 ? 30 : Math.abs(diferenca) > 100 ? 15 : 5;
        score -= penalidadeDesvio;

        const direcao = diferenca < 0 ? "um vazamento de caixa" : "uma receita omitida";
        diagnosticos.push({
          id: "conciliacao_desvio",
          tipo: "CONCILIACAO_DESVIO",
          severity,
          titulo: diferenca < 0 ? "Vazamento de Caixa (Diferença Negativa)" : "Receita Omitida (Diferença Positiva)",
          descricao: `Há uma discrepância de R$ ${Math.abs(diferenca).toFixed(2)} entre o saldo livre MagicBox e sua conta real. Isso sugere ${direcao} não catalogada.`,
          diferenca,
        });
      }
    }

    // Diagnóstico D: Incoerência de Metas em relação à Receita
    if (metasPagasGeral > recPagasGeral && recPagasGeral > 0) {
      score -= 20;
      diagnosticos.push({
        id: "incoerencia_metas",
        tipo: "INCOERENCIA_METAS",
        severity: "high",
        titulo: "Incoerência no Volume de Metas",
        descricao: `Seu valor alocado em metas poupadas (${metasPagasGeral.toFixed(2)}) supera o histórico total de receitas pagas (${recPagasGeral.toFixed(2)}). Isso cria distorções no cálculo do saldo livre.`,
      });
    }

    // Clampar score entre 0 e 100
    score = Math.max(0, Math.min(100, score));

    // Buscar último lançamento de ajuste
    const ultimoAjusteRaw = await prisma.lancamento.findFirst({
      where: { userId, observacaoAutomatica: "Ajuste de Conciliação Bancária" },
      orderBy: { data: "desc" },
    });

    const ultimoAjuste = ultimoAjusteRaw ? {
      data: ultimoAjusteRaw.data.toISOString(),
      valor: Number(ultimoAjusteRaw.valor),
      tipo: ultimoAjusteRaw.tipo,
      observacao: ultimoAjusteRaw.observacao,
    } : null;

    // Buscar histórico dos últimos 10 ajustes
    const historicoAjustesRaw = await prisma.lancamento.findMany({
      where: { userId, observacaoAutomatica: "Ajuste de Conciliação Bancária" },
      orderBy: { data: "desc" },
      take: 10,
    });

    const historicoAjustes = historicoAjustesRaw.map((item) => ({
      id: item.id,
      data: item.data.toISOString(),
      valor: Number(item.valor),
      tipo: item.tipo as "RECEITA" | "DESPESA",
      observacao: item.observacao,
    }));

    return {
      scoreIntegridade: Math.round(score),
      saldoDigital,
      saldoLivreGeral,
      saldoBrutoLiquido,
      totaisDivergencias: diagnosticos.length,
      diagnosticos,
      lancamentosAtrasados,
      historico,
      ultimoAjuste,
      historicoAjustes,
    };
  },

  /**
   * Cria uma transação de despesa ou receita de ajuste automático para conciliar o saldo livre geral com o saldo real informado
   */
  async ajustarSaldoReal(userId: number, saldoRealBancario: number) {
    // 1. Obter saldos atuais
    const totaisGerais = await relatoriosRepository.obterContagensETotaisHistoricos(userId);
    const recPagasGeral = totaisGerais.totaisHistoricos.receitasPagas ?? 0;
    const despPagasGeral = totaisGerais.totaisHistoricos.despesasPagas ?? 0;
    const metasPagasGeral = totaisGerais.totaisHistoricos.metas ?? 0;

    const saldoLivreGeral = recPagasGeral - despPagasGeral - metasPagasGeral;
    const diferenca = saldoRealBancario - saldoLivreGeral;

    if (Math.abs(diferenca) < 0.01) {
      return { success: true, message: "O saldo livre já está totalmente conciliado." };
    }

    // 2. Garantir que exista uma categoria de ajuste ou usar uma existente
    let cat = await prisma.categoria.findFirst({
      where: { userId, nome: { in: ["Ajuste de Saldo", "Ajustes", "Outros"] }, deletedAt: null },
    });
    if (!cat) {
      cat = await prisma.categoria.findFirst({
        where: { userId, deletedAt: null },
      });
    }
    if (!cat) {
      cat = await prisma.categoria.create({
        data: {
          nome: "Ajuste de Saldo",
          userId,
          cor: "#e11d48",
          icone: "IconAlertTriangle",
        },
      });
    }

    // 3. Criar a Receita ou Despesa de ajuste
    let despesaAjusteId: number | null = null;
    let receitaAjusteId: number | null = null;

    if (diferenca < 0) {
      // Cria despesa de ajuste para drenar saldo livre
      let despesaAjuste = await prisma.despesa.findFirst({
        where: { userId, nome: "Ajuste de Saldo", deletedAt: null },
      });
      if (!despesaAjuste) {
        despesaAjuste = await prisma.despesa.create({
          data: {
            nome: "Ajuste de Saldo",
            userId,
            categoriaId: cat.id,
            valorEstimado: 0,
            diaVencimento: 1,
            status: "A",
          },
        });
      }
      despesaAjusteId = despesaAjuste.id;
    } else {
      // Cria receita de ajuste para inflar saldo livre
      let receitaAjuste = await prisma.receita.findFirst({
        where: { userId, nome: "Ajuste de Saldo", deletedAt: null },
      });
      if (!receitaAjuste) {
        receitaAjuste = await prisma.receita.create({
          data: {
            nome: "Ajuste de Saldo",
            userId,
            categoriaId: cat.id,
            valorEstimado: 0,
            diaRecebimento: 1,
            status: "A",
          },
        });
      }
      receitaAjusteId = receitaAjuste.id;
    }

    // 4. Inserir lançamento pago (tipo = 'pagamento')
    const novoLancamento = await prisma.lancamento.create({
      data: {
        userId,
        tipo: "pagamento",
        valor: Math.abs(diferenca),
        data: new Date(),
        observacao: `Conciliação Bancária Expressa (Saldo real informado: R$ ${saldoRealBancario})`,
        observacaoAutomatica: "Ajuste de Conciliação Bancária",
        despesaId: despesaAjusteId,
        receitaId: receitaAjusteId,
      },
    });

    return {
      success: true,
      message: `Saldo livre de R$ ${saldoLivreGeral.toFixed(2)} ajustado para R$ ${saldoRealBancario.toFixed(2)}.`,
      lancamento: novoLancamento,
    };
  },

  /**
   * Corrige um furo orçamentário em um mês específico criando uma receita de ajuste
   */
  async ajustarFuroMensal(userId: number, mes: string) {
    // 1. Obter o fluxo mensal histórico para encontrar o mês
    const fluxoRaw = await divergenciasRepository.obterFluxoMensalHistorico(userId);
    const item = fluxoRaw.find(f => f.mes === mes);
    if (!item) {
      throw new Error(`Mês ${mes} não encontrado no histórico.`);
    }

    const furoValor = (item.despesas + item.metas) - item.receitas;
    if (furoValor <= 0) {
      return { success: true, message: `O mês ${mes} não possui furo orçamentário.` };
    }

    // 2. Garantir que exista uma categoria de ajuste ou usar uma existente
    let cat = await prisma.categoria.findFirst({
      where: { userId, nome: { in: ["Ajuste de Saldo", "Ajustes", "Outros"] }, deletedAt: null },
    });
    if (!cat) {
      cat = await prisma.categoria.findFirst({
        where: { userId, deletedAt: null },
      });
    }
    if (!cat) {
      cat = await prisma.categoria.create({
        data: {
          nome: "Ajuste de Saldo",
          userId,
          cor: "#e11d48",
          icone: "IconAlertTriangle",
        },
      });
    }

    // 3. Criar a Receita de ajuste
    let receitaAjuste = await prisma.receita.findFirst({
      where: { userId, nome: "Ajuste de Saldo", deletedAt: null },
    });
    if (!receitaAjuste) {
      receitaAjuste = await prisma.receita.create({
        data: {
          nome: "Ajuste de Saldo",
          userId,
          categoriaId: cat.id,
          valorEstimado: 0,
          diaRecebimento: 1,
          status: "A",
        },
      });
    }

    // Calcular o último dia daquele mês
    const [ano, mesNum] = mes.split("-");
    const ultimoDia = new Date(parseInt(ano, 10), parseInt(mesNum, 10), 0); // Dia 0 do próximo mês é o último dia do mês atual

    // 4. Inserir lançamento pago (tipo = 'pagamento')
    const novoLancamento = await prisma.lancamento.create({
      data: {
        userId,
        tipo: "pagamento",
        valor: furoValor,
        data: ultimoDia,
        observacao: `Ajuste Orçamentário (Cobertura de Deficit do mês de ${formatarMesAno(mes)})`,
        observacaoAutomatica: "Ajuste de Conciliação Bancária",
        receitaId: receitaAjuste.id,
      },
    });

    return {
      success: true,
      message: `Furo de R$ ${furoValor.toFixed(2)} em ${formatarMesAno(mes)} coberto com sucesso!`,
      lancamento: novoLancamento,
    };
  },
};
