"use client";
import HookPasswordField from "@/app/components/forms/hooksForm/HookPasswordField";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import CustomCheckbox from "@/app/components/forms/theme-elements/Checkbox";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import { useRegisterUserMutation } from "@/services/endpoints/usersApi";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from '@mui/lab/LoadingButton';
import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as yup from "yup";
import AuthSocialButtons from "./AuthSocialButtons";

interface RegisterType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const validationSchema = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  username: yup.string().required("Username é obrigatório").min(3, "Username deve ter pelo menos 3 caracteres"),
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .required("Senha é obrigatória"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], "Senhas não conferem")
    .required("Confirmação de senha é obrigatória"),
});

const AuthRegister = ({ title, subtitle, subtext }: RegisterType) => {
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  // --- Tratamento de erros OAuth (mesmo padrão do AuthLogin) ---
  useEffect(() => {
    const errorType = searchParams.get("callbackError");
    
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

      // Limpa os parâmetros da URL após exibir o toast
      router.replace("/auth/auth1/register", { scroll: false });
    }
  }, [searchParams, router]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: any) => {
    setError("");

    try {
      // Chamar API de registro via RTK Query
      const result = await registerUser({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      }).unwrap();

      // Sucesso - fazer login automático
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Conta criada com sucesso!",
        text: "Redirecionando...",
        showConfirmButton: false,
        timer: 2000,
      });

      // Login automático com as credenciais recém-criadas
      const signInResult = await signIn("credentials", {
        redirect: false,
        username: data.username,
        password: data.password,
      });

      if (signInResult?.ok) {
        const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
        router.push(callbackUrl);
      } else {
        // Se falhar o login automático, redireciona para página de login
        router.push("/auth/auth1/login?message=Conta criada! Faça login para continuar.");
      }
      
    } catch (err: any) {
      // Erros já são tratados pelo interceptor do RTK Query
      // Mas podemos capturar erros específicos aqui se necessário
      const errorMessage = err?.data?.message || err?.message || "Erro ao criar conta. Tente novamente.";
      setError(errorMessage);
    }
  };

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      )}

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
            ou cadastre-se com
          </Typography>
        </Divider>
      </Box>

      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} mt={3}>
          <Box>
            <CustomFormLabel htmlFor="name" sx={{ textAlign: 'left', mb: 0.5 }}>
              Nome Completo
            </CustomFormLabel>
            <HookTextField
              id="name"
              name="name"
              control={control}
              variant="outlined"
              fullWidth
              size="medium"
              placeholder="Digite seu nome completo"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="username" sx={{ textAlign: 'left', mb: 0.5 }}>
              Username
            </CustomFormLabel>
            <HookTextField
              id="username"
              name="username"
              control={control}
              variant="outlined"
              fullWidth
              size="medium"
              placeholder="Digite seu username"
              error={!!errors.username}
              helperText={errors.username?.message}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="email" sx={{ textAlign: 'left', mb: 0.5 }}>
              Email
            </CustomFormLabel>
            <HookTextField
              id="email"
              name="email"
              type="email"
              control={control}
              variant="outlined"
              fullWidth
              size="medium"
              placeholder="Digite seu email"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="password" sx={{ textAlign: 'left', mb: 0.5 }}>
              Senha
            </CustomFormLabel>
            <HookPasswordField
              id="password"
              name="password"
              control={control}
              variant="outlined"
              fullWidth
              size="medium"
              placeholder="Digite sua senha"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="confirmPassword" sx={{ textAlign: 'left', mb: 0.5 }}>
              Confirmar Senha
            </CustomFormLabel>
            <HookPasswordField
              id="confirmPassword"
              name="confirmPassword"
              control={control}
              variant="outlined"
              fullWidth
              size="medium"
              placeholder="Confirme sua senha"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </Box>
        </Stack>

        <Box mt={2}>
          <FormGroup>
            <FormControlLabel
              control={<CustomCheckbox defaultChecked />}
              label={
                <Typography variant="body2" fontWeight={400} sx={{ fontSize: '0.875rem' }}>
                  Eu aceito os{" "}
                  <Link href="/termos" style={{ textDecoration: "none", color: "inherit" }}>
                    <Typography component="span" color="primary.main" fontWeight={500}>
                      Termos de Uso
                    </Typography>
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacidade" style={{ textDecoration: "none", color: "inherit" }}>
                    <Typography component="span" color="primary.main" fontWeight={500}>
                      Política de Privacidade
                    </Typography>
                  </Link>
                </Typography>
              }
            />
          </FormGroup>
        </Box>

        <LoadingButton
          loading={isLoading}
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: "1rem",
            textTransform: 'none',
          }}
        >
          Criar Conta Grátis
        </LoadingButton>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;