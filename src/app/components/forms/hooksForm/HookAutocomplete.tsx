import { Control, FieldValues, Path, useController } from "react-hook-form";
import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteValue,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { SyntheticEvent } from "react";

type HookAutocompleteProps<
  TFieldValues extends FieldValues,
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = Omit<
  AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  "renderInput"
> & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  textFieldProps?: Omit<TextFieldProps, "label" | "placeholder">;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string | number;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
};

export function HookAutocomplete<
  TFieldValues extends FieldValues,
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>({
  name,
  control,
  label,
  placeholder,
  textFieldProps,
  getOptionLabel,
  getOptionValue,
  isOptionEqualToValue,
  ...props
}: HookAutocompleteProps<
  TFieldValues,
  T,
  Multiple,
  DisableClearable,
  FreeSolo
>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  // Função para lidar com a mudança do Autocomplete
  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>
  ) => {
    if (getOptionValue && newValue !== null && newValue !== undefined) {
      // Se múltiplo, mapeia os valores
      if (Array.isArray(newValue)) {
        const mappedValues = newValue.map((item) => getOptionValue(item as T));

        field.onChange(mappedValues);
      } else {
        // Se único, pega o valor
        field.onChange(getOptionValue(newValue as T));
      }
    } else {
      // Se não tem getOptionValue, usa o objeto completo
      field.onChange(newValue);
    }
  };

  // Função para obter o valor atual do campo
  const getCurrentValue = (): AutocompleteValue<
    T,
    Multiple,
    DisableClearable,
    FreeSolo
  > => {
    if (!field.value) {
      return (props.multiple ? [] : null) as AutocompleteValue<
        T,
        Multiple,
        DisableClearable,
        FreeSolo
      >;
    }

    if (!getOptionValue || !props.options) {
      return field.value as AutocompleteValue<
        T,
        Multiple,
        DisableClearable,
        FreeSolo
      >;
    }

    // Se for múltiplo
    if (props.multiple) {
      const values: (string | number)[] = Array.isArray(field.value) 
        ? field.value 
        : [];
      return props.options.filter((option) =>
        values.includes(getOptionValue(option))
      ) as AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>;
    }

    // Se for único
    return (props.options.find(
      (option) => getOptionValue(option) === field.value
    ) || null) as AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>;
  };

  // Função auxiliar para obter o label da opção
  const getDefaultOptionLabel = (option: T | string): string => {
    if (typeof option === "string") return option;
    const anyOption = option as any;
    return (
      anyOption?.label || anyOption?.nome || anyOption?.name || String(option)
    );
  };

  // Função auxiliar para comparar opções
  const getDefaultIsOptionEqualToValue = (option: T, value: T): boolean => {
    if (getOptionValue) {
      return getOptionValue(option) === getOptionValue(value);
    }
    return (option as any)?.id === (value as any)?.id;
  };

  return (
    <Autocomplete
      {...props}
      value={getCurrentValue()}
      onChange={handleChange}
      onBlur={field.onBlur}
      getOptionLabel={getOptionLabel || getDefaultOptionLabel}
      isOptionEqualToValue={
        isOptionEqualToValue || getDefaultIsOptionEqualToValue
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message}
          {...textFieldProps}
        />
      )}
    />
  );
}
