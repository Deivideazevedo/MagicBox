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
  Divider,
  InputAdornment,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import {
  IconCurrencyDollar,
  IconCalendar,
  IconCreditCard,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import { LoadingButton } from "@mui/lab";

// Hooks
import { useLancamentos } from "../hooks/useLancamentos";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { HookAutocomplete } from "@/app/components/forms/hooksForm";

interface FormularioLancamentoProps {
  onClose?: () => void;
}

export default function FormularioLancamento({
  onClose,
}: FormularioLancamentoProps) {
  const {
    register,
    submitWithClose,
    control,
    errors,
    isValid,
    watchedValues,
    isParcelado,
    handleParceladoChange,
    isCreating,
    handleCancelEdit,
    isEditing,
  } = useLancamentos();

  const { data: despesas = [] } = useGetDespesasQuery();
  const { data: categorias = [] } = useGetCategoriasQuery();

  // Encontrar a despesa selecionada para mostrar detalhes
  const despesaSelecionada = despesas.find(
    (d: any) => d.id === watchedValues.despesaId
  );

  // Criar handler que fecha o drawer após sucesso
  const handleFormSubmit = submitWithClose(() => {
    if (onClose) {
      setTimeout(() => onClose(), 500);
    }
  });

  const handleCancel = () => {
    handleCancelEdit();
    if (onClose) {
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Box component="form" onSubmit={handleFormSubmit}>
          <Grid container spacing={2.5}>
            {/* Tipo de Lançamento */}
            <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{ borderRadius: 2, bgcolor: "action.hover" }}
              >
                <CardContent
                  sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                >
                  <Controller
                    name="tipo"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value === "agendamento"}
                            onChange={(e) =>
                              field.onChange(
                                e.target.checked ? "agendamento" : "pagamento"
                              )
                            }
                          />
                        }
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {field.value === "pagamento"
                                ? "Pagamento Único"
                                : "Agendamento Recorrente"}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {field.value === "pagamento"
                                ? "Registrar um pagamento já realizado"
                                : "Agendar despesa para repetir mensalmente"}
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Categoria */}
            <Grid item xs={12}>
              <HookAutocomplete
                control={control}
                name="categoriaId"
                label="Categoria"
                options={categorias}
              />
              <HookAutocomplete
                name="categoriaId"
                control={control}
                label="Categoria"
                options={categorias}
                getOptionLabel={(cat) => cat.nome}
                getOptionValue={(cat) => cat.id}
              />
            </Grid>

            {/* Conta/Despesa */}
            <Grid item xs={12}>
              <HookAutocomplete
                control={control}
                name="despesaId"
                label="Despesa"
                options={despesas}
              />
            </Grid>

            {/* Valor */}
            <Grid item xs={12}>
              <Controller
                name="valor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Valor (R$)"
                    type="number"
                    error={!!errors.valor}
                    helperText={errors.valor?.message}
                    inputProps={{ step: "0.01", min: "0" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconCurrencyDollar size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Data */}
            <Grid item xs={12}>
              <Controller
                name="data"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    label={
                      watchedValues.tipo === "pagamento"
                        ? "Data do Pagamento"
                        : "Data de Início"
                    }
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => {
                      if (date && date instanceof Date) {
                        field.onChange(date.toISOString().split("T")[0]);
                      } else {
                        field.onChange("");
                      }
                    }}
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
              <Grid item xs={12}>
                <Controller
                  name="parcelas"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Número de Parcelas (meses)"
                      type="number"
                      error={!!errors.parcelas}
                      helperText={
                        errors.parcelas?.message ||
                        "Quantos meses repetir este agendamento"
                      }
                      inputProps={{ min: "1", max: "60" }}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Descrição */}
            <Grid item xs={12}>
              <Controller
                name="descricao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Descrição"
                    multiline
                    rows={2}
                    error={!!errors.descricao}
                    helperText={errors.descricao?.message}
                    placeholder="Adicione detalhes sobre este lançamento..."
                  />
                )}
              />
            </Grid>

            {/* Botões de Ação */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    loading={isCreating}
                    startIcon={<IconCheck />}
                  >
                    {isEditing
                      ? "Atualizar Lançamento"
                      : watchedValues.tipo === "pagamento"
                      ? "Registrar Pagamento"
                      : "Criar Agendamento"}
                  </LoadingButton>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="text"
                    size="large"
                    onClick={handleCancel}
                    startIcon={<IconX />}
                    sx={{ color: "text.secondary" }}
                  >
                    Cancelar
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
