// components/form/masks/number-format/HookCurrencyField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookCurrencyFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange"> & {
      returnAsNumber?: boolean;
    };

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export function HookCurrencyField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  returnAsNumber = true,
  ...textFieldProps
}: HookCurrencyFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const onlyDigits = rawValue.replace(/\D/g, "");

    // ADIÇÃO: Se o usuário apagar tudo, o valor no form passa a ser null (ou string vazia)
    // CORREÇÃO: Se não houver dígitos, ou se o valor numérico restante for zero absoluto
    // Isso captura tanto o "selecionar tudo e apagar" quanto o "apagar dígito por dígito até o fim"
    if (!onlyDigits || onlyDigits === "0" || onlyDigits === "00") {
      field.onChange(returnAsNumber ? null : "");
      return;
    }

    const numericValue = parseInt(onlyDigits, 10) / 100;
    field.onChange(returnAsNumber ? numericValue : numericValue.toString());
  };

  // ADIÇÃO: Se o valor for null/undefined/vazio, a interface mostra "" (campo limpo)
  const displayValue =
    field.value !== undefined && field.value !== null && field.value !== ""
      ? formatCurrency(Number(field.value))
      : "";

  return (
    <CustomTextField
      {...textFieldProps}
      {...field}
      value={displayValue}
      onChange={handleChange}
      type="text"
      // Um placeholder amigável ajuda o usuário a entender o formato esperado quando o campo está vazio
      placeholder="R$ 0,00"
      inputProps={{
        inputMode: "numeric",
        ...textFieldProps.inputProps,
      }}
      InputLabelProps={{
        shrink: true,
      }}
      fullWidth
      error={!!error}
      helperText={error?.message}
    />
  );
}
