"use client";
import HookTextField from "@/app/components/forms/hooksForm/HookTextField";
import HookPasswordField from "@/app/components/forms/hooksForm/HookPasswordField";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import AuthSocialButtons from "./AuthSocialButtons";
import LoadingButton from '@mui/lab/LoadingButton';

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");

    try {
      // Fazer chamada para API de registro
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta');
      }
      
      console.log("Usuário criado:", result);
      
      // Sucesso - redirecionar para login com mensagem
      router.push("/auth/auth1/login?message=Conta criada com sucesso! Faça login para continuar.");
      
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
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