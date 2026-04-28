"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { IconArrowRight } from "@tabler/icons-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useGetDashboardQuery } from "@/services/endpoints/dashboardApi";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";

import { useDashboardTourRefs } from "../components/DashboardTourContext";

const RecentTransactions = ({ date }: { date?: Date }) => {
  const { recentTransactionsRef } = useDashboardTourRefs();
  const baseDate = date || new Date();
  const dataInicio = format(startOfMonth(baseDate), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(baseDate), "yyyy-MM-dd");

  const { data: dashboard, isLoading } = useGetDashboardQuery({ dataInicio, dataFim });
  const transactions = dashboard?.transacoesRecentes || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Adjusting for timezone to avoid showing previous day
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return adjustedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <Card
      ref={recentTransactionsRef}
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Transações Recentes
          </Typography>
          <Button
            endIcon={<IconArrowRight size={16} />}
            sx={{
              textTransform: "none",
              color: "primary.main",
            }}
            href="/lancamentos"
          >
            Ver todas
          </Button>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            Nenhuma transação recente encontrada.
          </Typography>
        ) : (
          <List disablePadding>
            {transactions.map((transaction, index) => {
              const isReceita = transaction.tipo === "receita";
              const title = transaction.descricao || "Transação";
              const iconName = transaction.icone;
              const color = transaction.cor || (isReceita ? "#13DEB9" : "#FA896B");
              const categoryName = isReceita ? "Receita" : "Despesa";

              return (
                <ListItem
                  key={transaction.id}
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderBottom: index < transactions.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      <DynamicIcon name={iconName} size={20} fallbackIcon={isReceita ? "IconArrowUp" : "IconArrowDown"} color={color} />
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primaryTypographyProps={{ component: "div" }}
                    secondaryTypographyProps={{ component: "div" }}
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight={500} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
                          {title}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color={isReceita ? "#13DEB9" : "#FA896B"}
                        >
                          {isReceita ? "+" : "-"}{formatCurrency(transaction.valor)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Chip
                          label={categoryName}
                          size="small"
                          sx={{
                            backgroundColor: `${color}20`,
                            color: color,
                            fontSize: "0.75rem",
                            height: 20,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(transaction.data)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;