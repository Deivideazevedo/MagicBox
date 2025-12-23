// components/form/masks/input-mask/HookDecimalMaskField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { useMask } from "@react-input/mask";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookDecimalMaskFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange" | "onBlur"> & {
      showMask?: boolean;
    };

export function HookDecimalMaskField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  showMask = true,
  defaultValue,
  shouldUnregister,
  ...props
}: HookDecimalMaskFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const inputRef = useMask({
    mask: "_________,__",
    replacement: { _: /\d/ },
    showMask,
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
      fullWidth
      error={!!error}
      helperText={error?.message}
      placeholder={!showMask ? "0,00" : undefined}
    />
  );
}
