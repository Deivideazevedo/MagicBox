"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Avatar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  IconCookie,
  IconLock,
  IconMail,
  IconShieldCheck,
  IconUserCheck,
  IconDatabase,
  IconSettingsAutomation,
  IconShare,
  IconUserShield,
  IconCircleCheck,
} from "@tabler/icons-react";
import { ThemedHeroSection } from "@/components/shared/ThemedComponents";

const secoes = [
  {
    id: 0,
    titulo: "Dados que coletamos",
    icon: <IconDatabase size={22} />,
    texto:
      "Coletamos dados de cadastro (nome, e-mail e identificadores de conta), dados de autenticacao e informacoes de uso necessarias para o funcionamento da aplicacao.",
    bullets: [
      "Dados de perfil para acesso e personalizacao.",
      "Informacoes de sessao e seguranca para autenticacao.",
      "Dados financeiros inseridos por voce para controle no sistema.",
    ],
  },
  {
    id: 1,
    titulo: "Como usamos os dados",
    icon: <IconSettingsAutomation size={22} />,
    texto:
      "Utilizamos os dados para autenticar usuarios, oferecer funcionalidades financeiras, melhorar a experiencia e manter seguranca operacional.",
    bullets: [
      "Permitir login e protecao de rotas privadas.",
      "Exibir dashboards, extratos e relatorios personalizados.",
      "Detectar comportamentos anormais e prevenir abuso.",
    ],
  },
  {
    id: 2,
    titulo: "Compartilhamento",
    icon: <IconShare size={22} />,
    texto:
      "Nao comercializamos seus dados pessoais. O compartilhamento ocorre apenas quando necessario para operacao tecnica e exigencia legal.",
    bullets: [
      "Provedores de autenticacao, como Google, quando voce escolhe login social.",
      "Servicos tecnicos essenciais para hospedagem e monitoramento.",
      "Cumprimento de obrigacoes legais e regulatórias.",
    ],
  },
  {
    id: 3,
    titulo: "Seus direitos",
    icon: <IconUserShield size={22} />,
    texto:
      "Voce pode solicitar revisao, atualizacao e exclusao de dados pessoais, conforme a legislacao aplicavel.",
    bullets: [
      "Confirmacao de tratamento dos dados.",
      "Correcao de informacoes incompletas ou desatualizadas.",
      "Solicitacao de exclusao quando cabivel.",
    ],
  },
];

const destaques = [
  {
    titulo: "Seguranca",
    descricao:
      "Aplicamos boas praticas de autenticacao, controle de acesso e validacao de dados para proteger sua conta.",
    icon: IconLock,
  },
  {
    titulo: "Cookies",
    descricao:
      "Usamos cookies e identificadores de sessao para manter login, preferências e estabilidade da navegacao.",
    icon: IconCookie,
  },
  {
    titulo: "Retencao",
    descricao:
      "Mantemos dados pelo periodo necessario para operacao do servico, conformidade legal e seguranca.",
    icon: IconShieldCheck,
  },
  {
    titulo: "Titularidade",
    descricao:
      "Voce permanece no controle das informacoes que cadastra e pode solicitar suporte para demandas de privacidade.",
    icon: IconUserCheck,
  },
];

