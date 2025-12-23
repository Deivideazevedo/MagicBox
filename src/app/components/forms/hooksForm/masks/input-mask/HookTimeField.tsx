// components/form/masks/input-mask/HookTimeField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { MaskOptions, unformat, useMask } from "@react-input/mask";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookTimeFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange" | "onBlur"> & {
      showMask?: boolean;
      shrinkLabel?: boolean;
      maskOptions?: MaskOptions;
    };

export function HookTimeField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  showMask = true,
  shrinkLabel = true,
  defaultValue,
  shouldUnregister,
  placeholder = "HH:MM",
  maskOptions = {},
  ...props
}: HookTimeFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  // Configuração da máscara
  const optionsMask = {
    mask: "__:__",
    replacement: { _: /\d/ },
    showMask,
    ...maskOptions,
  };

  const inputRef = useMask(optionsMask);

  const clearOnBlur = () => {
    const unformattedValue = unformat(field.value, optionsMask);
    if (!unformattedValue) {
      field.onChange(unformattedValue);
    }
    field.onBlur();
  };

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
      fullWidth
      error={!!error}
      helperText={error?.message}
      placeholder={placeholder}
      onBlur={clearOnBlur}
      InputLabelProps={{
        shrink: shrinkLabel,
      }}
    />
  );
}
