// components/form/FormTextField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import CustomTextField from "../theme-elements/CustomTextField";

type FormTextFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "value" | "onChange">;

export function HookTextField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...props
}: FormTextFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <CustomTextField
      {...field}
      {...props}
      inputRef={field.ref}
      fullWidth
      error={!!error}
      helperText={error?.message}
    />
  );
}
