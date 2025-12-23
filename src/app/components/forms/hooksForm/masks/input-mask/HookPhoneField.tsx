// components/form/masks/input-mask/HookPhoneField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { format, unformat, useMask, MaskOptions } from "@react-input/mask";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookPhoneFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange" | "onBlur"> & {
      isMobile?: boolean;
      showMask?: boolean;
      shrinkLabel?: boolean;
      maskOptions?: MaskOptions; 
    };

export function HookPhoneField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  isMobile = true,
  showMask = true,
  shrinkLabel = true,
  defaultValue,
  shouldUnregister,
  placeholder = isMobile ? "(00) 00000-0000" : "(00) 0000-0000",
  maskOptions = {},
  ...props
}: HookPhoneFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const optionsMask = {
    mask: isMobile ? "(__) _____-____" : "(__) ____-____",
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