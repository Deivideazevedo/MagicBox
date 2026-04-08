"use client";

import Link from "next/link";
import Image from "next/image";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import PageContainer from "@/app/components/container/PageContainer";
import {
  ThemedHeroSection,
  useCustomTheme,
} from "@/components/shared/ThemedComponents";
import {
  IconShieldCheck,
  IconTrendingUp,
  IconGift,
  IconCheck,
} from "@tabler/icons-react";
import AuthRegister from "../authForms/AuthRegister";
import { useMediaQuery } from "@mui/material";

export default function Register() {
  const { theme, isDarkMode } = useCustomTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const benefits = [
    {
      icon: <IconGift size={32} color={theme.palette.primary.contrastText} />,
      title: "Gratuito para Sempre",
      description: "Organize suas finanças sem custo",
    },
    {
      icon: (
        <IconTrendingUp size={32} color={theme.palette.primary.contrastText} />
      ),
      title: "Controle Total",
      description: "Veja onde seu dinheiro está indo",
    },
    {
      icon: (
        <IconShieldCheck size={32} color={theme.palette.primary.contrastText} />
      ),
      title: "Dados Seguros",
      description: "Proteção a nível bancário",
    },
  ];

  const features = [
    "Dashboard visual e intuitivo",
    "Categorias e contas organizadas",
    "Lançamentos com parcelamento",
    "Extrato com filtros avançados",
    "Relatórios por período",
    "Alertas de vencimento",
  ];

  return (
    <PageContainer
      title="Cadastro"
      description="Crie sua conta MagicBox gratuitamente"
    >
      <ThemedHeroSection
        sx={{
          minHeight: "100vh",
          borderRadius: 0,
        }}
      >
        <Grid container sx={{ minHeight: "100vh" }}>
          {/* Left Side - Registration Form */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 3, md: 4 },
            }}
          >
            <Fade in timeout={800}>
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  width: "100%",
                  maxWidth: 500,
                  background: isDarkMode
                    ? "rgba(18, 18, 18, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[24],
                }}
              >
                <Box textAlign="center" mb={1.5}>
                  <Box
                    component={Link}
                    href="/"
                    sx={{
                      width: 78,
                      height: 78,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px) scale(1.05)",
                      },
                    }}
                  >
                    <Image
                      src={"/images/logos/logo.png"}
                      alt="Logo MagicBox"
                      width={78}
                      height={78}
                      priority
                    />
                  </Box>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    color="text.primary"
                  >
                    Junte-se ao MagicBox
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Entre com sua conta
                  </Typography>
                </Box>

                <AuthRegister
                  title=""
                  subtext={<></>}
                  subtitle={
                    <Stack
                      direction="row"
                      spacing={1}
                      mt={2}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography color="textSecondary" variant="body2">
                        Já tem uma conta?
                      </Typography>
                      <Typography
                        component={Link}
                        href="/auth/login"
                        fontWeight="600"
                        sx={{
                          textDecoration: "none",
                          color: "primary.main",
                          "&:hover": {
                            textDecoration: "underline",
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
          {isMdUp && (
            <Grid
              item
              xs={12}
              md={7}
              lg={7}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                p: { xs: 3, md: 4 },
                color: theme.palette.primary.contrastText,
              }}
            >
              {/* Hero Content */}
              <Slide direction="left" in timeout={1200}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      mb: 2,
                      fontWeight: 800,
                      fontSize: { xs: "1.8rem", md: "3rem" },
                      color: theme.palette.primary.contrastText,
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    Comece sua jornada financeira! 🚀
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2.5,
                      opacity: 0.95,
                      lineHeight: 1.5,
                      fontSize: { xs: "1rem", md: "1.25rem" },
                    }}
                  >
                    Junte-se a milhares de pessoas que já transformaram suas
                    finanças com o MagicBox.
                  </Typography>

                  {/* Social Proof */}
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Organize melhor, decida com clareza ✨
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tudo em um só lugar para você acompanhar sua evolução
                      financeira com praticidade.
                    </Typography>
                  </Box>
                </Box>
              </Slide>

              {/* Benefits */}
              <Slide direction="up" in timeout={1400}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {benefits.map((benefit, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Box
                        sx={{
                          p: { xs: 1.5, md: 2 },
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
                            wordBreak: "break-word",
                            hyphens: "auto",
                            lineHeight: 1.35,
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
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    O que você terá acesso:
                  </Typography>

                  <Grid container spacing={1.25}>
                    {features.map((feature, index) => (
                      <Grid item xs={4} key={index}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            p: 1,
                            borderRadius: 2,
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            textAlign: "left",
                          }}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: "rgba(255, 255, 255, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <IconCheck size={12} />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              opacity: 0.9,
                              wordBreak: "break-word",
                              lineHeight: 1.3,
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
          )}
        </Grid>
      </ThemedHeroSection>
    </PageContainer>
  );
}
