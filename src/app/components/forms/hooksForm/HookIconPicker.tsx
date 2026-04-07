import {
  Box,
  FormHelperText,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconBriefcase,
  IconBuildingStore,
  IconBus,
  IconCar,
  IconCoffee,
  IconCoin,
  IconCreditCard,
  IconDeviceGamepad2,
  IconDeviceMobile,
  IconDevices,
  IconGift,
  IconHeart,
  IconHome,
  IconMovie,
  IconNotes,
  IconPackages,
  IconPigMoney,
  IconPlane,
  IconReceipt,
  IconReportMedical,
  IconSchool,
  IconShirt,
  IconShoppingCart,
  IconTools,
  IconWallet,
} from "@tabler/icons-react";
import React from "react";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

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
  IconPigMoney: <IconPigMoney />,
  IconBriefcase: <IconBriefcase />,
  IconGift: <IconGift />,
  IconDeviceGamepad2: <IconDeviceGamepad2 />,
  IconHeart: <IconHeart />,
  IconTools: <IconTools />,
  IconReceipt: <IconReceipt />,
  IconCreditCard: <IconCreditCard />,
  IconPackages: <IconPackages />,
  IconNotes: <IconNotes />,
};

type HookIconPickerProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> & {
    label?: string;
  };

export function HookIconPicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  label = "Escolha um Ícone",
}: HookIconPickerProps<TFieldValues>) {
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
        gap={1}
        p={1.5}
        sx={{
          border: error ? "1px solid #fa896b" : "1px solid #e5eaef",
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        {Object.entries(AVAILABLE_ICONS).map(([key, iconComponent]) => (
          <Tooltip title={key.replace("Icon", "")} key={key}>
            <IconButton
              onClick={() => field.onChange(key)}
              color={field.value === key ? "primary" : "default"}
              sx={{
                backgroundColor: field.value === key ? "primary.light" : "transparent",
                border: field.value === key ? "1px solid" : "1px solid transparent",
                borderColor: field.value === key ? "primary.main" : "transparent",
                "&:hover": {
                  backgroundColor: field.value === key ? "primary.light" : "action.hover",
                },
              }}
            >
              {iconComponent}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
      {error && (
        <FormHelperText error sx={{ mt: 1, mx: 1 }}>
          {error.message}
        </FormHelperText>
      )}
    </Box>
  );
}
