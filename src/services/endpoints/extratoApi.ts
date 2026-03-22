import {
  ExtratoResposta,
  MiniCardsResumoProps,
} from "@/core/lancamentos/extrato/types";
import { PaginatedResult } from "@/core/types/global";
import { FindAllFilters } from "@/dtos";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { api } from "../api";
import {
  ExtratoFiltros,
  ExtratoResumoFiltros,
} from "@/core/lancamentos/extrato/extrato.dto";

export const lancamentosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExtrato: builder.query<PaginatedResult<ExtratoResposta>, ExtratoFiltros>(
      {
        query: (params) => ({
          url: "/extrato",
          params: fnCleanObject({ params }),
        }),
        providesTags: ["Extrato"],
      },
    ),
    getExtratoResumo: builder.query<MiniCardsResumoProps, ExtratoResumoFiltros>(
      {
        query: (params) => ({
          url: "/extrato/resumo",
          params: fnCleanObject({ params }),
        }),
        providesTags: ["Extrato"],
      },
    ),
  }),
});

export const {
  useGetExtratoQuery,
  useLazyGetExtratoQuery,
  useGetExtratoResumoQuery,
  useLazyGetExtratoResumoQuery,
} = lancamentosApi;
