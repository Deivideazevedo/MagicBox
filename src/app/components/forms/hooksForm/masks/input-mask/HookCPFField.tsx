// components/form/masks/input-mask/HookCPFField.tsx
import { useEffect, useRef } from "react";
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { useMask, format, unformat } from "@react-input/mask";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookCPFFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange" | "onBlur"> & {
      showMask?: boolean;
    };

export function HookCPFField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  showMask = true,
  defaultValue,
  shouldUnregister,
  ...props
}: HookCPFFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  // Configuração da máscara
  const maskOptions = {
    mask: "___.___.___-__",
    replacement: { _: /\d/ },
    showMask,
  };

  const inputRef = useMask(maskOptions);
  const previousValueRef = useRef<string>("");
  const formattedValue = format(field.value || "", maskOptions);

  // Atualiza o campo quando o valor vem da API ou setValue
  useEffect(() => {
    if (inputRef.current && field.value !== previousValueRef.current) {
      console.log("Atualizando campo CPF com valor formatado:", formattedValue);

      // Atualiza o valor do input diretamente
      inputRef.current.value = formattedValue;
      previousValueRef.current = field.value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  // Handler para remover caracteres não numéricos antes de salvar
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const unmaskedValue = unformat(event.target.value, maskOptions);
    previousValueRef.current = unmaskedValue;
    field.onChange(unmaskedValue);
  };

  return (
    <CustomTextField
      {...props}
      inputRef={(ref) => {
        if (ref) {
          inputRef.current = ref;
          field.ref(ref);
        }
      }}
      defaultValue={formattedValue}
      onChange={handleChange}
      onBlur={field.onBlur}
      name={field.name}
      fullWidth
      error={!!error}
      helperText={error?.message}
      placeholder={showMask ? undefined : "000.000.000-00"}
    />
  );
}
