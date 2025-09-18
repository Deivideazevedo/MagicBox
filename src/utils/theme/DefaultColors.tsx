const baselightTheme = {
  direction: 'ltr',
  palette: {
    primary: {
      main: '#6366F1', // Indigo moderno
      light: '#E0E7FF',
      dark: '#4F46E5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06B6D4', // Cyan vibrante
      light: '#CFFAFE',
      dark: '#0891B2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981', // Emerald
      light: '#D1FAE5',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3B82F6', // Blue
      light: '#DBEAFE',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444', // Red
      light: '#FEE2E2',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FEF3C7',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    purple: {
      A50: '#F3E8FF',
      A100: '#8B5CF6',
      A200: '#7C3AED',
    },
    // Gradientes modernos
    gradient: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      info: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      warning: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    },
    // Cores para financeiro
    financial: {
      income: '#10B981', // Verde para receitas
      expense: '#EF4444', // Vermelho para despesas
      investment: '#8B5CF6', // Roxo para investimentos
      saving: '#06B6D4', // Azul para poupança
      neutral: '#6B7280', // Cinza para neutro
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    action: {
      active: '#6366F1',
      hover: 'rgba(99, 102, 241, 0.04)',
      selected: 'rgba(99, 102, 241, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      focus: 'rgba(99, 102, 241, 0.12)',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
      neutral: '#F9FAFB',
    },
    // Cores de status
    status: {
      paid: '#10B981',
      pending: '#F59E0B',
      overdue: '#EF4444',
      scheduled: '#06B6D4',
      cancelled: '#6B7280',
    },
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    '0px 3px 6px rgba(0, 0, 0, 0.15), 0px 2px 4px rgba(0, 0, 0, 0.12)',
    '0px 6px 12px rgba(0, 0, 0, 0.15), 0px 4px 8px rgba(0, 0, 0, 0.12)',
    '0px 12px 24px rgba(0, 0, 0, 0.15), 0px 8px 16px rgba(0, 0, 0, 0.12)',
    '0px 16px 32px rgba(0, 0, 0, 0.15), 0px 12px 24px rgba(0, 0, 0, 0.12)',
    '0px 24px 48px rgba(0, 0, 0, 0.15), 0px 16px 32px rgba(0, 0, 0, 0.12)',
  ],
};

const baseDarkTheme = {
  direction: 'ltr',
  palette: {
    primary: {
      main: '#818CF8', // Indigo claro para dark mode
      light: '#C7D2FE',
      dark: '#6366F1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#22D3EE', // Cyan claro
      light: '#67E8F9',
      dark: '#06B6D4',
      contrastText: '#000000',
    },
    success: {
      main: '#34D399', // Emerald claro
      light: '#6EE7B7',
      dark: '#10B981',
      contrastText: '#000000',
    },
    info: {
      main: '#60A5FA', // Blue claro
      light: '#93C5FD',
      dark: '#3B82F6',
      contrastText: '#000000',
    },
    error: {
      main: '#F87171', // Red claro
      light: '#FCA5A5',
      dark: '#EF4444',
      contrastText: '#000000',
    },
    warning: {
      main: '#FBBF24', // Amber claro
      light: '#FCD34D',
      dark: '#F59E0B',
      contrastText: '#000000',
    },
    purple: {
      A50: '#1E1B4B',
      A100: '#A78BFA',
      A200: '#8B5CF6',
    },
    // Gradientes para dark mode
    gradient: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      info: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      warning: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      glass: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    },
    // Cores para financeiro no dark mode
    financial: {
      income: '#34D399',
      expense: '#F87171',
      investment: '#A78BFA',
      saving: '#22D3EE',
      neutral: '#9CA3AF',
    },
    grey: {
      50: '#1F2937',
      100: '#374151',
      200: '#4B5563',
      300: '#6B7280',
      400: '#9CA3AF',
      500: '#D1D5DB',
      600: '#E5E7EB',
      700: '#F3F4F6',
      800: '#F9FAFB',
      900: '#FFFFFF',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      disabled: '#6B7280',
    },
    action: {
      active: '#818CF8',
      hover: 'rgba(129, 140, 248, 0.08)',
      selected: 'rgba(129, 140, 248, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      focus: 'rgba(129, 140, 248, 0.16)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    background: {
      default: '#0F172A', // Slate 900
      paper: '#1E293B',   // Slate 800
      neutral: '#334155', // Slate 700
    },
    // Cores de status para dark mode
    status: {
      paid: '#34D399',
      pending: '#FBBF24',
      overdue: '#F87171',
      scheduled: '#22D3EE',
      cancelled: '#9CA3AF',
    },
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.24), 0px 1px 2px rgba(0, 0, 0, 0.36)',
    '0px 3px 6px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.24)',
    '0px 6px 12px rgba(0, 0, 0, 0.3), 0px 4px 8px rgba(0, 0, 0, 0.24)',
    '0px 12px 24px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.24)',
    '0px 16px 32px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.24)',
    '0px 24px 48px rgba(0, 0, 0, 0.3), 0px 16px 32px rgba(0, 0, 0, 0.24)',
  ],
};

export { baseDarkTheme, baselightTheme };


