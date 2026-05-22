"use client";

import React from "react";
import { IconButton, IconButtonProps, Tooltip, alpha, keyframes } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

// Animação combinada: Balanço (15%) + Pulso (35%) + Pausa (50%)
// Total de 6 segundos: 3s de animação ativa e 3s de repouso
export const combinedHighlight = keyframes`
  0% { transform: rotate(0deg) scale(1); box-shadow: 0 0 0 0 rgba(93, 135, 255, 0); }
  5% { transform: rotate(10deg) scale(1.1); }
  10% { transform: rotate(-10deg) scale(1.1); }
  15% { transform: rotate(0deg) scale(1); }
  /* Início do Pulso (ocorre logo após o balanço) */
  16% { box-shadow: 0 0 0 0 var(--pulse-color, rgba(93, 135, 255, 0.5)); }
  45% { box-shadow: 0 0 0 8px rgba(93, 135, 255, 0); }
  50%, 100% { box-shadow: 0 0 0 0 var(--pulse-color, rgba(93, 135, 255, 0)); transform: rotate(0deg) scale(1); }
`;

export interface PulsingIconButtonProps extends Omit<IconButtonProps, "color" | "size"> {
  /** Cor do tema que direciona o visual e o pulso. Padrão: 'primary' */
  color?: "primary" | "secondary" | "info" | "success" | "warning" | "error";
  /** Tamanho do componente: 'small', 'medium', 'large' */
  size?: "small" | "medium" | "large";
  /** Título do Tooltip. Se fornecido, envolve o botão com Tooltip */
  tooltipTitle?: string;
  /** Se o pulso deve estar habilitado localmente. Padrão: true (ainda respeita o estado global do customizer) */
  pulse?: boolean;
  /** Elemento interno (normalmente o ícone) */
  children: React.ReactNode;
}

/**
 * Componente unificado de botão de ícone com efeito de pulsar e balanço elástico.
 * Respeita a preferência global de movimento (isPulseEnabled) definida no Customizer do Redux.
 */
export const PulsingIconButton = React.forwardRef<HTMLButtonElement, PulsingIconButtonProps>(
  (
    {
      color = "primary",
      size = "medium",
      tooltipTitle,
      pulse = true,
      children,
      onClick,
      sx,
      ...props
    },
    ref
  ) => {
    const isPulseEnabled = useSelector((state: AppState) => state.customizer.isPulseEnabled ?? true);
    const shouldPulse = pulse && isPulseEnabled;

    const btn = (
      <IconButton
        ref={ref}
        onClick={onClick}
        sx={{
          width: size === "small" ? 32 : size === "large" ? 48 : 40,
          height: size === "small" ? 32 : size === "large" ? 48 : 40,
          borderRadius: "50%",
          color: `${color}.main`,
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
          "--pulse-color": (theme) => alpha(theme.palette[color].main, 0.4),
          animation: shouldPulse ? `${combinedHighlight} 6s ease-in-out infinite` : "none",
          "&:hover": {
            bgcolor: (theme) => theme.palette[color].main,
            color: "#fff",
            transform: "scale(1.1) rotate(15deg)",
          },
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          ...sx,
        }}
        {...props}
      >
        {children}
      </IconButton>
    );

    if (tooltipTitle) {
      return (
        <Tooltip title={tooltipTitle} arrow>
          {btn}
        </Tooltip>
      );
    }

    return btn;
  }
);

PulsingIconButton.displayName = "PulsingIconButton";

export default PulsingIconButton;
