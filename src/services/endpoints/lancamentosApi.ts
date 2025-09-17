import { api } from '../api';
import { Lancamento, CreateLancamentoDto, UpdateLancamentoDto, FiltroExtrato } from '../types';
import { fnBuildSearchParams } from '../../utils/searchParams';

export const lancamentosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLancamentos: builder.query<Lancamento[], FiltroExtrato | void>({
      query: (filtros) => {
        const queryString = fnBuildSearchParams(filtros || {});
        return `/lancamentos${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Lancamentos'],
    }),
    
    createLancamento: builder.mutation<Lancamento[], CreateLancamentoDto>({
      query: (newLancamento) => ({
        url: '/lancamentos',
        method: 'POST',
        body: newLancamento,
      }),
      invalidatesTags: ['Lancamentos'],
    }),
    
    updateLancamento: builder.mutation<Lancamento, UpdateLancamentoDto>({
      query: ({ id, ...data }) => ({
        url: `/lancamentos/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Lancamentos'],
    }),
    
    deleteLancamento: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/lancamentos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lancamentos'],
    }),
    
    deleteLancamentos: builder.mutation<{ success: boolean }, string[]>({
      query: (ids) => ({
        url: '/lancamentos/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Lancamentos'],
    }),
  }),
});

export const {
  useGetLancamentosQuery,
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
  useDeleteLancamentoMutation,
  useDeleteLancamentosMutation,
} = lancamentosApi;