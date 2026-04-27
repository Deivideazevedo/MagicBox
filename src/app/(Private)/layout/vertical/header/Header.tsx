import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material/styles";
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
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";
import Notifications from "./Notification";
import Profile from "./Profile";
import Search from "./Search";
import { AppState } from "@/store/store";
import Navigation from "./Navigation";
import MobileRightSidebar from "./MobileRightSidebar";

import { usePathname } from "next/navigation";
import { ProductTourButton } from "@/app/components/shared/ProductTour";

const Header = () => {
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  // drawer
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const isDashboard = pathname === "/dashboard";

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

  // Logica de Fullscreen Real (F11)
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullScreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullScreen(false));
      }
    }
  };

  // Monitorar mudanças externas (ex: Esc ou F11 do teclado)
  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

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
          {/* Dashboard Tour Button */}
          {/* ------------------------------------------- */}
          {isDashboard && (
            <ProductTourButton 
              onClick={() => window.dispatchEvent(new CustomEvent("start-dashboard-tour"))}
              title="Tour do Dashboard"
              size="small"
            />
          )}

          {/* ------------------------------------------- */}
          {/* Toggle Fullscreen Button (Real F11) */}
          {/* ------------------------------------------- */}
          {lgUp && (
            <IconButton
              size="large"
              color="inherit"
              aria-label="fullscreen"
              onClick={toggleFullScreen}
              sx={{
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "primary.light",
                },
              }}
            >
              {isFullScreen ? (
                <IconMinimize size="22" stroke="1.5" />
              ) : (
                <IconMaximize size="22" stroke="1.5" />
              )}
            </IconButton>
          )}

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
