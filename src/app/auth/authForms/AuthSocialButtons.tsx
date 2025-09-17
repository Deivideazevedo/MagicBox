"use client";
import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import { Stack } from "@mui/system";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { signInType } from "@/app/(Private)/types/auth/auth";
import { signIn } from "next-auth/react";

const AuthSocialButtons = ({ title }: signInType) => {
  const handleGoogleSignIn = async () => {
    await signIn("google");
  };

  const handleGithubSignIn = async () => {
    await signIn("github");
  };

  const handleMicrosoftSignIn = async () => {
    await signIn("azure-ad");
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="center"
        spacing={2}
        mt={3}
        sx={{
          "& .MuiButton-root": {
            minWidth: { xs: "100%", sm: "auto" },
            maxWidth: { xs: "100%" },
          },
        }}
      >
        <CustomSocialButton onClick={handleGoogleSignIn}>
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
            {title}{" "}
          Google
        </CustomSocialButton>

        <CustomSocialButton onClick={handleMicrosoftSignIn}>
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
          {title} Microsoft
        </CustomSocialButton>
      </Stack>
    </>
  );
};

export default AuthSocialButtons;
