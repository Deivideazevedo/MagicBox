import { Control, FieldValues, Path, useController } from "react-hook-form";
import {
  Autocomplete,
  TextField,
  AutocompleteProps,
  AutocompleteValue,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
  TextFieldProps,
  Checkbox,
} from "@mui/material";
import { SyntheticEvent } from "react";
import CustomTextField from "../theme-elements/CustomTextField";

/**
 * Tipo genérico para opções do Autocomplete
 * Por padrão espera { id, label }, mas pode ser qualquer tipo
 */
export type AutocompleteOption = {
  id: string | number;
  label: string;
  [key: string]: any;
};

/**
 * Props do HookAutocomplete
 * Comporta-se exatamente como o Autocomplete nativo do MUI,
 * mas integrado com react-hook-form
 */
type HookAutocompleteProps<
  T extends FieldValues,
  OptionType = AutocompleteOption,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = Omit<
  AutocompleteProps<OptionType, Multiple, DisableClearable, FreeSolo>,
  "renderInput"
> & {
  /** Nome do campo no formulário */
  name: Path<T>;
  /** Controle do react-hook-form */
  control: Control<T>;
  /** Label do campo */
  label?: string;
  /** Placeholder do campo */
  placeholder?: string;
  /** Props adicionais para o TextField interno */
  textFieldProps?: Omit<TextFieldProps, "label" | "placeholder">;
  /**
   * Função para extrair o valor do campo a partir da opção selecionada
   * Recebe a opção e retorna o valor a ser armazenado no formulário
   * @example
   * getFieldValue={(option) => option.id}
   * getFieldValue={(option) => option.nome}
   * 
   * Para múltipla seleção, retorna automaticamente array
   */
  getFieldValue?: (option: OptionType) => any;
};

/**
 * Componente HookAutocomplete
 * Autocomplete nativo do MUI integrado com react-hook-form via useController
 * Permite usar todas as props do Autocomplete normalmente
 */
const HookAutocomplete = <
  T extends FieldValues,
  OptionType = AutocompleteOption,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>({
  name,
  control,
  label,
  placeholder,
  textFieldProps,
  options = [],
  multiple,
  getFieldValue,
  renderOption,
  getOptionLabel,
  isOptionEqualToValue,
  onChange,
  value: _value, // Ignoramos value do pai, pois é controlado pelo form
  ...autocompleteProps
}: HookAutocompleteProps<
  T,
  OptionType,
  Multiple,
  DisableClearable,
  FreeSolo
>) => {
  // useController para integração com react-hook-form
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  // Tipo para o valor do Autocomplete
  type ValueType = AutocompleteValue<
    OptionType,
    Multiple,
    DisableClearable,
    FreeSolo
  >;

  // Handler onChange que integra com o formulário
  const handleChange = (
    event: SyntheticEvent,
    newValue: ValueType,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<OptionType>
  ) => {
    // Se getFieldValue foi fornecida, extrai o valor customizado
    let fieldValue: any;
    
    if (getFieldValue) {
      // Se for múltipla seleção, mapeia o array
      if (Array.isArray(newValue)) {
        fieldValue = newValue.map((item) => getFieldValue(item));
      } 
      // Se for single e não for null, extrai o valor
      else if (newValue !== null) {
        fieldValue = getFieldValue(newValue as OptionType);
      } 
      // Se for null, mantém null
      else {
        fieldValue = multiple ? [] : null;
      }
    } else {
      // Se não foi fornecida, usa o valor completo
      fieldValue = newValue;
    }

    // Atualiza o campo do formulário
    field.onChange(fieldValue);

    // Chama onChange customizado se fornecido
    onChange?.(event, newValue, reason, details);
  };

  // Converte o valor do formulário de volta para o objeto completo
  // Exemplo: se field.value = 1, busca { id: 1, label: "Brasil", ... } nas options
  const displayValue = (() => {
    if (!field.value) return multiple ? [] : null;

    if (getFieldValue) {
      if (multiple && Array.isArray(field.value)) {
        // Múltipla seleção: busca cada item pelo valor extraído
        return options.filter((opt) => 
          field.value.includes(getFieldValue(opt))
        );
      } else if (!multiple) {
        // Seleção única: busca o item pelo valor extraído
        return options.find((opt) => 
          getFieldValue(opt) === field.value
        ) ?? null;
      }
    }

    // Se não tem getFieldValue, usa o valor direto
    return field.value;
  })();

  // Renderização padrão com checkbox para múltipla seleção
  const finalRenderOption =
    renderOption ||
    (multiple
      ? (props: any, option: any, { selected }: any) => {
          const displayText = getOptionLabel
            ? getOptionLabel(option)
            : option?.label || option;
          return (
            <li {...props} key={option?.id || option}>
              <Checkbox style={{ marginRight: 8 }} checked={selected} />
              {displayText}
            </li>
          );
        }
      : undefined);

  // Label padrão
  const finalGetOptionLabel =
    getOptionLabel ||
    ((option: any) => {
      if (typeof option === "string") return option;
      return option?.label || String(option);
    });

  // Comparação padrão
  const finalIsOptionEqualToValue =
    isOptionEqualToValue ||
    ((option: any, value: any) => {
      if (!value) return false;
      
      // Se tem getFieldValue, compara usando o valor extraído
      if (getFieldValue) {
        return getFieldValue(option) === getFieldValue(value);
      }
      
      // Senão, compara por id se existir, ou compara o objeto todo
      if (option?.id !== undefined && value?.id !== undefined) {
        return option.id === value.id;
      }
      return option === value;
    });

  return (
    <Autocomplete<OptionType, Multiple, DisableClearable, FreeSolo>
      {...autocompleteProps}
      multiple={multiple}
      options={options}
      value={displayValue as ValueType}
      onChange={handleChange}
      onBlur={field.onBlur}
      renderOption={finalRenderOption}
      getOptionLabel={finalGetOptionLabel}
      isOptionEqualToValue={finalIsOptionEqualToValue}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          {...textFieldProps}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );
};

export default HookAutocomplete;
