import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API base do RTK Query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Aqui podemos adicionar headers de autenticação se necessário
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Despesas', 'Contas', 'Lancamentos', 'Dashboard'],
  endpoints: () => ({}), // Endpoints serão injetados nos arquivos de serviço específicos
});

export const enhancedApi = api.enhanceEndpoints({
  endpoints: () => ({
    // Endpoints base podem ser definidos aqui se necessário
  }),
});