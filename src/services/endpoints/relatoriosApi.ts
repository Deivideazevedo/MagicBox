import { api } from "../api";
import {
  RelatorioResponse,
  HistoricoMensal,
  EvolucaoAnualResponse,
} from "@/core/relatorios/relatorio.dto";

export const relatoriosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRelatorio: builder.query<RelatorioResponse, { dataInicio: string; dataFim: string }>({
      query: (params) => ({
        url: "/relatorios",
        params,
      }),
      providesTags: ["Resumo", "Lancamentos", "Metas"],
    }),
    getHistoricoAgrupado: builder.query<HistoricoMensal[], { itens: string; ano: number }>({
      query: (params) => ({
        url: "/relatorios/historico",
        method: "GET",
        params,
      }),
      providesTags: ["Resumo", "Lancamentos", "Metas", "Dividas"],
    }),
    getEvolucaoAnual: builder.query<EvolucaoAnualResponse, { ano: number }>({
      query: (params) => ({
        url: "/relatorios/evolucao",
        params,
      }),
      providesTags: ["Resumo", "Lancamentos", "Metas"],
    }),
  }),
});

export const {
  useGetRelatorioQuery,
  useGetHistoricoAgrupadoQuery,
  useGetEvolucaoAnualQuery,
} = relatoriosApi;
