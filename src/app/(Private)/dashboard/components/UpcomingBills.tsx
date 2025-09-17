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
} from "@mui/material";
import {
  IconAlertTriangle,
  IconCalendar,
  IconClock,
  IconArrowRight,
  IconBolt,
  IconHome,
  IconCar,
  IconPhone,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface UpcomingBill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  status: "pending" | "overdue" | "paid";
  icon: React.ReactNode;
}

const UpcomingBills = () => {
  // Mock data - em produção, estes dados viriam de APIs
  const [bills, setBills] = useState<UpcomingBill[]>([
    {
      id: "1",
      title: "Conta de Luz",
      amount: 185.90,
      dueDate: "2024-01-20",
      category: "Utilidades",
      status: "pending",
      icon: <IconBolt size={20} />,
    },
    {
      id: "2",
      title: "Financiamento Casa",
      amount: 1200.00,
      dueDate: "2024-01-25",
      category: "Habitação",
      status: "pending",
      icon: <IconHome size={20} />,
    },
    {
      id: "3",
      title: "Seguro do Carro",
      amount: 320.50,
      dueDate: "2024-01-18",
      category: "Transporte",
      status: "overdue",
      icon: <IconCar size={20} />,
    },
    {
      id: "4",
      title: "Internet + TV",
      amount: 129.90,
      dueDate: "2024-01-22",
      category: "Utilidades",
      status: "pending",
      icon: <IconPhone size={20} />,
    },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
    const due = new Date(dueDate);
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Utilidades": "#5D87FF",
      "Habitação": "#13DEB9",
      "Transporte": "#FA896B",
      "Alimentação": "#FFAE1F",
    };
    return colors[category] || "#757575";
  };

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = bills.filter(bill => getDaysUntilDue(bill.dueDate).status === "overdue");

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
          >
            Ver todas
          </Button>
        </Box>

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
            Total a pagar este mês
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {formatCurrency(totalAmount)}
          </Typography>
        </Box>

        <List disablePadding>
          {bills.map((bill, index) => {
            const { status } = getDaysUntilDue(bill.dueDate);
            
            return (
              <ListItem
                key={bill.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: index < bills.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: `${getCategoryColor(bill.category)}20`,
                      color: getCategoryColor(bill.category),
                    }}
                  >
                    {bill.icon}
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" fontWeight={500}>
                        {bill.title}
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {formatCurrency(bill.amount)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                      <Chip
                        label={getStatusLabel(bill.dueDate)}
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
                      <Typography variant="caption" color="text.secondary">
                        {formatDueDate(bill.dueDate)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default UpcomingBills;