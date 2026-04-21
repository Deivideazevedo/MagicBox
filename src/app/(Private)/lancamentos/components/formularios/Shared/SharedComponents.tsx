"use client";

import { Box, InputAdornment, useTheme } from "@mui/material";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";

interface ItemIconAdornmentProps {
  item: any | null;
  isDespesa?: boolean;
  isMeta?: boolean;
  isReceita?: boolean;
}

/** Renderiza o ícone do item selecionado (Tabler icon por nome string ou fallback) */
export function ItemIconAdornment({ item, isDespesa, isMeta, isReceita }: ItemIconAdornmentProps) {
  const theme = useTheme();
  
  const color = isMeta 
    ? theme.palette.primary.main 
    : isDespesa 
      ? theme.palette.error.main 
      : theme.palette.success.main;
      
  const itemColor = item?.cor || color;

  return (
    <InputAdornment position="end">
      <Box
        sx={{
          width: 28,
          height: 28,
          p: 0.1,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: itemColor,
          flexShrink: 0,
        }}
      >
        <DynamicIcon
          name={item?.icone}
          size={18}
          color={itemColor}
          fallbackIcon={isMeta ? "IconTarget" : isDespesa ? "IconCreditCard" : "IconWallet"}
        />
      </Box>
    </InputAdornment>
  );
}
