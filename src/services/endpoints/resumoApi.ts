import {
  ResumoResposta,
  ResumoMiniCardsProps,
  ResumoParametros,
} from "@/core/lancamentos/resumo/types";
import { PaginatedResult } from "@/core/types/global";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { api } from "../api";
import {
  ResumoFiltros,
} from "@/core/lancamentos/resumo/resumo.dto";

export const resumoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getResumo: builder.query<ResumoResposta[], ResumoParametros>(
      {
        query: (params) => ({
          url: "/resumo",
          params: fnCleanObject({ params }),
        }),
        providesTags: ["Resumo"],
      },
    ),
    getResumoListarTodos: builder.query<PaginatedResult<ResumoResposta>, ResumoParametros>(
      {
        query: (params) => ({
          url: "/resumo/listar-todos",
          params: fnCleanObject({ params }),
        }),
        providesTags: ["Resumo"],
      },
    ),
    getResumoCard: builder.query<ResumoMiniCardsProps, ResumoFiltros>(
      {
        query: (params) => ({
          url: "/resumo/card",
          params: fnCleanObject({ params }),
        }),
        providesTags: ["Resumo"],
      },
    ),
  }),
});

export const {
  useGetResumoQuery,
  useLazyGetResumoQuery,
  useGetResumoListarTodosQuery,
  useLazyGetResumoListarTodosQuery,
  useGetResumoCardQuery,
  useLazyGetResumoCardQuery,
} = resumoApi;
