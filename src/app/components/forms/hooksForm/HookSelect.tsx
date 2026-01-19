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

type HookSelectProps<
  TFieldValues extends FieldValues,
  T,
> = UseControllerProps<TFieldValues> &
  Omit<SelectProps, "name" | "value" | "onChange"> & {
    options?: T[];
    placeholder?: string;
    returnAsNumber?: boolean;
    getValue?: (obj: T) => string | number | readonly string[];
    getLabel?: (obj: T) => React.ReactNode;
    children?: React.ReactNode;
    disableEmpty?: boolean;
    onChange?: (value: string | number, option?: T) => void;
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
  onChange,
  ...props
}: HookSelectProps<TFieldValues, T>) {
  const {
    field: { ref, ...fieldWithoutRef },
    fieldState: { error },
  } = useController({ name, control, rules });

  // Função para converter o valor baseado na propriedade returnAsNumber
  const handleChange = (event: SelectChangeEvent<string | number>) => {
    const rawValue = event.target.value;
    const processedValue = returnAsNumber ? Number(rawValue) : rawValue;

    // Encontrar o objeto completo para passar no onChange externo
    const selectedOption = options?.find((item) => {
      const itemValue = getValue ? getValue(item) : (item as any)?.id;
      return String(itemValue) === String(rawValue);
    });

    // Sempre armazena o ID no field
    fieldWithoutRef.onChange(processedValue);

    // onChange externo recebe ID e objeto completo
    onChange?.(processedValue, selectedOption);
  };

  const newValue = returnAsNumber
    ? Number(fieldWithoutRef.value)
    : String(fieldWithoutRef.value ?? "");

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel shrink={props.displayEmpty} color={props.color}>
        {props.label}
      </InputLabel>
      <Select
        {...fieldWithoutRef}
        value={newValue}
        {...props}
        inputRef={ref}
        onChange={handleChange}
      >
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
