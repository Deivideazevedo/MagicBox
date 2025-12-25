"use client";

import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  IconCalendar,
  IconForms,
  IconLibrary,
  IconMask,
} from "@tabler/icons-react";

interface TestCard {
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  emoji: string;
  tags: string[];
  color: string;
}

const testCards: TestCard[] = [
  {
    title: "DatePicker",
    description: "Exemplos de HookDatePicker, HookMonthPicker e HookYearPicker com validações",
    route: "/teste/datepicker",
    icon: <IconCalendar size={40} />,
    emoji: "📅",
    tags: ["Date", "Form", "Validation"],
    color: "#4CAF50",
  },
  {
    title: "Inputs Básicos",
    description: "TextField, Select e Autocomplete integrados com React Hook Form",
    route: "/teste/inputs-basicos",
    icon: <IconForms size={40} />,
    emoji: "📝",
    tags: ["TextField", "Select", "Autocomplete"],
    color: "#2196F3",
  },
  {
    title: "Máscaras",
    description: "Exemplos de campos com máscara (CPF, CNPJ, Telefone, CEP, etc)",
    route: "/teste/mascaras",
    icon: <IconMask size={40} />,
    emoji: "🎭",
    tags: ["Mask", "Format", "Input"],
    color: "#FF9800",
  },
  {
    title: "Comparação de Libs",
    description: "Comparação entre diferentes bibliotecas de formatação e máscaras",
    route: "/teste/comparacao-libs",
    icon: <IconLibrary size={40} />,
    emoji: "📚",
    tags: ["Libraries", "Comparison"],
    color: "#9C27B0",
  },
];

export default function TestePage() {
  const router = useRouter();

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box mb={6} textAlign="center">
        <Typography
          variant="h2"
          fontWeight={800}
          mb={2}
          sx={{
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🧪 Área de Testes
        </Typography>
        <Typography variant="h6" color="textSecondary" maxWidth="800px" mx="auto">
          Explore e teste todos os componentes e funcionalidades do MagicBox.
          Cada página contém exemplos práticos e interativos.
        </Typography>
      </Box>

      {/* Test Cards Grid */}
      <Grid container spacing={4}>
        {testCards.map((test, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  // boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => handleCardClick(test.route)}
                sx={{ height: "100%", p: 0 }}
              >
                {/* <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}> */}
                  {/* Icon and Emoji */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 100,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: `${test.color}15`,
                      color: test.color,
                      position: "relative",
                    }}
                  >
                    {test.icon}
                  </Box>

                  {/* Title */}
                  <Typography variant="h5" fontWeight={700} mb={1}>
                    {test.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    mb={2}
                    sx={{ flexGrow: 1 }}
                  >
                    {test.description}
                  </Typography>

                  {/* Tags */}
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {test.tags.map((tag, tagIndex) => (
                      <Chip
                        key={tagIndex}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: `${test.color}20`,
                          color: test.color,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                {/* </CardContent> */}
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box mt={8} mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "primary.main", color: "white" }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" fontWeight={700}>
                  {testCards.length}
                </Typography>
                <Typography variant="body2">Páginas de Teste</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "success.main", color: "white" }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" fontWeight={700}>
                  15+
                </Typography>
                <Typography variant="body2">Componentes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "warning.main", color: "white" }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" fontWeight={700}>
                  50+
                </Typography>
                <Typography variant="body2">Exemplos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "info.main", color: "white" }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" fontWeight={700}>
                  100%
                </Typography>
                <Typography variant="body2">TypeScript</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Footer Info */}
      <Box mt={6} p={4} bgcolor="grey.100" borderRadius={2}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          💡 Sobre esta área
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={2}>
          Esta é uma área dedicada a testes e demonstrações de componentes do MagicBox.
          Todos os exemplos são interativos e podem ser testados em tempo real.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <strong>Dica:</strong> Abra o console do navegador (F12) para ver os logs de dados dos formulários.
        </Typography>
      </Box>
    </Container>
  );
}
