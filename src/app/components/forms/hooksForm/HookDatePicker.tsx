import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { Badge, TextField, TextFieldProps } from "@mui/material";
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
    > & {
      shrinkLabel?: boolean;
      size?: TextFieldProps["size"];
      actions?: Array<"today" | "clear" | "accept">;
      helperText?: React.ReactNode;
    };

export function HookDatePicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  shrinkLabel = true,
  size = "medium",
  actions,
  helperText,
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
          size={size}
          error={!!error}
          helperText={error?.message || helperText}
          InputLabelProps={{
            ...params.InputLabelProps,
            shrink: shrinkLabel,
          }}
          sx={{
            "& .MuiInputBase-root": {
              pr: 0.5, // Mantém um padding mínimo à direita para a borda
            },
            "& .MuiInputBase-input": {
              pr: 0, // Permite que o texto utilize o espaço até o limite
            },
            "& .MuiInputAdornment-root": {
              ml: 0, // Remove margem esquerda para aproximar o ícone do texto
            },
            "& .MuiIconButton-root": {
              p: 0.5, // Botão compacto
              mr: -0.25, // Centraliza o botão dentro do padding direito do input
            },
            ...params.sx,
          }}
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
          zIndex: (theme) => theme.zIndex.modal + 2,
          "& .MuiPaper-root": {
            marginTop: "4px", // Um pequeno espaço visual
            marginRight: "-45px", // Use isso SÓ SE precisar empurrar mais para a direita
          },
        },
      }}
      DialogProps={{
        sx: {
          zIndex: (theme) => theme.zIndex.modal + 2, // Garante que no modo mobile/responsivo (Dialog) ele fique na frente!
        },
      }}
      componentsProps={{
        actionBar: {
          actions: (variant) =>
            variant === "mobile"
              ? actions || ["today", "clear", "accept"]
              : actions || ["today", "clear"],
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
