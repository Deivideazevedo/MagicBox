import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

// 1. Esqueleto para os Cards de Sumário Financeiro
export const FinancialSummaryCardsSkeleton = () => {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={6} sm={6} md={3} key={i}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2.5,
              height: "100%",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 4,
                bgcolor: "action.hover",
              }}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1.5}
            >
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="rounded" width={32} height={32} />
            </Box>
            <Skeleton variant="text" width="80%" height={40} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// 2. Esqueleto para o Gráfico de Evolução Mensal
export const MonthlyChartSkeleton = () => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
        >
          <Box>
            <Skeleton variant="text" width="150px" height={24} />
            <Skeleton variant="text" width="200px" height={16} />
          </Box>
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 4 }}
          />
        </Box>
        <Skeleton
          variant="rounded"
          width="100%"
          height={300}
          sx={{ borderRadius: 2 }}
        />
        <Box mt={2}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={80}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// 3. Esqueleto para as Transações Recentes
export const RecentTransactionsSkeleton = () => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Skeleton variant="text" width="120px" height={24} />
          <Skeleton variant="text" width="60px" height={20} />
        </Box>
        <List disablePadding>
          {[1, 2, 3, 4, 5].map((i) => (
            <ListItem
              key={i}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: i < 5 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ component: "div" }}
                secondaryTypographyProps={{ component: "div" }}
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Skeleton variant="text" width="50%" />
                    <Skeleton variant="text" width="20%" />
                  </Box>
                }
                secondary={
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="20%" />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// 4. Esqueleto para o Progresso de Metas
export const GoalsProgressSkeleton = () => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="120px" height={24} />
          </Box>
          <Skeleton variant="text" width="60px" height={20} />
        </Box>
        {[1, 2].map((i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="20%" />
            </Box>
            <Skeleton variant="rounded" width="100%" height={8} />
            <Skeleton variant="text" width="60%" height={16} sx={{ mt: 1 }} />
          </Box>
        ))}
        <Skeleton
          variant="rounded"
          width="100%"
          height={100}
          sx={{ mt: 3, borderRadius: 2 }}
        />
      </CardContent>
    </Card>
  );
};

// 5. Esqueleto para Contas a Pagar (UpcomingBills)
export const UpcomingBillsSkeleton = () => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="120px" height={24} />
          </Box>
          <Skeleton variant="text" width="60px" height={20} />
        </Box>
        <Box mb={3}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={40} />
        </Box>
        <List disablePadding>
          {[1, 2, 3].map((i) => (
            <ListItem
              key={i}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: i < 3 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ component: "div" }}
                secondaryTypographyProps={{ component: "div" }}
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Skeleton variant="text" width="50%" />
                    <Skeleton variant="text" width="20%" />
                  </Box>
                }
                secondary={
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="20%" />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// 6. Esqueleto para o Mapa de Calor de Atividade (Heatmap)
export const TransactionHeatmapSkeleton = () => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box mb={3}>
          <Skeleton variant="text" width="200px" height={32} />
          <Skeleton variant="text" width="300px" height={20} />
        </Box>
        <Skeleton
          variant="rounded"
          width="100%"
          height={200}
          sx={{ borderRadius: 2 }}
        />
      </CardContent>
    </Card>
  );
};
