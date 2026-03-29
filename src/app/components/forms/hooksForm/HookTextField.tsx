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
    Omit<TextFieldProps, "name" | "value" | "onChange"> & {
      shrinkLabel?: boolean;
    };

export function HookTextField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  shrinkLabel = true,
  ...props
}: FormTextFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <CustomTextField
      {...field}
      value={field.value ?? ""}
      fullWidth
      inputRef={field.ref}
      error={!!error}
      helperText={error?.message}
      InputLabelProps={{
        shrink: shrinkLabel,
      }}
      {...props}
    />
  );
}
