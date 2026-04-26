"use client";

import React from "react";
import {
  IconButton,
  Tooltip,
  alpha,
  keyframes,
  Box,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { IconSparkles } from "@tabler/icons-react";

// Animação combinada: Balanço (15%) + Pulso (35%) + Pausa (50%)
// Total de 6 segundos: 3s de animação ativa e 3s de repouso
const combinedHighlight = keyframes`
  0% { transform: rotate(0deg) scale(1); box-shadow: 0 0 0 0 rgba(93, 135, 255, 0); }
  5% { transform: rotate(10deg) scale(1.1); }
  10% { transform: rotate(-10deg) scale(1.1); }
  15% { transform: rotate(0deg) scale(1); }
  /* Início do Pulso (ocorre logo após o balanço) */
  16% { box-shadow: 0 0 0 0 rgba(93, 135, 255, 0.5); }
  45% { box-shadow: 0 0 0 8px rgba(93, 135, 255, 0); }
  50%, 100% { box-shadow: 0 0 0 0 rgba(93, 135, 255, 0); transform: rotate(0deg) scale(1); }
`;

interface ProductTourButtonProps {
  /** Função disparada ao clicar para iniciar o tour */
  onClick: () => void;
  /** Texto explicativo do tooltip */
  title?: string;
  /** Variante do botão: 'icon' (circulo pequeno) ou 'text' (botão com label) */
  variant?: "icon" | "text";
  /** Cor base do tema (padrão 'primary') */
  color?: "primary" | "secondary" | "info" | "success" | "warning";
  /** Tamanho do componente */
  size?: "small" | "medium" | "large";
  /** Se deve forçar o início da animação de pulso */
  pulse?: boolean;
  /** Referência para o botão ser destacado no tour */
  buttonRef?: React.Ref<any>;
}

/**
 * Componente padronizado para gatilho de Tours de Produto.
 * Inclui animação de pulso automática para chamar atenção do usuário.
 */
export const ProductTourButton: React.FC<ProductTourButtonProps> = ({
  onClick,
  title = "Ver instruções da página",
  variant = "icon",
  color = "primary",
  size = "medium",
  pulse = true,
  buttonRef,
}) => {
  const iconSize = size === "small" ? 18 : size === "large" ? 28 : 22;

  if (variant === "text") {
    return (
      <Tooltip title={title} arrow placement="top">
        <Button
          ref={buttonRef}
          variant="contained"
          onClick={onClick}
          color={color}
          startIcon={
            <Box
              sx={{
                display: "flex",
              }}
            >
              <IconSparkles size={iconSize} />
            </Box>
          }
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 2,
            py: 1,
            animation: pulse
              ? `${combinedHighlight} 6s ease-in-out infinite`
              : "none",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: (theme) =>
                `0 6px 20px ${alpha(theme.palette[color].main, 0.4)}`,
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          Iniciar Tour
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={title} arrow>
      <IconButton
        ref={buttonRef}
        onClick={onClick}
        sx={{
          width: size === "small" ? 32 : size === "large" ? 48 : 40,
          height: size === "small" ? 32 : size === "large" ? 48 : 40,
          color: `${color}.main`,
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
          animation: pulse
            ? `${combinedHighlight} 6s ease-in-out infinite`
            : "none",
          "&:hover": {
            bgcolor: (theme) => theme.palette[color].main,
            color: "#fff",
            transform: "scale(1.1) rotate(15deg)",
          },
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
          }}
        >
          <IconSparkles size={iconSize} stroke={1.5} />
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ProductTourButton;
