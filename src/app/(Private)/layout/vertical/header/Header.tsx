import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, keyframes } from "@mui/material/styles";
import { useSelector, useDispatch } from "@/store/hooks";
import {
  toggleSidebar,
  toggleMobileSidebar,
  setDarkMode,
  toggleLayout,
} from "@/store/customizer/CustomizerSlice";
import {
  IconMenu2,
  IconMoon,
  IconSun,
  IconTrendingUp,
  IconRefresh,
  IconLoader2,
} from "@tabler/icons-react";
import { api } from "@/services/api";
import { persistor } from "@/store/store";
import { SwalToast } from "@/utils/swalert";
import Notifications from "./Notification";
import Profile from "./Profile";
import Search from "./Search";
import { AppState } from "@/store/store";
import Navigation from "./Navigation";
import MobileRightSidebar from "./MobileRightSidebar";

import { usePathname } from "next/navigation";
import { ProductTourButton } from "@/app/components/shared/ProductTour";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
`;

const Header = () => {
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  // drawer
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();


  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    borderBottom: "1px solid",
    borderBottomColor: theme.palette.divider,
    [theme.breakpoints.up("lg")]: {
      minHeight: customizer.TopbarHeight,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  // Logica de Sincronização Manual
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);

      // Reseta o estado da API (limpa o cache e refaz queries ativas)
      dispatch(api.util.resetApiState());

      // Persiste o estado atual (vazio/resetado) no storage
      await persistor.flush();

      // Pequeno delay para a animação ser visível e o cache atualizar
      setTimeout(() => {
        setIsSyncing(false);
        SwalToast.fire({
          icon: "success",
          title: "Dados sincronizados com sucesso!",
        });
      }, 800);
    } catch (error) {
      setIsSyncing(false);
      console.error("Erro ao sincronizar:", error);
    }
  };

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* ------------------------------------------- */}
        {/* Toggle Button Sidebar */}
        {/* ------------------------------------------- */}
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={
            lgUp
              ? () => dispatch(toggleSidebar())
              : () => dispatch(toggleMobileSidebar())
          }
          sx={{
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "primary.light",
            },
          }}
        >
          <IconMenu2 size="20" />
        </IconButton>

        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        <Search />

        {lgUp ? (
          <>
            <Navigation />
          </>
        ) : null}

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">

          {/* ------------------------------------------- */}
          {/* Botão de Sincronização Manual */}
          {/* ------------------------------------------- */}
          {/* {lgUp && ( */}
          <IconButton
            size="large"
            color="inherit"
            aria-label="sync"
            onClick={handleSync}
            disabled={isSyncing}
            sx={{
              "&:hover": {
                backgroundColor: "primary.light",
              },
              "& svg": {
                animation: isSyncing ? `${rotate} 1s linear infinite` : "none",
              },
            }}
          >
            <IconRefresh size="20" stroke="1.6" />
          </IconButton>
          {/* )} */}

          {/* ------------------------------------------- */}
          {/* Dark/Light Mode Toggle */}
          {/* ------------------------------------------- */}
          <IconButton
            size="large"
            color="inherit"
            sx={{
              "&:hover": {
                backgroundColor: "primary.light",
              },
            }}
            onClick={() =>
              dispatch(
                setDarkMode(
                  customizer.activeMode === "light" ? "dark" : "light",
                ),
              )
            }
          >
            {customizer.activeMode === "light" ? (
              <IconMoon size="20" stroke="1.5" />
            ) : (
              <IconSun size="20" stroke="1.5" />
            )}
          </IconButton>

          <Notifications />

          {/* ------------------------------------------- */}
          {/* Toggle Right Sidebar for mobile */}
          {/* ------------------------------------------- */}
          {lgDown ? <MobileRightSidebar /> : null}

          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
