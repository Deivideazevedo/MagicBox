"use client";
import { loginType } from "@/app/(DashboardLayout)/types/auth/auth";
import HookTextField from "@/app/components/forms/hooksForm/HookTextField";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import AuthSocialButtons from "./AuthSocialButtons";
import Swal from "sweetalert2";

const validationSchema = yup.object({
  username: yup.string().required("Usuário é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const { data: session } = useSession();
  const [error, setError] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const errorType = searchParams.get("error");

    if (errorType) {
      if (errorType === "OAuthSignin") {
        // É aqui que a mágica acontece para o erro de conexão
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Falha na Conexão",
          text: "Verifique sua internet e tente novamente.",
          showConfirmButton: false,
          timer: 4000,
        });
      } else if (errorType === "AccessDenied" || errorType === "Callback") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "Autenticação cancelada",
          showConfirmButton: false,
          timer: 3000,
        });
      }
    }
  }, [searchParams]);

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      username: "admin",
      password: "wise951",
    },
  });

  const onSubmit = async (data: { username: string; password: string }) => {
    const result = await signIn("credentials", {
      redirect: false,
      username: data.username,
      password: data.password,
    });

    console.log("result", result);

    if (result?.error) {
      setError(result.error);
      console.log("result?.error", result?.error);
    }
  };

  if (session) redirect("/");
  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <AuthSocialButtons title="Entrar com" />

      <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            ou entre com
          </Typography>
        </Divider>
      </Box>

      {error ? (
        <Box mt={3}>
          <Alert severity="error" sx={{ alignItems: "center" }}>
            {error}
          </Alert>
        </Box>
      ) : (
        ""
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Box>
            <CustomFormLabel htmlFor="username">Username</CustomFormLabel>
            <HookTextField
              name="username"
              control={control}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
            <HookTextField
              name="password"
              type="password"
              variant="outlined"
              control={control}
              fullWidth
            />
          </Box>
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              <FormControlLabel
                control={<CustomCheckbox defaultChecked />}
                label="Remeber this Device"
              />
            </FormGroup>
            <Typography
              component={Link}
              href="/"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
              }}
            >
              Forgot Password ?
            </Typography>
          </Stack>
        </Stack>
        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
          >
            Sign In
          </Button>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
