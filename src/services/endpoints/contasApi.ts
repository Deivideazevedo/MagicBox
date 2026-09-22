import { api } from '../api';
import { Despesa, DespesaPayload } from '@/core/despesas/types';
import { fnBuildSearchParams } from '@/utils/searchParams';
import { DESPESA_INVALIDATION_TAGS } from '@/constants/rtkTags';

export const contasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Mantemos hooks compatíveis, mas internamente usam /despesas
    getContas: builder.query<Despesa[], void>({
      query: () => '/despesas',
      providesTags: ['Despesas'],
    }),

    getContasByDespesa: builder.query<Despesa[], string>({
      query: (categoriaId) => {
        const queryString = fnBuildSearchParams({ categoriaId });
        return `/despesas?${queryString}`;
      },
      providesTags: ['Despesas'],
    }),

    createConta: builder.mutation<Despesa, DespesaPayload>({
      query: (newConta) => ({
        url: '/despesas',
        method: 'POST',
        body: newConta,
      }),
      invalidatesTags: DESPESA_INVALIDATION_TAGS,
    }),
    
    updateConta: builder.mutation<Despesa, { id: number; data: DespesaPayload }>({
      query: ({ id, data }) => ({
        url: `/despesas/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: DESPESA_INVALIDATION_TAGS,
    }),
    deleteConta: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/despesas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: DESPESA_INVALIDATION_TAGS,
    }),
  }),
});

export const {
  useGetContasQuery,
  useGetContasByDespesaQuery,
  useCreateContaMutation,
  useUpdateContaMutation,
  useDeleteContaMutation,
} = contasApi;