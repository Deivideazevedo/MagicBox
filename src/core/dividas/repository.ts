import { prisma } from "@/lib/prisma";
import { DividaUnica, DividaVolatil, StatusDivida, SituacaoParcela } from "./types";
import { CreateDividaDTO, UpdateDividaDTO } from "./divida.dto";
import { differenceInCalendarDays, isSameMonth } from "date-fns";
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

    return despesas.map((d) => this.mapearDividaUnica(d));
  },

  async listarVolateis(userId: number): Promise<DividaVolatil[]> {
    const agendamentos = await prisma.lancamento.findMany({
      where: {
        userId,
        tipo: "agendamento",
        despesaId: { not: null },
        despesa: {
          tipo: { not: "DIVIDA" },
          deletedAt: null,
          status: "A"
        }
      },
      include: {
        despesa: {
          include: { categoria: true }
        }
      },
      orderBy: { data: "asc" }
    });

    // Agrupar por despesaId
    const grupos = new Map<number, LancamentoComDespesa[]>();
    agendamentos.forEach((l: LancamentoComDespesa) => {
      const list = grupos.get(l.despesaId!) || [];
      list.push(l);
      grupos.set(l.despesaId!, list);
    });

    const hoje = new Date();

    return Array.from(grupos.values()).map(list => {
      const d = list[0].despesa!;
      const proximo = list[0];
      const diasParaVencer = differenceInCalendarDays(new Date(proximo.data), hoje);

      return {
        id: `vol-${d.id}`,
        despesaId: d.id,
        nome: d.nome,
        icone: d.icone,
        cor: d.cor,
        status: "A",
        tipo: "VOLATIL",
        valorTotalAgendado: list.reduce((acc, l) => acc + Number(l.valor), 0),
        quantidadeParcelas: list.length,
        proximoVencimento: proximo.data.toISOString(),
        diasParaVencer,
        atrasada: diasParaVencer < 0,
        categoriaNome: d.categoria?.nome,
        userId: d.userId,
        lancamentos: list
      } as DividaVolatil;
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
    const totalParcelas = d.totalParcelas || 0;
    const valorTotal = Number(d.valorTotal || 0);
    const valorParcelaBase = Number(d.valorEstimado || (valorTotal / totalParcelas) || 0);
    const dataInicio = new Date(d.dataInicio || d.createdAt);
    const hoje = new Date();

    // 1. Calcular Valor Total Pago (Aportes + Drawer)
    const pagamentosTotais = lancamentos.filter((l: Lancamento) => l.tipo === "pagamento");
    const valorPagoTotal = pagamentosTotais.reduce((acc: number, l: Lancamento) => acc + Number(l.valor), 0);
    
    // 2. Gerar cronograma (Waterfall)
    const situacaoParcelas: SituacaoParcela[] = [];
    let saldoParaAbater = valorPagoTotal;
    
    for (let i = 0; i < totalParcelas; i++) {
      const dataVencimento = new Date(dataInicio);
      dataVencimento.setMonth(dataInicio.getMonth() + i);

      // Ajuste de dia
      const diaDesejado = dataInicio.getDate();
      const ultimoDiaMes = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth() + 1, 0).getDate();
      dataVencimento.setDate(Math.min(diaDesejado, ultimoDiaMes));

      // Valor desta parcela específica (priorizar agendamento se existir para capturar alterações manuais)
      const agendamentosNoMes = lancamentos.filter((l: Lancamento) => 
        l.tipo === "agendamento" && isSameMonth(new Date(l.data), dataVencimento)
      );
      const valorDestaParcela = agendamentosNoMes.length > 0 ? Number(agendamentosNoMes[0].valor) : valorParcelaBase;

      let valorAlocado = 0;
      let status: SituacaoParcela['status'] = 'pendente';

      if (saldoParaAbater >= valorDestaParcela - 0.01) {
        valorAlocado = valorDestaParcela;
        saldoParaAbater -= valorDestaParcela;
        status = 'pago';
      } else if (saldoParaAbater > 0) {
        valorAlocado = saldoParaAbater;
        saldoParaAbater = 0;
        status = 'parcial';
      } else if (dataVencimento < hoje && !isSameMonth(dataVencimento, hoje)) {
        status = 'atrasada';
      }

      situacaoParcelas.push({
        numero: i + 1,
        dataVencimento: dataVencimento.toISOString(),
        valorAgendado: valorDestaParcela,
        valorPago: valorAlocado,
        status
      });
    }

    // 3. Calcular Metadados Globais
    const valorRestante = Math.max(0, valorTotal - valorPagoTotal);
    const parcelasPagas = situacaoParcelas.filter(p => p.status === 'pago').length;
    const parcelasRestantes = Math.max(0, totalParcelas - parcelasPagas);
    const progresso = valorTotal > 0 ? (valorPagoTotal / valorTotal) * 100 : 0;
    const proximoAgendamento = situacaoParcelas.find(p => p.status !== 'pago');

    return {
      id: d.id,
      nome: d.nome,
      icone: d.icone,
      cor: d.cor,
      status: d.status as StatusDivida,
      tipo: "UNICA",
      valorTotal,
      totalParcelas,
      valorParcela: valorParcelaBase,
      dataInicio: d.dataInicio || d.createdAt,
      diaVencimento: d.diaVencimento || 0,
      valorPago: valorPagoTotal,
      valorRestante,
      parcelasPagas,
      parcelasRestantes,
      progresso,
      concluida: (valorRestante <= 0 && valorTotal > 0) || parcelasPagas >= totalParcelas,
      proximoVencimento: proximoAgendamento?.dataVencimento || null,
      diasParaVencer: proximoAgendamento ? differenceInCalendarDays(new Date(proximoAgendamento.dataVencimento), hoje) : null,
      lancamentos: d.lancamentos,
      situacaoParcelas,
      categoriaId: d.categoriaId,
      categoriaNome: d.categoria?.nome,
      userId: d.userId,
    } as DividaUnica;
  },

  async buscarVolatilPorDespesaId(despesaId: number, userId: number): Promise<DividaVolatil | null> {
    const agendamentos = await prisma.lancamento.findMany({
      where: {
        userId,
        despesaId,
        tipo: "agendamento",
        despesa: {
          deletedAt: null,
          status: "A"
        }
      },
      include: {
        despesa: {
          include: { categoria: true }
        }
      },
      orderBy: { data: "asc" }
    });

    if (agendamentos.length === 0) return null;

    const d = agendamentos[0].despesa!;
    const proximo = agendamentos[0];
    const hoje = new Date();
    const diasParaVencer = differenceInCalendarDays(new Date(proximo.data), hoje);

    return {
      id: `vol-${d.id}`,
      despesaId: d.id,
      nome: d.nome,
      icone: d.icone,
      cor: d.cor,
      status: "A" as StatusDivida,
      tipo: "VOLATIL",
      valorTotalAgendado: agendamentos.reduce((acc, l) => acc + Number(l.valor), 0),
      quantidadeParcelas: agendamentos.length,
      proximoVencimento: proximo.data.toISOString(),
      diasParaVencer,
      atrasada: diasParaVencer < 0,
      categoriaNome: d.categoria?.nome,
      userId: d.userId,
      lancamentos: agendamentos
    } as DividaVolatil;
  },

  async criar(dados: CreateDividaDTO & { userId: number }) {
    return await prisma.despesa.create({
      data: {
        ...dados,
        tipo: "DIVIDA",
        valorEstimado: Number(dados.valorTotal) / dados.totalParcelas,
        diaVencimento: new Date(dados.dataInicio).getDate(),
      }
    });
  },

  async atualizar(id: number, dados: UpdateDividaDTO) {
    // Garantir que não estamos tentando atualizar o ID ou campos inexistentes
    const { ...updateData }: Prisma.DespesaUpdateInput = dados;
    
    if (dados.valorTotal && dados.totalParcelas) {
      updateData.valorEstimado = Number(dados.valorTotal) / dados.totalParcelas;
    }

    return await prisma.despesa.update({
      where: { id },
      data: updateData
    });
  },

  async remover(id: number) {
    return await prisma.despesa.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  },

  async buscarAgendamentoPorData(despesaId: number, data: Date) {
    return await prisma.lancamento.findFirst({
      where: {
        despesaId,
        tipo: "agendamento",
        data
      }
    });
  },

  async liquidarAgendamento(agendamentoId: number, dataPagamento: Date, observacao: string) {
    const ag = await prisma.lancamento.findUnique({ where: { id: agendamentoId } });
    if (!ag) return null;

    return await prisma.lancamento.update({
      where: { id: agendamentoId },
      data: {
        tipo: "pagamento",
        valor: ag.valor,
        data: dataPagamento,
        observacao
      }
    });
  }
};
