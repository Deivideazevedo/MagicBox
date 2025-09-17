"use client";

import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField } from "@mui/material";
import { ptBR } from "date-fns/locale";

interface CustomDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  [key: string]: any;
}

export default function CustomDatePicker({
  label,
  value,
  onChange,
  error,
  helperText,
  fullWidth = true,
  ...props
}: CustomDatePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <MuiDatePicker
        label={label}
        value={value}
        onChange={onChange}
        slots={{
          textField: TextField,
        }}
        slotProps={{
          textField: {
            fullWidth,
            error,
            helperText,
            ...props,
          },
        }}
      />
    </LocalizationProvider>
  );
}