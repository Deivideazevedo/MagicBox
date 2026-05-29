import { api } from "../api";
import { Objetivo, ObjetivoPayload } from "@/core/objetivos/types";
import { OBJETIVO_INVALIDATION_TAGS } from "@/constants/rtkTags";

export const objetivosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getObjetivos: builder.query<Objetivo[], void>({
      query: () => "/objetivos",
      providesTags: ["Objetivos"],
    }),
    
    getObjetivoById: builder.query<Objetivo, number>({
      query: (id) => `/objetivos/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Objetivos", id }],
    }),

    createObjetivo: builder.mutation<Objetivo, ObjetivoPayload>({
      query: (newObjetivo) => ({
        url: "/objetivos",
        method: "POST",
        body: newObjetivo,
      }),
      invalidatesTags: OBJETIVO_INVALIDATION_TAGS,
    }),

    updateObjetivo: builder.mutation<
      Objetivo,
      { id: number; data: ObjetivoPayload }
    >({
      query: ({ id, data }) => ({
        url: `/objetivos/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: OBJETIVO_INVALIDATION_TAGS,
    }),

    deleteObjetivo: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/objetivos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: OBJETIVO_INVALIDATION_TAGS,
    }),
  }),
});

export const {
  useGetObjetivosQuery,
  useGetObjetivoByIdQuery,
  useCreateObjetivoMutation,
  useUpdateObjetivoMutation,
  useDeleteObjetivoMutation,
} = objetivosApi;
