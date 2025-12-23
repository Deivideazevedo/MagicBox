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
  SelectChangeEvent,
} from "@mui/material";

type HookSelectProps<TFieldValues extends FieldValues, T> = UseControllerProps<TFieldValues> & 
  Omit<SelectProps, 'name' | 'value' | 'onChange'> & {
  options?: T[];
  placeholder?: string;
  returnAsNumber?: boolean;
  getValue?: (obj: T) => string | number | readonly string[];
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
  returnAsNumber = true,
  ...props
}: HookSelectProps<TFieldValues, T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  // Função para converter o valor baseado na propriedade returnAsNumber
  const handleChange = (event: SelectChangeEvent<string>) => {
    const rawValue = event.target.value;
    const processedValue = returnAsNumber ? Number(rawValue) : rawValue;
    field.onChange(processedValue);
  };

  // Determina se a label deve ter shrink ativo
  // Quando displayEmpty está ativo e não há valor, a label deve subir para não sobrepor o placeholder
  //const shouldShrink = props.displayEmpty ? true : undefined;

  

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel shrink={props.displayEmpty} color={props.color}>
        {props.label}
      </InputLabel>
      <Select {...field} {...props} inputRef={field.ref} onChange={handleChange}>
        {/* Caso o pai queira criar todas as opções manualmente */}
        {children}

        {!children && placeholder && (
          <MenuItem value={returnAsNumber ? 0 : ""} disabled={disableEmpty}>
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
