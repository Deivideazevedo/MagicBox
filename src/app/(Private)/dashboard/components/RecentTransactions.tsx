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
} from "@mui/material";
import {
  IconArrowRight,
  IconShoppingCart,
  IconHome,
  IconCar,
  IconPhone,
  IconCoffee,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  category: string;
  date: string;
  icon: React.ReactNode;
}

const RecentTransactions = () => {
  // Mock data - em produção, estes dados viriam de APIs
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      description: "Supermercado Carrefour",
      amount: -285.90,
      type: "despesa",
      category: "Alimentação",
      date: "2024-01-15",
      icon: <IconShoppingCart size={20} />,
    },
    {
      id: "2",
      description: "Salário Janeiro",
      amount: 4500.00,
      type: "receita",
      category: "Trabalho",
      date: "2024-01-15",
      icon: <IconHome size={20} />,
    },
    {
      id: "3",
      description: "Posto Shell",
      amount: -120.00,
      type: "despesa",
      category: "Transporte",
      date: "2024-01-14",
      icon: <IconCar size={20} />,
    },
    {
      id: "4",
      description: "Conta Telefone",
      amount: -89.90,
      type: "despesa",
      category: "Utilidades",
      date: "2024-01-13",
      icon: <IconPhone size={20} />,
    },
    {
      id: "5",
      description: "Starbucks",
      amount: -25.50,
      type: "despesa",
      category: "Lazer",
      date: "2024-01-12",
      icon: <IconCoffee size={20} />,
    },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Alimentação": "#FA896B",
      "Trabalho": "#13DEB9",
      "Transporte": "#5D87FF",
      "Utilidades": "#FFAE1F",
      "Lazer": "#49BEFF",
    };
    return colors[category] || "#757575";
  };

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
          <Typography variant="h6" fontWeight={600}>
            Transações Recentes
          </Typography>
          <Button
            endIcon={<IconArrowRight size={16} />}
            sx={{
              textTransform: "none",
              color: "primary.main",
            }}
            href="/dashboard/extrato"
          >
            Ver todas
          </Button>
        </Box>

        <List disablePadding>
          {transactions.map((transaction, index) => (
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
                    backgroundColor: `${getCategoryColor(transaction.category)}20`,
                    color: getCategoryColor(transaction.category),
                  }}
                >
                  {transaction.icon}
                </Avatar>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" fontWeight={500}>
                      {transaction.description}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color={transaction.type === "receita" ? "#13DEB9" : "#FA896B"}
                    >
                      {transaction.type === "receita" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Chip
                      label={transaction.category}
                      size="small"
                      sx={{
                        backgroundColor: `${getCategoryColor(transaction.category)}20`,
                        color: getCategoryColor(transaction.category),
                        fontSize: "0.75rem",
                        height: 20,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(transaction.date)}
                    </Typography>
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

export default RecentTransactions;