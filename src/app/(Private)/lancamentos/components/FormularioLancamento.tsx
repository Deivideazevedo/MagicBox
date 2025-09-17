"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Stack,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Paper,
  FormControlLabel,
  Switch,
  Snackbar,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { 
  IconCurrencyDollar,
  IconCalendar,
  IconCreditCard,
  IconReceipt,
  IconTrendingUp,
  IconTrendingDown,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
  IconCopy,
  IconWallet,
  IconNotes
} from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import { format } from "date-fns";

// Hooks
import { useLancamentos } from "../hooks/useLancamentos";
import { useGetContasQuery } from "@/services/endpoints/contasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";

const steps = [
  { label: 'Tipo & Conta', icon: IconCreditCard },
  { label: 'Valor & Data', icon: IconCurrencyDollar },
  { label: 'Confirmação', icon: IconCheck },
];

export default function FormularioLancamento() {
  const {
    register,
    handleSubmit,
    control,
    errors,
    isValid,
    watchedValues,
    step,
    setStep,
    isParcelado,
    setIsParcelado,
    totalComParcelas,
    onSubmit,
    nextStep,
    prevStep,
    handleTipoChange,
    handleParceladoChange,
    isCreating,
  } = useLancamentos();

  const { data: contas = [] } = useGetContasQuery();
  const { data: despesas = [] } = useGetDespesasQuery();

  // Encontrar a conta selecionada para mostrar detalhes
  const contaSelecionada = contas.find((conta: any) => conta.id === watchedValues.contaId);
  const despesaSelecionada = despesas.find((despesa: any) => despesa.id === contaSelecionada?.despesaId);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {watchedValues.tipo === "pagamento" ? "Registrar Pagamento" : "Agendar Despesa"}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          {watchedValues.tipo === "pagamento" 
            ? "Registre um pagamento que já foi realizado"
            : "Agende uma despesa para ser repetida mensalmente"
          }
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Tipo de Lançamento */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Controller
                    name="tipo"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value === "agendamento"}
                            onChange={(e) => field.onChange(e.target.checked ? "agendamento" : "pagamento")}
                            icon={<IconCreditCard />}
                            checkedIcon={<IconCalendar />}
                          />
                        }
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {field.value === "pagamento" ? "Pagamento Único" : "Agendamento Recorrente"}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {field.value === "pagamento" 
                                ? "Registrar um pagamento já realizado"
                                : "Agendar despesa para repetir mensalmente"
                              }
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Despesa */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.despesaId}>
                <InputLabel>Categoria de Despesa</InputLabel>
                <Controller
                  name="despesaId"
                  control={control}
                  rules={{ required: "Despesa é obrigatória" }}
                  render={({ field }) => (
                    <Select {...field} label="Categoria de Despesa">
                      {despesas.map((despesa: any) => (
                        <MenuItem key={despesa.id} value={despesa.id}>
                          {despesa.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.despesaId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.despesaId.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Conta */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.contaId}>
                <InputLabel>Conta</InputLabel>
                <Controller
                  name="contaId"
                  control={control}
                  rules={{ required: "Conta é obrigatória" }}
                  render={({ field }) => (
                    <Select {...field} label="Conta">
                      {contas.map((conta: any) => (
                        <MenuItem key={conta.id} value={conta.id}>
                          {conta.nome}
                          {conta.valorEstimado && (
                            <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                              (R$ {conta.valorEstimado.toFixed(2)})
                            </Typography>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.contaId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.contaId.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Valor */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor (R$)"
                type="number"
                {...register("valor", { 
                  required: "Valor é obrigatório",
                  min: { value: 0.01, message: "Valor deve ser positivo" }
                })}
                error={!!errors.valor}
                helperText={errors.valor?.message}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            {/* Data */}
            <Grid item xs={12} md={6}>
              <Controller
                name="data"
                control={control}
                rules={{ required: "Data é obrigatória" }}
                render={({ field, fieldState }) => (
                  <DatePicker
                    label={watchedValues.tipo === "pagamento" ? "Data do Pagamento" : "Data de Início"}
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Parcelas (apenas para agendamento) */}
            {watchedValues.tipo === "agendamento" && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número de Parcelas (meses)"
                  type="number"
                  {...register("parcelas", {
                    min: { value: 1, message: "Parcelas deve ser pelo menos 1" },
                    max: { value: 60, message: "Máximo 60 parcelas" }
                  })}
                  error={!!errors.parcelas}
                  helperText={errors.parcelas?.message || "Quantos meses repetir este agendamento"}
                  inputProps={{ min: "1", max: "60" }}
                />
              </Grid>
            )}

            {/* Descrição */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição (opcional)"
                multiline
                rows={2}
                {...register("descricao")}
                placeholder="Adicione detalhes sobre este lançamento..."
              />
            </Grid>

            {/* Botão Submit */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isCreating}
                startIcon={isCreating ? <CircularProgress size={20} /> : <IconCheck />}
                sx={{ minWidth: 200 }}
              >
                {isCreating 
                  ? "Processando..." 
                  : watchedValues.tipo === "pagamento" 
                    ? "Registrar Pagamento" 
                    : "Criar Agendamento"
                }
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}