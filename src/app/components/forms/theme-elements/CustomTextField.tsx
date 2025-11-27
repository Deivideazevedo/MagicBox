import React, { forwardRef } from "react";
import { styled } from "@mui/material/styles";
import { TextField, TextFieldProps } from "@mui/material";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    // 🔹 Borda ao passar o mouse
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.grey[400],
    },

    // 🔹 Borda ao focar no campo
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },

    // 🔹 Estilização do placeholder normal
    "& .MuiOutlinedInput-input::-webkit-input-placeholder": {
      color: theme.palette.text.primary,
      opacity: "0.8",
    },

    // 🔹 Cor da borda quando o campo está desabilitado
    "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.grey[200],
    },

    // 🔹 Placeholder quando o campo está desabilitado (deve vir ANTES do texto)
    "& .MuiOutlinedInput-input.Mui-disabled::-webkit-input-placeholder": {
      color: theme.palette.grey[400],
      WebkitTextFillColor: theme.palette.grey[400], // Sobrepoe a cor padrão do navegador
    },

    // 🔹 Cor de fundo quando o campo está desabilitado
    "&.Mui-disabled": {
      backgroundColor: theme.palette.grey[100],
    },
  },
}));

const CustomTextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref) => {
    return (
      <StyledTextField
        autoComplete={props.autoComplete || "off"}
        inputRef={ref}
        {...props}
      />
    );
  }
);

export default CustomTextField;
