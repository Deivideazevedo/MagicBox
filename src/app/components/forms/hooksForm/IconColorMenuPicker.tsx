import React, { useState } from "react";
import { Box, Popover, IconButton, Typography, Divider, alpha, useTheme, Button, Stack } from "@mui/material";
import { Control, FieldValues, Path } from "react-hook-form";
import { DynamicIcon } from "../../shared/DynamicIcon";
import { HookIconPicker } from "./HookIconPicker";
import { HookColorPicker } from "./HookColorPicker";
import { IconCheck, IconX } from "@tabler/icons-react";

interface IconColorMenuPickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  iconName: Path<TFieldValues>;
  colorName: Path<TFieldValues>;
  label?: string;
  watchIcon?: string | null;
  watchColor?: string | null;
  fallbackColor?: string;
  fallbackIcon?: string;
}

export function IconColorMenuPicker<TFieldValues extends FieldValues>({
  control,
  iconName,
  colorName,
  label,
  watchIcon,
  watchColor,
  fallbackColor,
  fallbackIcon,
}: IconColorMenuPickerProps<TFieldValues>) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "icon-color-popover" : undefined;

  const currentColor = watchColor || fallbackColor || theme.palette.primary.main;
  const currentIcon = watchIcon || fallbackIcon;
  return (
    <Box>
      {label && (
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>
          {label}
        </Typography>
      )}

      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        sx={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alpha(currentColor, 0.15),
          color: currentColor,
          cursor: "pointer",
          border: "4px solid",
          borderColor: alpha(currentColor, 0.3),
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
            backgroundColor: alpha(currentColor, 0.25),
            color: alpha(currentColor, 1),
          },
        }}
      >
        <DynamicIcon name={currentIcon} size={28} stroke={1.5} />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              width: 310,
              borderRadius: 2,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Personalizar Aparência
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <IconX size={18} />
          </IconButton>
        </Stack>

        <HookIconPicker control={control} name={iconName} label="Escolha um Ícone" iconColor={currentColor} />

        <Divider sx={{ my: 2 }} />

        <HookColorPicker control={control} name={colorName} label="Escolha uma Cor" />

        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="small"
            startIcon={<IconCheck size={18} />}
            onClick={handleClose}
            sx={{ borderRadius: 2 }}
          >
            Confirmar Seleção
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
