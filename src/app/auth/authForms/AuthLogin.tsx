"use client";
import { loginType } from "@/app/(Private)/types/auth/auth";
import HookPasswordField from "@/app/components/forms/hooksForm/HookPasswordField";
import CustomCheckbox from "@/app/components/forms/theme-elements/Checkbox";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Collapse } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import AuthSocialButtons from "./AuthSocialButtons";
import Swal from "sweetalert2";
import LoadingButton from "@mui/lab/LoadingButton";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";

const validationSchema = yup.object({
  username: yup.string().required("Usuário é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  // --- 1. Hooks para gerenciar estado, roteamento e parâmetros ---
  const [error, setError] = useState(""); // Erro do formulário de credenciais
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // --- 2. useEffect para tratar erros de OAuth e mensagens de sucesso ---
  useEffect(() => {
    const errorType = searchParams.get("callbackError");
    const successMessage = searchParams.get("message");

    if (errorType) {
      if (errorType === "AccessDenied") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "Autenticação cancelada",
          showConfirmButton: false,
          timer: 5000,
        });
      } else if (errorType === "NetworkError") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Falha na Conexão",
          text: "Verifique sua internet e tente novamente.",
          showConfirmButton: false,
          timer: 5000,
        });
      }
    }

    if (successMessage) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Sucesso!",
        text: successMessage,
        showConfirmButton: false,
        timer: 6000,
      });
    }
  }, [searchParams, router]);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // --- 3. Lógica de login com credenciais ---
  const onSubmit = async (data: { username: string; password: string }) => {
    const result = await signIn("credentials", {
      redirect: false,
      username: data.username,
      password: data.password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.replace(callbackUrl);
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <AuthSocialButtons />

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

      <Collapse in={!!error} sx={{ mt: 2 }}>
        <Box mb={1.5}>
          <Alert
            severity="error"
            sx={{
              alignItems: "center",
            }}
          >
            {error}
          </Alert>
        </Box>
      </Collapse>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="username" sx={{ textAlign: "left" }}>
              Usuário
            </CustomFormLabel>
            <HookTextField
              name="username"
              control={control}
              fullWidth
              variant="outlined"
              size="medium"
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password" sx={{ textAlign: "left" }}>
              Senha
            </CustomFormLabel>
            <HookPasswordField
              name="password"
              variant="outlined"
              control={control}
              fullWidth
              size="medium"
            />
            <Box
              display={"flex"}
              justifyContent="right"
              alignItems="center"
              mt={1}
            >
              {/* <Typography
                component={Link}
                href="/"
                fontWeight="500"
                sx={{
                  textDecoration: "none",
                  color: "primary.main",
                  fontSize: "0.875rem",
                }}
              >
                Esqueceu a senha?
              </Typography> */}
            </Box>
          </Box>
        </Stack>
        <Box sx={{ mt: 2 }}>
          <LoadingButton
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            loading={isSubmitting}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Entrar
          </LoadingButton>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
