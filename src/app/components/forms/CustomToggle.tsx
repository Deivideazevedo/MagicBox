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
}: CustomToggleProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box
          // AQUI ESTÁ A MÁGICA:
          // tabIndex={0} torna o elemento focável na ordem natural
          tabIndex={0}
          role="button"
          onClick={() => field.onChange(!field.value)}
          onKeyDown={(e) => {
            // Permite ativar com Espaço ou Enter
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              field.onChange(!field.value);
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
            borderColor: field.value
              ? (theme) => alpha(theme.palette[color].main, 0.3)
              : "divider",
            backgroundColor: field.value
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
                borderColor: field.value ? `${color}.main` : "grey.400",
                backgroundColor: field.value ? `${color}.main` : "transparent",
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
              {field.value && iconActive}
            </Box>
          ) : (
            <Switch
              checked={field.value}
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
              color={field.value ? `${color}.main` : "text.primary"}
            >
              {field.value ? titleActive : titleInactive}
            </Typography>
            {(descriptionActive || descriptionInactive) && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.3 }}
              >
                {field.value ? descriptionActive : descriptionInactive}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    />
  );
}