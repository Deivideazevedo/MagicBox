// src/app/components/forms/theme-elements/HookTextField.tsx

import { Control, Controller } from 'react-hook-form';
import CustomTextField from '../theme-elements/CustomTextField';
import { TextFieldProps } from '@mui/material';

// Inclui props do Controller, exceto 'render' (definido internamente)
type HookTextFieldProps = TextFieldProps & {
  name: string;
  control: Control<any>;
};

const HookTextFieldOld = (props: HookTextFieldProps) => {
  const { name, control, ...customProps } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error }}) => (
        <CustomTextField
          {...field}
          {...customProps}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );
};

export default HookTextFieldOld;