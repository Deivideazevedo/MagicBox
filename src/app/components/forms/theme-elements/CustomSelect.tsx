import React, { forwardRef } from "react";
import { styled } from "@mui/material/styles";
import { Select, SelectProps } from "@mui/material";

const StyledSelect = styled(Select)(({ theme }) => ({
  "& .MuiOutlinedInput-notchedOutline": {
    // borderColor: theme.palette.grey[300],
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    // borderColor: theme.palette.grey[400],
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.grey[100],
  },
}));

const CustomSelect = forwardRef<HTMLDivElement, SelectProps>(
  (props, ref) => {
    return (
      <StyledSelect
        ref={ref}
        {...props}
      />
    );
  }
);

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;
