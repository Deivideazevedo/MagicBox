import React, { useState, useEffect, forwardRef } from "react"; // 1. Importe forwardRef
import { styled } from "@mui/material/styles";
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export type CustomTextFieldProps = TextFieldProps & {
  isLoading?: boolean;
  endIcon?: React.ReactNode;
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root.Mui-focused": {
    color: theme.palette.primary.main,
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, & .MuiOutlinedInput-root.Moi-focused .MuiOutlinedInput-notchedOutline":
    {
      borderColor: theme.palette.primary.main,
    },
}));

// 2. Envolvemos toda a definição do componente com forwardRef
const CustomTextField = forwardRef<HTMLDivElement, CustomTextFieldProps>(
  (props, ref) => {
    const {
      isLoading = false,
      endIcon,
      type,
      value,
    } = props;

    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";

    const handleTogglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const determineEndAdornment = () => {
      if (isLoading) {
        return (
          <InputAdornment position="end">
            <CircularProgress size={20} />
          </InputAdornment>
        );
      }
      if (endIcon) {
        return <InputAdornment position="end">{endIcon}</InputAdornment>;
      }
      if (isPasswordType && value) {
        return (
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
        );
      }
      return null;
    };

    return (
      <StyledTextField
        autoComplete="off"
        {...props}
        ref={ref}
        type={isPasswordType ? (showPassword ? "text" : "password") : type}
        InputProps={{
          ...props.InputProps,
          endAdornment: determineEndAdornment(),
        }}
      />
    );
  }
);

// Adicionar um nome de exibição é uma boa prática para depuração
CustomTextField.displayName = "CustomTextField";

export default CustomTextField;
