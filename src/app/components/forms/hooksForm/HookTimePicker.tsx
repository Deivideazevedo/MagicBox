import { TimePicker, TimePickerProps } from "@mui/x-date-pickers/TimePicker";
import { TextField } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

type HookTimePickerProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<
      TimePickerProps<Date | null, Date>,
      "value" | "onChange" | "renderInput"
    >;

/**
 * HookTimePicker - TimePicker integrado com React Hook Form
 *
 * Retorna string no formato time: "HH:mm"
 */
export function HookTimePicker<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...timePickerProps
}: HookTimePickerProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <TimePicker
      inputFormat="HH:mm"
      value={
        field.value
          ? (() => {
              const [hours, minutes] = field.value.split(":");
              const date = new Date();
              date.setHours(Number(hours), Number(minutes), 0, 0);
              return date;
            })()
          : null
      }
      onChange={(date) => {
        if (!date || isNaN(date.getTime())) {
          field.onChange(null);
          return;
        }

        field.onChange(
          fnFormatDateInTimeZone({
            date,
            format: "time",
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
      }}PopperProps={{
        placement: "bottom-end", // Alinha a direita do menu com a direita do input
        disablePortal: true,     // <--- OBRIGATÓRIO: Mantém o menu preso ao input no DOM
        popperOptions: {
          modifiers: [
            {
              name: 'offset',
              options: {
                // [Eixo X, Eixo Y]
                // Se quiser empurrar mais para a direita (fora do input), use valor negativo no primeiro item.
                // Ex: [-45, 0] empurra 45px para a direita.
                // Se quiser apenas alinhado, deixe [0, 0].
                offset: [45, 0], 
              },
            },
          ],
        },
      }}
      componentsProps={{
        actionBar: {
          actions: ["today", "clear"],
        },
      }}
      {...timePickerProps}
    />
  );
}
