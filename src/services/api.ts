import { RootState } from "@/store/store";
import { SwalToast } from "@/utils/sweetAlert";
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

    // Tratamento específico por status code
    switch (result.error.status) {
      case 401:
        message = "Usuário não autenticado. Redirecionando para login...";
        // Aqui você pode despachar uma ação para logout
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
        message = "Erro de conexão. Verifique sua internet e tente novamente.";
        break;
      case "PARSING_ERROR":
        message = "Erro ao processar resposta do servidor.";
        break;
      case "TIMEOUT_ERROR":
        message = "Tempo limite excedido. Tente novamente.";
        break;
      default:
        // Tentar extrair mensagem do servidor
        if (result.error.data && typeof result.error.data === "object") {
          const errorData = result.error.data as any;
          if (Array.isArray(errorData.message)) {
            message = errorData.message[0];
          } else if (errorData.message) {
            message = errorData.message;
          } else if (errorData.error) {
            message = errorData.error;
          }
        }
        break;
    }

    // Mostrar notificação para o usuário
    SwalToast.fire({
      title: message,
      icon,
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
  baseQuery: baseQueryInterceptor,
  tagTypes: [
    "Categorias",
    "Contas",
    "Despesas",
    "Lancamentos",
    "Dashboard",
    "Receita",
    "FonteRenda",
  ],
  endpoints: () => ({}), // Endpoints serão injetados nos arquivos de serviço específicos
});

export const enhancedApi = api.enhanceEndpoints({
  endpoints: () => ({
    // Endpoints base podem ser definidos aqui se necessário
  }),
});
