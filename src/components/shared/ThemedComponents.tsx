"use client";

import { useTheme } from "@mui/material/styles";
import { Box, styled } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { alpha } from "@mui/system";

// Componente estilizado que responde ao tema
export const ThemedHeroSection = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.primary.dark} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  textAlign: "center",
  py: { xs: 8, md: 12 },
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"10\" cy=\"10\" r=\"1\" fill=\"white\" opacity=\"0.05\"/><circle cx=\"30\" cy=\"20\" r=\"0.5\" fill=\"white\" opacity=\"0.08\"/><circle cx=\"50\" cy=\"30\" r=\"1.5\" fill=\"white\" opacity=\"0.05\"/><circle cx=\"70\" cy=\"15\" r=\"1\" fill=\"white\" opacity=\"0.1\"/><circle cx=\"90\" cy=\"25\" r=\"0.8\" fill=\"white\" opacity=\"0.05\"/></svg>')"
      : "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"10\" cy=\"10\" r=\"1\" fill=\"white\" opacity=\"0.1\"/><circle cx=\"30\" cy=\"20\" r=\"0.5\" fill=\"white\" opacity=\"0.15\"/><circle cx=\"50\" cy=\"30\" r=\"1.5\" fill=\"white\" opacity=\"0.1\"/><circle cx=\"70\" cy=\"15\" r=\"1\" fill=\"white\" opacity=\"0.2\"/><circle cx=\"90\" cy=\"25\" r=\"0.8\" fill=\"white\" opacity=\"0.1\"/></svg>')"
  }
}));

export const ThemedCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-4px)',
  }
}));

export const ThemedFeatureCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  textAlign: 'center',
  height: '100%',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    // Use alpha() do MUI para o boxShadow ficar mais limpo
    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.12)}`,
    transform: 'translateY(-8px)', // Um pouco mais de movimento para o feedback ser claro
  },
  transition: "all 0.3s ease"
}));

// Hook para obter informações do tema
export const useCustomTheme = () => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);
  
  return {
    theme,
    isDarkMode: customizer.activeMode === 'dark',
    isLightMode: customizer.activeMode === 'light',
    activeTheme: customizer.activeTheme,
  };
};