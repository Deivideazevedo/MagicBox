import { api } from '../api';
import { FonteRenda, CreateFonteRendaDto, UpdateFonteRendaDto } from '../types';

export const fontesRendaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFontesRenda: builder.query<FonteRenda[], string | void>({
      query: (receitaId) => receitaId ? `/fontes-renda?receitaId=${receitaId}` : '/fontes-renda',
      providesTags: ['FonteRenda'],
    }),
    
    createFonteRenda: builder.mutation<FonteRenda, CreateFonteRendaDto>({
      query: (newFonteRenda) => ({
        url: '/fontes-renda',
        method: 'POST',
        body: newFonteRenda,
      }),
      invalidatesTags: ['FonteRenda'],
    }),
    
    updateFonteRenda: builder.mutation<FonteRenda, UpdateFonteRendaDto>({
      query: (fonteRenda) => ({
        url: '/fontes-renda',
        method: 'PUT',
        body: fonteRenda,
      }),
      invalidatesTags: ['FonteRenda'],
    }),
    
    deleteFonteRenda: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/fontes-renda?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FonteRenda'],
    }),
  }),
});

export const {
  useGetFontesRendaQuery,
  useCreateFonteRendaMutation,
  useUpdateFonteRendaMutation,
  useDeleteFonteRendaMutation,
} = fontesRendaApi;