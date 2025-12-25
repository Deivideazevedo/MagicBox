// components/form/masks/number-format/HookDecimalField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import {
  useNumberFormat,
  unformat,
  format,
} from "@react-input/number-format";
import CustomTextField from "../../../theme-elements/CustomTextField";
import { NumberFormatOptions } from "./types";

type HookDecimalFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange"> & {
      /** Opções de formatação do número */
      formatOptions?: NumberFormatOptions;
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
  const defaultFormatOptions: NumberFormatOptions = {
    locales: "pt-BR",
    format: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...formatOptions, // Sobrescreve com as opções do usuário
  } as any;
  const inputRef = useNumberFormat(defaultFormatOptions as any);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // remover formataçoes matematica nativamente aplicadas no input
    const numericString = unformat(
      e.target.value,
      defaultFormatOptions.locales
    );

    if (returnAsNumber) {
      const number = Number(numericString);
      field.onChange(isNaN(number) ? undefined : number);
    } else {
      field.onChange(numericString);
    }
  };

  const visualValue = field.value
    ? format(String(field.value), defaultFormatOptions as any)
    : "";

  return (
    <CustomTextField
      {...textFieldProps}
      {...field}
      value={visualValue}
      onChange={handleChange}
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
