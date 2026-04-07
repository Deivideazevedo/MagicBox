import { Box, FormHelperText, Tooltip, Typography } from "@mui/material";
import React from "react";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

// Cores pré-definidas em HEX, modernas e que combinam com a UI (cores que não sejam brancas demais para dar contraste com fundos brancos)
export const AVAILABLE_COLORS = [
  "#2684FF", // Blue Primary
  "#13DEB9", // Teal / Cyan Secondary
  "#FA896B", // Red / Orange Error
  "#FFC91A", // Yellow Warning
  "#00E676", // Green Success
  "#9C27B0", // Purple
  "#3F51B5", // Indigo
  "#E91E63", // Pink
  "#FF9800", // Orange
  "#607D8B", // Blue Grey
  "#795548", // Brown
  "#00BCD4", // Cyan
  "#212121", // Dark / Black
];

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
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

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
          border: error ? "1px solid #fa896b" : "1px solid #e5eaef",
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        {AVAILABLE_COLORS.map((color) => {
          const isSelected = field.value === color;

          return (
            <Tooltip title={color} key={color}>
              <Box
                onClick={() => field.onChange(color)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: color,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isSelected
                    ? `0 0 0 3px #fff, 0 0 0 5px ${color}`
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
