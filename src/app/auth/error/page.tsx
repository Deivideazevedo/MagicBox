"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Componentes do Material-UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';

// Ícones SVG do Material-UI
import AccessDeniedIcon from '@mui/icons-material/Block';
import ConnectionErrorIcon from '@mui/icons-material/WifiOff';
import CallbackErrorIcon from '@mui/icons-material/SyncProblem';
import GenericErrorIcon from '@mui/icons-material/ErrorOutline';

// Tipagem para as chaves de erro (incluindo erros do NextAuth)
type ErrorKey = 'AccessDenied' | 'NetworkError' | 'CredentialsSignin' | 'Configuration' | 'Verification' | 'OAuthSignin' | 'OAuthCallback' | 'OAuthCreateAccount' | 'EmailCreateAccount' | 'Callback' | 'OAuthAccountNotLinked' | 'EmailSignin' | 'SessionRequired' | 'default';

// Detalhes do erro, agora com componentes de ícone JSX
const errorDetails: Record<ErrorKey, { icon: JSX.Element; title: string; message: string; buttonText: string }> = {
  // Erros de OAuth
  AccessDenied: {
    icon: <AccessDeniedIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Acesso Negado',
    message: 'Você não concedeu as permissões necessárias ou cancelou a autenticação.',
    buttonText: 'Tentar Novamente',
  },
  NetworkError: {
    icon: <ConnectionErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Falha na Conexão',
    message: 'Não foi possível conectar ao provedor. Verifique sua internet e tente novamente.',
    buttonText: 'Tentar Novamente',
  },
  
  // Erros de credenciais
  CredentialsSignin: {
    icon: <GenericErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Credenciais Inválidas',
    message: 'Usuário ou senha incorretos. Verifique seus dados e tente novamente.',
    buttonText: 'Tentar Novamente',
  },
  
  // Erros de configuração
  Configuration: {
    icon: <GenericErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Erro de Configuração',
    message: 'Há um problema na configuração do servidor. Por favor, contate o suporte.',
    buttonText: 'Voltar para o Login',
  },
  
  // Erros de OAuth específicos
  OAuthSignin: {
    icon: <ConnectionErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Erro no Provedor OAuth',
    message: 'Não foi possível iniciar o login com o provedor. Tente novamente.',
    buttonText: 'Tentar Novamente',
  },
  OAuthCallback: {
    icon: <CallbackErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Erro no Callback OAuth',
    message: 'Ocorreu um erro ao processar a resposta do provedor de autenticação.',
    buttonText: 'Tentar Novamente',
  },
  OAuthCreateAccount: {
    icon: <GenericErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Erro ao Criar Conta',
    message: 'Não foi possível criar sua conta com este provedor. Tente outro método.',
    buttonText: 'Voltar para o Login',
  },
  OAuthAccountNotLinked: {
    icon: <GenericErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Conta Já Registrada',
    message: 'Este e-mail já está vinculado a outra conta. Faça login com o método original.',
    buttonText: 'Voltar para o Login',
  },
  
  // Erros de email
  EmailCreateAccount: {
    icon: <GenericErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Erro ao Criar Conta',
    message: 'Não foi possível criar sua conta com este e-mail.',
    buttonText: 'Voltar para o Login',
  },
  EmailSignin: {
    icon: <GenericErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Erro no Login por E-mail',
    message: 'Não foi possível enviar o e-mail de autenticação.',
    buttonText: 'Tentar Novamente',
  },
  
  // Outros erros
  Verification: {
    icon: <GenericErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Erro de Verificação',
    message: 'O token de verificação é inválido ou expirou.',
    buttonText: 'Voltar para o Login',
  },
  Callback: {
    icon: <CallbackErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Erro no Callback',
    message: 'Ocorreu um erro ao processar o callback de autenticação.',
    buttonText: 'Tentar Novamente',
  },
  SessionRequired: {
    icon: <AccessDeniedIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Sessão Necessária',
    message: 'Você precisa estar autenticado para acessar esta página.',
    buttonText: 'Fazer Login',
  },
  
  // Erro padrão
  default: {
    icon: <GenericErrorIcon sx={{ fontSize: '4rem' }} color="error" />,
    title: 'Ocorreu um Erro',
    message: 'Um erro inesperado aconteceu durante o login. Por favor, tente novamente.',
    buttonText: 'Voltar para o Login',
  },
};

const AuthErrorPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [details, setDetails] = useState(errorDetails.default);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // NextAuth usa o parâmetro 'error' por padrão, mas também suportamos 'callbackError'
    const errorCode = (searchParams.get('error') || searchParams.get('callbackError')) as ErrorKey | null;
    
    // Define os detalhes corretos ou o padrão
    setDetails(errorDetails[errorCode ?? 'default']);
    setVisible(true); // Ativa a animação de Fade

    // Limpa a URL para que o erro não persista no refresh
    router.replace('/auth/error', { scroll: false });
    
  }, [searchParams, router]);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ height: '100vh', bgcolor: 'grey.100' }}
    >
      <Container maxWidth="sm">
        <Fade in={visible} timeout={500}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              {/* Renderiza o componente do ícone diretamente */}
              {details?.icon}
              
              <Typography variant="h4" component="h1" fontWeight="600">
                {details?.title}
              </Typography>
              
              <Typography color="text.secondary">
                {details?.message}
              </Typography>
              
              <Button
                component={Link}
                href="/auth/login"
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                {details?.buttonText}
              </Button>
            </Stack>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default AuthErrorPage;