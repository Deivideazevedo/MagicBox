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
  Skeleton,
  Alert,
  useTheme,
} from "@mui/material";
import { IconArrowRight } from "@tabler/icons-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useGetDashboardQuery } from "@/services/endpoints/dashboardApi";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";

import { useDashboardTourRefs } from "../components/DashboardTourContext";
import { RecentTransactionsSkeleton } from "./DashboardSkeletons";
import Link from "next/link";

const RecentTransactions = ({ date }: { date?: Date }) => {
  const theme = useTheme();
  const { recentTransactionsRef } = useDashboardTourRefs();
  const baseDate = date || new Date();
  const dataInicio = format(startOfMonth(baseDate), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(baseDate), "yyyy-MM-dd");

  const { data: dashboard, isLoading } = useGetDashboardQuery({
    dataInicio,
    dataFim,
  });
  const transactions = dashboard?.transacoesRecentes || [];

  if (isLoading) {
    return <RecentTransactionsSkeleton />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Adjusting for timezone to avoid showing previous day
    const adjustedDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000,
    );
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight={600}>
            Transações Recentes
          </Typography>
          <Button
            component={Link}
            href="/lancamentos"
            endIcon={<IconArrowRight size={16} />}
            sx={{
              textTransform: "none",
              color: "primary.main",
            }}
          >
            Ver todas
          </Button>
        </Box>

        {transactions.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Nenhuma transação recente encontrada.
          </Alert>
        ) : (
          <Box sx={{ maxHeight: 380, overflowY: "auto", pr: 1.5 }}>
            <List disablePadding>
              {transactions.map((transaction, index) => {
                const isReceita = transaction.tipo === "receita";
                const isObjetivo = transaction.tipo === "objetivo";
                const isAporte = isObjetivo && transaction.valor > 0;
                const isRetirada = isObjetivo && transaction.valor < 0;
                const title = transaction.descricao || "Transação";
                const iconName = transaction.icone;
                const color =
                  transaction.cor ||
                  (isReceita
                    ? theme.palette.success.main
                    : isAporte
                      ? theme.palette.primary.main
                      : theme.palette.error.main);
                const categoryName = isReceita
                  ? "Receita"
                  : isAporte
                    ? "Aporte"
                    : isRetirada
                      ? "Retirada"
                      : "Despesa";

                return (
                  <ListItem
                    key={transaction.id}
                    sx={{
                      px: 0,
                      py: 1.5,
                      borderBottom:
                        index < transactions.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
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
                        <DynamicIcon
                          name={iconName}
                          size={20}
                          fallbackIcon={
                            isObjetivo
                              ? "IconTarget"
                              : isReceita
                                ? "IconArrowUp"
                                : "IconArrowDown"
                          }
                          color={color}
                        />
                      </Avatar>
                    </ListItemIcon>

                    <ListItemText
                      primaryTypographyProps={{ component: "div" }}
                      secondaryTypographyProps={{ component: "div" }}
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="body1"
                            fontWeight={500}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "60%",
                            }}
                          >
                            {title}
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            color={
                              isReceita
                                ? "success.main"
                                : isAporte
                                  ? "primary.main"
                                  : "error.main"
                            }
                          >
                            {isReceita || isAporte ? "+" : "-"}
                            {formatCurrency(transaction.valor)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mt={0.5}
                        >
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
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
