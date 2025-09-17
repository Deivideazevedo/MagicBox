"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Button,
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { IconWand, IconShieldLock, IconArrowRight } from "@tabler/icons-react";
import { Speed } from "@mui/icons-material";

export default function LandingPage() {
  const theme = useTheme();
  const { data: session } = useSession();

  const features = [
    {
      icon: <IconWand size={40} />,
      title: "Mágica Simplificada",
      description:
        "Interface intuitiva que torna complexas operações simples e mágicas",
    },
    {
      icon: <IconShieldLock size={40} />,
      title: "Segurança Garantida",
      description:
        "Proteção robusta para seus dados com criptografia de ponta a ponta",
    },
    {
      icon: <Speed fontSize="large"/>,
      title: "Alto Desempenho",
      description: "Rapidez e eficiência em todas as operações do sistema",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          py: 12,
          background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h1" sx={{ mb: 4, fontWeight: 700 }}>
            MagicBox
          </Typography>
          <Typography variant="h4" sx={{ mb: 6, opacity: 0.9 }}>
            Transforme sua experiência digital com soluções mágicas
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href={session ? "/dashboard" : "/auth/auth1/login"}
            sx={{
              py: 2,
              px: 4,
              backgroundColor: "white",
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.9)",
              },
            }}
            endIcon={<IconArrowRight />}
          >
            {session ? "Acessar Dashboard" : "Começar Agora"}
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 12 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  textAlign: "center",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
