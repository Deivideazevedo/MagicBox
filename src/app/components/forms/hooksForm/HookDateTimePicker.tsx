import {
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers/DateTimePicker";
import { TextField } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

/**
 * HookDateTimePicker - DateTimePicker integrado com React Hook Form
 *
 * Retorna string no formato datetime-local: "YYYY-MM-DDTHH:mm"
 * Exibe no formato brasileiro: "dd/MM/yyyy HH:mm"
 */
type HookDateTimePickerProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<
      DateTimePickerProps<Date | null, Date>,
      "value" | "onChange" | "renderInput"
    >;

export function HookDateTimePicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...dateTimePickerProps
}: HookDateTimePickerProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <DateTimePicker
    //   {...dateTimePickerProps}
      inputFormat="dd/MM/yyyy HH:mm"
      value={field.value ? new Date(field.value) : null}
      onChange={(date) => {
        if (!date || isNaN(date.getTime())) {
          field.onChange(null);
          return;
        }

        field.onChange(
          fnFormatDateInTimeZone({ date, format: "datetime-local" })
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
      {...dateTimePickerProps}
    />
  );
}
