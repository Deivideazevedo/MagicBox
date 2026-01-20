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
import { FindAllFilters } from "./lancamento.dto";
export const lancamentoRepository = {
  /**
   * Busca lançamentos com suporte a filtros dinâmicos
   */
  async findAll(
    filters: FindAllFilters
  ): Promise<PaginatedResult<PrismaLancamento>> {
    const { 
      page = 0, 
      limit = 10, 
      dataInicio,
      dataFim,
      tipo,
      observacao,
      userId,
      categoriaId,
      despesaId,
      fonteRendaId,
      origem,
    } = filters;

    let whereClause: Prisma.LancamentoWhereInput = {};

    // Adicionar filtros válidos manualmente
    if (userId) {
      whereClause.user_id = Number(userId);
    }
    if (categoriaId) {
      whereClause.categoria_id = Number(categoriaId);
    }
    if (despesaId) {
      whereClause.despesa_id = Number(despesaId);
    }
    if (fonteRendaId) {
      whereClause.fonte_renda_id = Number(fonteRendaId);
    }
    if (origem) {
      if (origem === "despesa") {
        whereClause.despesa_id = { not: null };
      } else if (origem === "renda") {
        whereClause.fonte_renda_id = { not: null };
      }
    }

    // Filtro por período
    if (dataInicio || dataFim) {
      whereClause.data = {};
      if (dataInicio) {
        whereClause.data.gte = new Date(dataInicio);
      }
      if (dataFim) {
        whereClause.data.lte = new Date(dataFim);
      }
    }

    // Filtro por tipo
    if (tipo) {
      whereClause.tipo = tipo as TipoLancamento;
    }

    // Filtro por busca (descrição)
    if (observacao) {
      whereClause.observacao = {
        contains: observacao,
        mode: 'insensitive',
      };
    }

    const [total, data] = await prisma.$transaction([
      prisma.lancamento.count({ where: whereClause }),
      prisma.lancamento.findMany({
        where: whereClause,
        take: limit,
        skip: page * limit,
        orderBy: { data: "desc" },
        include: {
          categoria: {
            select: {
              id: true,
              nome: true,
            },
          },
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
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
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
    });

    if (!lancamento) return null;

    return lancamento;
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
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
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
    });

    return lancamentos;
  },

  async create(data: any) {
    // Cria o lançamento sem buscar as relações (economiza 2 queries desnecessárias)
    const lancamento = await prisma.lancamento.create({
      data: {
        user_id: Number(data.userId),
        tipo: data.tipo,
        valor: Number(data.valor),
        data: new Date(data.data),
        observacao: data.observacao,
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
        observacao: data.observacao,
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
