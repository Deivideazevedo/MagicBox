import { Control, Controller, Path } from 'react-hook-form';
import { Autocomplete, TextField, AutocompleteProps, Checkbox } from '@mui/material';

type Option = {
  id: number;
  label: string;
};

type HookAutocompleteProps<T extends Record<string, any>> = Omit<
  AutocompleteProps<Option, boolean, boolean, boolean>,
  'renderInput'
> & {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
};

const HookAutocomplete = <T extends Record<string, any>>({
  name,
  control,
  label,
  placeholder,
  ...autocompleteProps
}: HookAutocompleteProps<T>) => {
  const isMultiple = autocompleteProps.multiple;
  const defaultRenderOption = isMultiple && !autocompleteProps.renderOption
    ? (props: any, option: Option, { selected }: any) => (
        <li {...props}>
          <Checkbox style={{ marginRight: 8 }} checked={selected} />
          {option.label}
        </li>
      )
    : autocompleteProps.renderOption;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Autocomplete
          {...autocompleteProps}
          renderOption={defaultRenderOption}
          value={
            isMultiple
              ? autocompleteProps.options?.filter((opt) => field.value?.includes(opt.id)) || []
              : autocompleteProps.options?.find((opt) => opt.id === field.value) || null
          }
          getOptionLabel={(option: Option | string) => (typeof option === 'string' ? option : option.label)}
          isOptionEqualToValue={(option: Option, value: Option | string | null) =>
            typeof value === 'string' ? option.label === value : option.id === value?.id
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
            />
          )}
          onChange={(_, value) =>
            field.onChange(
              isMultiple
                ? (value as Option[])?.map((v) => v.id) || []
                : (value as Option)?.id || null
            )
          }
        />
      )}
    />
  );
};

export default HookAutocomplete;