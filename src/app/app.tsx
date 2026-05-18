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
import { AppState } from "@/store/store";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import RecaptchaProvider from "@/app/components/shared/RecaptchaProvider";

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

          border: "1px solid",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 500,
          padding: "12px 40px 12px 16px",
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
            boxShadow: `0 4px 18px ${alpha(theme.palette.success.main, 0.25)}`,
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
            boxShadow: `0 4px 18px ${alpha(theme.palette.error.main, 0.25)}`,
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
        <RecaptchaProvider>
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
                </ConfirmDialogProvider>
              </LocalizationProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </RecaptchaProvider>
      </SessionProvider>
    </>
  );
};

export default MyApp;
