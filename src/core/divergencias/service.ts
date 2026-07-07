import { prisma } from "@/lib/prisma";
import { relatoriosRepository } from "@/core/relatorios/repository";
import { divergenciasRepository } from "./repository";
import { DiagnosticoFinanceiro, ResumoAuditoria, LancamentoAtrasado, HistoricoDiscrepancia } from "./divergencia.dto";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { TIME_ZONE } from "@/constants/globals";

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

    // Calcular início do dia de hoje no fuso horário configurado e converter para UTC para comparação consistente de atrasados
    const agoraNoFuso = utcToZonedTime(new Date(), TIME_ZONE);
    agoraNoFuso.setHours(0, 0, 0, 0); // Início do dia no fuso horário local
    const hojeUTC = zonedTimeToUtc(agoraNoFuso, TIME_ZONE); // Convertido para UTC

    // 2. Buscar lançamentos atrasados reais (agendamentos gravados)
    const vencidosRaw = await divergenciasRepository.obterLancamentosVencidosNaoPagos(userId);
    const lancamentosAtrasadosReais: LancamentoAtrasado[] = vencidosRaw.map((v) => {
      const tipo = v.origem_tipo === "OBJETIVO" ? "META" : v.origem_tipo;
      const nome = v.nome || "Lançamento";
      
      let fallbackCor = "#94a3b8";
      if (tipo === "RECEITA") fallbackCor = "#22c55e";
      else if (tipo === "DESPESA") fallbackCor = "#ef4444";
      else if (tipo === "META") fallbackCor = "#3b82f6";

      return {
        id: v.id, // String gerada pelo DB no formato "itemId-YYYY-MM"
        nome,
        tipo,
        valor: Number(v.valor),
        data: new Date(v.data).toISOString(),
        categoriaCor: v.cor || fallbackCor,
      };
    });

    // 2.2. Buscar despesas fixas recorrentes do tipo FIXA ativas e pendentes no passado
    const despesasFixas = await prisma.despesa.findMany({
      where: {
        userId,
        tipo: "FIXA",
        status: "A",
        deletedAt: null,
      },
      include: {
        categoria: true,
      },
    });

    const despesaIds = despesasFixas.map((d) => d.id);

    // Buscar lançamentos reais associados a essas despesas fixas
    const lancamentosFixos = await prisma.lancamento.findMany({
      where: {
        userId,
        despesaId: { in: despesaIds },
      },
    });

    // Mapear lançamentos em memória por despesaId e por mês/ano correspondente à data
    const mapaLancamentosFixos = new Map<string, typeof lancamentosFixos>();
    for (const l of lancamentosFixos) {
      const d = new Date(l.data);
      const key = `${l.despesaId}-${d.getUTCMonth() + 1}-${d.getUTCFullYear()}`;
      const list = mapaLancamentosFixos.get(key) || [];
      list.push(l);
      mapaLancamentosFixos.set(key, list);
    }

    const lancamentosAtrasadosVirtuais: LancamentoAtrasado[] = [];

    // Iterar para cada despesa fixa para verificar ocorrências pendentes no passado
    for (const despesa of despesasFixas) {
      const dataCriacao = new Date(despesa.createdAt);
      const anoCriacao = dataCriacao.getUTCFullYear();
      const mesCriacao = dataCriacao.getUTCMonth() + 1;

      const anoHoje = hojeUTC.getUTCFullYear();
      const mesHoje = hojeUTC.getUTCMonth() + 1;

      let anoIter = anoCriacao;
      let mesIter = mesCriacao;

      while (anoIter < anoHoje || (anoIter === anoHoje && mesIter <= mesHoje)) {
        // Data de vencimento correspondente àquele mês
        const ultimoDiaMes = new Date(anoIter, mesIter, 0).getDate();
        const diaVenc = Math.min(despesa.diaVencimento || 1, ultimoDiaMes);
        const dataVenc = new Date(Date.UTC(anoIter, mesIter - 1, diaVenc));

        // Só consideramos no passado (atrasado) se o vencimento for menor que hojeUTC
        if (dataVenc < hojeUTC) {
          const key = `${despesa.id}-${mesIter}-${anoIter}`;
          const lancsDoMes = mapaLancamentosFixos.get(key) || [];

          // Calcular se foi paga ou se há agendamento real para este mês
          const totalPago = lancsDoMes
            .filter((l) => l.tipo === "pagamento")
            .reduce((sum, l) => sum + Number(l.valor), 0);

          const temQuitacao = lancsDoMes.some(
            (l) => l.tipo === "pagamento" && l.observacaoAutomatica?.includes("[QUITAÇÃO]")
          );

          const temAgendamento = lancsDoMes.some((l) => l.tipo === "agendamento");

          const valorPrevisto = Number(despesa.valorEstimado || 0);
          if (totalPago < valorPrevisto && !temAgendamento && !temQuitacao) {
            lancamentosAtrasadosVirtuais.push({
              id: `virtual-fix-${despesa.id}-${mesIter}-${anoIter}`,
              nome: `${despesa.nome} (Ref: ${String(mesIter).padStart(2, "0")}/${anoIter})`,
              tipo: "DESPESA",
              valor: valorPrevisto - totalPago,
              data: dataVenc.toISOString(),
              categoriaCor: despesa.cor ?? despesa.categoria?.cor ?? "#ef4444",
            });
          }
        }

        // Avançar um mês
        mesIter++;
        if (mesIter > 12) {
          mesIter = 1;
          anoIter++;
        }
      }
    }

    // Unir lançamentos atrasados reais e virtuais
    const lancamentosAtrasados = [...lancamentosAtrasadosReais, ...lancamentosAtrasadosVirtuais];
    lancamentosAtrasados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

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

    // Diagnóstico B: Furo de Orçamento com base no Saldo Acumulado
    // Apenas verificamos um furo se o fluxo mensal foi negativo o suficiente
    // para fazer o SALDO ACUMULADO GLOBAL cair abaixo de zero. 
    // Usar economias passadas não é considerado um furo, garantindo precisão matemática.
    const mesesComDeficit: Array<{ mes: string, furoValor: number, despesas: number, metas: number, receitas: number }> = [];
    let saldoAcumuladoLoop = 0;

    for (const f of fluxoRaw) {
      const rec = f.receitas ?? 0;
      const desp = f.despesas ?? 0;
      const meta = f.metas ?? 0;
      const fluxoMensal = rec - desp - meta;
      
      const saldoAnterior = saldoAcumuladoLoop;
      saldoAcumuladoLoop += fluxoMensal;

      // Se o saldo acumulado caiu abaixo de zero e o fluxo do mês foi negativo
      if (saldoAcumuladoLoop < -0.01 && fluxoMensal < 0) {
        // Se antes estava positivo (ou zero), o furo real causado neste mês é apenas a parte que passou de zero.
        // Se já estava negativo, o furo inteiro é contabilizado neste mês, agravando o déficit histórico.
        const furoValor = saldoAnterior >= 0 ? Math.abs(saldoAcumuladoLoop) : Math.abs(fluxoMensal);
        
        mesesComDeficit.push({
          mes: f.mes,
          furoValor,
          despesas: desp,
          metas: meta,
          receitas: rec,
        });
      }
    }

    if (mesesComDeficit.length > 0) {
      const penalidadeDeficits = Math.min(30, mesesComDeficit.length * 10);
      score -= penalidadeDeficits;

      mesesComDeficit.forEach((item) => {
        const nomeMesFormatado = formatarMesAno(item.mes);
        diagnosticos.push({
          id: `deficit_passado_${item.mes}`,
          tipo: "DEFICIT_PASSADO",
          severity: item.furoValor > 500 ? "high" : "medium",
          titulo: `Furo de Orçamento em ${nomeMesFormatado}`,
          descricao: `Detectamos que em ${nomeMesFormatado} o seu saldo livre acumulado ficou negativo, criando um déficit de R$ ${item.furoValor.toFixed(2)}. Isso significa que as suas despesas ultrapassaram não só as receitas do mês, mas também as economias guardadas no passado.`,
          mesReferencia: item.mes,
          diferenca: item.furoValor,
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
        where: { userId, nome: "Ajuste Despesa (Auto)", deletedAt: null },
      });
      if (!despesaAjuste) {
        despesaAjuste = await prisma.despesa.create({
          data: {
            nome: "Ajuste Despesa (Auto)",
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
        where: { userId, nome: "Ajuste Receita (Auto)", deletedAt: null },
      });
      if (!receitaAjuste) {
        receitaAjuste = await prisma.receita.create({
          data: {
            nome: "Ajuste Receita (Auto)",
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
      where: { userId, nome: "Ajuste Receita (Auto)", deletedAt: null },
    });
    if (!receitaAjuste) {
      receitaAjuste = await prisma.receita.create({
        data: {
          nome: "Ajuste Receita (Auto)",
          userId,
          categoriaId: cat.id,
          valorEstimado: 0,
          diaRecebimento: 1,
          status: "A",
        },
      });
    }

    // Calcular o último dia daquele mês à meia-noite em UTC (evita cair às 03:00 e sair do filtro <= dataFim)
    const [ano, mesNum] = mes.split("-");
    const ultimoDia = new Date(Date.UTC(parseInt(ano, 10), parseInt(mesNum, 10), 0));

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
