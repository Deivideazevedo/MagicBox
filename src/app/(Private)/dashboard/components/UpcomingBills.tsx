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
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconCalendar,
  IconClock,
  IconArrowRight,
  IconCheck,
  IconEditCircle,
  IconCash,
} from "@tabler/icons-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { useGetDashboardQuery } from "@/services/endpoints/dashboardApi";
import { useCreateLancamentoMutation } from "@/services/endpoints/lancamentosApi";
import { useLancamentoDrawer } from "@/hooks/useLancamentoDrawer";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { fnGetTodayISO } from "@/utils/functions/fnGetTodayISO";

import { useDashboardTourRefs } from "../components/DashboardTourContext";
import { UpcomingBillsSkeleton } from "./DashboardSkeletons";
import Link from "next/link";

const UpcomingBills = ({ date }: { date?: Date }) => {
  const { upcomingBillsRef } = useDashboardTourRefs();
  const { abrirDrawer: openLancamentoDrawer } = useLancamentoDrawer();
  const confirm = useConfirm();
  const baseDate = date || new Date();
  const dataInicio = format(startOfMonth(baseDate), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(baseDate), "yyyy-MM-dd");

  const { data: dashboard, isLoading } = useGetDashboardQuery({
    dataInicio,
    dataFim,
  });

  const [createLancamento] = useCreateLancamentoMutation();

  if (isLoading) {
    return <UpcomingBillsSkeleton />;
  }

  const bills = dashboard?.upcomingBills || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getDueDateString = (dia: number | null, mes: number, ano: number) => {
    if (!dia) return new Date(ano, mes - 1, 1).toISOString();
    return new Date(ano, mes - 1, dia).toISOString();
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    // zerar horas
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { days: Math.abs(diffDays), status: "overdue" };
    if (diffDays === 0) return { days: 0, status: "today" };
    return { days: diffDays, status: "pending" };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "#FA896B";
      case "today":
        return "#FFAE1F";
      default:
        return "#13DEB9";
    }
  };

  const getStatusLabel = (dueDate: string) => {
    const { days, status } = getDaysUntilDue(dueDate);

    switch (status) {
      case "overdue":
        return `${days} dia${days > 1 ? "s" : ""} em atraso`;
      case "today":
        return "Vence hoje";
      default:
        return `${days} dia${days > 1 ? "s" : ""}`;
    }
  };

  const handleQuickPay = async (bill: any) => {
    await confirm.create({
      title: "Pagar Despesa",
      icon: IconCash,
      description: (
        <>
          Deseja pagar a despesa <strong>"{bill.nome}"</strong> com o valor
          agendado de {formatCurrency(bill.valorPrevisto)}?
        </>
      ),
      confirmText: "Sim, pagar agora",
      onConfirm: async () => {
        await createLancamento({
          tipo: "pagamento",
          valor: bill.valorPrevisto,
          data: fnGetTodayISO(),
          despesaId: bill.despesaId,
          observacaoAutomatica: `Pagamento de ${bill.nome} referente a ${bill.mes}/${bill.ano}`,
        }).unwrap();
        // await new Promise((resolve) => setTimeout(resolve, 5000));
        toast.success("Despesa paga com sucesso!");
      },
    });
  };

  const openDrawer = (bill: any) => {
    openLancamentoDrawer("pagar", {
      ...bill,
      origemId: bill.despesaId || bill.id,
      origem: "despesa", // No dashboard de UpcomingBills são sempre despesas
    });
  };

  const totalAmount = bills.reduce((sum, bill) => sum + bill.valorPrevisto, 0);
  const overdueBills = bills.filter((bill) => {
    const dueDate = getDueDateString(bill.diaVencido, bill.mes, bill.ano);
    return getDaysUntilDue(dueDate).status === "overdue" || bill.atrasado;
  });

  return (
    <Card
      ref={upcomingBillsRef}
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
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "#FFAE1F20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFAE1F",
              }}
            >
              <IconCalendar size={20} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Contas a Pagar
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/resumo"
            size="small"
            endIcon={<IconArrowRight size={16} />}
            sx={{
              textTransform: "none",
              color: "primary.main",
            }}
          >
            Ver todas
          </Button>
        </Box>

        <>
            {overdueBills.length > 0 && (
              <Alert
                severity="warning"
                icon={<IconAlertTriangle size={20} />}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-message": {
                    fontSize: "0.875rem",
                  },
                }}
              >
                Você tem {overdueBills.length} conta
                {overdueBills.length > 1 ? "s" : ""} em atraso
              </Alert>
            )}

            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total a pagar pendente em{" "}
                <Box
                  component="span"
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  {format(baseDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </Box>
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {formatCurrency(totalAmount)}
              </Typography>
            </Box>

            {bills.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Nenhuma conta a pagar pendente.
              </Alert>
            ) : (
              <Box sx={{ maxHeight: 380, overflowY: "auto", pr: 1.5 }}>
                <List disablePadding>
                  {bills.map((bill, index) => {
                    const dueDateString = getDueDateString(
                      bill.diaVencido,
                      bill.mes,
                      bill.ano,
                    );
                    const { status } = getDaysUntilDue(dueDateString);
                    const billColor = bill.cor || "#757575";

                    return (
                      <ListItem
                        key={bill.id}
                        sx={{
                          px: 0,
                          py: 1,
                          borderBottom:
                            index < bills.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: `${billColor}20`,
                              color: billColor,
                            }}
                          >
                            <DynamicIcon
                              name={bill.icone}
                              size={20}
                              fallbackIcon="IconInvoice"
                              color={billColor}
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
                                  maxWidth: "70%",
                                }}
                              >
                                {bill.nome}
                              </Typography>

                              <Box display="flex" gap={0.5}>
                                <Tooltip title="Baixa rápida" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleQuickPay(bill)}
                                    color="success"
                                    sx={{ padding: "4px" }}
                                  >
                                    <IconCheck size={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Preencher detalhes" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => openDrawer(bill)}
                                    color="primary"
                                    sx={{ padding: "4px" }}
                                  >
                                    <IconEditCircle size={18} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="flex-end"
                              // mt={0.5}
                            >
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label={getStatusLabel(dueDateString)}
                                  size="small"
                                  icon={<IconClock size={14} />}
                                  sx={{
                                    backgroundColor: `${getStatusColor(status)}20`,
                                    color: getStatusColor(status),
                                    fontSize: "0.75rem",
                                    height: 20,
                                    "& .MuiChip-icon": {
                                      color: "inherit",
                                    },
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDueDate(dueDateString)}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color="text.primary"
                              >
                                {formatCurrency(bill.valorPrevisto)}
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
          </>
      </CardContent>
    </Card>
  );
};

export default UpcomingBills;
