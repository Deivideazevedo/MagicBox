"use client";
import { ThemeSettings } from "@/utils/theme/Theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, alpha, useTheme } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

import { ptBR as muiPtBR } from "@mui/x-date-pickers/locales";
import ptBR from "date-fns/locale/pt-BR";

import "@/app/api/index";
import { ConfirmDialogProvider } from "@/components/shared/ConfirmDialog";
import PwaInstallPrompt from "@/components/shared/PwaInstallPrompt";
import PromptNotificacoesPush from "@/components/shared/PromptNotificacoesPush";
import { AppState } from "@/store/store";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";


// Toaster configurado com as cores do tema
const ThemeToaster = () => {
  const theme = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 500,
          padding: "12px 40px 12px 16px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.31), 0 0 6px 1px rgba(0,0,0,0.06)", // Glow neutro bem retido e colado na borda
        },
        loading: {
          iconTheme: {
            primary: theme.palette.primary.main,
            secondary: "#fff",
          },
        },
        success: {
          iconTheme: {
            primary: theme.palette.success.main,
            secondary: "#fff",
          },
          style: {
            borderColor: alpha(theme.palette.success.main, 0.25),
            borderLeft: `6px solid ${theme.palette.success.main}`,
            boxShadow: `0 0 1px 0 ${alpha(theme.palette.success.main, 0.35)}, 0 0 6px 0.5px ${alpha(theme.palette.success.main, 0.22)}`, // Glow verde retido e denso rente à borda
          },
        },
        error: {
          iconTheme: {
            primary: theme.palette.error.main,
            secondary: "#fff",
          },
          style: {
            borderColor: alpha(theme.palette.error.main, 0.25),
            borderLeft: `6px solid ${theme.palette.error.main}`,
            boxShadow: `0 0 1px 0 ${alpha(theme.palette.error.main, 0.35)}, 0 0 6px 0.5px ${alpha(theme.palette.error.main, 0.22)}`, // Glow vermelho retido e denso rente à borda
          },
        },
      }}
    />
  );
};

const MyApp = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) => {
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <>
      <SessionProvider session={session}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
              localeText={
                muiPtBR.components.MuiLocalizationProvider.defaultProps
                  .localeText
              }
            >
              <ConfirmDialogProvider>
                <CssBaseline />
                {children}
                <ThemeToaster />
                <PwaInstallPrompt />
                <PromptNotificacoesPush />
              </ConfirmDialogProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </SessionProvider>
    </>
  );
};

export default MyApp;
