import { z } from "zod";
import { logChat } from "./log-utils";
import { chatDiagnosisService } from "./dados-ferramentas/diagnosis.service";
import { resumoServico } from "@/core/lancamentos/resumo/service";

/**
 * Definições e implementações das ferramentas disponíveis para o assistente de IA.
 * Permite ao agente invocar lógica interna para consultar saldos, despesas e lançamentos.
 */
export function criarFerramentas(userId: number) {
  const agora = new Date();

  return {
    consultarResumoGeral: {
      description:
        "Retorna diagnóstico financeiro. Use para saldos, metas e dívidas. Se não passar datas, retorna a visão global. Se passar, inclui projeções. RETORNO: possui campos pilarReceitas, pilarDespesas, pilarMetas e saldos.",
      inputSchema: z.object({
        dataInicio: z
          .string()
          .nullable()
          .optional()
          .describe("Data início (YYYY-MM-DD)."),
        dataFim: z
          .string()
          .nullable()
          .optional()
          .describe("Data fim (YYYY-MM-DD)."),
      }),
      execute: async ({
        dataInicio,
        dataFim,
      }: {
        dataInicio?: string;
        dataFim?: string;
      }) => {
        logChat({
          tipo: "TOOL_CALL",
          userId,
          ferramenta: "consultarResumoGeral",
          mensagem: dataInicio
            ? `Período: ${dataInicio} → ${dataFim}`
            : "Visão Global Atemporal",
        });

        const diagnostico = await chatDiagnosisService.obterDiagnosticoCompleto(
          userId,
          dataInicio && dataFim ? { userId, dataInicio, dataFim } : undefined,
        );

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "consultarResumoGeral",
          mensagem: `Contexto: ${diagnostico.contexto} | Saldo Livre: R$${diagnostico.saldos.saldoLivre}`,
        });

        return diagnostico;
      },
    },
    consultarDespesas: {
      description:
        "Retorna despesas consolidadas (FIXA, DIVIDA, VARIAVEL) com totais e detalhes mensais. RETORNO: totalHistorico, pagoNoPeriodo, totalDevedorDividas, despesasConsolidadas[]. OBRIGATÓRIO: SEMPRE passe período (dataInicio=dataInicio, dataFim=dataFim). Use período padrão: primeiro dia do mês anterior até último dia do mês atual. Use para: contas atrasadas (filtre detalhesMensais onde diasParaVencer < 0), quanto falta pagar (totalDevedorDividas), gastos do período (pagoNoPeriodo), próximos vencimentos (detalhesMensais onde diasParaVencer > 0).",
      inputSchema: z.object({
        dataInicio: z
          .string()
          .nullable()
          .optional()
          .describe("Data início (YYYY-MM-DD)."),
        dataFim: z
          .string()
          .nullable()
          .optional()
          .describe("Data fim (YYYY-MM-DD)."),
      }),
      execute: async ({
        dataInicio,
        dataFim,
      }: {
        dataInicio?: string;
        dataFim?: string;
      }) => {
        logChat({
          tipo: "TOOL_CALL",
          userId,
          ferramenta: "consultarDespesas",
          mensagem: dataInicio
            ? `Período: ${dataInicio} → ${dataFim}`
            : "Visão Geral (Atemporal)",
        });

        const despesas = await chatDiagnosisService.obterPilarDespesas(
          userId,
          dataInicio && dataFim ? { userId, dataInicio, dataFim } : undefined,
        );

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "consultarDespesas",
          mensagem: `Total Devedor: R$${despesas.totalDevedorDividas} | Itens: ${despesas.despesasConsolidadas.length}`,
        });

        return despesas;
      },
    },
    consultarLancamentos: {
      description:
        "Retorna extrato detalhado agrupado por item. SEMPRE exige período. RETORNO: possui campos totalEncontrados, formato e sumario (lista de itens).",
      inputSchema: z.object({
        dataInicio: z
          .string()
          .nullable()
          .optional()
          .describe("Data início (YYYY-MM-DD)."),
        dataFim: z
          .string()
          .nullable()
          .optional()
          .describe("Data fim (YYYY-MM-DD)."),
        tipo: z
          .enum(["receita", "despesa", "todos"])
          .optional()
          .default("todos"),
      }),
      execute: async ({
        dataInicio,
        dataFim,
        tipo,
      }: {
        dataInicio?: string;
        dataFim?: string;
        tipo?: "receita" | "despesa" | "todos";
      }) => {
        const dInicio =
          dataInicio ||
          new Date(agora.getFullYear(), agora.getMonth(), 1)
            .toISOString()
            .split("T")[0];
        const dFim =
          dataFim ||
          new Date(agora.getFullYear(), agora.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];

        logChat({
          tipo: "TOOL_CALL",
          userId,
          ferramenta: "consultarLancamentos",
          mensagem: `Período: ${dInicio} → ${dFim} | Tipo: ${tipo}`,
        });

        const itens = await resumoServico.obterResumo({
          userId,
          dataInicio: dInicio,
          dataFim: dFim,
        });

        const filtrados = itens.filter(
          (item) => tipo === "todos" || item.origem === tipo,
        );

        const diffMs = new Date(dFim).getTime() - new Date(dInicio).getTime();
        const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);

        if (diffMonths > 3) {
          interface ItemAgrupado {
            nome: string;
            tipo: string;
            totalPrevisto: number;
            totalPago: number;
            ocorrencias: number;
          }

          const agrupado = filtrados.reduce(
            (acc: Record<string, ItemAgrupado>, item: any) => {
              const chave = `${item.origem}-${item.nome}`;
              if (!acc[chave]) {
                acc[chave] = {
                  nome: item.nome,
                  tipo: item.origem,
                  totalPrevisto: 0,
                  totalPago: 0,
                  ocorrencias: 0,
                };
              }
              acc[chave].totalPrevisto += item.valorPrevisto;
              acc[chave].totalPago += item.valorPago;
              acc[chave].ocorrencias += 1;
              return acc;
            },
            {},
          );

          return {
            totalEncontrados: filtrados.length,
            periodoReferencia: `${dInicio} a ${dFim}`,
            formato: "SUMARIO_AGRUPADO",
            aviso:
              "Período longo detectado. Os dados foram agrupados por item/fonte para facilitar a análise.",
            sumario: Object.values(agrupado),
          };
        }

        const listagem = filtrados.map((item: any) => {
          const detalhes = (item.detalhes ?? []).map((d: any) => ({
            ...d,
            data:
              typeof d.data === "string"
                ? d.data
                : new Date(
                  d.data as unknown as string | number | Date,
                ).toISOString(),
          }));

          return {
            nome: item.nome,
            tipo: item.origem,
            valorPrevisto: item.valorPrevisto,
            valorPago: item.valorPago,
            status: item.status,
            atrasado: item.atrasado,
            isProjetado: item.isProjetado,
            detalhes,
            diaVencimento: item.diaVencido,
            mes: item.mes,
            ano: item.ano,
          };
        });

        logChat({
          tipo: "TOOL_RESULT",
          ferramenta: "consultarLancamentos",
          mensagem: `Encontrados ${listagem.length} lançamentos para o período ${dInicio} a ${dFim}`,
        });

        return {
          totalEncontrados: listagem.length,
          lancamentos: listagem,
          periodoReferencia: `${dInicio} a ${dFim}`,
        };
      },
    },
  };
}
