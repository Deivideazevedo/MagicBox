import { prisma } from "@/lib/prisma";
import { Divida, DividaUnica, DividaVolatil, StatusDivida } from "./types";
import { CreateDividaDTO, UpdateDividaDTO } from "./divida.dto";
import { differenceInDays } from "date-fns";

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

    return despesas.map((d) => {
      const lancamentos = d.lancamentos;
      const pagos = lancamentos.filter((l) => l.tipo === "pagamento");
      const agendados = lancamentos.filter((l) => l.tipo === "agendamento");

      const valorTotal = Number(d.valorTotal || 0);
      const valorPago = pagos.reduce((acc, l) => acc + Number(l.valor), 0);
      const valorRestante = Math.max(0, valorTotal - valorPago);

      const totalParcelas = d.totalParcelas || 0;
      const parcelasPagas = pagos.length;
      const parcelasRestantes = Math.max(0, totalParcelas - parcelasPagas);

      const progresso = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;

      const proximoAgendamento = agendados[0];
      const hoje = new Date();

      return {
        id: d.id,
        nome: d.nome,
        icone: d.icone,
        cor: d.cor,
        status: d.status as StatusDivida,
        tipo: "UNICA",
        valorTotal,
        totalParcelas,
        valorParcela: Number(d.valorEstimado || 0),
        dataInicio: d.dataInicio || d.createdAt,
        diaVencimento: d.diaVencimento || 0,
        valorPago,
        valorRestante,
        parcelasPagas,
        parcelasRestantes,
        progresso,
        concluida: valorRestante <= 0 && valorTotal > 0,
        proximoVencimento: proximoAgendamento?.data.toISOString(),
        diasParaVencer: proximoAgendamento ? differenceInDays(new Date(proximoAgendamento.data), hoje) : null,
        lancamentos: d.lancamentos,
        categoriaId: d.categoriaId,
        categoriaNome: d.categoria?.nome,
        userId: d.userId,
      } as DividaUnica;
    });
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
    const grupos = new Map<number, typeof agendamentos>();
    agendamentos.forEach(l => {
      const list = grupos.get(l.despesaId!) || [];
      list.push(l);
      grupos.set(l.despesaId!, list);
    });

    const hoje = new Date();

    return Array.from(grupos.values()).map(list => {
      const d = list[0].despesa!;
      const proximo = list[0];
      const diasParaVencer = differenceInDays(new Date(proximo.data), hoje);

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

    // Repetir lógica de mapeamento para Unica (pode ser refatorado depois)
    const d = despesa;
    const lancamentos = d.lancamentos;
    const pagos = lancamentos.filter((l) => l.tipo === "pagamento");
    const agendados = lancamentos.filter((l) => l.tipo === "agendamento");
    const valorTotal = Number(d.valorTotal || 0);
    const valorPago = pagos.reduce((acc, l) => acc + Number(l.valor), 0);
    const valorRestante = Math.max(0, valorTotal - valorPago);
    const totalParcelas = d.totalParcelas || 0;
    const parcelasPagas = pagos.length;
    const progresso = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;
    const proximoAgendamento = agendados[0];
    const hoje = new Date();

    return {
      id: d.id,
      nome: d.nome,
      icone: d.icone,
      cor: d.cor,
      status: d.status as StatusDivida,
      tipo: "UNICA",
      valorTotal,
      totalParcelas,
      valorParcela: Number(d.valorEstimado || 0),
      dataInicio: d.dataInicio || d.createdAt,
      diaVencimento: d.diaVencimento || 0,
      valorPago,
      valorRestante,
      parcelasPagas,
      parcelasRestantes: Math.max(0, totalParcelas - parcelasPagas),
      progresso,
      concluida: valorRestante <= 0 && valorTotal > 0,
      proximoVencimento: proximoAgendamento?.data.toISOString(),
      diasParaVencer: proximoAgendamento ? differenceInDays(new Date(proximoAgendamento.data), hoje) : null,
      lancamentos: d.lancamentos,
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
    const diasParaVencer = differenceInDays(new Date(proximo.data), hoje);

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
    const updateData: any = { ...dados };
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
  }
};
