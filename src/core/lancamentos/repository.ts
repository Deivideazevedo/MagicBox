// src/core/lancamentos/repository.ts
import { prisma } from "@/lib/prisma";
import { Lancamento as PrismaLancamento, TipoLancamento , Despesa, FonteRenda, Prisma } from "@prisma/client";
import { LancamentoPayload } from "./types";
import { calcularStatusDinamico, buscarIdsPorStatusDinamico } from "./utils";

// Tipo enriquecido com statusDinamico (exportado para uso externo)
export type LancamentoEnriquecido = PrismaLancamento & {
  despesa: Despesa | null;
  fonteRenda: FonteRenda | null;
  statusDinamico: string;
};

export const lancamentoRepository = {
  /**
   * Busca lançamentos com suporte a filtro de status dinâmico (Two-Step Fetch)
   * Enriquece cada resultado com o campo statusDinamico
   */
  async findAll(filters: Partial<PrismaLancamento> & { statusDinamico?: string }): Promise<LancamentoEnriquecido[]> {
    const { statusDinamico, ...prismaFilters } = filters;
    
    let whereClause: Prisma.LancamentoWhereInput = { ...prismaFilters };
    
    // ETAPA 1: Two-Step Fetch se houver filtro de status dinâmico
    if (statusDinamico && statusDinamico !== "TODOS") {
      const ids = await buscarIdsPorStatusDinamico(
        prisma,
        statusDinamico,
        prismaFilters.userId ? Number(prismaFilters.userId) : undefined
      );
      
      // Se não houver IDs, retorna array vazio
      if (ids.length === 0) {
        return [];
      }
      
      // Filtra pelos IDs encontrados
      whereClause = {
        ...prismaFilters,
        id: { in: ids },
      };
    }
    
    // ETAPA 2: Busca completa com relacionamentos
    const lancamentos = await prisma.lancamento.findMany({
      where: whereClause,
      orderBy: { data: "desc" },
      include: {
        despesa: true,
        fonteRenda: true,
      },
    });
    
    // ETAPA 3: Enriquecimento com statusDinamico
    return lancamentos.map((lancamento) => ({
      ...lancamento,
      statusDinamico: calcularStatusDinamico(lancamento),
    }));
  },

  async findById(id: string | number): Promise<LancamentoEnriquecido | null> {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    const lancamento = await prisma.lancamento.findUnique({
      where: { id: numericId },
      include: {
        despesa: true,
        fonteRenda: true,
      },
    });
    
    if (!lancamento) return null;
    
    return {
      ...lancamento,
      statusDinamico: calcularStatusDinamico(lancamento),
    };
  },

  async findByUser(userId: string | number): Promise<LancamentoEnriquecido[]> {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    const lancamentos = await prisma.lancamento.findMany({
      where: { userId: numericId },
      orderBy: { data: "desc" },
      include: {
        despesa: true,
        fonteRenda: true,
      },
    });
    
    return lancamentos.map((lancamento) => ({
      ...lancamento,
      statusDinamico: calcularStatusDinamico(lancamento),
    }));
  },

  async create(data: LancamentoPayload & { userId: number }): Promise<LancamentoEnriquecido> {
    const lancamento = await prisma.lancamento.create({
      data: {
        userId: data.userId,
        tipo: data.tipo as TipoLancamento,
        valor: Number(data.valor),
        data: new Date(data.data),
        descricao: data.descricao,
        despesaId: data.despesaId ? Number(data.despesaId) : null,
        contaId: data.contaId ? Number(data.contaId) : null,
        fonteRendaId: data.fonteRendaId ? Number(data.fonteRendaId) : null,
        parcelas: data.parcelas ? Number(data.parcelas) : null,
        valorPago: data.valorPago ? Number(data.valorPago) : null,
      },
      include: {
        despesa: true,
        fonteRenda: true,
      },
    });
    
    return {
      ...lancamento,
      statusDinamico: calcularStatusDinamico(lancamento),
    };
  },

  async remove(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      await prisma.lancamento.delete({
        where: { id: numericId },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async update(id: string | number, data: Partial<LancamentoPayload>): Promise<LancamentoEnriquecido> {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    const lancamento = await prisma.lancamento.update({
      where: { id: numericId },
      data: {
        tipo: data.tipo ? (data.tipo as TipoLancamento) : undefined,
        valor: data.valor ? Number(data.valor) : undefined,
        data: data.data ? new Date(data.data) : undefined,
        descricao: data.descricao,
        despesaId: data.despesaId ? Number(data.despesaId) : undefined,
        contaId: data.contaId ? Number(data.contaId) : undefined,
        fonteRendaId: data.fonteRendaId ? Number(data.fonteRendaId) : undefined,
        parcelas: data.parcelas ? Number(data.parcelas) : undefined,
        valorPago: data.valorPago ? Number(data.valorPago) : undefined,
      },
      include: {
        despesa: true,
        fonteRenda: true,
      },
    });
    
    return {
      ...lancamento,
      statusDinamico: calcularStatusDinamico(lancamento),
    };
  },
};
