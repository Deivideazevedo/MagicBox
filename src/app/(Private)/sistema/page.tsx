"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Slider,
  Stack,
  Divider,
  Alert,
  AlertTitle,
  useTheme,
  alpha,
  Collapse,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  IconTrash,
  IconCategory,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconDatabase,
  IconCheck,
  IconCalendar,
  IconClock,
  IconBolt,
  IconSettings,
} from "@tabler/icons-react";
import { useSistema } from "./hooks/useSistema";

export default function SistemaPage() {
  const theme = useTheme();

  // Consumir toda a parte lógica delegada ao custom hook useSistema
  const {
    dias,
    isLoading,
    resultado,
    dataLimiteFormatada,
    handleSliderChange,
    handleSetDias,
    handleLimpar,
  } = useSistema();

  // Definição das tabelas afetadas para renderização dinâmica premium
  const tabelasAfetadas = [
    {
      title: "Categorias",
      desc: "Categorias soft-deletadas e toda a sua árvore de dados vinculados.",
      icon: <IconCategory size={22} stroke={2} />,
      color: "#5D87FF", // Blue
    },
    {
      title: "Receitas",
      desc: "Lançamentos de receitas individuais removidos da visualização ativa.",
      icon: <IconTrendingUp size={22} stroke={2} />,
      color: "#13DEB9", // Teal/Green
    },
    {
      title: "Despesas",
      desc: "Registros de despesas individuais descartados que ultrapassaram o período.",
      icon: <IconTrendingDown size={22} stroke={2} />,
      color: "#FA896B", // Red/Coral
    },
    {
      title: "Objetivos / Metas",
      desc: "Objetivos financeiros e históricos de aportes excluídos pelo usuário.",
      icon: <IconTarget size={22} stroke={2} />,
      color: "#FFAE1F", // Yellow/Orange
    },
  ];

  return (
    <Box p={3} sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Cabeçalho Premium */}
      <Box display="flex" alignItems="center" mb={4} gap={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconSettings size={32} stroke={1.5} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
            Manutenção do Sistema
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Otimização do banco de dados PostgreSQL Neon e exclusão definitiva de dados.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Painel Esquerdo: Configuração e Controle */}
        <Grid item xs={12} md={7}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              position: "relative",
              mb: 3,
            }}
          >
            {/* Detalhe estético premium */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 4,
                height: "100%",
                bgcolor: "primary.main",
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                <IconDatabase size={24} stroke={1.5} />
                Limpeza Física de Dados Inativos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                Quando você deleta informações na plataforma, elas passam por um processo de exclusão lógica (Soft Delete), mantendo os registros salvos temporariamente para fins de segurança e arrependimento. Use este painel para remover definitivamente esses itens do banco de dados, otimizando o seu espaço e desempenho.
              </Typography>

              {/* Alerta Informativo */}
              <Alert
                severity="info"
                icon={<IconClock size={20} />}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  color: "info.dark",
                  mb: 4,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.info.main, 0.2),
                }}
              >
                <AlertTitle sx={{ fontWeight: 700 }}>Período de Arrependimento</AlertTitle>
                Apenas dados marcados como excluídos **antes de {dataLimiteFormatada}** serão purgados fisicamente do banco de dados Neon.
              </Alert>

              {/* Slider de Configuração de Dias */}
              <Box sx={{ px: 2, mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body1" fontWeight={600} display="flex" alignItems="center" gap={1}>
                    <IconCalendar size={18} />
                    Período mínimo de inatividade:
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.main">
                    {dias} {dias === 1 ? "dia" : "dias"}
                  </Typography>
                </Stack>

                <Slider
                  value={dias}
                  onChange={handleSliderChange}
                  min={0}
                  max={90}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{
                    height: 8,
                    "& .MuiSlider-track": {
                      border: "none",
                    },
                    "& .MuiSlider-thumb": {
                      width: 20,
                      height: 20,
                      backgroundColor: "#fff",
                      border: "2px solid currentColor",
                      "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                        boxShadow: "inherit",
                      },
                      "&::before": {
                        display: "none",
                      },
                    },
                  }}
                />

                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    0 dias (imediato)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    90 dias
                  </Typography>
                </Stack>
              </Box>

              {/* Atalhos Rápidos */}
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Atalhos de Período
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
                <Button
                  size="small"
                  variant={dias === 7 ? "contained" : "outlined"}
                  color={dias === 7 ? "primary" : "inherit"}
                  onClick={() => handleSetDias(7)}
                  sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
                >
                  7 Dias (Recomendado)
                </Button>
                <Button
                  size="small"
                  variant={dias === 15 ? "contained" : "outlined"}
                  color={dias === 15 ? "primary" : "inherit"}
                  onClick={() => handleSetDias(15)}
                  sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
                >
                  15 Dias
                </Button>
                <Button
                  size="small"
                  variant={dias === 30 ? "contained" : "outlined"}
                  color={dias === 30 ? "primary" : "inherit"}
                  onClick={() => handleSetDias(30)}
                  sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
                >
                  30 Dias
                </Button>
                <Button
                  size="small"
                  variant={dias === 0 ? "contained" : "outlined"}
                  color={dias === 0 ? "error" : "inherit"}
                  onClick={() => handleSetDias(0)}
                  sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
                >
                  Imediato (0 dias)
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Botão de Limpeza com Estilo Premium Destrutivo */}
              <Box display="flex" justifyContent="flex-end">
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={handleLimpar}
                  startIcon={<IconTrash size={20} />}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.error.main, 0.15)}`,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      bgcolor: "error.dark",
                      boxShadow: `0 12px 20px ${alpha(theme.palette.error.main, 0.3)}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Iniciar Purga Física
                </LoadingButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Painel Direito: Entidades Afetadas */}
        <Grid item xs={12} md={5}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ px: 1 }}>
              Tabelas do Banco Otimizadas
            </Typography>

            <Grid container spacing={2}>
              {tabelasAfetadas.map((tab, idx) => (
                <Grid item xs={12} key={idx}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: alpha(tab.color, 0.15),
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateX(6px)",
                        boxShadow: `0 8px 16px ${alpha(tab.color, 0.08)}`,
                        borderColor: alpha(tab.color, 0.4),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 4,
                        height: "100%",
                        bgcolor: tab.color,
                      }}
                    />
                    <CardContent sx={{ p: 2.5, display: "flex", gap: 2, alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          bgcolor: alpha(tab.color, 0.1),
                          color: tab.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {tab.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
                          {tab.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.4 }}>
                          {tab.desc}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Resultados da Purga com Animação Premium */}
      <Collapse in={resultado !== null} timeout={400}>
        {resultado && (
          <Card
            elevation={0}
            sx={{
              mt: 4,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.success.main, 0.02),
              border: "1px solid",
              borderColor: alpha(theme.palette.success.main, 0.2),
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 4,
                bgcolor: "success.main",
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: "success.main",
                    display: "flex",
                  }}
                >
                  <IconCheck size={20} stroke={2.5} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="success.dark">
                    Limpeza Concluída com Sucesso!
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Registros removidos de forma definitiva do PostgreSQL Neon
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {[
                  {
                    name: "Categorias",
                    count: resultado.categorias,
                    icon: <IconCategory size={20} />,
                    color: "#5D87FF",
                  },
                  {
                    name: "Receitas",
                    count: resultado.receitas,
                    icon: <IconTrendingUp size={20} />,
                    color: "#13DEB9",
                  },
                  {
                    name: "Despesas",
                    count: resultado.despesas,
                    icon: <IconTrendingDown size={20} />,
                    color: "#FA896B",
                  },
                  {
                    name: "Objetivos / Metas",
                    count: resultado.objetivos,
                    icon: <IconTarget size={20} />,
                    color: "#FFAE1F",
                  },
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        sx={{
                          mx: "auto",
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: alpha(item.color, 0.1),
                          color: item.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1.5,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>
                        {item.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Alert
                severity="success"
                icon={<IconBolt size={20} />}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  color: "success.dark",
                  mt: 3,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.success.main, 0.15),
                }}
              >
                O banco de dados foi reorganizado e o espaço físico correspondente a estes registros inativos foi totalmente recuperado!
              </Alert>
            </CardContent>
          </Card>
        )}
      </Collapse>
    </Box>
  );
}
