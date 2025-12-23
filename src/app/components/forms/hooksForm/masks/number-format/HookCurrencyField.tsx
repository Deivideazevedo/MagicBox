// components/form/masks/number-format/HookCurrencyField.tsx
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

type HookCurrencyFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange"> & {
      /** Opções de formatação do número */
      formatOptions?: NumberFormatOptions;
      /** Se true, retorna o valor como number, se false retorna como string formatada */
      returnAsNumber?: boolean;
    };

export function HookCurrencyField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  formatOptions,
  returnAsNumber = false,
  ...textFieldProps
}: HookCurrencyFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  // Defaults para formatação de moeda
  const defaultFormatOptions: NumberFormatOptions = {
    locales: "pt-BR",
    format: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    ...formatOptions, // Sobrescreve com as opções do usuário
  };

  const inputRef = useNumberFormat(defaultFormatOptions);

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
    ? format(String(field.value), defaultFormatOptions)
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
