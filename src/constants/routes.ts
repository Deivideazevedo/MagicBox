/**
 * Centralized route constants for the MagicBox application
 * This helps prevent hardcoded routes throughout the application
 */

export const ROUTES = {
  // Authentication routes
  AUTH: {
    LOGIN: '/auth/auth1/login',
    REGISTER: '/auth/auth1/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  
  // Main application routes
  DASHBOARD: '/dashboard',
  
  // Private routes
  LANCAMENTOS: '/dashboard/lancamentos',
  EXTRATO: '/dashboard/extrato',
  RELATORIOS: '/dashboard/relatorios',
  CONTAS: '/dashboard/contas',
  DESPESAS: '/dashboard/despesas',
  
  // Public routes
  HOME: '/',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];