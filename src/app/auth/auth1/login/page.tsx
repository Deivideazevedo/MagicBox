import Link from 'next/link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ROUTES } from '@/constants/routes';
import PageContainer from '@/app/components/container/PageContainer';
import Logo from '@/app/(Private)/layout/shared/logo/Logo';
import AuthLogin from '../../authForms/AuthLogin';
import Image from 'next/image';

export default function Login () {
  return(
  <PageContainer title="Login - MagicBox" description="Acesse sua plataforma de controle financeiro">
    <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
      <Grid
        item
        xs={12}
        sm={12}
        lg={7}
        xl={8}
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#e3f2fd, #f3e5f5, #e0f2f1)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Box position="relative">
          <Box px={3}>
            <Logo />
          </Box>
          <Box
            alignItems="center"
            justifyContent="center"
            height={'calc(100vh - 75px)'}
            sx={{
              display: {
                xs: 'none',
                lg: 'flex',
              },
            }}
          >
            <Image
              src={"/images/backgrounds/login-bg.svg"}
              alt="Login background illustration" 
              width={500} 
              height={500}
              style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '500px',
              }}
            />
          </Box>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        sm={12}
        lg={5}
        xl={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box p={4} sx={{ width: '100%', maxWidth: 480 }}>
          <AuthLogin
            title="Bem-vindo ao MagicBox"
            subtext={
              <Typography variant="subtitle1" color="textSecondary" mb={1}>
                Sua Plataforma de Controle Financeiro
              </Typography>
            }
            subtitle={
              <Stack direction="row" spacing={1} mt={3}>
                <Typography color="textSecondary" variant="h6" fontWeight="500">
                  Novo por aqui?
                </Typography>
                <Typography
                  component={Link}
                  href={ROUTES.AUTH.REGISTER}
                  fontWeight="500"
                  sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Criar uma conta
                </Typography>
              </Stack>
            }
          />
        </Box>
      </Grid>
    </Grid>
  </PageContainer>
)};
