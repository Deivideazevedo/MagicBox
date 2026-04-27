"use client";

import PageContainer from "@/app/components/container/PageContainer";
import {
  Box,
  Button,
  Container,
  Fade,
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
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FinancialSummaryCards from "./components/FinancialSummaryCards";
import GoalsProgress from "./components/GoalsProgress";
import MonthlyChart from "./components/MonthlyChart";
import QuickActionModal from "./components/QuickActionModal";
import RecentTransactions from "./components/RecentTransactions";
import UpcomingBills from "./components/UpcomingBills";
import TransactionHeatmap from "./components/TransactionHeatmap";

// Componentes locais (serão criados)

import { useMemo } from "react";
import { ProductTour, useTour, ProductTourButton } from "@/app/components/shared/ProductTour";
import { DashboardTourProvider, useDashboardTourRefs } from "./components/DashboardTourContext";
import { criarDashboardTourSteps } from "./components/dashboardTourSteps";

const DashboardContent = () => {
  const { data: session } = useSession();
  const tourRefs = useDashboardTourRefs();
  
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setIsPageVisible(true);
  }, []);

  const steps = useMemo(() => criarDashboardTourSteps(tourRefs), [tourRefs]);
  const tour = useTour({
    storageKey: "tour-dashboard-visto-v1",
    steps,
    autoStart: true,
  });

  // Escutar evento do Header para iniciar o tour
  useEffect(() => {
    const handleStartTour = () => {
      tour.reset();
      tour.start();
    };
    window.addEventListener("start-dashboard-tour", handleStartTour);
    return () => window.removeEventListener("start-dashboard-tour", handleStartTour);
  }, [tour]);

  const userName = session?.user?.name?.split(" ")[0] || "Usuário";
  const isCurrentMonth = format(selectedDate, "MM/yyyy") === format(new Date(), "MM/yyyy");

  return (
    <PageContainer title="Dashboard" description="Visão geral das suas finanças">
      <Fade in={isPageVisible} timeout={350}>
        <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }} ref={tourRefs.welcomeRef}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography 
              variant="h3" 
              fontWeight={700}
              sx={{
                background: "linear-gradient(45deg, #5D87FF 30%, #49BEFF 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {isCurrentMonth ? `Olá, ${userName}! 👋` : `Resumo de ${format(selectedDate, "MMMM", { locale: ptBR })}`}
            </Typography>
            <ProductTourButton 
              onClick={() => {
                tour.reset();
                tour.start();
              }}
              size="small"
            />
            {!isCurrentMonth && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setSelectedDate(new Date())}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Voltar para o mês atual
              </Button>
            )}
          </Stack>
          <Typography variant="h6" color="textSecondary">
            {isCurrentMonth 
              ? "Aqui está um resumo das suas finanças hoje" 
              : `Visualizando dados consolidados de ${format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}`}
          </Typography>
        </Box>

        {/* Financial Summary Cards */}
        <FinancialSummaryCards date={selectedDate} />

        <Box sx={{ mt: 3 }}>
          <TransactionHeatmap />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Monthly Chart */}
          <Grid item xs={12} lg={8}>
            <MonthlyChart 
              selectedDate={selectedDate} 
              onMonthClick={(date: Date) => setSelectedDate(date)} 
            />
          </Grid>

          {/* Goals Progress */}
          <Grid item xs={12} lg={4}>
            <GoalsProgress date={selectedDate} />
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} lg={7}>
            <RecentTransactions date={selectedDate} />
          </Grid>

          {/* Upcoming Bills */}
          <Grid item xs={12} lg={5}>
            <UpcomingBills date={selectedDate} />
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
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Typography variant="h5" fontWeight={600}>
                      🎉 Parabéns! Você está no caminho certo
                    </Typography>
                  </Box>
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
                    href="/relatorios"
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
      </Fade>

      <ProductTour
        isOpen={tour.isOpen}
        step={tour.step}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        isFirstStep={tour.isFirstStep}
        isLastStep={tour.isLastStep}
        onNext={tour.next}
        onPrev={tour.prev}
        onSkip={tour.skip}
      />
    </PageContainer>
  );
};

const Dashboard = () => {
  return (
    <DashboardTourProvider>
      <DashboardContent />
    </DashboardTourProvider>
  );
};

export default Dashboard;
