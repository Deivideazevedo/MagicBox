import { api } from '../api';
import { Lancamento, LancamentoPayload } from '@/core/lancamentos/types';

export const lancamentosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLancamentos: builder.query<Lancamento[], void>({
      query: () => '/lancamentos',
      providesTags: ['Lancamentos'],
    }),
    
    createLancamento: builder.mutation<Lancamento, LancamentoPayload>({
      query: (newLancamento) => ({
        url: '/lancamentos',
        method: 'POST',
        body: newLancamento,
      }),
      invalidatesTags: ['Lancamentos'],
    }),
    
    updateLancamento: builder.mutation<
      Lancamento,
      { id: string; data: LancamentoPayload }
    >({
      query: ({ id, data }) => ({
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
  }),
});

export const {
  useGetLancamentosQuery,
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
  useDeleteLancamentoMutation,
} = lancamentosApi;