export default function PrivacyPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <ThemedHeroSection
        sx={{
          py: 6,
          borderRadius: { xs: 2, md: 3 },
          mt: 3,
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
              // linear-gradient(120deg, transparent 24%, ${alpha(theme.palette.common.white, 0.07)} 46%, transparent 70%),
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
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={2} alignItems="center">
            <Chip
              label="Política de Privacidade"
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.16),
                color: "common.white",
                fontWeight: 700,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: { xs: 1.25, md: 1.3 },
                maxWidth: 900,
                textAlign: "center",
                color: "common.white",
              }}
            >
              Transparencia e seguranca para seus dados
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 760,
                textAlign: "center",
                opacity: 0.95,
                color: "common.white",
              }}
            >
              Esta pagina explica, de forma objetiva, como o MagicBox coleta,
              utiliza, protege e trata os dados pessoais no uso da plataforma.
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "common.white", opacity: 0.9 }}
            >
              Ultima atualizacao: 27/03/2026
            </Typography>
          </Stack>
        </Container>
      </ThemedHeroSection>

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 4, md: 6 }, px: "0px !important" }}
      >
        {/* Grid de Destaques (Mini Cards) */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {destaques.map((item) => {
            const Icon = item.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={item.titulo}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                    },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Icon size={24} color={theme.palette.primary.main} />
                    <Typography variant="h6" fontWeight={700}>
                      {item.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.descricao}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

 {/* SEÇÃO DE TABS */}
<Grid container spacing={4}>
  <Grid item xs={12} md={3.5}>
    <Box sx={{ position: { md: "sticky" }, top: 100 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, px: 1 }}>
        Navegação
      </Typography>
      <Tabs
        orientation="vertical"
        value={activeTab}
        onChange={handleChange}
        sx={{
          borderLeft: `2px solid ${theme.palette.divider}`,
          "& .MuiTabs-indicator": { 
            left: 0, 
            right: "auto", 
            width: 4,
            borderRadius: '0 4px 4px 0' 
          },
          "& .MuiTab-root": {
            display: 'flex',
            alignItems: "center",
            justifyContent: "flex-start",
            minHeight: "48px", // Mais "justinho"
            textAlign: "left",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            py: 1.5,
            px: 2,
            my: 0.8, // Espaçamento entre os itens para ver o arredondamento
            // mx: 1,
            color: "text.secondary",
            borderRadius: '0 12px 12px 0', // Arredonda os cantos do lado direito
            transition: "all 0.2s ease",
            "&.Mui-selected": {
              color: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
            "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
            "& svg": {
                marginRight: '12px !important' // Ícone colado ao texto à esquerda
            }
          },
        }}
      >
        {secoes.map((secao) => (
          <Tab
            key={secao.id}
            label={secao.titulo}
            icon={secao.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  </Grid>

<Grid item xs={12} md={8.5}>
  {/* Adicionando a 'key={activeTab}' fazemos com que o Paper 
    seja "reiniciado" e a animação aconteça no card inteiro 
  */}
  <Paper
    key={activeTab} 
    elevation={1}
    sx={{
      p: { xs: 3, md: 5 },
      borderRadius: 4,
      border: `1px solid ${theme.palette.divider}`,
      background: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.8) 
          : alpha(theme.palette.primary.light, 0.05),
      minHeight: "450px",
      // ANIMAÇÃO APLICADA AO PAPER
      animation: 'slideUpPaper 1s ease',
      "@keyframes slideUpPaper": {
        "0%": {
          opacity: 0,
          transform: "translateX(-30px)",
        },
        "100%": {
          opacity: 1,
          transform: "translateX(0)",
        },
      },
    }}
  >
    {secoes.map((secao) => (
      <Box
        key={secao.id}
        role="tabpanel"
        hidden={activeTab !== secao.id}
        sx={{ display: activeTab === secao.id ? "block" : "none" }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              width: 48,
              height: 48
            }}
          >
            {secao.icon}
          </Avatar>
          <Typography variant="h4" fontWeight={800}>
            {secao.titulo}
          </Typography>
        </Stack>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, fontSize: "1.05rem", lineHeight: 1.7 }}
        >
          {secao.texto}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Pontos principais:
        </Typography>

        <List disablePadding>
          {secao.bullets.map((bullet, idx) => (
            <ListItem key={idx} disableGutters sx={{ alignItems: "flex-start", mb: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                <IconCircleCheck size={22} color={theme.palette.success.main} />
              </ListItemIcon>
              <ListItemText
                primary={bullet}
                primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    ))}
  </Paper>

  {/* Footer de Contato (Fora do Paper para não animar junto, se preferir) */}
  {/* ... código do footer ... */}
</Grid>
</Grid>

        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Ao continuar usando a plataforma, voce reconhece esta politica. Para
            voltar ao inicio, acesse{" "}
            <Link
              href="/"
              style={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              nossa pagina principal
            </Link>
            .
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
