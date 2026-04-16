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
} from "@mui/material";
import {
  IconAlertTriangle,
  IconCalendar,
  IconClock,
  IconArrowRight,
  IconCheck,
  IconEditCircle,
} from "@tabler/icons-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { useGetDashboardQuery } from "@/services/endpoints/dashboardApi";
import { useCreateLancamentoMutation } from "@/services/endpoints/lancamentosApi";
import { useDispatch } from "@/store/hooks";
import { abrirDrawer } from "@/store/apps/lancamentos/LancamentoSlice";
import { SwalToast, Swalert } from "@/utils/swalert";

const UpcomingBills = () => {
  const dispatch = useDispatch();
  const dataInicio = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data: dashboard, isLoading } = useGetDashboardQuery({
    dataInicio,
    dataFim,
  });

  const [createLancamento] = useCreateLancamentoMutation();

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
    const confirm = await Swalert({
      icon: "question",
      title: "Pagar Despesa",
      text: `Deseja pagar a despesa ${bill.nome} com o valor agendado de ${formatCurrency(bill.valorPrevisto)}?`,
      confirmButtonText: "Sim, pagar agora",
      cancelButtonText: "Cancelar"
    });

    if (confirm.isConfirmed) {
      try {
        await createLancamento({
          tipo: "pagamento",
          valor: bill.valorPrevisto,
          data: new Date().toISOString(), // Today
          despesaId: bill.despesaId,
          observacao: `Pagamento de ${bill.nome} referente a ${bill.mes}/${bill.ano}`
        }).unwrap();

        SwalToast.fire({
          icon: "success",
          title: "Despesa paga com sucesso!",
        });
      } catch (error) {
        SwalToast.fire({
          icon: "error",
          title: "Erro ao registrar pagamento.",
        });
      }
    }
  };

  const openDrawer = (bill: any) => {
    dispatch(abrirDrawer({ 
      modo: "pagar", 
      dados: {
        ...bill,
        origem: "despesa" // No dashboard de UpcomingBills são sempre despesas
      } 
    }));
  };

  const totalAmount = bills.reduce((sum, bill) => sum + bill.valorPrevisto, 0);
  const overdueBills = bills.filter(bill => {
    const dueDate = getDueDateString(bill.diaVencido, bill.mes, bill.ano);
    return getDaysUntilDue(dueDate).status === "overdue" || bill.atrasado;
  });

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
            size="small"
            endIcon={<IconArrowRight size={16} />}
            sx={{
              textTransform: "none",
              color: "primary.main",
            }}
            href="/dashboard/despesas"
          >
            Ver todas
          </Button>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
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
                Você tem {overdueBills.length} conta{overdueBills.length > 1 ? "s" : ""} em atraso
              </Alert>
            )}

            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total a pagar pendente este mês
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {formatCurrency(totalAmount)}
              </Typography>
            </Box>

            {bills.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                Nenhuma conta a pagar pendente.
              </Typography>
            ) : (
              <List disablePadding>
                {bills.slice(0, 5).map((bill, index) => {
                  const dueDateString = getDueDateString(bill.diaVencido, bill.mes, bill.ano);
                  const { status } = getDaysUntilDue(dueDateString);
                  const billColor = bill.cor || "#757575";
                  
                  return (
                    <ListItem
                      key={bill.id}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: index < Math.min(bills.length, 5) - 1 ? "1px solid #f0f0f0" : "none",
                        "&:hover .action-buttons": {
                          opacity: 1,
                        }
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
                          <DynamicIcon name={bill.icone} size={20} fallbackIcon="IconInvoice" color={billColor} />
                        </Avatar>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight={500} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
                              {bill.nome}
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color="text.primary">
                              {formatCurrency(bill.valorPrevisto)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                            <Tooltip title="Pagar com valor agendado" arrow placement="top">
                              <Chip
                                label={getStatusLabel(dueDateString)}
                                size="small"
                                icon={<IconClock size={14} />}
                                onClick={() => handleQuickPay(bill)}
                                sx={{
                                  backgroundColor: `${getStatusColor(status)}20`,
                                  color: getStatusColor(status),
                                  fontSize: "0.75rem",
                                  height: 20,
                                  cursor: "pointer",
                                  "& .MuiChip-icon": {
                                    color: "inherit",
                                  },
                                  "&:hover": {
                                    backgroundColor: `${getStatusColor(status)}40`,
                                  }
                                }}
                              />
                            </Tooltip>
                            
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDueDate(dueDateString)}
                              </Typography>

                              <Box 
                                className="action-buttons" 
                                sx={{ 
                                  opacity: 0, 
                                  transition: 'opacity 0.2s',
                                  display: 'flex',
                                  gap: 0.5 
                                }}
                              >
                                <Tooltip title="Baixa rápida">
                                  <IconButton size="small" onClick={() => handleQuickPay(bill)} color="success" sx={{ p: 0.5 }}>
                                    <IconCheck size={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Abrir com detalhes preenchidos">
                                  <IconButton size="small" onClick={() => openDrawer(bill)} color="primary" sx={{ p: 0.5 }}>
                                    <IconEditCircle size={18} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBills;