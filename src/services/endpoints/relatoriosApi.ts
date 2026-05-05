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
    getHistoricoAgrupado: builder.mutation({
      query: (body) => ({
        url: "/relatorios/historico",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetRelatorioQuery,
  useGetHistoricoAgrupadoMutation,
} = relatoriosApi;
