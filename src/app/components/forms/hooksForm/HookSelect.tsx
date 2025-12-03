import { Control, FieldValues, Path, useController } from "react-hook-form";
import {
  Select,
  MenuItem,
  SelectProps,
  FormControl,
  FormHelperText,
  InputLabel,
} from "@mui/material";

type HookSelectProps<TFieldValues extends FieldValues, T> = SelectProps & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  options?: T[];
  placeholder?: string;
  getValue?: (obj: T) => any;
  getLabel?: (obj: T) => React.ReactNode;
  children?: React.ReactNode; // permite passar MenuItem manualmente
};

export function HookSelect<TFieldValues extends FieldValues, T>({
  name,
  control,
  options,
  placeholder,
  getValue,
  getLabel,
  children,
  ...props
}: HookSelectProps<TFieldValues, T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel>{props.label}</InputLabel>
      <Select {...field} {...props} inputRef={field.ref}>
        {/* Caso o pai queira criar todas as opções manualmente */}
        {children}

        {!children && placeholder && (
          <MenuItem value="">
            <em>{placeholder}</em>
          </MenuItem>
        )}

        {/* Caso o pai envie uma lista + renderizador */}
        {!children &&
          options &&
          options.map((item, index) => (
            <MenuItem
              key={index}
              value={getValue ? getValue(item) : (item as any)?.id || ""}
            >
              {getLabel ? getLabel(item) : (item as any)?.label || ""}
            </MenuItem>
          ))}
      </Select>

      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
}
