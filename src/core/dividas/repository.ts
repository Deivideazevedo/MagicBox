import { prisma } from "@/lib/prisma";
import { DividaUnica, DividaVolatil, DividaFixa, StatusDivida, SituacaoParcela, StatusSituacaoParcela } from "./types";
import { CreateDividaDTO, UpdateDividaDTO } from "./divida.dto";
import { differenceInCalendarDays, isSameMonth, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Prisma, Lancamento, Despesa, Categoria } from "@prisma/client";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { fnGetTodayISO } from "@/utils/functions/fnGetTodayISO";

type DespesaComCategoria = Despesa & {
  categoria: Categoria;
};

type DespesaComRelacoes = DespesaComCategoria & {
  lancamentos: Lancamento[];
};

type LancamentoComDespesa = Lancamento & {
  despesa: DespesaComCategoria | null;
};

export const dividasRepository = {
  async listarUnicas(userId: number): Promise<DividaUnica[]> {
    const despesas = await prisma.despesa.findMany({
      where: {
        userId,
        tipo: "DIVIDA",
        deletedAt: null,
      },
      include: {
        categoria: true,
        lancamentos: {
          orderBy: { data: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return despesas.map((d) => this.mapearDividaUnica(d as DespesaComRelacoes));
  },

  async listarVolateis(userId: number, incluirPagos: boolean = false, filtros?: { dataInicio?: string; dataFim?: string; despesaId?: number }): Promise<DividaVolatil[]> {
    const dataInicio = filtros?.dataInicio ? new Date(filtros.dataInicio) : null;
    const dataFim = filtros?.dataFim ? new Date(filtros.dataFim) : null;

    type RowAgregado = {
      despesaId: number;
      mes_referencia: Date;
      valorAgendado: number;
      valorPago: number;
      nomeDespesa: string;
      icone: string | null;
      cor: string | null;
      userId: number;
      categoriaId: number;
      categoriaNome: string | null;
    };

    const queryFiltroDespesa = filtros?.despesaId ?? null;
    const queryFiltroDataInicio = dataInicio ?? null;
    const queryFiltroDataFim = dataFim ?? null;

    // 1. Executa a Common Table Expression (CTE) agregando os totais diretamente no PostgreSQL
    const rows = await prisma.$queryRaw<RowAgregado[]>`
      WITH lancamentos_agrupados AS (
        SELECT 
          l."despesaId",
          DATE_TRUNC('month', l.data) as mes_referencia,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0)::float as valor_agendado,
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as valor_pago
        FROM lancamento l
        INNER JOIN despesa d ON l."despesaId" = d.id
        WHERE d."userId" = ${userId} 
          AND d.tipo IN ('VARIAVEL', 'FIXA') 
          AND d."deletedAt" IS NULL 
          AND d.status = 'A'
          AND (${queryFiltroDespesa}::integer IS NULL OR d.id = ${queryFiltroDespesa})
          AND (${queryFiltroDataInicio}::timestamp IS NULL OR l.data >= ${queryFiltroDataInicio}::timestamp)
          AND (${queryFiltroDataFim}::timestamp IS NULL OR l.data <= ${queryFiltroDataFim}::timestamp)
        GROUP BY l."despesaId", DATE_TRUNC('month', l.data)
      )
      SELECT 
        la."despesaId",
        la.mes_referencia,
        la.valor_agendado as "valorAgendado",
        la.valor_pago as "valorPago",
        d.nome as "nomeDespesa",
        d.icone,
        d.cor,
        d."userId",
        d."categoriaId",
        c.nome as "categoriaNome"
      FROM lancamentos_agrupados la
      JOIN despesa d ON la."despesaId" = d.id
      LEFT JOIN categorias c ON d."categoriaId" = c.id
      WHERE 
        la.valor_agendado > 0
        AND (
          ${incluirPagos} = true 
          OR la.valor_pago < (la.valor_agendado - 0.01)
        )
      ORDER BY la.mes_referencia ASC;
    `;

    const hoje = new Date();
    const volateis: DividaVolatil[] = [];

    if (rows.length === 0) {
      return volateis;
    }

    // 2. Agrupar as linhas retornadas por despesaId em memória
    const mapaDespesas = new Map<number, RowAgregado[]>();
    for (const row of rows) {
      const list = mapaDespesas.get(row.despesaId) || [];
      list.push(row);
      mapaDespesas.set(row.despesaId, list);
    }

    // 3. Buscar os lançamentos detalhados em lote apenas para as despesas voláteis retornadas
    const idsEncontrados = Array.from(mapaDespesas.keys());
    const todosLancamentos = await prisma.lancamento.findMany({
      where: { 
        despesaId: { in: idsEncontrados },
        ...(dataInicio && dataFim ? {
          data: { gte: dataInicio, lte: dataFim }
        } : {})
      },
      orderBy: { data: "asc" }
    });

    const mapaLancamentos = new Map<number, typeof todosLancamentos>();
    for (const l of todosLancamentos) {
      const list = mapaLancamentos.get(l.despesaId!) || [];
      list.push(l);
      mapaLancamentos.set(l.despesaId!, list);
    }

    // 4. Montar a estrutura da DividaVolatil[]
    for (const [despesaId, meses] of mapaDespesas.entries()) {
      const primeiraRow = meses[0];
      const lancamentosDespesa = mapaLancamentos.get(despesaId) || [];

      const situacaoParcelas: SituacaoParcela[] = [];
      let numeroSeq = 1;

      for (const m of meses) {
        const dateRefTruncated = new Date(m.mes_referencia);

        // Buscar a observação correspondente da primeira transação do mês, se houver
        const primeiroLancamentoDoMes = lancamentosDespesa.find(
          l => new Date(l.data).getUTCMonth() === dateRefTruncated.getUTCMonth() && 
               new Date(l.data).getUTCFullYear() === dateRefTruncated.getUTCFullYear()
        );

        // Restaura a data original do agendamento (ex: dia 08 em vez de dia 01)
        const dateRef = primeiroLancamentoDoMes ? new Date(primeiroLancamentoDoMes.data) : dateRefTruncated;

        const isTotalmentePaga = Math.round(m.valorPago * 100) >= Math.round(m.valorAgendado * 100);

        let status: StatusSituacaoParcela = isTotalmentePaga ? 'pago' : (m.valorPago > 0 ? 'parcial' : 'pendente');
        if (status === 'pendente' && dateRef < hoje && !isSameMonth(dateRef, hoje)) {
          status = 'atrasada';
        }

        const observacao = primeiroLancamentoDoMes?.observacao || primeiroLancamentoDoMes?.observacaoAutomatica || undefined;

        situacaoParcelas.push({
          numero: numeroSeq++,
          label: `Referência: ${format(dateRef, 'MM/yyyy', { locale: ptBR })}`,
          dataVencimento: dateRef.toISOString().split('T')[0],
          valorAgendado: m.valorAgendado,
          valorPago: m.valorPago,
          status,
          observacao
        });
      }

      if (situacaoParcelas.length === 0) continue;

      const proximo = situacaoParcelas.find(p => p.status !== 'pago');
      const valorTotalPendentes = situacaoParcelas.reduce((acc, p) => acc + p.valorAgendado, 0);
      const valorPagoPendentes = situacaoParcelas.reduce((acc, p) => acc + p.valorPago, 0);

      volateis.push({
        id: despesaId,
        despesaId,
        nome: primeiraRow.nomeDespesa,
        icone: primeiraRow.icone,
        cor: primeiraRow.cor,
        status: "A",
        tipo: "VOLATIL",
        valorTotalAgendado: valorTotalPendentes,
        valorPago: valorPagoPendentes,
        valorRestante: Math.max(0, valorTotalPendentes - valorPagoPendentes),
        quantidadeParcelas: situacaoParcelas.length,
        proximoVencimento: proximo?.dataVencimento || null,
        diasParaVencer: proximo ? differenceInCalendarDays(parseISO(fnFormatNaiveDate(proximo.dataVencimento, 'yyyy-MM-dd') + "T00:00:00"), parseISO(fnGetTodayISO() + "T00:00:00")) : null,
        atrasada: situacaoParcelas.some(p => p.status === 'atrasada'),
        categoriaNome: primeiraRow.categoriaNome || undefined,
        userId: primeiraRow.userId,
        lancamentos: lancamentosDespesa as unknown as Lancamento[],
        situacaoParcelas
      });
    }

    return volateis;
  },

  async listarFixas(userId: number): Promise<DividaFixa[]> {
    const hoje = new Date();
    const dataInicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const dataFimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

    const despesas = await prisma.despesa.findMany({
      where: {
        userId,
        tipo: "FIXA",
        status: "A",
        deletedAt: null,
        lancamentos: {
          none: {
            tipo: "agendamento",
          },
        },
      },
      include: {
        categoria: true,
        lancamentos: {
          where: {
            tipo: "pagamento",
            data: {
              gte: dataInicioMes,
              lte: dataFimMes,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return despesas.map((d) => {
      const valorEstimado = Number(d.valorEstimado || 0);
      const lancamentos = d.lancamentos || [];
      const valorPago = lancamentos.reduce((acc, l) => acc + Number(l.valor), 0);
      
      const temAjusteQuitacao = lancamentos.some(
        (l) => l.observacaoAutomatica?.includes("[QUITAÇÃO]")
      );

      const concluida = temAjusteQuitacao || (valorPago >= valorEstimado - 0.01);
      const valorRestante = concluida ? 0 : Math.max(0, valorEstimado - valorPago);

      // Próximo vencimento no mês atual
      const diaVencimento = d.diaVencimento || 1;
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
      const diaVencimentoTratado = Math.min(diaVencimento, ultimoDiaMes);
      const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimentoTratado);

      return {
        id: d.id,
        nome: d.nome,
        icone: d.icone,
        cor: d.cor,
        status: d.status as StatusDivida,
        tipo: "FIXA",
        valorEstimado,
        diaVencimento,
        valorPago,
        valorRestante,
        concluida,
        temAjusteQuitacao,
        proximoVencimento: dataVencimento.toISOString().split("T")[0],
        diasParaVencer: differenceInCalendarDays(parseISO(fnFormatNaiveDate(dataVencimento, 'yyyy-MM-dd') + "T00:00:00"), parseISO(fnGetTodayISO() + "T00:00:00")),
        categoriaNome: d.categoria?.nome,
        userId: d.userId,
      };
    });
  },

  async buscarVolatilPorDespesaId(despesaId: number, userId: number): Promise<DividaVolatil | null> {
    const mapped = await this.listarVolateis(userId, false, { despesaId });
    return mapped[0] || null;
  },

  async buscarAgendamentoPorData(despesaId: number, data: Date): Promise<Lancamento | null> {
    const start = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), 1));
    const end = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    return prisma.lancamento.findFirst({
      where: {
        despesaId,
        tipo: 'agendamento',
        data: {
          gte: start,
          lte: end
        }
      }
    });
  },



  async buscarPorId(id: number): Promise<DividaUnica | null> {
    const despesa = await prisma.despesa.findUnique({
      where: { id },
      include: {
        categoria: true,
        lancamentos: {
          orderBy: { data: "asc" },
        }
      }
    });

    if (!despesa || despesa.tipo !== "DIVIDA" || despesa.deletedAt) return null;

    return this.mapearDividaUnica(despesa as DespesaComRelacoes);
  },

  mapearDividaUnica(d: DespesaComRelacoes): DividaUnica {
    const lancamentos = d.lancamentos || [];
    const totalParcelasPlanejadas = d.totalParcelas || 0;
    const valorTotal = Number(d.valorTotal || 0);
    const valorParcelaBase = Number(d.valorEstimado || (valorTotal / totalParcelasPlanejadas) || 0);
    const dataInicio = new Date(d.dataInicio || d.createdAt);
    const hoje = new Date();
    // 1. Identificar todos os meses que possuem atividade (Planejada ou Real)
    const mesesComAtividade = new Set<string>();
    const mapaParcelasPlanejadas = new Map<string, number>();

    // Meses do cronograma planejado
    const diaVencimentoPuro = d.diaVencimento || dataInicio.getUTCDate();
    for (let i = 0; i < totalParcelasPlanejadas; i++) {
      const dVenc = new Date(Date.UTC(
        dataInicio.getUTCFullYear(),
        dataInicio.getUTCMonth() + i,
        diaVencimentoPuro
      ));
      const key = `${dVenc.getUTCMonth()}-${dVenc.getUTCFullYear()}`;
      mesesComAtividade.add(key);
      mapaParcelasPlanejadas.set(key, i + 1); // Salva o número da parcela original
    }

    // Lançamentos reais (Drawer)
    lancamentos.forEach(l => {
      const date = new Date(l.data);
      const key = `${date.getUTCMonth()}-${date.getUTCFullYear()}`;
      mesesComAtividade.add(key);
    });

    // 2. Processar cada mês para calcular Valor Agendado e Valor Pago
    const situacaoParcelas: SituacaoParcela[] = [];
    const keysOrdenadas = Array.from(mesesComAtividade).sort((a, b) => {
      const [m1, y1] = a.split('-').map(Number);
      const [m2, y2] = b.split('-').map(Number);
      return y1 !== y2 ? y1 - y2 : m1 - m2;
    });

    keysOrdenadas.forEach((key, idx) => {
      const [mes, ano] = key.split('-').map(Number);

      // Pagamentos do mês
      const valorPagoNoMes = lancamentos
        .filter(l => l.tipo === 'pagamento' && new Date(l.data).getUTCMonth() === mes && new Date(l.data).getUTCFullYear() === ano)
        .reduce((acc, l) => acc + Number(l.valor), 0);

      // Agendamentos reais do mês
      const valorAgendadoReal = lancamentos
        .filter(l => l.tipo === 'agendamento' && new Date(l.data).getUTCMonth() === mes && new Date(l.data).getUTCFullYear() === ano)
        .reduce((acc, l) => acc + Number(l.valor), 0);

      // Se o mês está no plano original e NÃO tem agendamento real (já foi pago ou deletado), 
      // usamos o base. Se tem agendamento real, usamos o real (que já é o valor atualizado).
      const numeroParcelaOriginal = mapaParcelasPlanejadas.get(key);
      const isMêsPlanejado = numeroParcelaOriginal !== undefined;
      
      // Se não é planejado (Parcela Adicional), o valor final agendado deve ser igual ao pago nela,
      // para nunca criar saldo devedor/parcial pendente artificial.
      const valorFinalAgendado = isMêsPlanejado 
        ? ((valorAgendadoReal > 0) ? valorAgendadoReal : valorParcelaBase)
        : valorPagoNoMes;

      // Se não tem agendamento nem é planejado, mas TAMBÉM não tem pagamento, ignoramos
      if (valorFinalAgendado === 0 && valorPagoNoMes === 0 && !isMêsPlanejado) return;

      let label = "";
      if (isMêsPlanejado) {
        label = `Parcela ${String(numeroParcelaOriginal).padStart(2, '0')}/${String(totalParcelasPlanejadas).padStart(2, '0')}`;
      } else {
        label = "Parcela Adicional";
      }

      // Usamos o dia que foi gravado explicitamente no banco ou o dia da data de início
      const diaVencimentoBanco = d.diaVencimento || dataInicio.getUTCDate();
      const dateRef = new Date(Date.UTC(ano, mes, diaVencimentoBanco));
      let status: StatusSituacaoParcela = 'pendente';

      if (!isMêsPlanejado && valorPagoNoMes > 0) {
        status = 'pago';
      } else if (valorFinalAgendado > 0) {
        if (valorPagoNoMes >= valorFinalAgendado - 0.01) {
          status = 'pago';
        } else if (valorPagoNoMes > 0) {
          status = 'parcial';
        } else if (dateRef < hoje && !isSameMonth(dateRef, hoje)) {
          status = 'atrasada';
        }
      } else if (valorPagoNoMes > 0) {
        // Se não havia agendamento mas foi pago (ex: pagamento avulso antes/fora do plano)
        status = 'pago';
      }

      situacaoParcelas.push({
        numero: idx + 1,
        label,
        dataVencimento: dateRef.toISOString().split('T')[0],
        valorAgendado: valorFinalAgendado,
        valorPago: valorPagoNoMes,
        status
      });
    });


    // 4. Calcular Metadados Globais (Baseado no acumulado real de agendamentos)
    const valorTotalCalculado = situacaoParcelas.reduce((acc, p) => acc + p.valorAgendado, 0);
    const valorPagoTotalGlobal = lancamentos
      .filter(l => l.tipo === 'pagamento')
      .reduce((acc, l) => acc + Number(l.valor), 0);

    const valorTotalOriginal = Number(d.valorTotal || 0);
    const valorRestante = Math.max(0, valorTotalOriginal - valorPagoTotalGlobal);
    const parcelasPagas = situacaoParcelas.filter(p => p.status === 'pago').length;
    
    // Progresso é medido sobre o planejado original para permitir progresso > 100%
    const progresso = valorTotalOriginal > 0 ? (valorPagoTotalGlobal / valorTotalOriginal) * 100 : 0;
    const proximoAgendamento = situacaoParcelas.find(p => p.status !== 'pago');

    // Parcelas restantes medem apenas as parcelas em aberto do plano original
    const parcelasRestantes = situacaoParcelas.filter(p => {
      const date = new Date(p.dataVencimento);
      const key = `${date.getUTCMonth()}-${date.getUTCFullYear()}`;
      return mapaParcelasPlanejadas.has(key) && p.status !== 'pago';
    }).length;

    const concluida = (valorRestante <= 0 && valorTotalOriginal > 0) || parcelasRestantes === 0;

    return {
      id: d.id,
      nome: d.nome,
      icone: d.icone,
      cor: d.cor,
      status: d.status as StatusDivida,
      tipo: "UNICA",
      valorTotal: valorTotalOriginal,
      totalParcelas: totalParcelasPlanejadas,
      valorParcela: valorParcelaBase,
      dataInicio: d.dataInicio || d.createdAt,
      diaVencimento: d.diaVencimento || 0,
      valorPago: valorPagoTotalGlobal,
      valorRestante,
      parcelasPagas,
      parcelasRestantes,
      progresso,
      concluida,
      proximoVencimento: proximoAgendamento?.dataVencimento || null,
      diasParaVencer: proximoAgendamento ? differenceInCalendarDays(parseISO(fnFormatNaiveDate(proximoAgendamento.dataVencimento, 'yyyy-MM-dd') + "T00:00:00"), parseISO(fnGetTodayISO() + "T00:00:00")) : null,
      lancamentos: d.lancamentos,
      situacaoParcelas,
      categoriaId: d.categoriaId,
      userId: d.userId,
      categoriaNome: d.categoria?.nome
    };
  },

  async criar(dados: CreateDividaDTO & { userId: number }): Promise<Despesa> {
    return prisma.despesa.create({
      data: {
        userId: dados.userId,
        categoriaId: dados.categoriaId,
        nome: dados.nome,
        tipo: "DIVIDA",
        valorTotal: dados.valorTotal,
        totalParcelas: dados.totalParcelas,
        valorEstimado: dados.valorEstimado,
        diaVencimento: new Date(dados.dataInicio).getUTCDate(),
        dataInicio: new Date(dados.dataInicio),
        icone: dados.icone,
        cor: dados.cor,
        status: "A",
        updatedAt: new Date()
      }
    });
  },

  async atualizar(id: number, data: UpdateDividaDTO): Promise<Despesa> {
    return prisma.despesa.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  },

  async remover(id: number): Promise<Despesa> {
    return prisma.despesa.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  },
};
