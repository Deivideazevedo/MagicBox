import { Control, Controller, Path } from 'react-hook-form';
import { TextField, TextFieldProps, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';

type HookPasswordFieldProps<T extends Record<string, any>> = Omit<TextFieldProps, 'type'> & {
  name: Path<T>;
  control: Control<T>;
};

const HookPasswordField = <T extends Record<string, any>>({
  name,
  control,
  ...textFieldProps
}: HookPasswordFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          type={showPassword ? 'text' : 'password'}
          error={!!error}
          helperText={error?.message}
          InputProps={{
            ...textFieldProps.InputProps,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  size="small"
                >
                  {showPassword ? (
                    <Visibility fontSize="small" />
                  ) : (
                    <VisibilityOff fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};

export default HookPasswordField;