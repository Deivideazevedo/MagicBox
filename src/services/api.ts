import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

// Header
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// Interceptor
const baseQueryInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // 🔹 TRATAMENTO DE ERRO APÓS A REQUISIÇÃO
  if (result.error) {
    let message = "Ocorreu um erro na requisição.";
    let icon: "error" | "warning" | "info" = "error";

    // Tentar extrair mensagem do backend primeiro
    if (result.error.data) {
      const errorData = result?.error?.data as any;

      // Backend já envia mensagem tratada
      if (errorData.message) {
        message = Array.isArray(errorData.message)
          ? errorData.message[0]
          : errorData.message;
      } else if (errorData.error) {
        message = errorData.error;
      }
    }

    // Mensagens genéricas apenas para erros sem mensagem do backend
    if (message === "Ocorreu um erro na requisição.") {
      switch (result.error.status) {
        case 401:
          message = "Usuário não autenticado. Redirecionando para login...";
          // api.dispatch(logout());
          break;
        case 403:
          message = "Acesso negado. Você não tem permissão para esta ação.";
          break;
        case 404:
          message = "Recurso não encontrado.";
          break;
        case 500:
          message = "Erro interno do servidor. Tente novamente mais tarde.";
          break;
        case "FETCH_ERROR":
          message =
            "Erro de conexão. Verifique sua internet e tente novamente.";
          break;
        case "PARSING_ERROR":
          message = "Erro ao processar resposta do servidor.";
          break;
        case "TIMEOUT_ERROR":
          message = "Tempo limite excedido. Tente novamente.";
          break;
      }
    }

    // Mostrar notificação para o usuário (import dinâmico para evitar dependência circular)
    import("@/utils/swalert").then(({ SwalToast }) => {
      SwalToast.fire({
        title: message,
        icon,
      });
    });

    // Log detalhado para desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.error("📋 Detalhes do erro:", {
        status: result.error.status,
        data: result.error.data,
        endpoint: args,
      });
    }
  }

  return result;
};

// API base do RTK Query com interceptor
export const api = createApi({
  reducerPath: "api",
  keepUnusedDataFor: 300, // Mantém dados por 60 segundos para evitar refetchs desnecessários
  baseQuery: baseQueryInterceptor,
  tagTypes: [
    "Categorias",
    "Contas",
    "Despesas",
    "Lancamentos",
    "Dashboard",
    "Receita",
    "FonteRenda",
    "Resumo",
  ],
  endpoints: () => ({}), // Endpoints serão injetados nos arquivos de serviço específicos
});

export const enhancedApi = api.enhanceEndpoints({
  endpoints: () => ({
    // Endpoints base podem ser definidos aqui se necessário
  }),
});
