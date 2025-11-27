// components/form/FormTextField.tsx
import { TextField, TextFieldProps } from "@mui/material";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import CustomTextField from "../theme-elements/CustomTextField";

type FormTextFieldProps<TFieldValues extends FieldValues> = TextFieldProps & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
};

export function HookTextField<TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: FormTextFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

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
