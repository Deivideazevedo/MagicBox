// src/app/components/forms/theme-elements/HookTextField.tsx

import { Control, Controller } from 'react-hook-form';
import CustomTextField, { CustomTextFieldProps } from '../theme-elements/CustomTextField';

// As props do nosso novo componente. Inclui as props do TextField, 
// mais 'name' e 'control' que são obrigatórios.
type HookTextFieldProps = CustomTextFieldProps & {
  name: string;
  control: Control<any>;
};

const HookTextField = (props: HookTextFieldProps) => {
  const { name, control, ...rest } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <CustomTextField
          {...field}
          {...rest}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );
};

export default HookTextField;