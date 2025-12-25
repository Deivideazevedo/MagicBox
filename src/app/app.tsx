"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import RTL from "@/app/(Private)/layout/shared/customizer/RTL";
import { ThemeSettings } from "@/utils/theme/Theme";
import { useSelector } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import ptBR from "date-fns/locale/pt-BR";
import { ptBR as muiPtBR } from "@mui/x-date-pickers/locales";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { AppState } from "@/store/store";
import "@/app/api/index";

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
              <RTL direction={customizer.activeDir}>
                <CssBaseline />
                {children}
              </RTL>
            </LocalizationProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </SessionProvider>
    </>
  );
};

export default MyApp;
