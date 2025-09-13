'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon'; // Usaremos para ícones dinâmicos

// Objeto de configuração para cada tipo de erro
const errorDetails: {
  [key: string]: {
    icon: string; // Nome do ícone do Material Icons
    title: string;
    message: string;
    buttonText: string;
  };
} = {
  AccessDenied: {
    icon: 'block',
    title: 'Acesso Negado',
    message: 'Você cancelou o processo de autenticação ou não concedeu as permissões necessárias.',
    buttonText: 'Tentar Novamente',
  },
  OAuthSignin: {
    icon: 'wifi_off',
    title: 'Falha na Conexão',
    message: 'Não foi possível conectar ao provedor de login. Verifique sua conexão com a internet.',
    buttonText: 'Tentar Novamente',
  },
  Callback: {
    icon: 'sync_problem',
    title: 'Erro no Retorno',
    message: 'Houve um problema no retorno da autenticação. Por favor, tente novamente.',
    buttonText: 'Tentar Novamente',
  },
  // Erro padrão para qualquer outro caso
  default: {
    icon: 'error_outline',
    title: 'Ocorreu um Erro',
    message: 'Um erro inesperado aconteceu durante o login. Por favor, tente novamente mais tarde.',
    buttonText: 'Voltar para o Login',
  },
};

const CustomErrorPage = () => {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error') || 'default';

  // Seleciona os detalhes do erro com base no código, ou usa o padrão
  const details = errorDetails[errorCode] || errorDetails.default;

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <Icon style={{ fontSize: '6rem', color: '#d32f2f' }}>
          {details.icon}
        </Icon>
        <Typography align="center" variant="h2" mt={2} mb={1}>
          {details.title}
        </Typography>
        <Typography align="center" variant="h5" color="textSecondary" mb={4}>
          {details.message}
        </Typography>
        <Button
          color="primary"
          variant="contained"
          component={Link}
          // Sempre envia o usuário de volta para a página de login para tentar de novo
          href="/auth/auth1/login" 
          disableElevation
        >
          {details.buttonText}
        </Button>
      </Container>
    </Box>
  );
};

export default CustomErrorPage;