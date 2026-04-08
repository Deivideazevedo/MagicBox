"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import useMediaQuery from "@mui/material/useMediaQuery";
import PageContainer from "@/app/components/container/PageContainer";
import Logo from "@/app/(Private)/layout/shared/logo/Logo";
import AuthLogin from "../authForms/AuthLogin";
import {
  ThemedHeroSection,
  useCustomTheme,
} from "@/components/shared/ThemedComponents";
import {
  IconChartPie,
  IconShieldCheck,
  IconTrendingUp,
} from "@tabler/icons-react";
import { alpha } from "@mui/system";

// Desabilita SSR para esta página (necessário devido ao Redux e MUI theme)
export const dynamic = "force-dynamic";

export default function Login() {
  const { theme, isDarkMode } = useCustomTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRedirectTransition, setShowRedirectTransition] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    router.prefetch(callbackUrl);
  }, [callbackUrl, router]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const benefits = [
    {
      icon: (
        <IconChartPie size={32} color={theme.palette.primary.contrastText} />
      ),
      title: "Dashboard Intuitivo",
      description: "Visualize suas finanças em tempo real",
    },
    {
      icon: (
        <IconTrendingUp size={32} color={theme.palette.primary.contrastText} />
      ),
      title: "Análises Inteligentes",
      description: "Insights para suas decisões financeiras",
    },
    {
      icon: (
        <IconShieldCheck size={32} color={theme.palette.primary.contrastText} />
      ),
      title: "100% Seguro",
      description: "Seus dados protegidos com criptografia",
    },
  ];

  return (
    <PageContainer
      title="Login"
      description="Acesse sua conta MagicBox"
    >
      <ThemedHeroSection
        sx={{
          height: "100vh",
          borderRadius: 0,
        }}
      >
          <Grid container sx={{ minHeight: "calc(100vh - 70px)"}}>
            {/* Left Side - Branding & Benefits */}
            {isMdUp && (
              <Grid
                item
                xs={12}
                md={7}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
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
                        lineHeight: 1.2,
                        fontSize: { xs: "2rem", md: "3.5rem" },
                        color: theme.palette.primary.contrastText,
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
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
                        maxWidth: "500px",
                        textAlign: "left",
                      }}
                    >
                      Acesse sua conta e continue transformando suas finanças em
                      insights valiosos.
                    </Typography>
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
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                          >
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
            )}

            {/* Right Side - Login Form */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
              }}
            >
              <Fade in timeout={1400}>
                <Paper
                  elevation={24}
                  sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    width: "100%",
                    maxWidth: 450,
                    background: isDarkMode
                      ? "rgba(18, 18, 18, 0.95)"
                      : "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[24],
                  }}
                >
                  <Box textAlign="center" mb={2}>
                    <Box
                      component={Link}
                      href="/"
                      aria-label="Ir para tela inicial"
                      sx={{
                        width: 88,
                        height: 88,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        mb: 2,
                        bgcolor: "transparent",
                        borderRadius: "50%",
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        p: "2px",
                        transition:
                          "transform 0.25s ease, box-shadow 0.25s ease",
                        "& img": {
                          transition: "transform 0.25s ease",
                        },
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                        },
                        "&:hover img": {
                          transform: "translateY(-2px) scale(1.03)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          bgcolor: isDarkMode
                            ? "rgba(18, 18, 18, 0.95)"
                            : "rgba(255, 255, 255, 0.95)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          src={"/images/logos/logo.png"}
                          alt="Logo MagicBox"
                          width={74}
                          height={74}
                          priority
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="h4"
                      fontWeight={700}
                      gutterBottom
                      color="text.primary"
                    >
                      Entre na sua conta
                    </Typography>
                  </Box>

                  <AuthLogin
                    title=""
                    subtext={<></>}
                    subtitle={
                      <Stack
                        direction="row"
                        spacing={1}
                        mt={3}
                        justifyContent="center"
                      >
                        <Typography
                          component={Link}
                          href="/auth/register"
                          fontWeight="600"
                          sx={{
                            textDecoration: "none",
                            color: "primary.main",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Ainda não tem uma conta?
                        </Typography>
                      </Stack>
                    }
                  />
                </Paper>
              </Fade>
            </Grid>
          </Grid>
      </ThemedHeroSection>
    </PageContainer>
  );
}
