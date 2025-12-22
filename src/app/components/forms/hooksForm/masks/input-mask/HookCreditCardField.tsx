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
    Omit<TextFieldProps, "name" | "value" | "onChange">;

export function HookCreditCardField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...props
}: HookCreditCardFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const inputRef = useMask({
    mask: "____ ____ ____ ____",
    replacement: { _: /\d/ },
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
      value={field.value ?? ""}
      fullWidth
      error={!!error}
      helperText={error?.message}
      placeholder="0000 0000 0000 0000"
    />
  );
}
