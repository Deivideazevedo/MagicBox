"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import Header from "./layout/vertical/header/Header";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import dynamic from "next/dynamic";
import GlobalLancamentoButton from "./layout/shared/GlobalLancamentoButton";

import GlobalChatFab from "./layout/shared/GlobalChat/GlobalChatFab";

const Customizer = dynamic(() => import("./layout/shared/customizer/Customizer"), {
  ssr: false,
});
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  // Evita que qualquer conteúdo largo (tabelas, etc.) gere scroll horizontal e
  // exponha o fundo do body à direita em telas menores.
  maxWidth: "100vw",
  overflowX: "hidden",
}));

const PageWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  // `min-width: 0` permite que este flex item encolha abaixo da largura
  // intrínseca do conteúdo (padrão flex é `auto`), em vez de empurrar o layout.
  minWidth: 0,
  // backgroundColor: 'transparent',
  background: theme.palette.grey[100],
}));

interface Props {
  children: React.ReactNode;
}

import AuthGuard from "@/app/components/auth/AuthGuard";

// ... (styled components permanentes)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  return (
    <AuthGuard>
      <MainWrapper>
        {/* ------------------------------------------- */}
        {/* Sidebar */}
        {/* ------------------------------------------- */}
        <Sidebar />
        {/* ------------------------------------------- */}
        {/* Main Wrapper */}
        {/* ------------------------------------------- */}
        <PageWrapper
          className="page-wrapper"
          sx={{
            ...(customizer.isCollapse && {
              [theme.breakpoints.up("lg")]: {
                ml: `${customizer.MiniSidebarWidth}px`,
              },
            }),
          }}
        >
          {/* ------------------------------------------- */}
          {/* Header */}
          {/* ------------------------------------------- */}
          <Header />
          <Container
            disableGutters
            sx={{
              maxWidth:
                customizer.isLayout === "boxed" ? "lg" : "100%!important",
              px: { xs: 1.5, sm: 3 }, // Padding horizontal reduzido no mobile
            }}
          >
            {/* ------------------------------------------- */}
            {/* PageContent */}
            {/* ------------------------------------------- */}

            <Box
              sx={{
                minHeight: "calc(100vh - 170px)",
                paddingTop: { xs: 2, sm: 4 }, // Padding vertical reduzido no mobile
                paddingBottom: { xs: 2, sm: 4 },
              }}
            >
              {/* <Outlet /> */}
              {children}
              {/* <Index /> */}
            </Box>

            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}
          </Container>
          {customizer.isCustomizerOpen && <Customizer />}
          <GlobalLancamentoButton />
          <GlobalChatFab />
        </PageWrapper>
      </MainWrapper>
    </AuthGuard>
  );
}
