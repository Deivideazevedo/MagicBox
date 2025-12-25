import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

type HookMonthPickerProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<
      DatePickerProps<Date | null, Date>,
      "value" | "onChange" | "renderInput"
    >;

/**
 * HookMonthPicker - Seletor de Mês/Ano integrado com React Hook Form
 *
 * Retorna string no formato date: "YYYY-MM-01"
 */
export function HookMonthPicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...datePickerProps
}: HookMonthPickerProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <DatePicker
      views={["year", "month"]}
      openTo="month"
      inputFormat="MM/yyyy"
      value={field.value ? new Date(field.value + "T00:00:00") : null}
      onChange={(date) => {
        if (!date || isNaN(date.getTime())) {
          field.onChange(null);
          return;
        }

        const firstDayOfMonth = new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        );

        field.onChange(
          fnFormatDateInTimeZone({
            date: firstDayOfMonth,
            format: "date",
          })
        );
      }}
      inputRef={field.ref}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          error={!!error}
          helperText={error?.message}
        />
      )}
      PaperProps={{
        elevation: 1, // Define a intensidade da sombra (padrão é geralmente 8)
        sx: {
          borderRadius: 2, // Opcional: arredondar as bordas do menu
        },
      }}
      PopperProps={{
        placement: "bottom-end",
        sx: {
          "& .MuiPaper-root": {
            marginTop: "4px", // Um pequeno espaço visual
            marginRight: '-45px' // Use isso SÓ SE precisar empurrar mais para a direita
          },
        },
      }}
      componentsProps={{
        actionBar: {
          actions: ["today", "clear"],
        },
      }}
      {...datePickerProps}
    />
  );
}
