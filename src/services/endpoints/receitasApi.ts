import { api } from '../api';
import { Receita, CreateReceitaDto, UpdateReceitaDto } from '../types';

export const receitasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReceitas: builder.query<Receita[], void>({
      query: () => '/receitas',
      providesTags: ['Receita'],
    }),
    
    createReceita: builder.mutation<Receita, CreateReceitaDto>({
      query: (newReceita) => ({
        url: '/receitas',
        method: 'POST',
        body: newReceita,
      }),
      invalidatesTags: ['Receita'],
    }),
    
    updateReceita: builder.mutation<Receita, UpdateReceitaDto>({
      query: (receita) => ({
        url: '/receitas',
        method: 'PUT',
        body: receita,
      }),
      invalidatesTags: ['Receita'],
    }),
    
    deleteReceita: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/receitas?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Receita', 'FonteRenda'],
    }),
  }),
});

export const {
  useGetReceitasQuery,
  useCreateReceitaMutation,
  useUpdateReceitaMutation,
  useDeleteReceitaMutation,
} = receitasApi;