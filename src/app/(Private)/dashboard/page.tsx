"use client";

// export const dynamic = 'force-dynamic';

import PageContainer from "@/app/components/container/PageContainer";
import {
  Box,
  Button,
  Container,
  Fab,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import {
  IconCreditCard,
  IconPlus,
  IconTrendingUp,
  IconWallet
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import FinancialSummaryCards from "./components/FinancialSummaryCards";
import GoalsProgress from "./components/GoalsProgress";
import MonthlyChart from "./components/MonthlyChart";
import QuickActionModal from "./components/QuickActionModal";
import RecentTransactions from "./components/RecentTransactions";
import UpcomingBills from "./components/UpcomingBills";

// Componentes locais (serão criados)

const Dashboard = () => {
  const { data: session } = useSession();
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"despesa" | "conta" | "lancamento" | null>(null);

  const handleQuickAction = (action: "despesa" | "conta" | "lancamento") => {
    setSelectedAction(action);
    setQuickActionOpen(true);
  };

  // 🔥 ERRO DE RUNTIME PROPOSITAL - Remover após testar
  const obj: any = undefined;
  const teste = obj.propriedades; // ← Vai gerar TypeError e acionar error.tsx

  const userName = session?.user?.name?.split(" ")[0] || "Usuário";

  return (
    <PageContainer title="Dashboard" description="Visão geral das suas finanças">
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            fontWeight={700}
            sx={{
              background: "linear-gradient(45deg, #5D87FF 30%, #49BEFF 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Olá, {userName}! 👋
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
            Aqui está um resumo das suas finanças hoje
          </Typography>
          
          {/* Quick Actions */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<IconPlus />}
              onClick={() => handleQuickAction("lancamento")}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                py: 1.5,
                background: "linear-gradient(45deg, #5D87FF 30%, #49BEFF 90%)",
                "&:hover": {
                  background: "linear-gradient(45deg, #4570EA 30%, #2A9BE8 90%)",
                },
              }}
            >
              Novo Lançamento
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<IconWallet />}
              onClick={() => handleQuickAction("despesa")}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                py: 1.5,
              }}
            >
              Nova Despesa
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<IconCreditCard />}
              onClick={() => handleQuickAction("conta")}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                py: 1.5,
              }}
            >
              Nova Conta
            </Button>
          </Stack>
        </Box>

        {/* Financial Summary Cards */}
        {/* <FinancialSummaryCards /> */}

        {/* Main Content Grid */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Monthly Chart */}
          <Grid item xs={12} lg={8}>
            <MonthlyChart />
          </Grid>

          {/* Goals Progress */}
          <Grid item xs={12} lg={4}>
            <GoalsProgress />
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} lg={7}>
            <RecentTransactions />
          </Grid>

          {/* Upcoming Bills */}
          <Grid item xs={12} lg={5}>
            <UpcomingBills />
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                p: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    🎉 Parabéns! Você está no caminho certo
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Suas finanças estão organizadas e você tem controle total sobre seus gastos.
                    Continue assim e alcance seus objetivos financeiros!
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} textAlign="center">
                  <IconButton
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      width: 64,
                      height: 64,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                    href="/dashboard/relatorios"
                  >
                    <IconTrendingUp size={32} />
                  </IconButton>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Ver Relatórios
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
};

export default Dashboard;
