import {
  Box,
  FormHelperText,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/system";
import {
  IconBolt,
  IconBriefcase,
  IconBuildingStore,
  IconBus,
  IconCar,
  IconCategory,
  IconCoffee,
  IconCoin,
  IconCreditCard,
  IconDeviceGamepad2,
  IconDeviceMobile,
  IconDevices,
  IconDeviceTv,
  IconDroplet,
  IconGasStation,
  IconGift,
  IconHeart,
  IconHome,
  IconMovie,
  IconNotes,
  IconPill,
  IconPizza,
  IconPlane,
  IconReceipt,
  IconReportMedical,
  IconSchool,
  IconShirt,
  IconShoppingCart,
  IconTools,
  IconWallet,
  IconWifi,
} from "@tabler/icons-react";
import React, { useState } from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

// Mapeamento de nomes de ícones para os componentes do tabler-icons
// Salvamos apenas a string (ex: "IconHome") no banco para ser adaptável no Mobile futuramente
export const AVAILABLE_ICONS = {
  IconHome: <IconHome />,
  IconShoppingCart: <IconShoppingCart />,
  IconCar: <IconCar />,
  IconBus: <IconBus />,
  IconCoffee: <IconCoffee />,
  IconMovie: <IconMovie />,
  IconShirt: <IconShirt />,
  IconReportMedical: <IconReportMedical />,
  IconSchool: <IconSchool />,
  IconBuildingStore: <IconBuildingStore />,
  IconDeviceMobile: <IconDeviceMobile />,
  IconDevices: <IconDevices />,
  IconPlane: <IconPlane />,
  IconCoin: <IconCoin />,
  IconWallet: <IconWallet />,
  IconBriefcase: <IconBriefcase />,
  IconGift: <IconGift />,
  IconDeviceGamepad2: <IconDeviceGamepad2 />,
  IconHeart: <IconHeart />,
  IconTools: <IconTools />,
  IconReceipt: <IconReceipt />,
  IconCreditCard: <IconCreditCard />,
  IconCategory: <IconCategory />,
  // Novos ícones
  IconBolt: <IconBolt />, // Eletricidade
  IconWifi: <IconWifi />, // Internet
  IconDeviceTv: <IconDeviceTv />, // TV
  IconDroplet: <IconDroplet />, // Água
  IconGasStation: <IconGasStation />, // Combustível
  IconPizza: <IconPizza />, // Comida
  IconPill: <IconPill />, // Farmácia
};

type HookIconPickerProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> & {
    label?: string;
    iconColor?: string;
  };

export function HookIconPicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  label = "Escolha um Ícone",
  iconColor,
}: HookIconPickerProps<TFieldValues>) {
  const theme = useTheme();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = Object.entries(AVAILABLE_ICONS).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase().replace(/\s/g, "")),
  );

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight={600} mb={1}>
          {label}
        </Typography>
      )}
      {/* <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Pesquisar ícone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 1.5 }}
      /> */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={1}
        p={1}
        sx={{
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderRadius: 2,
          backgroundColor: "background.paper",
          // maxHeight: 200, // Altura máxima para ativar a rolagem
          // overflowY: "auto", // Adiciona a barra de rolagem vertical
        }}
      >
        {filteredIcons.map(([key, iconComponent]) => {
          const isSelected = field.value === key;
          return (
            <IconButton
              key={key}
              onClick={() => field.onChange(key)}
              size="small"
              sx={{
                color: isSelected ? (iconColor || "primary.main") : "text.secondary",
                backgroundColor: isSelected ? alpha(iconColor || "#000", 0.1) : "transparent",
                border: "1px solid",
                // borderRadius: 2,
                borderColor: isSelected ? (iconColor || "primary.main") : "transparent",
                "&:hover": {
                  color: isSelected ? (iconColor || "primary.main") : "primary.main",
                  backgroundColor: isSelected ? alpha(iconColor || "#000", 0.15) : alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              {React.cloneElement(iconComponent as React.ReactElement, {
                size: 20,
                color: isSelected ? (iconColor || "currentColor") : "currentColor"
              })}
            </IconButton>
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
