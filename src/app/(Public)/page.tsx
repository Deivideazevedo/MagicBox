"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Button,
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Fade,
  Slide,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";
import { 
  IconCoin, 
  IconChartPie, 
  IconShieldCheck, 
  IconArrowRight, 
  IconTrendingUp,
  IconCreditCard,
  IconReport,
  IconCalendar,
  IconStar
} from "@tabler/icons-react";
import { ThemedHeroSection, ThemedCard, ThemedFeatureCard, useCustomTheme } from "@/components/shared/ThemedComponents";

export default function LandingPage() {
  const { theme, isDarkMode } = useCustomTheme();
  const { data: session } = useSession();
  const [animateDemo, setAnimateDemo] = useState(false);
  const [demoData, setDemoData] = useState({ receita: 5000, despesa: 3200 });

  useEffect(() => {
    const timer = setTimeout(() => setAnimateDemo(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <IconChartPie size={48} color={theme.palette.primary.main} />,
      title: "Dashboard Intuitivo",
      description: "Visualize sua saúde financeira em tempo real com gráficos interativos e KPIs personalizados"
    },
    {
      icon: <IconCreditCard size={48} color={theme.palette.secondary.main} />,
      title: "Gestão Completa",
      description: "Cadastre categorias, contas e lance transações com facilidade e organização"
    },
    {
      icon: <IconReport size={48} color={theme.palette.success.main} />,
      title: "Relatórios Visuais",
      description: "Transforme seus dados em insights valiosos com relatórios detalhados e análises"
    },
    {
      icon: <IconCalendar size={48} color={theme.palette.warning.main} />,
      title: "Controle de Parcelas",
      description: "Gerencie agendamentos e parcelamentos de forma automática e inteligente"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Freelancer",
      comment: "Finalmente consegui organizar minhas finanças de forma simples e eficiente!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Empresário",
      comment: "O MagicBox mudou completamente como eu vejo meu dinheiro. Recomendo!",
      rating: 5
    }
  ];

  const handleDemoClick = (tipo: 'receita' | 'despesa') => {
    if (tipo === 'receita') {
      setDemoData(prev => ({ ...prev, receita: prev.receita + 500 }));
    } else {
      setDemoData(prev => ({ ...prev, despesa: prev.despesa + 300 }));
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <ThemedHeroSection
        sx={{
          py: { xs: 8, md: 12 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography 
                variant="h1" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  color: theme.palette.primary.contrastText,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Desvende a mágica das suas finanças
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 6, 
                  opacity: 0.95,
                  maxWidth: "600px",
                  mx: "auto",
                  lineHeight: 1.6,
                  color: theme.palette.primary.contrastText
                }}
              >
                Transforme números confusos em insights claros. Controle total, decisões inteligentes.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href={session ? "/dashboard" : "/auth/auth1/login"}
                sx={{
                  py: 2,
                  px: 6,
                  fontSize: "1.1rem",
                  backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
                  color: theme.palette.primary.main,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  "&:hover": {
                    backgroundColor: isDarkMode ? theme.palette.grey[100] : "rgba(255,255,255,0.95)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease"
                }}
                endIcon={<IconArrowRight />}
              >
                {session ? "Acessar MagicBox" : "Comece Gratuitamente"}
              </Button>
            </Box>
          </Fade>
        </Container>
      </ThemedHeroSection>

      {/* Demo Interativo */}
      <Container sx={{ py: 8 }}>
        <Slide direction="up" in={animateDemo} timeout={1000}>
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" gutterBottom fontWeight={700}>
              Veja a Mágica em Ação
            </Typography>
            <Typography variant="h6" color="textSecondary" mb={4}>
              Clique nos botões para ver como seus dados ganham vida
            </Typography>
            
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4, 
                maxWidth: 600, 
                mx: "auto", 
                borderRadius: 4,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    size="large"
                    onClick={() => handleDemoClick('receita')}
                    sx={{ py: 2 }}
                  >
                    <IconTrendingUp /> Adicionar Receita
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    color="warning"
                    fullWidth
                    size="large"
                    onClick={() => handleDemoClick('despesa')}
                    sx={{ py: 2 }}
                  >
                    <IconCoin /> Adicionar Despesa
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 3, 
                      bgcolor: theme.palette.primary.main, 
                      color: "white", 
                      borderRadius: 2,
                      transition: "all 0.5s ease"
                    }}
                  >
                    <Typography variant="h4" gutterBottom>
                      Saldo: R$ {(demoData.receita - demoData.despesa).toLocaleString("pt-BR")}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Receitas</Typography>
                        <Typography variant="h6">R$ {demoData.receita.toLocaleString("pt-BR")}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Categorias</Typography>
                        <Typography variant="h6">R$ {demoData.despesa.toLocaleString("pt-BR")}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Slide>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.default', py: 10 }}>
        <Container>
          <Typography variant="h3" textAlign="center" gutterBottom fontWeight={700} color="text.primary">
            Funcionalidades Poderosas
          </Typography>
          <Typography variant="h6" mb={6} color="text.secondary" textAlign="center">
            Tudo que você precisa para dominar suas finanças
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <ThemedFeatureCard>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight={600} color="text.primary">
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" lineHeight={1.6}>
                      {feature.description}
                    </Typography>
                  </ThemedFeatureCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Prova Social */}
      <Container sx={{ py: 10 }}>
        <Typography variant="h3" textAlign="center" gutterBottom fontWeight={700}>
          O que nossos usuários dizem
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                elevation={4} 
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" }
                }}
              >
                <Box display="flex" mb={2}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <IconStar key={i} size={20} color={theme.palette.warning.main} fill={theme.palette.warning.main} />
                  ))}
                </Box>
                <Typography variant="body1" mb={2} fontStyle="italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </Typography>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {testimonial.name}
                  </Typography>
                  <Chip label={testimonial.role} size="small" variant="outlined" />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Final */}
      <Box 
        sx={{ 
          py: 10, 
          bgcolor: theme.palette.primary.main, 
          color: "white", 
          textAlign: "center" 
        }}
      >
        <Container>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Pronto para a transformação?
          </Typography>
          <Typography variant="h6" mb={4} sx={{ opacity: 0.9 }}>
            Junte-se a milhares de pessoas que já descobriram a mágica do controle financeiro
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href={session ? "/dashboard" : "/auth/auth1/login"}
            sx={{
              py: 2,
              px: 6,
              fontSize: "1.1rem",
              backgroundColor: "white",
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.9)",
                transform: "translateY(-2px)",
              },
            }}
            endIcon={<IconArrowRight />}
          >
            {session ? "Acessar Dashboard" : "Começar Gratuitamente"}
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
