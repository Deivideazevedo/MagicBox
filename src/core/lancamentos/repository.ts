// src/core/lancamentos/repository.ts
import { prisma } from "@/lib/prisma";
import {
  Lancamento as PrismaLancamento,
  TipoLancamento,
  Despesa,
  FonteRenda,
  Prisma,
} from "@prisma/client";
import { LancamentoParams, LancamentoPayload } from "./types";
import { PaginatedResult } from "../types/global";
export const lancamentoRepository = {
  /**
   * Busca lançamentos com suporte a filtro de status dinâmico (Two-Step Fetch)
   * Enriquece cada resultado com o campo statusDinamico
   */
  async findAll(
    filters: LancamentoParams
  ): Promise<PaginatedResult<PrismaLancamento>> {
    const { page = 0, limit = 10, statusDinamico, ...filterParams } = filters;

    let whereClause: Prisma.LancamentoWhereInput = {
      ...filterParams,
    };

    const [total, data] = await prisma.$transaction([
      prisma.lancamento.count({ where: whereClause }),
      prisma.lancamento.findMany({
        where: whereClause,
        take: limit,
        skip: page * limit,
        orderBy: { data: "desc" },
        include: {
          despesa: {
            select: {
              id: true,
              nome: true,
              valorEstimado: true,
              diaVencimento: true,
            },
          },
          fonteRenda: {
            select: {
              id: true,
              nome: true,
              valorEstimado: true,
              diaRecebimento: true,
            },
          },
        },
      }),
    ]);

    return {
      data: data.map((lancamento) => ({
        ...lancamento,
        // statusDinamico: "", // calcularStatusDinamico(lancamento),
      })),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  },

  async findById(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    const lancamento = await prisma.lancamento.findUnique({
      where: {
        id: numericId,
      },
      include: {
        despesa: true,
        fonteRenda: true,
      },
    });

    if (!lancamento) return null;

    return {
      ...lancamento,
      // statusDinamico: calcularStatusDinamico(lancamento),
    };
  },

  async findByUser(userId: string | number) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    const lancamentos = await prisma.lancamento.findMany({
      where: {
        user_id: numericId,
      },
      orderBy: { data: "desc" },
      include: {
        despesa: true,
        fonteRenda: true,
      },
    });

    return lancamentos.map((lancamento) => ({
      ...lancamento,
      // statusDinamico: calcularStatusDinamico(lancamento),
    }));
  },

  async create(data: any) {
    // Cria o lançamento sem buscar as relações (economiza 2 queries desnecessárias)
    const lancamento = await prisma.lancamento.create({
      data: {
        user_id: Number(data.userId),
        tipo: data.tipo,
        valor: Number(data.valor),
        data: new Date(data.data),
        descricao: data.descricao,
        observacao_automatica: data.observacaoAutomatica,
        categoria_id: Number(data.categoriaId),
        despesa_id: data.despesaId ? Number(data.despesaId) : null,
        fonte_renda_id: data.fonteRendaId ? Number(data.fonteRendaId) : null,
      },
      // REMOVIDO include para otimização de performance
      // Se precisar das relações, faça um findById logo após
    });

    return {
      ...lancamento,
      despesa: null, // Mantém compatibilidade com o tipo esperado
      fonteRenda: null,
      // statusDinamico: calcularStatusDinamico(lancamento),
    };
  },

  async remove(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      // Delete permanente (sem soft delete)
      await prisma.lancamento.delete({
        where: { id: numericId },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async update(id: string | number, data: Partial<LancamentoPayload>) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    const lancamento = await prisma.lancamento.update({
      where: { id: numericId },
      data: {
        tipo: data.tipo ? (data.tipo as TipoLancamento) : undefined,
        valor: data.valor ? Number(data.valor) : undefined,
        data: data.data ? new Date(data.data) : undefined,
        descricao: data.descricao,
        despesa_id: data.despesaId !== undefined 
          ? (data.despesaId ? Number(data.despesaId) : null) 
          : undefined,
        fonte_renda_id: data.fonteRendaId !== undefined 
          ? (data.fonteRendaId ? Number(data.fonteRendaId) : null) 
          : undefined,
      },
      // REMOVIDO include para otimização de performance
      // Se precisar das relações, faça um findById logo após
    });

    return {
      ...lancamento,
      despesa: null, // Mantém compatibilidade com o tipo esperado
      fonteRenda: null,
      // statusDinamico: calcularStatusDinamico(lancamento),
    };
  },
};
