import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { Badge, TextField } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";
import { PickersDay } from "@mui/x-date-pickers";

type HookDatePickerProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<
      DatePickerProps<Date | null, Date>,
      "value" | "onChange" | "renderInput"
    >;

export function HookDatePicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...datePickerProps
}: HookDatePickerProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <DatePicker
      inputFormat="dd/MM/yyyy"
      views={["year", "day"]}
      value={field.value ? new Date(field.value + "T00:00:00") : null}
      onChange={(date) => {
        if (!date || isNaN(date.getTime())) {
          field.onChange(null);
          return;
        }

        field.onChange(fnFormatDateInTimeZone({ date, format: "date" }));
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
            marginRight: "-45px", // Use isso SÓ SE precisar empurrar mais para a direita
          },
        },
      }}
      componentsProps={{
        actionBar: {
          actions: (variant) =>
            variant === "mobile"
              ? ["today", "clear", "accept"]
              : ["today", "clear"],
        },
      }}
    //   renderDay={(day, _value, DayComponentProps) => {
    //     return (
    //       <Badge
    //         key={day.toString()}
    //         overlap="circular"
    //         badgeContent={day.getDate() === 25 ? `💸` : undefined}
    //       >
    //         <PickersDay {...DayComponentProps} />
    //       </Badge>
    //     );
    //   }}
      {...datePickerProps}
    />
  );
}
