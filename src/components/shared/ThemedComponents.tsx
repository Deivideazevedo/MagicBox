"use client";

import { useTheme } from "@mui/material/styles";
import { Box, BoxProps, styled, keyframes } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { alpha } from "@mui/system";

// Componente estilizado que responde ao tema
interface ThemedHeroSectionProps extends BoxProps {
  density?: number; // Ex: 1, 2, 5, 10...
}

// Função para gerar círculos aleatórios baseados na densidade
const generateCircles = () => {
  const allCircles = [
    // --- Distribuição no topo (0 a 30) ---
    // Faixa 0-10 (Bem no topo)
    `<circle cx="5" cy="8" r="0.9" fill="white" opacity="0.12"/>`,
    `<circle cx="20" cy="3" r="1.1" fill="white" opacity="0.08"/>`,
    `<circle cx="45" cy="5" r="0.6" fill="white" opacity="0.06"/>`,
    `<circle cx="65" cy="9" r="0.8" fill="white" opacity="0.1"/>`,
    `<circle cx="88" cy="4" r="1.2" fill="white" opacity="0.07"/>`,

    // Faixa 10-20 (Meio do topo)
    `<circle cx="30" cy="15" r="0.7" fill="white" opacity="0.1"/>`,
    `<circle cx="40" cy="10" r="1.3" fill="white" opacity="0.11"/>`,
    `<circle cx="30" cy="12" r="0.5" fill="white" opacity="0.05"/>`,
    `<circle cx="55" cy="14" r="1.0" fill="white" opacity="0.15"/>`,
    `<circle cx="95" cy="11" r="0.8" fill="white" opacity="0.09"/>`,

    // Faixa 20-30 (Limite inferior da decoração)
    `<circle cx="8" cy="28" r="0.6" fill="white" opacity="0.06"/>`,
    `<circle cx="25" cy="24" r="0.9" fill="white" opacity="0.13"/>`,
    `<circle cx="48" cy="29" r="1.1" fill="white" opacity="0.07"/>`,
    `<circle cx="70" cy="22" r="0.7" fill="white" opacity="0.12"/>`,
    `<circle cx="82" cy="27" r="1.4" fill="white" opacity="0.08"/>`,
    `<circle cx="18" cy="21" r="0.5" fill="white" opacity="0.05"/>`,
    `<circle cx="40" cy="14" r="0.8" fill="white" opacity="0.09"/>`,
    `<circle cx="60" cy="26" r="0.4" fill="white" opacity="0.06"/>`,
    `<circle cx="92" cy="19" r="1.1" fill="white" opacity="0.1"/>`,
  ];

  return allCircles.join("");
};

export const ThemedHeroSection = styled(Box)(({ theme }) => {
  const circles = generateCircles();

  return {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    borderRadius: 0,
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    // Eleva o conteúdo acima da decoração de bolinhas, sem precisar de wrapper.
    "& > *": { position: "relative", zIndex: 1 },
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      // Decoração não captura cliques.
      pointerEvents: "none",
      backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${circles}</svg>')`,
    },
  };
});

// Animação das bolinhas flutuantes do hero da landing ('/').
const driftDots = keyframes`
  0%   { background-position: 0 0, 55px 25px; }
  50%  { background-position: 80px 50px, 10px 75px; }
  100% { background-position: 0 0, 55px 25px; }
`;

/**
 * Fundo do hero usado na landing ('/'): gradiente de 3 paradas
 * (primary.main → primary.dark → secondary.dark) + padrão de bolinhas
 * animadas. Aceita children — eles são elevados automaticamente acima da
 * decoração (`& > *` recebe z-index), então o consumidor não precisa se
 * preocupar com empilhamento. Layout (padding, flex, borderRadius) fica a
 * cargo do `sx` passado.
 */
export const HeroGradientLanding = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  color: theme.palette.primary.contrastText,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%, ${alpha(
    theme.palette.secondary.dark,
    0.9,
  )} 100%)`,
  "& > *": { position: "relative", zIndex: 1 },
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: `
      radial-gradient(circle, ${alpha("#fff", 0.22)} 2px, transparent 2.5px),
      radial-gradient(circle, ${alpha("#fff", 0.12)} 1.5px, transparent 2px)
    `,
    backgroundSize: "130px 130px, 190px 190px",
    backgroundPosition: "0 0, 55px 25px",
    animation: `${driftDots} 22s linear infinite`,
  },
}));

/**
 * Fork do HeroGradientLanding: herda tudo (bolinhas animadas, z-index dos
 * children, etc.) e só troca o gradiente para o de 2 paradas do
 * ThemedHeroSection (primary.main → primary.dark).
 */
export const HeroGradientLandingNew = styled(HeroGradientLanding)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
}));

export const ThemedCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-4px)",
  },
}));

export const ThemedFeatureCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 3,
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    // Use alpha() do MUI para o boxShadow ficar mais limpo
    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.12)}`,
    transform: "translateY(-8px)", // Um pouco mais de movimento para o feedback ser claro
  },
  transition: "all 0.3s ease",
}));

// Hook para obter informações do tema
export const useCustomTheme = () => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);

  return {
    theme,
    isDarkMode: customizer.activeMode === "dark",
    isLightMode: customizer.activeMode === "light",
    activeTheme: customizer.activeTheme,
  };
};
