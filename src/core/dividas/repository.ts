import { prisma } from "@/lib/prisma";
import { DividaUnica, DividaVolatil, StatusDivida, SituacaoParcela, StatusSituacaoParcela } from "./types";
import { CreateDividaDTO, UpdateDividaDTO } from "./divida.dto";
import { differenceInCalendarDays, isSameMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Prisma, Lancamento, Despesa, Categoria } from "@prisma/client";

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

  async listarVolateis(userId: number, incluirPagos: boolean = false, filtros?: { dataInicio: string; dataFim: string }): Promise<DividaVolatil[]> {
    const dataInicio = filtros ? new Date(filtros.dataInicio) : null;
    const dataFim = filtros ? new Date(filtros.dataFim) : null;

    type LancamentoOtimizado = {
      id: number;
      tipo: string;
      valor: Prisma.Decimal;
      data: Date;
      observacao: string | null;
      observacaoAutomatica: string | null;
    };

    const despesasBase = await prisma.despesa.findMany({
      where: {
        userId,
        tipo: "VARIAVEL",
        deletedAt: null,
        status: "A",
        ...(filtros ? {
          lancamentos: {
            some: {
              data: { gte: dataInicio!, lte: dataFim! }
            }
          }
        } : {})
      },
      select: {
        id: true,
        nome: true,
        icone: true,
        cor: true,
        userId: true,
        categoria: {
          select: { nome: true }
        },
        lancamentos: {
          where: filtros ? {
            data: { gte: dataInicio!, lte: dataFim! }
          } : {},
          select: {
            id: true,
            tipo: true,
            valor: true,
            data: true,
            observacao: true,
            observacaoAutomatica: true
          },
          orderBy: { data: "asc" }
        }
      }
    });

    const hoje = new Date();
    const volateis: DividaVolatil[] = [];

    for (const d of despesasBase) {
      const lancamentos = d.lancamentos as LancamentoOtimizado[];

      // Agrupamento cronológico em passada única (Preserva ordem ASC do banco)
      const mesesAgrupados = new Map<string, {
        dataReferencia: Date;
        valorAgendado: number;
        valorPago: number;
        observacao?: string;
      }>();

      for (const l of lancamentos) {
        const date = new Date(l.data);
        const key = `${date.getUTCMonth()}-${date.getUTCFullYear()}`;

        const grupo = mesesAgrupados.get(key) || {
          dataReferencia: l.data,
          valorAgendado: 0,
          valorPago: 0,
          observacao: l.observacao || l.observacaoAutomatica || undefined
        };

        if (l.tipo === 'agendamento') {
          grupo.valorAgendado += Number(l.valor);
        } else if (l.tipo === 'pagamento') {
          grupo.valorPago += Number(l.valor);
        }

        mesesAgrupados.set(key, grupo);
      }

      const situacaoParcelas: SituacaoParcela[] = [];
      let numeroSeq = 1;

      // Iteramos o Map que já está em ordem cronológica de inserção (devido ao orderBy ASC do prisma)
      mesesAgrupados.forEach((grupo, key) => {
        const { dataReferencia, valorAgendado, valorPago, observacao } = grupo;

        // REGRA: Se foi TOTALMENTE paga e não solicitamos incluir pagos, IGNORA
        const isTotalmentePaga = Math.round(valorPago * 100) >= Math.round(valorAgendado * 100);
        if (!incluirPagos && isTotalmentePaga) return;

        let status: StatusSituacaoParcela = isTotalmentePaga ? 'pago' : (valorPago > 0 ? 'parcial' : 'pendente');
        if (status === 'pendente' && new Date(dataReferencia) < hoje && !isSameMonth(new Date(dataReferencia), hoje)) {
          status = 'atrasada';
        }

        situacaoParcelas.push({
          numero: numeroSeq++,
          label: `Referência: ${format(new Date(dataReferencia), 'MM/yyyy', { locale: ptBR })}`,
          dataVencimento: new Date(dataReferencia).toISOString().split('T')[0],
          valorAgendado,
          valorPago,
          status,
          observacao
        });
      });

      if (situacaoParcelas.length === 0) continue;

      const proximo = situacaoParcelas.find(p => p.status !== 'pago');
      const valorTotalPendentes = situacaoParcelas.reduce((acc, p) => acc + p.valorAgendado, 0);
      const valorPagoPendentes = situacaoParcelas.reduce((acc, p) => acc + p.valorPago, 0);

      volateis.push({
        id: `vol-${d.id}`,
        despesaId: d.id,
        nome: d.nome,
        icone: d.icone,
        cor: d.cor,
        status: "A",
        tipo: "VOLATIL",
        valorTotalAgendado: valorTotalPendentes,
        valorPago: valorPagoPendentes,
        valorRestante: Math.max(0, valorTotalPendentes - valorPagoPendentes),
        quantidadeParcelas: situacaoParcelas.length,
        proximoVencimento: proximo?.dataVencimento || null,
        diasParaVencer: proximo ? differenceInCalendarDays(new Date(proximo.dataVencimento), hoje) : null,
        atrasada: situacaoParcelas.some(p => p.status === 'atrasada'),
        categoriaNome: d.categoria?.nome,
        userId: d.userId,
        lancamentos: lancamentos as unknown as Lancamento[],
        situacaoParcelas
      });
    }

    return volateis;
  },

  async buscarVolatilPorDespesaId(despesaId: number, userId: number): Promise<DividaVolatil | null> {
    const d = await prisma.despesa.findFirst({
      where: { id: despesaId, userId, tipo: "VARIAVEL", deletedAt: null },
      include: { categoria: true, lancamentos: { orderBy: { data: "asc" } } }
    });
    if (!d) return null;
    const mapped = await this.listarVolateis(userId);
    return mapped.find(v => v.despesaId === despesaId) || null;
  },

  async buscarAgendamentoPorData(despesaId: number, data: Date): Promise<Lancamento | null> {
    const start = new Date(data.getFullYear(), data.getMonth(), 1);
    const end = new Date(data.getFullYear(), data.getMonth() + 1, 0);

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

  async liquidarAgendamento(id: number, data: Date, observacao: string): Promise<Lancamento> {
    return prisma.lancamento.update({
      where: { id },
      data: {
        tipo: 'pagamento',
        data: data,
        observacao,
        updatedAt: new Date()
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
      const valorFinalAgendado = (valorAgendadoReal > 0) ? valorAgendadoReal : (isMêsPlanejado ? valorParcelaBase : 0);

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

      if (valorFinalAgendado > 0) {
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

    const valorRestante = Math.max(0, valorTotalCalculado - valorPagoTotalGlobal);
    const parcelasPagas = situacaoParcelas.filter(p => p.status === 'pago').length;
    const progresso = valorTotalCalculado > 0 ? (valorPagoTotalGlobal / valorTotalCalculado) * 100 : 0;
    const proximoAgendamento = situacaoParcelas.find(p => p.status !== 'pago');

    return {
      id: d.id,
      nome: d.nome,
      icone: d.icone,
      cor: d.cor,
      status: d.status as StatusDivida,
      tipo: "UNICA",
      valorTotal: valorTotalCalculado,
      totalParcelas: situacaoParcelas.length,
      valorParcela: valorParcelaBase,
      dataInicio: d.dataInicio || d.createdAt,
      diaVencimento: d.diaVencimento || 0,
      valorPago: valorPagoTotalGlobal,
      valorRestante,
      parcelasPagas,
      parcelasRestantes: Math.max(0, situacaoParcelas.length - parcelasPagas),
      progresso,
      concluida: (valorRestante <= 0 && valorTotalCalculado > 0) || parcelasPagas >= situacaoParcelas.length,
      proximoVencimento: proximoAgendamento?.dataVencimento || null,
      diasParaVencer: proximoAgendamento ? differenceInCalendarDays(new Date(proximoAgendamento.dataVencimento), hoje) : null,
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
