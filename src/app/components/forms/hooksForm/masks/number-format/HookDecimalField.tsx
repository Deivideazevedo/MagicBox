// components/form/masks/number-format/HookDecimalField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { useNumberFormat, unformat, InputNumberFormatProps } from "@react-input/number-format";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookDecimalFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange"> & {
      /** Opções de formatação do número */
      formatOptions?: Omit<InputNumberFormatProps, "component">;
      /** Se true, retorna o valor como number, se false retorna como string formatada */
      returnAsNumber?: boolean;
    };

export function HookDecimalField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  formatOptions,
  returnAsNumber = false,
  ...textFieldProps
}: HookDecimalFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  // Defaults para formatação decimal
  const defaultFormatOptions: Omit<InputNumberFormatProps, "component"> = {
    locales: "pt-BR",
    format: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...formatOptions, // Sobrescreve com as opções do usuário
  };

  const inputRef = useNumberFormat(defaultFormatOptions);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (returnAsNumber) {
      // Usa a função nativa unformat da biblioteca
      const numericString = unformat(value, defaultFormatOptions.locales);
      const number = Number(numericString);
      field.onChange(isNaN(number) ? undefined : number);
    } else {
      field.onChange(value);
    }
  };

  return (
    <CustomTextField
      {...textFieldProps}
      name={field.name}
      defaultValue={field.value ?? ""}
      onChange={handleChange}
      onBlur={field.onBlur}
      inputRef={(ref) => {
        if (ref) {
          inputRef.current = ref;
          field.ref(ref);
        }
      }}
      fullWidth
      error={!!error}
      helperText={error?.message}
    />
  );
}
