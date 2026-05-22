"use client";

import React from "react";
import { Tooltip, alpha, Box, Button } from "@mui/material";
import { IconSparkles } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PulsingIconButton, { combinedHighlight } from "@/components/shared/PulsingIconButton";

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
  const isPulseEnabled = useSelector((state: AppState) => state.customizer.isPulseEnabled ?? true);
  const shouldPulse = pulse && isPulseEnabled;

  if (variant === "text") {
    return (
      <Tooltip title={title} arrow placement="top">
        <Button
          ref={buttonRef}
          variant="contained"
          onClick={onClick}
          color={color}
          startIcon={
            <Box sx={{ display: "flex" }}>
              <IconSparkles size={iconSize} />
            </Box>
          }
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 2,
            py: 1,
            animation: shouldPulse
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
    <PulsingIconButton
      ref={buttonRef}
      onClick={onClick}
      color={color}
      size={size}
      pulse={pulse}
      tooltipTitle={title}
    >
      <Box sx={{ display: "flex" }}>
        <IconSparkles size={iconSize} stroke={1.5} />
      </Box>
    </PulsingIconButton>
  );
};

export default ProductTourButton;
