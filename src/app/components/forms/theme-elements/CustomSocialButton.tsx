import React from "react";
import { alpha, bgcolor, borderColor, styled } from "@mui/system";
import { Button } from "@mui/material";

const CustomSocialButton = styled((props: any) => (
  <Button variant="outlined" color="inherit" {...props} />
))(({ theme }) => ({
  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,

  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.light, 0.2),
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  },
}));

export default CustomSocialButton;
