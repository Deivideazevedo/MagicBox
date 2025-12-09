import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import {
  Select,
  MenuItem,
  SelectProps,
  FormControl,
  FormHelperText,
  InputLabel,
} from "@mui/material";

type HookSelectProps<TFieldValues extends FieldValues, T> = UseControllerProps<TFieldValues> & 
  Omit<SelectProps, 'name' | 'value' | 'onChange'> & {
  options?: T[];
  placeholder?: string;
  getValue?: (obj: T) => any;
  getLabel?: (obj: T) => React.ReactNode;
  children?: React.ReactNode;
  disableEmpty?: boolean;
};

export function HookSelect<TFieldValues extends FieldValues, T>({
  name,
  control,
  rules,
  options,
  placeholder,
  getValue,
  getLabel,
  children,
  disableEmpty,
  ...props
}: HookSelectProps<TFieldValues, T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  // Determina se a label deve ter shrink ativo
  // Quando displayEmpty está ativo e não há valor, a label deve subir para não sobrepor o placeholder
  //const shouldShrink = props.displayEmpty ? true : undefined;

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel shrink={props.displayEmpty} color={props.color}>
        {props.label}
      </InputLabel>
      <Select {...field} {...props} inputRef={field.ref}>
        {/* Caso o pai queira criar todas as opções manualmente */}
        {children}

        {!children && placeholder && (
          <MenuItem value="" disabled={disableEmpty}>
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
