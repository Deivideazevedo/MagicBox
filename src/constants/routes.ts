// Routes constants for centralized URL management
export const ROUTES = {
  // Public routes
  HOME: "/",
  ABOUT: "/about",
  
  // Auth routes
  AUTH: {
    LOGIN: "/auth/auth1/login",
    LOGOUT: "/auth/logout",
    ERROR: "/auth/error",
  },
  
  // Private/Dashboard routes
  DASHBOARD: {
    HOME: "/dashboard",
    CADASTROS: "/dashboard/cadastros",
    LANCAMENTOS: "/dashboard/lancamentos", 
    EXTRATO: "/dashboard/extrato",
    RELATORIOS: "/dashboard/relatorios",
    PERFIL: "/dashboard/perfil",
    CONFIGURACOES: "/dashboard/configuracoes",
    AJUDA: "/dashboard/ajuda",
  },
  
  // API routes
  API: {
    AUTH: "/api/auth",
    GOALS: "/api/goals",
    DESPESAS: "/api/despesas",
    CONTAS: "/api/contas", 
    LANCAMENTOS: "/api/lancamentos",
  },
} as const;

// Navigation menu items
export const NAVIGATION_ITEMS = [
  {
    id: "dashboard",
    title: "Dashboard", 
    href: ROUTES.DASHBOARD.HOME,
    description: "Visão geral das suas finanças",
  },
  {
    id: "lancamentos",
    title: "Lançamentos",
    href: ROUTES.DASHBOARD.LANCAMENTOS,
    description: "Registrar novas transações",
  },
  {
    id: "extrato", 
    title: "Extrato",
    href: ROUTES.DASHBOARD.EXTRATO,
    description: "Histórico de transações",
  },
  {
    id: "relatorios",
    title: "Relatórios", 
    href: ROUTES.DASHBOARD.RELATORIOS,
    description: "Análises e gráficos financeiros",
  },
  {
    id: "cadastros",
    title: "Cadastros",
    href: ROUTES.DASHBOARD.CADASTROS, 
    description: "Configurar contas e categorias",
  },
] as const;