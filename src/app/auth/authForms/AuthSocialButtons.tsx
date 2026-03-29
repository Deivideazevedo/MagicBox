"use client";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import { signIn } from "next-auth/react";
import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";

interface AuthSocialButtonsProps {
  title?: string;
}

const AuthSocialButtons = () => {
  const handleGoogleSignIn = async () => {
    await signIn("google");
  };

  const handleMicrosoftSignIn = async () => {
    await signIn("azure-ad");
  };

  return (
    <Grid container spacing={1.5} mt={0.5}>
      <Grid item xs={12} md={6}>
        <CustomSocialButton
          onClick={handleGoogleSignIn}
          variant="outlined"
          fullWidth
          // sx={{
          //   py: 1,
          //   textTransform: "none",
          //   justifyContent: "center",
          //   borderColor: "divider",
          // }}
        >
          <Avatar
            src={"/images/svgs/google-icon.svg"}
            alt={"Google"}
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0,
              mr: 1,
            }}
          />
          Google
        </CustomSocialButton>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomSocialButton
          onClick={handleMicrosoftSignIn}
          variant="outlined"
          fullWidth
          // sx={{
          //   py: 1,
          //   // textTransform: "none",
          //   justifyContent: "center",
          //   borderColor: "divider",
          //   color: "text.primary",
          // }}
        >
          <Avatar
            src={"/images/svgs/microsoft-icon.svg"}
            alt={"Microsoft"}
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0,
              mr: 1,
            }}
          />
          Microsoft
        </CustomSocialButton>
      </Grid>
    </Grid>
  );
};

export default AuthSocialButtons;
