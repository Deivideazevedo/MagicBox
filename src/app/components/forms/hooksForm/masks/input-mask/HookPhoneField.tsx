// components/form/masks/input-mask/HookPhoneField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { useMask } from "@react-input/mask";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookPhoneFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange"> & {
      /** Se true, usa máscara para celular (9 dígitos), se false usa telefone fixo (8 dígitos) */
      isMobile?: boolean;
    };

export function HookPhoneField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  isMobile = true,
  ...props
}: HookPhoneFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  // Máscara para celular: (00) 00000-0000
  // Máscara para fixo: (00) 0000-0000
  const inputRef = useMask({
    mask: isMobile ? "(__) _____-____" : "(__) ____-____",
    replacement: { _: /\d/ },
  });

  return (
    <CustomTextField
      {...props}
      {...field}
      inputRef={(ref) => {
        if (ref) {
          inputRef.current = ref;
          field.ref(ref);
        }
      }}
      value={field.value ?? ""}
      fullWidth
      error={!!error}
      helperText={error?.message}
      placeholder={isMobile ? "(00) 00000-0000" : "(00) 0000-0000"}
    />
  );
}
