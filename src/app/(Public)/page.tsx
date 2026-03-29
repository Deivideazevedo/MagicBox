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
  Fade,
  Slide,
  Paper,
  Chip,
  Tab,
  Tabs,
  Stack,
  Divider,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import { alpha, keyframes, styled } from "@mui/material/styles";
import {
  IconCoin,
  IconChartPie,
  IconShieldCheck,
  IconArrowRight,
  IconTrendingUp,
  IconCreditCard,
  IconReport,
  IconCalendar,
} from "@tabler/icons-react";
import {
  ThemedHeroSection,
  ThemedFeatureCard,
  useCustomTheme,
} from "@/components/shared/ThemedComponents";

const floatingParticles = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(180deg);
    opacity: 0;
  }
`;

const ParticleBox = styled(Box)({
  position: "absolute",
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.6)",
  animation: `${floatingParticles} 4s linear infinite`,
});

export default function LandingPage() {
  const { theme, isDarkMode } = useCustomTheme();
  const { data: session } = useSession();
  const [animateDemo, setAnimateDemo] = useState(false);
  const [demoData, setDemoData] = useState({ receita: 5000, despesa: 3200 });
  const [activeFlowTab, setActiveFlowTab] = useState(0);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const ctaParticleLayerHeight = 80;

  useEffect(() => {
    const timer = setTimeout(() => setAnimateDemo(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <IconChartPie size={48} color={theme.palette.primary.main} />,
      title: "Dashboard Intuitivo",
      description:
        "Visualize sua saúde financeira em tempo real com gráficos interativos e KPIs personalizados",
    },
    {
      icon: <IconCreditCard size={48} color={theme.palette.secondary.main} />,
      title: "Gestão Completa",
      description:
        "Cadastre categorias, contas e lance transações com facilidade e organização",
    },
    {
      icon: <IconReport size={48} color={theme.palette.success.main} />,
      title: "Relatórios Visuais",
      description:
        "Transforme seus dados em insights valiosos com relatórios detalhados e análises",
    },
    {
      icon: <IconCalendar size={48} color={theme.palette.warning.main} />,
      title: "Controle de Parcelas",
      description:
        "Gerencie agendamentos e parcelamentos de forma automática e inteligente",
    },
  ];

  const workflowSteps = [
    {
      id: 0,
      title: "Categorias",
      icon: <IconChartPie size={22} />,
      description:
        "Comece estruturando as categorias macro para organizar despesas e facilitar filtros em toda a aplicação.",
      bullets: [
        "Agrupa contas por contexto financeiro.",
        "Facilita filtros em extrato, resumo e relatórios.",
        "É a base de organização do fluxo completo.",
      ],
    },
    {
      id: 1,
      title: "Despesas e Fontes de Renda",
      icon: <IconCoin size={22} />,
      description:
        "Cadastre despesas e fontes de renda vinculadas às categorias para formar a estrutura real de entradas e saídas.",
      bullets: [
        "Define itens recorrentes e ocasionais.",
        "Mantém controle de status e previsões.",
        "Prepara dados para lançamentos consistentes.",
      ],
    },
    {
      id: 2,
      title: "Lançamentos",
      icon: <IconCalendar size={22} />,
      description:
        "Registre transações sempre vinculando conta e categoria. Parcelamento e agendamento são validados pelas regras da conta.",
      bullets: [
        "Permite lançar pagamentos e agendamentos.",
        "Respeita regras de vencimento e parcelamento.",
        "Consolida tudo que alimenta os módulos analíticos.",
      ],
    },
    {
      id: 3,
      title: "Extrato",
      icon: <IconCreditCard size={22} />,
      description:
        "Visualize movimentações financeiras com filtros por período, categoria, conta e status, direto da API.",
      bullets: [
        "Consulta detalhada das transações.",
        "Filtros práticos para conferência diária.",
        "Base para auditoria financeira pessoal.",
      ],
    },
    {
      id: 4,
      title: "Resumo",
      icon: <IconTrendingUp size={22} />,
      description:
        "Acompanhe uma visão consolidada da saúde financeira para identificar tendências e ajustar decisões rapidamente.",
      bullets: [
        "Panorama de receitas, despesas e saldo.",
        "Leitura rápida para decisão semanal/mensal.",
        "Complementa análise detalhada do extrato.",
      ],
    },
    {
      id: 5,
      title: "Relatório",
      icon: <IconReport size={22} />,
      description:
        "Analise indicadores e padrões com visão histórica, sempre consumindo dados reais de lançamentos via API.",
      bullets: [
        "Apoia planejamento financeiro contínuo.",
        "Permite leitura por período e por agrupamentos.",
        "Transforma dados em decisões de melhoria.",
      ],
    },
  ];

  const handleFlowTabChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setActiveFlowTab(newValue);
  };

  const saldoAtual = demoData.receita - demoData.despesa;
  const saldoPositivo = saldoAtual >= 0;

  const handleDemoClick = (tipo: "receita" | "despesa") => {
    if (tipo === "receita") {
      setDemoData((prev) => ({ ...prev, receita: prev.receita + 500 }));
    } else {
      setDemoData((prev) => ({ ...prev, despesa: prev.despesa + 300 }));
    }
  };

  const ctaParticles = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    left: `${(index * 17 + 11) % 100}%`,
    top: `${(index * 41 + 9) % ctaParticleLayerHeight}px`,
    delay: `${(index % 5) * 0.5}s`,
    duration: `${3 + (index % 4) * 0.5}s`,
    size: 4 + (index % 3) * 2,
    opacity: 0.3 + (index % 3) * 0.12,
  }));

  return (
    <Box>
      {/* Hero Section */}
      <ThemedHeroSection
        sx={{
          mt: 3,
          py: 7,
          textAlign: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `
              radial-gradient(circle, ${alpha(theme.palette.common.white, 0.26)} 2px, transparent 2.8px),
              radial-gradient(circle, ${alpha(theme.palette.common.white, 0.16)} 2px, transparent 2.8px)
            `,
            backgroundSize: "140px 140px, 180px 180px",
            backgroundPosition: "0 0, 60px 30px",
            animation: "driftDots 20s linear infinite",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `
              linear-gradient(300deg, transparent 40%, ${alpha(theme.palette.common.white, 0.1)} 53%, transparent 68%)
            `,
            backgroundSize: "240% 240%, 200% 200%",
            animation: "driftLines 18s ease-in-out infinite",
          },
          "@keyframes driftDots": {
            "0%": { backgroundPosition: "0 0, 60px 30px" },
            "50%": { backgroundPosition: "90px 60px, 10px 80px" },
            "100%": { backgroundPosition: "0 0, 60px 30px" },
          },
          "@keyframes driftLines": {
            "0%": { backgroundPosition: "0% 0%, 100% 0%" },
            "50%": { backgroundPosition: "100% 100%, 0% 100%" },
            "100%": { backgroundPosition: "0% 0%, 100% 0%" },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  lineHeight: { xs: 1.25, md: 1.3 },
                  color: theme.palette.primary.contrastText,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
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
                  color: theme.palette.primary.contrastText,
                }}
              >
                Transforme números confusos em insights claros. Controle total,
                decisões inteligentes.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href={session ? "/dashboard" : "/auth/login"}
                sx={{
                  py: 2,
                  px: 6,
                  fontSize: "1.1rem",
                  backgroundColor: isDarkMode
                    ? theme.palette.background.paper
                    : "white",
                  color: theme.palette.primary.main,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? theme.palette.grey[100]
                      : "rgba(255,255,255,0.95)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
                endIcon={<IconArrowRight />}
              >
                {session ? "Acessar MagicBox" : "Comece Gratuitamente"}
              </Button>
            </Box>
          </Fade>
        </Container>
      </ThemedHeroSection>


      {/* Features Section */}
      <Box
        sx={{
          py: 10,
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: alpha(theme.palette.secondary.main, 0.12),
            filter: "blur(90px)",
            top: -180,
            right: -80,
            pointerEvents: "none",
          },
        }}
      >
        <Container>
          <Box sx={{ textAlign: "center", mb: 6, position: "relative", zIndex: 1 }}>
            <Chip
              label="Recursos que aceleram seus resultados"
              sx={{
                mb: 2,
                px: 1.5,
                fontWeight: 600,
                letterSpacing: 0.3,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            />
            <Typography
              variant="h3"
              textAlign="center"
              gutterBottom
              fontWeight={800}
              color="text.primary"
              sx={{
                fontSize: { xs: "2rem", md: "2.8rem" },
                lineHeight: 1.2,
              }}
            >
              Funcionalidades Poderosas
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.7 }}
            >
              Tudo que você precisa para dominar suas finanças, em uma
              experiência pensada para clareza, foco e decisões seguras.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ position: "relative", zIndex: 1 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <ThemedFeatureCard
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    height: "100%",
                  }}
                >
                  <Slide
                    direction="up"
                    in={animateDemo}
                    timeout={1000 + index * 180}
                  >
                    <Box>
                      <Box
                        sx={{
                          mb: 3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h5"
                        gutterBottom
                        fontWeight={600}
                        color="text.primary"
                      >
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary" lineHeight={1.6}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Slide>
                </ThemedFeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>


      {/* Fluxo Real do Projeto */}
      <Container sx={{ py: 6, my: 4, bgcolor: "background.default", borderRadius: 2 }}>
        <Box textAlign="center" mb={5}>
          <Chip
            label="Fluxo oficial do MagicBox"
            sx={{
              mb: 6,
              fontWeight: 600,
              color: theme.palette.success.main,
              bgcolor: alpha(theme.palette.success.main, 0.12),
            }}
          />
          <Typography
            variant="h3"
            textAlign="center"
            gutterBottom
            fontWeight={800}
            sx={{ fontSize: { xs: "1.9rem", md: "2.7rem" } }}
          >
            Como o controle funciona na prática
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 760, mx: "auto", lineHeight: 1.7 }}
          >
            Estrutura baseada no comportamento real do projeto: da organização
            inicial até a leitura dos resultados em extrato, resumo e relatório.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={3.5}>
            <Box sx={{ position: { md: "sticky" }, top: 100 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3, px: 1 }}>
                Etapas
              </Typography>
              <Tabs
                orientation={isMdUp ? "vertical" : "horizontal"}
                variant={isMdUp ? "standard" : "scrollable"}
                allowScrollButtonsMobile
                value={activeFlowTab}
                onChange={handleFlowTabChange}
                sx={{
                  borderLeft: isMdUp
                    ? `2px solid ${theme.palette.divider}`
                    : "none",
                  borderBottom: isMdUp
                    ? "none"
                    : `1px solid ${theme.palette.divider}`,
                  "& .MuiTabs-indicator": isMdUp
                    ? {
                        left: 0,
                        right: "auto",
                        width: 4,
                        borderRadius: "0 4px 4px 0",
                      }
                    : undefined,
                  "& .MuiTab-root": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    minHeight: "48px",
                    textAlign: "left",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    py: 1.5,
                    px: 2,
                    color: "text.secondary",
                    borderRadius: isMdUp ? "0 12px 12px 0" : "10px 10px 0 0",
                    transition: "all 0.2s ease",
                    "&.Mui-selected": {
                      color: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                    "& svg": {
                      marginRight: "12px !important",
                    },
                  },
                }}
              >
                {workflowSteps.map((step) => (
                  <Tab
                    key={step.id}
                    label={step.title}
                    icon={step.icon}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Box>
          </Grid>

          <Grid item xs={12} md={8.5}>
            <Paper
              key={activeFlowTab}
              elevation={1}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                minHeight: 350,
                animation: "slideUpPaper 0.6s ease",
                "@keyframes slideUpPaper": {
                  "0%": {
                    opacity: 0,
                    transform: "translateX(-24px)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
              }}
            >
              {workflowSteps.map((step) => (
                <Box
                  key={step.id}
                  role="tabpanel"
                  hidden={activeFlowTab !== step.id}
                  sx={{ display: activeFlowTab === step.id ? "block" : "none" }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        width: 48,
                        height: 48,
                      }}
                    >
                      {step.icon}
                    </Avatar>
                    <Typography variant="h4" fontWeight={800}>
                      {step.title}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, fontSize: "1.05rem", lineHeight: 1.7 }}
                  >
                    {step.description}
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={1.5}>
                    {step.bullets.map((item) => (
                      <Box key={item} display="flex" gap={1.2} alignItems="flex-start">
                        <IconShieldCheck
                          size={18}
                          color={theme.palette.success.main}
                          style={{ marginTop: 2, flexShrink: 0 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>




      {/* Demo Interativo */}
      <Container sx={{ py: 4 }}>
        <Slide direction="up" in={animateDemo} timeout={1000}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" gutterBottom fontWeight={700}>
              Veja a Mágica em Ação
            </Typography>
            <Typography variant="h6" color="textSecondary" mb={3}>
              Clique nos botões para ver como seus dados ganham vida
            </Typography>

            <Paper
              elevation={2}
              sx={{
                p: 4,
                maxWidth: 760,
                mx: "auto",
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="center"
                sx={{ mb: 3 }}
              >
                <Chip
                  label={`Receitas: R$ ${demoData.receita.toLocaleString("pt-BR")}`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`Despesas: R$ ${demoData.despesa.toLocaleString("pt-BR")}`}
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  label={`Saldo ${saldoPositivo ? "positivo" : "negativo"}`}
                  color={saldoPositivo ? "success" : "error"}
                />
              </Stack>

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    size="large"
                    onClick={() => handleDemoClick("receita")}
                    sx={{ py: 2, fontWeight: 700 }}
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
                    onClick={() => handleDemoClick("despesa")}
                    sx={{ py: 2, fontWeight: 700 }}
                  >
                    <IconCoin /> Adicionar Despesa
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      mt: 1,
                      p: 2.5,
                      bgcolor: saldoPositivo
                        ? theme.palette.primary.main
                        : theme.palette.error.main,
                      color: "white",
                      borderRadius: 3,
                      transition: "all 0.5s ease",
                    }}
                  >
                    <Typography variant="h4" gutterBottom fontWeight={800}>
                      Saldo: R${" "}
                      {saldoAtual.toLocaleString("pt-BR")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, mb: 2 }}
                    >
                      Simulação visual de entradas e saídas para entender o
                      impacto imediato no seu caixa.
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Receitas
                        </Typography>
                        <Typography variant="h6">
                          R$ {demoData.receita.toLocaleString("pt-BR")}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Despesas
                        </Typography>
                        <Typography variant="h6">
                          R$ {demoData.despesa.toLocaleString("pt-BR")}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Slide>
      </Container>

      {/* CTA Final */}
      <Box
        sx={{
          py: 8,
          bgcolor: theme.palette.primary.main,
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: `${ctaParticleLayerHeight}px`,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {ctaParticles.map((particle) => (
            <ParticleBox
              key={particle.id}
              sx={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </Box>
        <Container sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h3"
            gutterBottom
            fontWeight={700}
            sx={{
              mb: 4,
              color: theme.palette.primary.contrastText,
              fontSize: { xs: "1.5.rem", md: "2.5rem" },
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Pronto para a transformação?
          </Typography>
          <Typography variant="h6" mb={2} sx={{ opacity: 0.9 }}>
            Junte-se a milhares de pessoas que já descobriram a mágica do
            controle financeiro
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href={session ? "/dashboard" : "/auth/login"}
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
              transition: "all 0.3s ease",
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
