import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderOptionState,
  AutocompleteValue,
  Chip,
  ListItemText,
  MenuItem,
  TextFieldProps,
} from "@mui/material";
import { Fragment, SyntheticEvent, useMemo } from "react";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";
import CustomCheckbox from "../theme-elements/CustomCheckbox";
import CustomTextField from "../theme-elements/CustomTextField";

const allOption = { id: "__select_all__", label: "Selecionar Todos" };

type HookAutocompleteProps<
  TFieldValues extends FieldValues,
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = Omit<
  AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  "renderInput"
> & UseControllerProps<TFieldValues> & {
  label?: string;
  placeholder?: string;
  textFieldProps?: Omit<TextFieldProps, "label" | "placeholder">;
  selectAll?: boolean;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string | number;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  onChange?: (
    event: SyntheticEvent,
    value: AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>,
    reason: string
  ) => void;
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
  rules,
  label,
  placeholder,
  textFieldProps,
  getOptionLabel,
  getOptionValue,
  isOptionEqualToValue,
  renderOption,
  renderTags,
  selectAll,
  options,
  onChange,
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
  } = useController({ name, control, rules });

  // Prepara as opções do componente, incluindo a opção "Selecionar Todos" se necessário
  const componentOptions = useMemo(() => {
    if (selectAll && props.multiple && options) {
      return [allOption as T, ...options];
    }
    return options || [];
  }, [selectAll, props.multiple, options]);

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

    if (!getOptionValue || !options) {
      return field.value;
    }

    // Se for múltiplo
    if (props.multiple) {
      const values: (string | number)[] = Array.isArray(field.value)
        ? field.value
        : [];

      if (values.length === 0) {
        return [] as AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>;
      }

      const selectedIds = new Set(values.map((v) => String(v)));

      const selectedOptions = options.filter((option) =>
        selectedIds.has(String(getOptionValue(option)))
      );

      // Se selectAll estiver ativo e todos os itens reais estão selecionados, incluir "Todos"
      if (
        selectAll &&
        options.length > 0 &&
        selectedOptions.length === options.length
      ) {
        return [allOption as T, ...selectedOptions] as AutocompleteValue<
          T,
          Multiple,
          DisableClearable,
          FreeSolo
        >;
      }

      return selectedOptions as AutocompleteValue<
        T,
        Multiple,
        DisableClearable,
        FreeSolo
      >;
    }

    // Se for único
    return (options.find((option) => getOptionValue(option) === field.value) ||
      null) as AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>;
  };

  // Função para lidar com a mudança do Autocomplete
  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>,
    reason: string
  ) => {
    if (selectAll && props.multiple && Array.isArray(newValue)) {
      const selectedOptions = newValue as T[];
      const currentOptions = getCurrentValue() as T[];

      // Verifica se a opção "Selecionar Todos" está PRESENTE na nova seleção (após o clique do usuário)
      const isAllSelected = selectedOptions.some((opt) =>
        getOptionValue
          ? getOptionValue(opt) === allOption.id
          : (opt as any)?.id === allOption.id
      );

      // Verifica se a opção "Selecionar Todos" estava PRESENTE na seleção anterior (antes do clique)
      const wasAllSelected = currentOptions?.some((opt) =>
        getOptionValue
          ? getOptionValue(opt) === allOption.id
          : (opt as any)?.id === allOption.id
      );

      let finalValues: (string | number)[] = [];

      if (isAllSelected && !wasAllSelected) {
        // CASO 1: "Todos" está presente AGORA mas NÃO estava antes → Usuário clicou em "Selecionar Todos"
        // Ação: Seleciona TODAS as opções reais (exclui a opção "Todos" artificial)
        finalValues = (options || []).map((o) =>
          getOptionValue ? getOptionValue(o) : (o as any).id
        );
      } else if (!isAllSelected && wasAllSelected) {
        // CASO 2: "Todos" NÃO está presente AGORA mas estava antes → Usuário desmarcou "Selecionar Todos"
        // Ação: Limpa todas as seleções
        finalValues = [];
      } else {
        // CASO 3: Mudança normal (usuário clicou em um item específico, não em "Todos")
        // Ação: Remove a opção artificial "Todos" e mantém apenas os IDs das opções reais selecionadas
        finalValues = selectedOptions
          .filter((opt) => {
            const optId = getOptionValue
              ? getOptionValue(opt)
              : (opt as any)?.id;
            return optId !== allOption.id;
          })
          .map((opt) =>
            getOptionValue ? getOptionValue(opt) : (opt as any).id
          );
      }

      field.onChange(finalValues);
    } else if (getOptionValue && newValue !== null && newValue !== undefined) {
      // Lógica original
      if (Array.isArray(newValue)) {
        const mappedValues = newValue.map((item) => getOptionValue(item as T));
        field.onChange(mappedValues);
      } else {
        field.onChange(getOptionValue(newValue as T));
      }
    } else {
      field.onChange(newValue);
    }

    // Chama onChange externo uma única vez no final
    onChange?.(event, newValue, reason);
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

  const defaultRenderOption = props.multiple
    ? (
        optionProps: React.HTMLAttributes<HTMLLIElement> & { key: string },
        option: T,
        state: AutocompleteRenderOptionState
      ) => {
        const { key, ...restOptionProps } = optionProps;
        return (
          <Fragment key={key}>
            <MenuItem
              {...restOptionProps}
              style={{ textAlign: "start", padding: 0 }}
            >
              <CustomCheckbox
                size={props.size}
                checked={state.selected}
                style={{ paddingLeft: 8, paddingRight: 10 }}
              />
              <ListItemText
                primary={
                  getOptionLabel
                    ? getOptionLabel(option)
                    : getDefaultOptionLabel(option)
                }
                primaryTypographyProps={{
                  style: {
                    whiteSpace: "normal",
                  },
                }}
              />
            </MenuItem>
          </Fragment>
        );
      }
    : (
        optionProps: React.HTMLAttributes<HTMLLIElement> & { key: string },
        option: T
      ) => {
        const { key, ...restOptionProps } = optionProps;
        return (
          <MenuItem
            {...restOptionProps}
            key={key}
            style={{
              whiteSpace: "normal",
            }}
          >
            {getOptionLabel
              ? getOptionLabel(option)
              : getDefaultOptionLabel(option)}
          </MenuItem>
        );
      };

  const defaultRenderTags = (
    tagValue: T[],
    getTagProps: AutocompleteRenderGetTagProps
  ) => {
    if (!props.multiple) return null;

    // Filtra a opção "Todos" para não contabilizar no limite e contador
    const realTags = tagValue.filter((option) => {
      const optId = getOptionValue
        ? getOptionValue(option)
        : (option as any)?.id;
      return optId !== allOption.id;
    });

    // Detecta se todos os itens reais estão selecionados
    const allSelected =
      selectAll &&
      realTags.length === (options?.length || 0) &&
      (options?.length || 0) > 0;

    const limit = props.limitTags ?? realTags.length;

    const contador =
      realTags.length > limit ? (
        <span style={{ marginLeft: 4 }}>+{realTags.length - limit}</span>
      ) : null;

    if (props.limitTags === 0) return contador;

    return (
      <>
        {allSelected && (
          <Chip
            size={props.size}
            label="Todos"
            {...getTagProps({ index: 0 })}
            key="chip-todos"
          />
        )}

        {!allSelected &&
          realTags
            .slice(0, limit)
            .map((option, index) => (
              <Chip
                size={props.size}
                label={
                  getOptionLabel
                    ? getOptionLabel(option)
                    : getDefaultOptionLabel(option)
                }
                {...getTagProps({ index: tagValue.indexOf(option) })}
                key={index}
              />
            ))}

        {contador}
      </>
    );
  };

  return (
    <Autocomplete
      value={getCurrentValue()}
      options={componentOptions}
      onChange={handleChange}
      onBlur={field.onBlur}
      getOptionLabel={getOptionLabel || getDefaultOptionLabel}
      isOptionEqualToValue={
        isOptionEqualToValue || getDefaultIsOptionEqualToValue
      }
      renderOption={renderOption || defaultRenderOption}
      renderTags={
        renderTags || (props.multiple ? defaultRenderTags : undefined)
      }
      disableCloseOnSelect={props.disableCloseOnSelect ?? props.multiple}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message}
          {...textFieldProps}
        />
      )}
      {...props}
    />
  );
}
