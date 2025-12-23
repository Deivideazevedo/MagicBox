// components/form/masks/input-mask/HookPercentageMaskField.tsx
import { TextFieldProps } from "@mui/material";
import { unformat, useMask, MaskOptions } from "@react-input/mask";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookPercentageMaskFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange" | "onBlur"> & {
      showMask?: boolean;
      shrinkLabel?: boolean;
      maskOptions?: MaskOptions; 
    };

export function HookPercentageMaskField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  showMask = true,
  shrinkLabel = true,
  defaultValue,
  shouldUnregister,
  placeholder = "0,00%",
  maskOptions = {},
  ...props
}: HookPercentageMaskFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const optionsMask = {
    mask: "___,__%",
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
  }

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
