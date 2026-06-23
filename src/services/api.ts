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

// Evita múltiplos redirects quando várias queries falham com 401 ao mesmo tempo.
let encerrandoSessao = false;

/**
 * Sessão inválida/expirada detectada numa chamada de API: apenas INVALIDA a
 * sessão do NextAuth (limpa o cookie) sem navegar. Ao virar "unauthenticated",
 * o AuthGuard assume o redirect para o login com o callbackUrl correto — assim
 * existe um único dono da navegação e nenhuma corrida entre as camadas.
 * Roda apenas no cliente e é idempotente dentro do mesmo ciclo de página.
 */
async function encerrarSessaoExpirada() {
  if (encerrandoSessao || typeof window === "undefined") return;
  // Já estamos no fluxo de login? Não faz nada para evitar trabalho redundante.
  if (window.location.pathname.startsWith("/auth/login")) return;

  encerrandoSessao = true;
  const { signOut } = await import("next-auth/react");
  await signOut({ redirect: false });
}

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
          message = "Sua sessão expirou. Redirecionando para o login...";
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

    // Sessão inválida/expirada: independente da mensagem do backend, encerra a
    // sessão e manda para o login (fecha o estado "zumbi" de página logada com
    // API negando acesso).
    if (result.error.status === 401) {
      message = "Sua sessão expirou. Redirecionando para o login...";
      void encerrarSessaoExpirada();
    }

    // Mostrar notificação para o usuário
    import("react-hot-toast").then(({ toast }) => {
      toast.error(message, { id: message });
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
  keepUnusedDataFor: 300, // Mantém dados por 5 minutos se não houver componentes montados
  refetchOnMountOrArgChange: 300, // Revalida automaticamente se o cache for mais antigo que 5 min ao montar
  // refetchOnFocus: true, // Revalida quando a janela ganha foco
  refetchOnReconnect: true, // Revalida quando a conexão é recuperada
  baseQuery: baseQueryInterceptor,
  tagTypes: [
    "Categorias",
    "Contas",
    "Despesas",
    "Lancamentos",
    "Dashboard",
    "Receita",
    "Resumo",
    "Users",
    "Objetivos",
    "Dividas",
    "Relatorios",
    "Disparos",
    "Notificacoes",
    "PreferenciaNotificacao",
  ],
  endpoints: () => ({}), // Endpoints serão injetados nos arquivos de serviço específicos
});

export const enhancedApi = api.enhanceEndpoints({
  endpoints: () => ({
    // Endpoints base podem ser definidos aqui se necessário
  }),
});
