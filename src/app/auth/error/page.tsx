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

// Tipagem para as chaves de erro
type ErrorKey = 'AccessDenied' | 'NetworkError' | 'default';

// Detalhes do erro, agora com componentes de ícone JSX
const errorDetails = {
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
    // NextAuth v4 usa o parâmetro 'error' por padrão
    const errorCode = searchParams.get('callbackError') as ErrorKey | null;
    
    // Define os detalhes corretos ou o padrão
    setDetails(errorDetails[errorCode ?? 'default']);
    setVisible(true); // Ativa a animação de Fade

    // Limpa a URL para que o erro não persista no refresh
    // O ideal é que a URL base seja a da própria página de erro
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
                href="/auth/auth1/login"
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