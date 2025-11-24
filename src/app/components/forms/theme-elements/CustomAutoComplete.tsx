import React, { forwardRef } from "react";
import { styled } from "@mui/material/styles";
import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  TextField,
  TextFieldProps,
} from "@mui/material";
import CustomTextField from "./CustomTextField";

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    // Adicione estilos personalizados aqui, se necessário
    // Por exemplo, bordas, cores, etc.
  },
}));

const CustomAutoComplete = forwardRef<
  HTMLDivElement,
  Omit<AutocompleteProps<any, boolean, boolean, boolean>, 'renderInput'> & {
    renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
  }
>((props, ref) => {
  const { renderInput, ...rest } = props;

  const renderInputDefault = props.renderInput
    ? props.renderInput
    : (params: AutocompleteRenderInputParams) => <CustomTextField {...params} />;

  return (
    <StyledAutocomplete ref={ref} renderInput={renderInputDefault} {...rest} />
  );
});

CustomAutoComplete.displayName = "CustomAutoComplete";

export default CustomAutoComplete;
