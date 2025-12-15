"use client";

import { Box, Switch, Typography, alpha } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { ReactNode } from "react";

type ColorType = "primary" | "secondary" | "error" | "warning" | "info" | "success";

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
  iconInactive,
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
          onClick={() => field.onChange(!field.value)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            py: 1,
            px: 1.5,
            borderRadius: 1.5,
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: "1px solid",
            borderColor: field.value
              ? (theme) => alpha(theme.palette[color].main, 0.3)
              : "divider",
            backgroundColor: field.value
              ? (theme) => alpha(theme.palette[color].main, 0.04)
              : "transparent",
            "&:hover": {
              borderColor: (theme) => alpha(theme.palette[color].main, 0.4),
              backgroundColor: (theme) => alpha(theme.palette[color].main, 0.02),
            },
          }}
        >
          {variant === "checkbox" ? (
            // Checkbox customizado
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
              }}
            >
              {field.value && iconActive}
            </Box>
          ) : (
            // Switch nativo do MUI
            <Switch
              checked={field.value}
              color={color}
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => field.onChange(e.target.checked)}
              sx={{ ml: -0.5 }}
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
