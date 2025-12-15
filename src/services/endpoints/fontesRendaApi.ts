import { FonteRenda, FonteRendaPayload } from "@/core/fontesRenda/types";
import { api } from "../api";

export const fontesRendaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFontesRenda: builder.query<FonteRenda[], string | void>({
      query: (receitaId) =>
        receitaId ? `/fontes-renda?receitaId=${receitaId}` : "/fontes-renda",
      providesTags: ["FonteRenda"],
    }),

    createFonteRenda: builder.mutation<FonteRenda, FonteRendaPayload>({
      query: (newFonteRenda) => ({
        url: "/fontes-renda",
        method: "POST",
        body: newFonteRenda,
      }),
      invalidatesTags: ["FonteRenda"],
    }),

    updateFonteRenda: builder.mutation<
      FonteRenda,
      { id: string; data: FonteRendaPayload }
    >({
      query: ({ id, data }) => ({
        url: `/fontes-renda/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["FonteRenda"],
    }),

    deleteFonteRenda: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/fontes-renda/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FonteRenda"],
    }),
  }),
});

export const {
  useGetFontesRendaQuery,
  useCreateFonteRendaMutation,
  useUpdateFonteRendaMutation,
  useDeleteFonteRendaMutation,
} = fontesRendaApi;
