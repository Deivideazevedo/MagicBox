"use client";

import Link from 'next/link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import { useTheme } from '@mui/material/styles';
import PageContainer from '@/app/components/container/PageContainer';
import Logo from '@/app/(Private)/layout/shared/logo/Logo';
import AuthLogin from '../../authForms/AuthLogin';
import { ThemedHeroSection, useCustomTheme } from '@/components/shared/ThemedComponents';
import { 
  IconCoin,
  IconChartPie,
  IconShieldCheck,
  IconTrendingUp,
  IconStar,
} from '@tabler/icons-react';

// Desabilita SSR para esta página (necessário devido ao Redux e MUI theme)
export const dynamic = 'force-dynamic';

export default function Login() {
  const { theme, isDarkMode } = useCustomTheme();

  const benefits = [
    {
      icon: <IconChartPie size={32} color={theme.palette.primary.contrastText} />,
      title: "Dashboard Intuitivo",
      description: "Visualize suas finanças em tempo real"
    },
    {
      icon: <IconTrendingUp size={32} color={theme.palette.primary.contrastText} />,
      title: "Análises Inteligentes",
      description: "Insights para suas decisões financeiras"
    },
    {
      icon: <IconShieldCheck size={32} color={theme.palette.primary.contrastText} />,
      title: "100% Seguro",
      description: "Seus dados protegidos com criptografia"
    }
  ];

  return (
    <PageContainer title="Login - MagicBox" description="Acesse sua conta MagicBox">
      <ThemedHeroSection
        sx={{ 
          minHeight: '100vh',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Side - Branding & Benefits */}
            <Grid
              item
              xs={12}
              lg={7}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: { xs: 3, md: 6 },
                color: theme.palette.primary.contrastText,
              }}
            >
              
              {/* Hero Content */}
              <Slide direction="right" in timeout={1000}>
                <Box sx={{ mb: 8 }}>
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 800,
                      fontSize: { xs: "2rem", md: "3.5rem" },
                      color: theme.palette.primary.contrastText,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    Bem-vindo de volta ao MagicBox! ✨
                  </Typography>
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 4, 
                      opacity: 0.95,
                      lineHeight: 1.6,
                      maxWidth: '500px',
                      textAlign: 'left'
                    }}
                  >
                    Acesse sua conta e continue transformando suas finanças em insights valiosos.
                  </Typography>

                  {/* Stats */}
                  <Stack direction="row" spacing={4} sx={{ mb: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight={700}>
                        10K+
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Usuários ativos
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight={700}>
                        R$ 50M+
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Valor gerenciado
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight={700}>
                        4.9★
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Avaliação
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Slide>

              {/* Benefits */}
              <Slide direction="up" in timeout={1200}>
                <Grid container spacing={3}>
                  {benefits.map((benefit, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          textAlign: "center",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-5px)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto",
                            mb: 2,
                            color: "white",
                          }}
                        >
                          {benefit.icon}
                        </Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Slide>
            </Grid>

            {/* Right Side - Login Form */}
            <Grid
              item
              xs={12}
              lg={5}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
              }}
            >
              <Fade in timeout={1400}>
                <Paper
                  elevation={24}
                  sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    width: '100%',
                    maxWidth: 450,
                    background: isDarkMode 
                      ? "rgba(18, 18, 18, 0.95)" 
                      : "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[24],
                  }}
                >
                  <Box textAlign="center" mb={4}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        mb: 3,
                        color: "white",
                      }}
                    >
                      <IconCoin size={40} />
                    </Box>
                    
                    <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
                      Entrar na sua conta
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary">
                      Acesse o MagicBox e continue organizando suas finanças
                    </Typography>
                  </Box>

                  <AuthLogin
                    title=""
                    subtext={<></>}
                    subtitle={
                      <Stack direction="row" spacing={1} mt={3} justifyContent="center">
                        <Typography color="textSecondary" variant="body1">
                          Ainda não tem uma conta?
                        </Typography>
                        <Typography
                          component={Link}
                          href="/auth/auth1/register"
                          fontWeight="600"
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Cadastre-se gratuitamente
                        </Typography>
                      </Stack>
                    }
                  />
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </ThemedHeroSection>
    </PageContainer>
  );
}
