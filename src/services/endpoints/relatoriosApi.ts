import { api } from "../api";

export const relatoriosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRelatorio: builder.query({
      query: (params) => ({
        url: "/relatorios",
        params,
      }),
      providesTags: ["Resumo", "Lancamentos", "Metas"],
    }),
    getHistoricoAgrupado: builder.query({
      query: (params) => ({
        url: "/relatorios/historico",
        method: "GET",
        params,
      }),
      providesTags: ["Resumo", "Lancamentos", "Metas", "Dividas"],
    }),
  }),
});

export const {
  useGetRelatorioQuery,
  useGetHistoricoAgrupadoQuery,
} = relatoriosApi;
