import React, { useState } from "react";
import { Box, Popover, IconButton, Typography, Divider, alpha } from "@mui/material";
import { Control, FieldValues, Path } from "react-hook-form";
import { DynamicIcon } from "../../shared/DynamicIcon";
import { HookIconPicker } from "./HookIconPicker";
import { HookColorPicker } from "./HookColorPicker";

interface IconColorMenuPickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  iconName: Path<TFieldValues>;
  colorName: Path<TFieldValues>;
  label?: string;
  watchIcon?: string | null;
  watchColor?: string | null;
}

export function IconColorMenuPicker<TFieldValues extends FieldValues>({
  control,
  iconName,
  colorName,
  label,
  watchIcon,
  watchColor,
}: IconColorMenuPickerProps<TFieldValues>) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "icon-color-popover" : undefined;

  const currentColor = watchColor || "#212121"; // Dark padrão
  const currentIcon = watchIcon || "IconCategory";

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
          border: "2px solid",
          borderColor: alpha(currentColor, 0.3),
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
            backgroundColor: alpha(currentColor, 0.25),
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
        PaperProps={{
          sx: {
            mt: 1,
            p: 2,
            width: 320,
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
          Personalizar Aparência
        </Typography>
        
        <HookIconPicker control={control} name={iconName} label="Escolha um Ícone" />
        
        <Divider sx={{ my: 2 }} />
        
        <HookColorPicker control={control} name={colorName} label="Escolha uma Cor" />
      </Popover>
    </Box>
  );
}
