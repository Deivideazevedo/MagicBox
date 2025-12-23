// components/form/masks/input-mask/HookCreditCardField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { useMask } from "@react-input/mask";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookCreditCardFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange" | "onBlur"> & {
      showMask?: boolean;
    };

export function HookCreditCardField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  showMask = true,
  defaultValue,
  shouldUnregister,
  ...props
}: HookCreditCardFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const inputRef = useMask({
    mask: "____ ____ ____ ____",
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
      placeholder={!showMask ? "0000 0000 0000 0000" : undefined}
    />
  );
}
