import { Box, FormHelperText, Tooltip, Typography, useTheme } from "@mui/material";
import React from "react";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

type HookColorPickerProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> & {
    label?: string;
  };

export function HookColorPicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  label = "Escolha uma Cor",
}: HookColorPickerProps<TFieldValues>) {
  const theme = useTheme();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const themeColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main,
    "#9C27B0", // Purple
    "#3F51B5", // Indigo
    "#E91E63", // Pink
    "#607D8B", // Blue Grey
    "#795548", // Brown
    "#00BCD4", // Cyan
    "#212121", // Dark / Black
  ];

  return (
    <Box mb={2}>
      {label && (
        <Typography variant="body2" fontWeight={600} mb={1}>
          {label}
        </Typography>
      )}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={1.5}
        p={1.5}
        sx={{
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderRadius: 2,
          backgroundColor: "background.paper",
          maxHeight: 180, // Altura máxima para ativar a rolagem
          overflowY: "auto", // Adiciona a barra de rolagem vertical
        }}
      >
        {themeColors.map((color) => {
          const isSelected = field.value === color;

          return (
            <Tooltip title={color} key={color}>
              <Box
                onClick={() => field.onChange(color)}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: color,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isSelected
                    ? `0 0 0 3px ${theme.palette.background.paper}, 0 0 0 5px ${color}`
                    : "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
      {error && (
        <FormHelperText error sx={{ mt: 1, mx: 1 }}>
          {error.message}
        </FormHelperText>
      )}
    </Box>
  );
}
