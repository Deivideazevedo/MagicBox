import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

type HookYearPickerProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<
      DatePickerProps<Date | null, Date>,
      "value" | "onChange" | "renderInput" | "views" | "openTo"
    >;

/**
 * HookYearPicker - Seletor de Ano integrado com React Hook Form
 *
 * Retorna string no formato date: "YYYY-01-01" (primeiro dia do ano)
 */
export function HookYearPicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...datePickerProps
}: HookYearPickerProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <DatePicker
      views={["year"]}
      openTo="year"
      inputFormat="yyyy"
      value={field.value ? new Date(field.value + "T00:00:00") : null}
      onChange={(date) => {
        if (!date || isNaN(date.getTime())) {
          field.onChange(null);
          return;
        }

        // Sempre retorna 1º de janeiro do ano selecionado
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);

        field.onChange(
          fnFormatDateInTimeZone({
            date: firstDayOfYear,
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
