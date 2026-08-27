import { prisma } from "@/lib/prisma";
import { relatoriosRepository } from "@/core/relatorios/repository";
import { divergenciasRepository } from "./repository";
import { DiagnosticoFinanceiro, ResumoAuditoria, LancamentoAtrasado, HistoricoDiscrepancia } from "./divergencia.dto";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { TIME_ZONE } from "@/constants/globals";
import { financeEngine, withFinanceiroCache } from "@/core/financeiro";

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
   * Executa a auditoria completa de anomalias e conciliação bancária (Cacheada sob demanda)
   */
  async obterCentralDivergencias(userId: number, saldoRealBancario?: number): Promise<ResumoAuditoria> {
    const fnCached = withFinanceiroCache(
      async () => this._obterCentralDivergenciasInterno(userId, saldoRealBancario),
      [`divergencias-${userId}-${saldoRealBancario || "auto"}`],
      userId
    );

    return await fnCached();
  },

  async _obterCentralDivergenciasInterno(userId: number, saldoRealBancario?: number): Promise<ResumoAuditoria> {
    // 1. Totais históricos gerais consolidados via motor financeiro
    const totaisGerais = await financeEngine.calcularTotaisHistoricosGerais(userId);
    const recPagasGeral = totaisGerais.receitasPagasGeral;
    const despPagasGeral = totaisGerais.despesasPagasGeral;
    const metasPagasGeral = totaisGerais.metasPagasGeral;

    const saldoLivreGeral = totaisGerais.saldoLivreGeral;
    const saldoBrutoLiquido = totaisGerais.saldoBrutoLiquido;
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

    // Diagnóstico D: Objetivos com Saldo Negativo (Retiradas > Aportes)
    const objetivosDoUsuario = await prisma.objetivo.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, nome: true },
    });

    if (objetivosDoUsuario.length > 0) {
      const saldosObjetivos = await prisma.lancamento.groupBy({
        by: ["objetivoId"],
        where: {
          userId,
          objetivoId: { in: objetivosDoUsuario.map((o) => o.id) },
          tipo: "pagamento",
        },
        _sum: { valor: true },
      });

      const mapaSaldoObj = new Map(saldosObjetivos.map((s) => [s.objetivoId, Number(s._sum.valor || 0)]));
      const objetivosNegativos = objetivosDoUsuario.filter((o) => (mapaSaldoObj.get(o.id) ?? 0) < -0.01);

      if (objetivosNegativos.length > 0) {
        score -= 15;
        diagnosticos.push({
          id: "objetivo_saldo_negativo",
          tipo: "OBJETIVO_NEGATIVO",
          severity: "high",
          titulo: `${objetivosNegativos.length} Objetivo(s) com Saldo Negativo`,
          descricao: `Os objetivos (${objetivosNegativos.map((o) => o.nome).join(", ")}) possuem retiradas registradas que superam os aportes acumulados. Revise os lançamentos vinculados a estes objetivos.`,
        });
      }
    }

    // Diagnóstico E: Saldo Livre Global Negativo
    if (saldoLivreGeral < -0.01) {
      score -= 25;
      diagnosticos.push({
        id: "saldo_livre_negativo",
        tipo: "SALDO_LIVRE_NEGATIVO",
        severity: "high",
        titulo: "Saldo Livre Global Negativo",
        descricao: `Seu saldo livre acumulado está negativo em R$ ${Math.abs(saldoLivreGeral).toFixed(2)}. Suas saídas e valores retidos ultrapassaram o total de entradas de caixa. Utilize o Conciliador Expresso para calibrar seu saldo real com o banco.`,
        diferenca: Math.abs(saldoLivreGeral),
      });
    }

    // Clampar score entre 0 e 100
    score = Math.max(0, Math.min(100, score));

    // Buscar último lançamento de ajuste
    const ultimoAjusteRaw = await prisma.lancamento.findFirst({
      where: {
        userId,
        OR: [
          { tipo: "ajuste" },
          { observacaoAutomatica: "Ajuste de Conciliação Bancária" },
        ],
      },
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
      where: {
        userId,
        OR: [
          { tipo: "ajuste" },
          { observacaoAutomatica: "Ajuste de Conciliação Bancária" },
        ],
      },
      orderBy: { data: "desc" },
      take: 10,
    });

    const historicoAjustes = historicoAjustesRaw.map((a) => ({
      id: a.id,
      data: a.data.toISOString(),
      valor: Number(a.valor),
      tipo: (Number(a.valor) >= 0 ? "RECEITA" : "DESPESA") as "RECEITA" | "DESPESA",
      observacao: a.observacao || a.observacaoAutomatica || "Ajuste de Conciliação",
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
   * Cria uma transação de ajuste autônomo de conciliação com sinal (+/-) para alinhar o saldo livre geral com o saldo real informado
   */
  async ajustarSaldoReal(userId: number, saldoRealBancario: number) {
    // 1. Obter saldos atuais consolidados via motor financeiro
    const totaisGerais = await financeEngine.calcularTotaisHistoricosGerais(userId);
    const saldoLivreGeral = totaisGerais.saldoLivreGeral;
    const diferenca = saldoRealBancario - saldoLivreGeral;

    if (Math.abs(diferenca) < 0.01) {
      return { success: true, message: "O saldo livre já está totalmente conciliado." };
    }

    // 2. Inserir lançamento de ajuste autônomo com sinal (+/-) sem vincular a nenhuma entidade pai
    const novoLancamento = await prisma.lancamento.create({
      data: {
        userId,
        tipo: "ajuste",
        valor: diferenca, // Positivo para entrada (crédito), negativo para saída (débito)
        data: new Date(),
        observacao: `Conciliação Bancária Expressa (Saldo real informado: R$ ${saldoRealBancario.toFixed(2)})`,
        observacaoAutomatica: "Ajuste de Conciliação Bancária",
        despesaId: null,
        receitaId: null,
        objetivoId: null,
      },
    });

    // 3. Invalidação do cache financeiro do usuário
    financeEngine.invalidarCache(userId);

    return {
      success: true,
      message: `Saldo livre de R$ ${saldoLivreGeral.toFixed(2)} ajustado para R$ ${saldoRealBancario.toFixed(2)}.`,
      lancamento: novoLancamento,
    };
  },

  /**
   * Corrige um furo orçamentário em um mês específico criando um lançamento autônomo de ajuste de entrada
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

    // Calcular o último dia daquele mês à meia-noite em UTC (evita cair às 03:00 e sair do filtro <= dataFim)
    const [ano, mesNum] = mes.split("-");
    const ultimoDia = new Date(Date.UTC(parseInt(ano, 10), parseInt(mesNum, 10), 0));

    // 2. Inserir lançamento autônomo de ajuste com sinal positivo
    const novoLancamento = await prisma.lancamento.create({
      data: {
        userId,
        tipo: "ajuste",
        valor: furoValor, // Positivo (cobertura/crédito)
        data: ultimoDia,
        observacao: `Ajuste Orçamentário (Cobertura de Deficit do mês de ${formatarMesAno(mes)})`,
        observacaoAutomatica: "Ajuste de Conciliação Bancária",
        despesaId: null,
        receitaId: null,
        objetivoId: null,
      },
    });

    // 3. Invalidação do cache financeiro do usuário
    financeEngine.invalidarCache(userId);

    return {
      success: true,
      message: `Furo de R$ ${furoValor.toFixed(2)} em ${formatarMesAno(mes)} coberto com sucesso!`,
      lancamento: novoLancamento,
    };
  },

  /**
   * Resolve um lançamento atrasado na competência original correta (quitar com valor, isentar R$ 0 ou descartar)
   */
  async resolverAtrasado(userId: number, payload: { id: string; acao: "quitar" | "isentar" | "descartar"; valor?: number }) {
    const { id, acao, valor } = payload;

    if (id.startsWith("virtual-fix-")) {
      const parts = id.split("-");
      const despesaId = Number(parts[2]);
      const mesNum = parseInt(parts[3], 10);
      const anoNum = parseInt(parts[4], 10);

      const despesa = await prisma.despesa.findFirst({
        where: { id: despesaId, userId, deletedAt: null },
      });

      if (!despesa) {
        throw new Error("Despesa fixa não encontrada.");
      }

      const ultimoDiaMes = new Date(anoNum, mesNum, 0).getDate();
      const diaVenc = Math.min(despesa.diaVencimento || 1, ultimoDiaMes);
      const dataVencimentoCompetencia = new Date(Date.UTC(anoNum, mesNum - 1, diaVenc));

      if (acao === "quitar") {
        const valorFinal = valor && valor > 0 ? valor : Number(despesa.valorEstimado || 0);
        await prisma.lancamento.create({
          data: {
            userId,
            despesaId,
            tipo: "pagamento",
            valor: valorFinal,
            data: dataVencimentoCompetencia,
            observacao: `Pagamento de atrasado - ${despesa.nome}`,
            observacaoAutomatica: `Pagamento de despesa fixa referente a ${String(mesNum).padStart(2, "0")}/${anoNum}`,
          },
        });
      } else {
        // Isenção / Quitação de competência passada sem desembolso (R$ 0,00)
        await prisma.lancamento.create({
          data: {
            userId,
            despesaId,
            tipo: "pagamento",
            valor: 0,
            data: dataVencimentoCompetencia,
            observacao: `Isenção/Quitação de competência passada - ${despesa.nome}`,
            observacaoAutomatica: `[QUITAÇÃO] Competência ${String(mesNum).padStart(2, "0")}/${anoNum} quitada sem desembolso`,
          },
        });
      }
    } else {
      // ID real composto: "itemId-YYYY-MM" ou ID numérico de agendamento
      const parts = id.split("-");
      const itemId = Number(parts[0]);
      const anoNum = parseInt(parts[1], 10);
      const mesNum = parseInt(parts[2], 10);

      if (!isNaN(itemId) && !isNaN(anoNum) && !isNaN(mesNum)) {
        const start = new Date(Date.UTC(anoNum, mesNum - 1, 1));
        const end = new Date(Date.UTC(anoNum, mesNum, 0, 23, 59, 59, 999));

        const agendamento = await prisma.lancamento.findFirst({
          where: {
            userId,
            tipo: "agendamento",
            data: { gte: start, lte: end },
            OR: [
              { despesaId: itemId },
              { receitaId: itemId },
              { objetivoId: itemId },
            ],
          },
        });

        if (agendamento) {
          if (acao === "quitar") {
            await prisma.lancamento.update({
              where: { id: agendamento.id },
              data: {
                tipo: "pagamento",
                observacaoAutomatica: agendamento.observacaoAutomatica || `Pagamento referente a ${String(mesNum).padStart(2, "0")}/${anoNum}`,
              },
            });
          } else if (acao === "isentar") {
            await prisma.lancamento.update({
              where: { id: agendamento.id },
              data: {
                tipo: "pagamento",
                valor: 0,
                observacaoAutomatica: `[QUITAÇÃO] ${agendamento.observacaoAutomatica || "Isenção sem desembolso"}`,
              },
            });
          } else {
            // Descartar agendamento físico órfão
            await prisma.lancamento.delete({
              where: { id: agendamento.id },
            });
          }
        } else {
          // Se não encontrou agendamento exato mas a despesa/receita existe, cria o pagamento na competência correta
          const despesa = await prisma.despesa.findFirst({ where: { id: itemId, userId } });
          if (despesa) {
            const ultimoDiaMes = new Date(anoNum, mesNum, 0).getDate();
            const diaVenc = Math.min(despesa.diaVencimento || 1, ultimoDiaMes);
            const dataVenc = new Date(Date.UTC(anoNum, mesNum - 1, diaVenc));

            await prisma.lancamento.create({
              data: {
                userId,
                despesaId: itemId,
                tipo: "pagamento",
                valor: acao === "quitar" ? (valor || Number(despesa.valorEstimado || 0)) : 0,
                data: dataVenc,
                observacao: `${acao === "quitar" ? "Pagamento" : "Isenção"} de pendência passada`,
                observacaoAutomatica: acao === "quitar"
                  ? `Pagamento de referência ${String(mesNum).padStart(2, "0")}/${anoNum}`
                  : `[QUITAÇÃO] Referência ${String(mesNum).padStart(2, "0")}/${anoNum} quitada sem desembolso`,
              },
            });
          }
        }
      } else {
        // ID numérico direto de lancamento
        const lancamentoId = Number(id);
        if (!isNaN(lancamentoId)) {
          if (acao === "quitar") {
            await prisma.lancamento.update({
              where: { id: lancamentoId },
              data: {
                tipo: "pagamento",
                observacaoAutomatica: "Pagamento liquidado",
              },
            });
          } else if (acao === "isentar") {
            await prisma.lancamento.update({
              where: { id: lancamentoId },
              data: {
                tipo: "pagamento",
                valor: 0,
                observacaoAutomatica: "[QUITAÇÃO] Isenção sem desembolso",
              },
            });
          } else {
            await prisma.lancamento.delete({
              where: { id: lancamentoId },
            });
          }
        }
      }
    }

    financeEngine.invalidarCache(userId);
    return {
      success: true,
      message:
        acao === "quitar"
          ? "Lançamento pago na competência correta!"
          : acao === "isentar"
          ? "Lançamento quitado com isenção (R$ 0,00) na competência correta!"
          : "Lançamento pendente descartado!",
    };
  },

  /**
   * Lista o histórico completo de lançamentos de ajuste de conciliação do usuário
   */
  async listarHistoricoAjustes(userId: number) {
    return await prisma.lancamento.findMany({
      where: {
        userId,
        tipo: "ajuste",
      },
      orderBy: [
        { data: "desc" },
        { createdAt: "desc" },
      ],
    });
  },

  /**
   * Reverte ou exclui um lançamento de ajuste de conciliação
   */
  async reverterAjuste(userId: number, ajusteId: number) {
    const ajuste = await prisma.lancamento.findFirst({
      where: {
        id: ajusteId,
        userId,
        tipo: "ajuste",
      },
    });

    if (!ajuste) {
      throw new Error("Ajuste de conciliação não encontrado.");
    }

    await prisma.lancamento.delete({
      where: { id: ajusteId },
    });

    financeEngine.invalidarCache(userId);

    return {
      success: true,
      message: "Ajuste de conciliação revertido com sucesso!",
    };
  },
};
