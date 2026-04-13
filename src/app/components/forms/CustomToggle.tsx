"use client";

import { Box, Switch, Typography, alpha } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { ReactNode } from "react";

type ColorType =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success";

interface CustomToggleProps {
  control: Control<any>;
  name: string;
  color?: ColorType;
  variant?: "checkbox" | "switch";
  iconActive?: ReactNode;
  iconInactive?: ReactNode;
  titleActive: string;
  titleInactive: string;
  descriptionActive?: string;
  descriptionInactive?: string;
  activeValue?: any;
  inactiveValue?: any;
}

export default function CustomToggle({
  control,
  name,
  color = "primary",
  variant = "checkbox",
  iconActive,
  titleActive,
  titleInactive,
  descriptionActive,
  descriptionInactive,
  activeValue = true,
  inactiveValue = false,
}: CustomToggleProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        // Verifica se o valor atual é o valor ativo. 
        // Se o valor for undefined ou null, assume o valor inativo por padrão.
        const isActive = field.value === activeValue;
        
        const handleToggle = () => {
          const nextValue = isActive ? inactiveValue : activeValue;
          field.onChange(nextValue);
        };

        return (
          <Box
            tabIndex={0}
            role="button"
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                handleToggle();
              }
            }}
            sx={{
              display: "flex",
            alignItems: "center",
            gap: 1.5,
            py: 1,
            px: 1.5,
            borderRadius: 1,
            cursor: "pointer",
            transition: 'ease-in-out 0.2s ease',
            border: "1px solid",
            borderColor: isActive
              ? (theme) => alpha(theme.palette[color].main, 0.3)
              : "divider",
            backgroundColor: isActive
              ? (theme) => alpha(theme.palette[color].main, 0.04)
              : "transparent",
            // Estilos de foco visual para acessibilidade
            "&:focus-visible,&:focus": {
              outline: "1.5px solid",
              outlineColor: (theme) => theme.palette[color].main,
              borderColor: (theme) => `${theme.palette[color].main} !important`,
            },
            // Mantemos o hover original
            "&:hover": {
              borderColor: (theme) => alpha(theme.palette[color].main, 0.4),
              backgroundColor: (theme) =>
                alpha(theme.palette[color].main, 0.02),
            },
          }}
        >
          {variant === "checkbox" ? (
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 0.5,
                border: "2px solid",
                borderColor: isActive ? `${color}.main` : "grey.400",
                backgroundColor: isActive ? `${color}.main` : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
                "&:focus": {
                  border: `2px solid  ${color}.main`,
                },
                "&:hover": {
                  borderColor: (theme) => theme.palette[color].main,
                  backgroundColor: (theme) =>
                    alpha(theme.palette[color].main, 0.02),
                },
              }}
            >
              {isActive && iconActive}
            </Box>
          ) : (
            <Switch
              checked={isActive}
              color={color}
              size="small"
              // Removemos o foco do switch interno para focar apenas no container Box
              tabIndex={-1}
              readOnly
              sx={{ ml: -0.5, pointerEvents: 'none' }} // Deixa o clique passar para o Box pai
            />
          )}

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              color={isActive ? `${color}.main` : "text.primary"}
            >
              {isActive ? titleActive : titleInactive}
            </Typography>
            {(descriptionActive || descriptionInactive) && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.3 }}
              >
                {isActive ? descriptionActive : descriptionInactive}
              </Typography>
            )}
          </Box>
        </Box>
      );
    }}
  />
  );
}