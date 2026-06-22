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
  IconArrowRight,
  IconBrain,
  IconBellRinging,
  IconTarget,
  IconCash,
  IconScale,
  IconShieldLock,
  IconLayoutDashboard,
  IconChartBar,
  IconChartPie,
  IconCreditCard,
  IconReport,
  IconCalendar,
  IconCoin,
  IconTrendingUp,
  IconShieldCheck,
  IconMail,
  IconMessage,
  IconPhone,
  IconLogin,
  IconHistory,
  IconCheck,
  IconSparkles,
  IconBrandWhatsapp,
  IconWallet,
  IconReceiptOff,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import {
  ThemedHeroSection,
  ThemedFeatureCard,
  useCustomTheme,
} from "@/components/shared/ThemedComponents";

// ─── Animations ───────────────────────────────────────────────────────────────

const floatUp = keyframes`
  0%   { transform: translateY(0px) rotate(0deg);   opacity: 0.7; }
  100% { transform: translateY(-120px) rotate(200deg); opacity: 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.08); opacity: 0.85; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const ParticleBox = styled(Box)({
  position: "absolute",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.55)",
  animation: `${floatUp} 5s linear infinite`,
});

const GlowBadge = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: 0.4,
  fontSize: "0.78rem",
  background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary.main, 0.14)})`,
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "& .MuiChip-label": { px: 1.5 },
}));

const AiGlowCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
  borderRadius: 20,
  padding: theme.spacing(5),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 70%)`,
    pointerEvents: "none",
  },
}));

const StatCard = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(3, 2),
  borderRadius: 16,
  background: alpha(theme.palette.primary.main, 0.06),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: "all 0.25s ease",
  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: "translateY(-3px)",
  },
}));

const NotifCard = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  height: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
    transform: "translateY(-6px)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: IconLayoutDashboard,
    color: "primary" as const,
    title: "Dashboard Inteligente",
    description:
      "Painel com KPIs financeiros em tempo real, heatmap de atividade e métricas de performance consolidadas.",
  },
  {
    icon: IconCreditCard,
    color: "secondary" as const,
    title: "Gestão de Despesas",
    description:
      "Despesas fixas, variáveis e dívidas com controle de parcelas, vencimento e valor estimado vs. realizado.",
  },
  {
    icon: IconCash,
    color: "success" as const,
    title: "Controle de Receitas",
    description:
      "Cadastre rendas fixas e variáveis com dias de recebimento e acompanhe suas fontes de entrada.",
  },
  {
    icon: IconTarget,
    color: "warning" as const,
    title: "Objetivos Financeiros",
    description:
      "Crie metas de poupança e reservas de emergência com valor-alvo, data-alvo e progresso visual.",
  },
  {
    icon: IconChartBar,
    color: "info" as const,
    title: "Relatórios Avançados",
    description:
      "Análise por período, breakdown por categoria, evolução anual e médias mensais com gráficos interativos.",
  },
  {
    icon: IconReceiptOff,
    color: "error" as const,
    title: "Gestão de Dívidas",
    description:
      "Rastreie dívidas com aportes de pagamento, parcelas e histórico completo de quitação.",
  },
  {
    icon: IconScale,
    color: "primary" as const,
    title: "Divergências",
    description:
      "Detecção automática de gaps entre planejado e realizado. Reconcilie e ajuste furos orçamentários.",
  },
  {
    icon: IconReport,
    color: "secondary" as const,
    title: "Extrato Completo",
    description:
      "Histórico detalhado de transações com filtros avançados, busca, paginação e exportação em PDF.",
  },
];

const workflowSteps = [
  {
    id: 0,
    title: "Categorias",
    icon: <IconChartPie size={20} />,
    description:
      "Comece estruturando as categorias macro para organizar despesas, receitas e objetivos e facilitar filtros em toda a aplicação.",
    bullets: [
      "Agrupa contas por contexto financeiro.",
      "Facilita filtros em extrato, resumo e relatórios.",
      "É a base de organização do fluxo completo.",
    ],
  },
  {
    id: 1,
    title: "Despesas e Receitas",
    icon: <IconCoin size={20} />,
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
    title: "Objetivos e Dívidas",
    icon: <IconTarget size={20} />,
    description:
      "Configure metas financeiras (META ou RESERVA) e gerencie dívidas com controle de parcelas e aportes.",
    bullets: [
      "Metas com valor-alvo e data-alvo.",
      "Dívidas com rastreamento de parcelas.",
      "Progresso visual para cada objetivo.",
    ],
  },
  {
    id: 3,
    title: "Lançamentos",
    icon: <IconCalendar size={20} />,
    description:
      "Registre transações vinculando categoria, tipo e conta. Parcelamento e agendamento são validados pelas regras cadastradas.",
    bullets: [
      "Pagamentos e agendamentos futuros.",
      "Respeita regras de vencimento e parcelas.",
      "Operações em massa para agilidade.",
    ],
  },
  {
    id: 4,
    title: "Extrato e Resumo",
    icon: <IconCreditCard size={20} />,
    description:
      "Visualize movimentações com filtros por período, categoria e status. Consulte cards de resumo consolidados.",
    bullets: [
      "Consulta detalhada das transações.",
      "Filtros práticos para conferência diária.",
      "Base para auditoria financeira pessoal.",
    ],
  },
  {
    id: 5,
    title: "Relatórios",
    icon: <IconChartBar size={20} />,
    description:
      "Analise indicadores e padrões com visão histórica, evolução anual e breakdown por categoria.",
    bullets: [
      "Apoia planejamento financeiro contínuo.",
      "Leitura por período e por agrupamentos.",
      "Transforma dados em decisões de melhoria.",
    ],
  },
  {
    id: 6,
    title: "Divergências",
    icon: <IconScale size={20} />,
    description:
      "Detecte automaticamente diferenças entre o que foi planejado e o que foi realizado e tome ação imediata.",
    bullets: [
      "Identifica gaps orçamentários.",
      "Permite reconciliação e ajuste de furos.",
      "Mantém o planejamento sempre alinhado.",
    ],
  },
];

const notifChannels = [
  {
    icon: IconMail,
    color: "#1976d2",
    label: "E-mail",
    title: "Notificações por E-mail",
    description:
      "Lembretes de vencimentos, alertas de metas atingidas e relatórios automáticos direto na sua caixa de entrada.",
    items: ["Lembretes de vencimento", "Alertas de metas", "Resumo semanal"],
  },
  {
    icon: IconPhone,
    color: "#2e7d32",
    label: "SMS",
    title: "Alertas via SMS",
    description:
      "Notificações instantâneas por SMS para os momentos mais críticos do seu controle financeiro.",
    items: ["Alertas urgentes", "Confirmações de pagamento", "Lembretes de conta"],
  },
  {
    icon: IconBrandWhatsapp,
    color: "#25D366",
    label: "WhatsApp",
    title: "Mensagens no WhatsApp",
    description:
      "Receba notificações onde você já está. Integração com WhatsApp via Twilio para maior comodidade.",
    items: ["Notificações ricas", "Fácil interação", "Alta taxa de leitura"],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { theme, isDarkMode } = useCustomTheme();
  const { data: session } = useSession();
  const [animateIn, setAnimateIn] = useState(false);
  const [demoData, setDemoData] = useState({ receita: 5000, despesa: 3200 });
  const [activeFlowTab, setActiveFlowTab] = useState(0);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 400);
    return () => clearTimeout(t);
  }, []);

  const saldo = demoData.receita - demoData.despesa;
  const saldoPositivo = saldo >= 0;

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 19 + 7) % 100}%`,
    top: `${(i * 37 + 5) % 60}px`,
    delay: `${(i % 6) * 0.6}s`,
    duration: `${4 + (i % 4) * 0.7}s`,
    size: 5 + (i % 3) * 2,
    opacity: 0.25 + (i % 4) * 0.1,
  }));

  return (
    <Box>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <ThemedHeroSection
        sx={{
          mt: 3,
          py: { xs: 8, md: 11 },
          textAlign: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `
              radial-gradient(circle, ${alpha("#fff", 0.22)} 2px, transparent 2.5px),
              radial-gradient(circle, ${alpha("#fff", 0.12)} 1.5px, transparent 2px)
            `,
            backgroundSize: "130px 130px, 190px 190px",
            backgroundPosition: "0 0, 55px 25px",
            animation: "driftDots 22s linear infinite",
          },
          "@keyframes driftDots": {
            "0%":   { backgroundPosition: "0 0, 55px 25px" },
            "50%":  { backgroundPosition: "80px 50px, 10px 75px" },
            "100%": { backgroundPosition: "0 0, 55px 25px" },
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Fade in={animateIn} timeout={800}>
            <Box>
              <Chip
                label="✨ Controle financeiro com IA integrada"
                sx={{
                  mb: 3,
                  px: 2,
                  py: 0.5,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  bgcolor: alpha("#fff", 0.18),
                  color: "#fff",
                  border: `1px solid ${alpha("#fff", 0.3)}`,
                  backdropFilter: "blur(8px)",
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  fontWeight: 900,
                  fontSize: { xs: "2.6rem", sm: "3.4rem", md: "4.2rem" },
                  lineHeight: { xs: 1.2, md: 1.15 },
                  color: "#fff",
                  textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  letterSpacing: "-0.5px",
                }}
              >
                Desvende a mágica
                <br />
                das suas finanças
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  opacity: 0.92,
                  maxWidth: 560,
                  mx: "auto",
                  lineHeight: 1.65,
                  color: "#fff",
                  fontWeight: 400,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                }}
              >
                Transforme números confusos em insights claros. Dashboard,
                relatórios, metas, dívidas e um assistente de IA financeiro —
                tudo em um só lugar.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href={session ? "/dashboard" : "/auth/login"}
                  endIcon={<IconArrowRight size={20} />}
                  sx={{
                    py: 1.8,
                    px: 5,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    bgcolor: "#fff",
                    color: theme.palette.primary.main,
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.93)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 14px 44px rgba(0,0,0,0.28)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {session ? "Acessar MagicBox" : "Começar Gratuitamente"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/about"
                  sx={{
                    py: 1.8,
                    px: 4,
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#fff",
                    borderColor: alpha("#fff", 0.5),
                    borderRadius: 3,
                    "&:hover": {
                      borderColor: "#fff",
                      bgcolor: alpha("#fff", 0.1),
                    },
                  }}
                >
                  Saiba mais
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </ThemedHeroSection>


      {/* ── STATS BAR ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 5,
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {[
              { value: "8+", label: "Módulos financeiros" },
              { value: "3",  label: "Canais de notificação" },
              { value: "4",  label: "Providers de autenticação" },
              { value: "3",  label: "Modelos de IA integrados" },
            ].map((stat) => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <StatCard>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    color="primary"
                    sx={{ lineHeight: 1, mb: 0.5, fontSize: { xs: "2rem", md: "2.6rem" } }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </StatCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>


      {/* ── FEATURES GRID ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 10,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: alpha(theme.palette.secondary.main, 0.08),
            filter: "blur(100px)",
            top: -100,
            right: -100,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: alpha(theme.palette.primary.main, 0.06),
            filter: "blur(80px)",
            bottom: -80,
            left: -80,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={7} sx={{ position: "relative", zIndex: 1 }}>
            <GlowBadge label="Funcionalidades" sx={{ mb: 2 }} />
            <Typography
              variant="h3"
              fontWeight={900}
              color="text.primary"
              sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, mb: 2, lineHeight: 1.2 }}
            >
              Tudo para dominar suas finanças
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 660, mx: "auto", lineHeight: 1.7, fontWeight: 400 }}
            >
              Cada módulo foi pensado para dar clareza, controle e autonomia
              sobre o seu dinheiro — da organização ao planejamento de longo prazo.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ position: "relative", zIndex: 1 }}>
            {features.map((feat, i) => {
              const Icon = feat.icon;
              const colorMap: Record<string, string> = {
                primary: theme.palette.primary.main,
                secondary: theme.palette.secondary.main,
                success: theme.palette.success.main,
                warning: theme.palette.warning.main,
                info: theme.palette.info.main,
                error: theme.palette.error.main,
              };
              const color = colorMap[feat.color];
              return (
                <Grid item xs={12} sm={6} lg={3} key={i}>
                  <Slide direction="up" in={animateIn} timeout={700 + i * 100}>
                    <ThemedFeatureCard
                      sx={{
                        borderRadius: 4,
                        border: `1px solid ${alpha(color, 0.14)}`,
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          mb: 2.5,
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(color, 0.1),
                        }}
                      >
                        <Icon size={28} color={color} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                        {feat.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.65}>
                        {feat.description}
                      </Typography>
                    </ThemedFeatureCard>
                  </Slide>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>


      {/* ── AI ASSISTANT ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <GlowBadge label="Assistente IA" sx={{ mb: 2 }} />
              <Typography
                variant="h3"
                fontWeight={900}
                color="text.primary"
                sx={{ fontSize: { xs: "1.9rem", md: "2.5rem" }, mb: 2.5, lineHeight: 1.2 }}
              >
                Seu consultor
                <br />
                financeiro com IA
              </Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.75} sx={{ mb: 3 }}>
                Converse com nosso assistente financeiro alimentado por múltiplos
                modelos de IA (OpenAI, Google Gemini e Groq) com fallback automático.
                Pergunte sobre seus gastos, peça análises e obtenha recomendações
                personalizadas em segundos.
              </Typography>
              <Stack spacing={1.5}>
                {[
                  "Consulta de despesas por categoria",
                  "Análise de tendências de gastos",
                  "Recomendações de economia",
                  "Respostas em tempo real (streaming)",
                ].map((item) => (
                  <Box key={item} display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconCheck size={13} color={theme.palette.primary.main} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={7}>
              <AiGlowCard>
                <Stack spacing={2.5}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: `${pulse} 2.5s ease-in-out infinite`,
                      }}
                    >
                      <IconBrain size={22} color={theme.palette.primary.main} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>MagicBox IA</Typography>
                      <Typography variant="caption" color="text.secondary">Assistente financeiro • Online</Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {[
                    {
                      from: "user",
                      text: "Quanto gastei em alimentação esse mês?",
                    },
                    {
                      from: "ai",
                      text: "Você gastou R$ 820,00 em Alimentação este mês — 18% acima da sua média de R$ 694,00. Os 3 lançamentos com maior valor foram mercado (R$ 340), restaurantes (R$ 280) e delivery (R$ 200).",
                    },
                    {
                      from: "user",
                      text: "Como posso reduzir?",
                    },
                    {
                      from: "ai",
                      text: "Com base no seu histórico, reduzir delivery para 2x/semana economizaria cerca de R$ 120/mês. Seu objetivo 'Reserva de Emergência' ficaria 15% mais próximo em 6 meses. 🎯",
                    },
                  ].map((msg, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "82%",
                          px: 2,
                          py: 1.2,
                          borderRadius: msg.from === "user"
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          bgcolor: msg.from === "user"
                            ? theme.palette.primary.main
                            : alpha(theme.palette.background.default, 0.8),
                          border: msg.from === "ai"
                            ? `1px solid ${theme.palette.divider}`
                            : "none",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: msg.from === "user" ? "#fff" : "text.primary",
                            lineHeight: 1.55,
                          }}
                        >
                          {msg.text}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </AiGlowCard>
            </Grid>
          </Grid>
        </Container>
      </Box>


      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={7}>
          <GlowBadge label="Fluxo do MagicBox" sx={{ mb: 2 }} />
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{ fontSize: { xs: "1.9rem", md: "2.7rem" }, mb: 2 }}
          >
            Como o controle funciona na prática
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.7, fontWeight: 400 }}
          >
            Da organização inicial até a leitura dos resultados em extrato,
            relatório e reconciliação orçamentária.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={3.5}>
            <Box sx={{ position: { md: "sticky" }, top: 100 }}>
              <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ px: 1, mb: 2, display: "block" }}>
                Etapas
              </Typography>
              <Tabs
                orientation={isMdUp ? "vertical" : "horizontal"}
                variant={isMdUp ? "standard" : "scrollable"}
                allowScrollButtonsMobile
                value={activeFlowTab}
                onChange={(_, v) => setActiveFlowTab(v)}
                sx={{
                  borderLeft: isMdUp ? `2px solid ${theme.palette.divider}` : "none",
                  borderBottom: isMdUp ? "none" : `1px solid ${theme.palette.divider}`,
                  "& .MuiTabs-indicator": isMdUp
                    ? { left: 0, right: "auto", width: 3, borderRadius: "0 3px 3px 0" }
                    : undefined,
                  "& .MuiTab-root": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    minHeight: 48,
                    textAlign: "left",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    py: 1.5,
                    px: 2,
                    color: "text.secondary",
                    borderRadius: isMdUp ? "0 12px 12px 0" : "8px 8px 0 0",
                    transition: "all 0.2s ease",
                    "&.Mui-selected": {
                      color: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.07),
                    },
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    "& svg": { marginRight: "10px !important" },
                  },
                }}
              >
                {workflowSteps.map((step) => (
                  <Tab key={step.id} label={step.title} icon={step.icon} iconPosition="start" />
                ))}
              </Tabs>
            </Box>
          </Grid>

          <Grid item xs={12} md={8.5}>
            <Paper
              key={activeFlowTab}
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                minHeight: 320,
                animation: "slideIn 0.4s ease",
                "@keyframes slideIn": {
                  "0%":   { opacity: 0, transform: "translateX(-20px)" },
                  "100%": { opacity: 1, transform: "translateX(0)" },
                },
              }}
            >
              {workflowSteps.map((step) => (
                <Box
                  key={step.id}
                  role="tabpanel"
                  sx={{ display: activeFlowTab === step.id ? "block" : "none" }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        width: 46,
                        height: 46,
                      }}
                    >
                      {step.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="overline" color="text.secondary" fontWeight={700}>
                        Etapa {step.id + 1} de {workflowSteps.length}
                      </Typography>
                      <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
                        {step.title}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.75 }}>
                    {step.description}
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={1.5}>
                    {step.bullets.map((item) => (
                      <Box key={item} display="flex" gap={1.5} alignItems="flex-start">
                        <IconShieldCheck
                          size={17}
                          color={theme.palette.success.main}
                          style={{ marginTop: 3, flexShrink: 0 }}
                        />
                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
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


      {/* ── NOTIFICATIONS ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(180deg, ${alpha(theme.palette.success.main, 0.04)} 0%, transparent 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={7}>
            <GlowBadge
              label="Notificações"
              sx={{
                mb: 2,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
              }}
            />
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{ fontSize: { xs: "1.9rem", md: "2.7rem" }, mb: 2 }}
            >
              Notificações que chegam
              <br />
              onde você está
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto", lineHeight: 1.7, fontWeight: 400 }}
            >
              Nunca mais perca um vencimento. Receba alertas por e-mail,
              SMS ou WhatsApp com total controle de preferências.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {notifChannels.map((ch) => {
              const Icon = ch.icon;
              return (
                <Grid item xs={12} md={4} key={ch.label}>
                  <NotifCard>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(ch.color, 0.1),
                        mb: 2.5,
                      }}
                    >
                      <Icon size={26} color={ch.color} />
                    </Box>
                    <Chip
                      label={ch.label}
                      size="small"
                      sx={{
                        mb: 1.5,
                        fontWeight: 700,
                        bgcolor: alpha(ch.color, 0.1),
                        color: ch.color,
                        fontSize: "0.72rem",
                      }}
                    />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {ch.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.65} sx={{ mb: 2.5 }}>
                      {ch.description}
                    </Typography>
                    <Stack spacing={1}>
                      {ch.items.map((item) => (
                        <Box key={item} display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: ch.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </NotifCard>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>


      {/* ── SECURITY ────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <GlowBadge
              label="Segurança"
              sx={{
                mb: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.dark,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
              }}
            />
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{ fontSize: { xs: "1.9rem", md: "2.5rem" }, mb: 2.5, lineHeight: 1.2 }}
            >
              Seus dados protegidos
              <br />
              com múltiplas camadas
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.75} sx={{ mb: 3 }}>
              Autenticação com múltiplos provedores OAuth, bcrypt nas senhas,
              reCAPTCHA v3 contra bots, sessões JWT de curta duração e log completo
              de acessos com geolocalização.
            </Typography>
            <Stack spacing={2}>
              {[
                { icon: IconLogin,   label: "Login com Google, GitHub e Azure AD" },
                { icon: IconShieldLock, label: "Senhas com bcrypt + reCAPTCHA v3" },
                { icon: IconHistory, label: "Log de acesso com IP e geolocalização" },
                { icon: IconAdjustmentsHorizontal, label: "Dados isolados por usuário" },
              ].map(({ icon: Icon, label }) => (
                <Box key={label} display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={theme.palette.warning.dark} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
                background: alpha(theme.palette.warning.main, 0.03),
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
                Histórico de acessos recentes
              </Typography>
              <Stack spacing={1.5}>
                {[
                  { provider: "Google", city: "São Paulo, BR", time: "Agora", status: "success" },
                  { provider: "GitHub", city: "Rio de Janeiro, BR", time: "2h atrás", status: "success" },
                  { provider: "Credentials", city: "Curitiba, BR", time: "1 dia", status: "success" },
                  { provider: "Azure AD", city: "Belo Horizonte, BR", time: "3 dias", status: "success" },
                ].map((log, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: theme.palette.success.main,
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{log.provider}</Typography>
                        <Typography variant="caption" color="text.secondary">{log.city}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{log.time}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>


      {/* ── INTERACTIVE DEMO ────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 100%)`,
        }}
      >
        <Container maxWidth="sm">
          <Box textAlign="center" mb={5}>
            <GlowBadge label="Demo interativo" sx={{ mb: 2 }} />
            <Typography variant="h3" fontWeight={900} sx={{ fontSize: { xs: "1.9rem", md: "2.5rem" }, mb: 1.5 }}>
              Veja a mágica em ação
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
              Simule entradas e saídas e veja o impacto imediato no seu saldo.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 3 }}>
              <Chip
                label={`Receitas: R$ ${demoData.receita.toLocaleString("pt-BR")}`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={`Despesas: R$ ${demoData.despesa.toLocaleString("pt-BR")}`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <Stack spacing={2}>
              <Button
                variant="outlined"
                color="success"
                fullWidth
                size="large"
                onClick={() => setDemoData((p) => ({ ...p, receita: p.receita + 500 }))}
                startIcon={<IconTrendingUp size={18} />}
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                + R$ 500 em Receita
              </Button>
              <Button
                variant="outlined"
                color="warning"
                fullWidth
                size="large"
                onClick={() => setDemoData((p) => ({ ...p, despesa: p.despesa + 300 }))}
                startIcon={<IconCoin size={18} />}
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                + R$ 300 em Despesa
              </Button>

              <Box
                sx={{
                  mt: 1,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: saldoPositivo ? theme.palette.primary.main : theme.palette.error.main,
                  color: "#fff",
                  transition: "all 0.4s ease",
                  textAlign: "center",
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.8 }}>
                  Saldo {saldoPositivo ? "positivo" : "negativo"}
                </Typography>
                <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                  R$ {saldo.toLocaleString("pt-BR")}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {saldo > 0
                    ? `Você está R$ ${saldo.toLocaleString("pt-BR")} no positivo`
                    : `Atenção: gastos acima da receita`}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>


      {/* ── CTA FINAL ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%, ${alpha(theme.palette.secondary.dark, 0.85)} 100%)`,
          color: "#fff",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {particles.map((p) => (
            <ParticleBox
              key={p.id}
              sx={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </Box>

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              animation: `${pulse} 2.5s ease-in-out infinite`,
            }}
          >
            <IconSparkles size={30} color="#fff" />
          </Box>

          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              mb: 2,
              color: "#fff",
              fontSize: { xs: "2rem", md: "3rem" },
              textShadow: "0 2px 8px rgba(0,0,0,0.25)",
              lineHeight: 1.2,
            }}
          >
            Pronto para a transformação?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 5, opacity: 0.9, maxWidth: 520, mx: "auto", lineHeight: 1.65, fontWeight: 400 }}
          >
            Junte-se a quem já descobriu a mágica do controle financeiro consciente
            e comece a tomar decisões mais inteligentes com seu dinheiro.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              component={Link}
              href={session ? "/dashboard" : "/auth/login"}
              endIcon={<IconArrowRight size={20} />}
              sx={{
                py: 1.8,
                px: 5,
                fontSize: "1.05rem",
                fontWeight: 700,
                bgcolor: "#fff",
                color: theme.palette.primary.main,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.93)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 44px rgba(0,0,0,0.28)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {session ? "Acessar Dashboard" : "Começar Gratuitamente"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/privacy"
              sx={{
                py: 1.8,
                px: 4,
                fontSize: "1rem",
                fontWeight: 600,
                color: "#fff",
                borderColor: alpha("#fff", 0.5),
                borderRadius: 3,
                "&:hover": {
                  borderColor: "#fff",
                  bgcolor: alpha("#fff", 0.1),
                },
              }}
            >
              Política de Privacidade
            </Button>
          </Stack>
        </Container>
      </Box>

    </Box>
  );
}
