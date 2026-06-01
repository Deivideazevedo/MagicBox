import { api } from "../api";

export interface ResultadoLimpeza {
  message: string;
  limite: string;
  removidos: {
    categorias: number;
    despesas: number;
    receitas: number;
    objetivos: number;
  };
}

export const sistemaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    executarLimpeza: builder.mutation<ResultadoLimpeza, { dias?: number }>({
      query: (body) => ({
        url: "/sistema/limpar",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useExecutarLimpezaMutation } = sistemaApi;
