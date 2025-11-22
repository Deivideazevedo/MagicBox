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
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import PageContainer from '@/app/components/container/PageContainer';
import Logo from '@/app/(Private)/layout/shared/logo/Logo';
import { ThemedHeroSection, useCustomTheme } from '@/components/shared/ThemedComponents';
import { 
  IconCoin,
  IconUsers,
  IconShieldCheck,
  IconTrendingUp,
  IconGift,
  IconCheck,
} from '@tabler/icons-react';
import AuthRegister from '../../authForms/AuthRegister';

export default function Register() {
  const { theme, isDarkMode } = useCustomTheme();

  const benefits = [
    {
      icon: <IconGift size={32} color={theme.palette.primary.contrastText} />,
      title: "Gratuito para Sempre",
      description: "Comece sem custo e organize suas finanças"
    },
    {
      icon: <IconTrendingUp size={32} color={theme.palette.primary.contrastText} />,
      title: "Controle Total",
      description: "Veja onde seu dinheiro está indo"
    },
    {
      icon: <IconShieldCheck size={32} color={theme.palette.primary.contrastText} />,
      title: "Dados Seguros",
      description: "Criptografia de nível bancário"
    }
  ];

  const features = [
    "Dashboard com gráficos interativos",
    "Controle de categorias e receitas",
    "Relatórios detalhados",
    "Gestão de metas financeiras",
    "Alertas de vencimento",
    "Análises inteligentes"
  ];

  return (
    <PageContainer title="Cadastro - MagicBox" description="Crie sua conta MagicBox gratuitamente">
      <ThemedHeroSection
        sx={{ 
          minHeight: '100vh',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Side - Registration Form */}
            <Grid
              item
              xs={12}
              lg={5}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                order: { xs: 2, lg: 1 }
              }}
            >
              <Fade in timeout={800}>
                <Paper
                  elevation={24}
                  sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    width: '100%',
                    maxWidth: 500,
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
                        background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        mb: 3,
                        color: "white",
                      }}
                    >
                      <IconUsers size={40} />
                    </Box>
                    
                    <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
                      Junte-se ao MagicBox
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary">
                      Crie sua conta gratuita e transforme suas finanças hoje mesmo
                    </Typography>
                  </Box>

                  <AuthRegister
                    title=""
                    subtext={<></>}
                    subtitle={
                      <Stack direction="row" spacing={1} mt={3} justifyContent="center">
                        <Typography color="textSecondary" variant="body1">
                          Já tem uma conta?
                        </Typography>
                        <Typography
                          component={Link}
                          href="/auth/auth1/login"
                          fontWeight="600"
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Faça login
                        </Typography>
                      </Stack>
                    }
                  />
                </Paper>
              </Fade>
            </Grid>

            {/* Right Side - Branding & Benefits */}
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
                order: { xs: 1, lg: 2 }
              }}
            >
              {/* Logo */}
              <Fade in timeout={1000}>
                <Box sx={{ mb: 6 }}>
                  <Logo />
                </Box>
              </Fade>

              {/* Hero Content */}
              <Slide direction="left" in timeout={1200}>
                <Box sx={{ mb: 6 }}>
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 800,
                      fontSize: { xs: "2rem", md: "3.5rem" },
                      color: theme.palette.primary.contrastText,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    Comece sua jornada financeira! 🚀
                  </Typography>
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 4, 
                      opacity: 0.95,
                      lineHeight: 1.6,
                      maxWidth: '500px'
                    }}
                  >
                    Junte-se a milhares de pessoas que já transformaram suas finanças com o MagicBox.
                  </Typography>

                  {/* Social Proof */}
                  <Box 
                    sx={{ 
                      p: 3,
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      mb: 4
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      ✨ Mais de 10.000 usuários confiam no MagicBox
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      "Melhor app de finanças que já usei!" - Maria S.
                    </Typography>
                  </Box>
                </Box>
              </Slide>

              {/* Benefits */}
              <Slide direction="up" in timeout={1400}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {benefits.map((benefit, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Box
                        sx={{
                          p: { xs: 2, md: 3 },
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
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            opacity: 0.8,
                            wordBreak: 'break-word',
                            hyphens: 'auto'
                          }}
                        >
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Slide>

              {/* Features List */}
              <Slide direction="up" in timeout={1600}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    O que você terá acesso:
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {features.map((feature, index) => (
                      <Grid item xs={12} key={index}>
                        <Box display="flex" alignItems="flex-start" gap={2}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "rgba(255, 255, 255, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              mt: 0.2
                            }}
                          >
                            <IconCheck size={14} />
                          </Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              opacity: 0.9,
                              wordBreak: 'break-word',
                              lineHeight: 1.4
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </ThemedHeroSection>
    </PageContainer>
  );
}