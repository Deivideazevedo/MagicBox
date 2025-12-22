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
    Omit<TextFieldProps, "name" | "value" | "onChange"> & {
      showMask?: boolean;
    };

export function HookCPFField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  showMask = true,
  ...props
}: HookCPFFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });
  
  // Configuração da máscara
  const maskOptions = {
    mask: "___.___.___-__",
    replacement: { _: /\d/ },
    showMask,
  };
  
  const inputRef = useMask(maskOptions);
  const previousValueRef = useRef<string>("");

  // Atualiza o campo quando o valor vem da API ou setValue
  useEffect(() => {
    if (inputRef.current && field.value !== previousValueRef.current) {
      const formattedValue = field.value 
        ? format(field.value.replace(/\D/g, ""), maskOptions)
        : "";
      
      // Atualiza o valor do input diretamente
      inputRef.current.value = formattedValue;
      previousValueRef.current = field.value;
      
      // Dispara o evento input para que a máscara processe
      const event = new Event('input', { bubbles: true });
      inputRef.current.dispatchEvent(event);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  // Handler para remover caracteres não numéricos antes de salvar
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const unmaskedValue = unformat(event.target.value,maskOptions);
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
      defaultValue={field.value ? format(field.value.replace(/\D/g, ""), maskOptions) : ""}
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