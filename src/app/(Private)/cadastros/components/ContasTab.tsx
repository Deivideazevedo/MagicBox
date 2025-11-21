"use client";

import { useState, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Divider,
  InputAdornment,
} from "@mui/material";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconCreditCard,
  IconX,
  IconCalendar,
  IconCurrencyDollar
} from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import { useContas } from "../hooks/useContas";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";

// Tipo para o formulário baseado no CreateContaDto
interface FormData {
  despesaId: string;
  nome: string;
  valorEstimado?: number;
  diaVencimento?: number;
  status: boolean;
}

export default function ContasTab() {
  const formRef = useRef<HTMLDivElement>(null);
  
  const {
    contas,
    isLoading,
    error,
    editingConta,
    register,
    handleSubmit,
    control,
    errors,
    isCreating,
    isUpdating,
    isDeleting,
    onSubmit,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    deleteDialog
  } = useContas();

  const { data: despesas = [] } = useGetDespesasQuery();

  const scrollToForm = () => {
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 180; // 120px de offset do topo

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleEditWithScroll = (conta: any) => {
    handleEdit(conta, scrollToForm);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Erro ao carregar contas. Tente novamente.
      </Alert>
    );
  }

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Card 
            ref={formRef}
            elevation={2}
            sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              // background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <IconCreditCard size={24} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {editingConta ? 'Editar Conta' : 'Nova Conta'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingConta ? 'Atualize os dados da conta' : 'Adicione uma nova conta financeira'}
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.despesaId}>
                  <InputLabel>Categoria de Despesa</InputLabel>
                  <Controller
                    name="despesaId"
                    control={control}
                    rules={{ required: "Despesa é obrigatória" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Categoria de Despesa"
                      >
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

                <TextField
                  fullWidth
                  label="Nome da Conta"
                  placeholder="Ex: Supermercado, Restaurante..."
                  {...register("nome", { 
                    required: "Nome da conta é obrigatório",
                    minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" }
                  })}
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCreditCard size={20}/>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Valor Estimado"
                  type="number"
                  placeholder="0,00"
                  {...register("valorEstimado", {
                    min: { value: 0.01, message: "Valor deve ser positivo" }
                  })}
                  error={!!errors.valorEstimado}
                  helperText={errors.valorEstimado?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCurrencyDollar size={20} />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ step: "0.01", min: "0" }}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Dia do Vencimento"
                  type="number"
                  placeholder="15"
                  {...register("diaVencimento", {
                    min: { value: 1, message: "Dia deve ser entre 1 e 31" },
                    max: { value: 31, message: "Dia deve ser entre 1 e 31" }
                  })}
                  error={!!errors.diaVencimento}
                  helperText={errors.diaVencimento?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendar size={20} />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ min: "1", max: "31" }}
                  sx={{ mb: 3 }}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: 'action.hover' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Status da Conta
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {field.value ? 'Conta ativa e disponível para lançamentos' : 'Conta inativa'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={field.value ? 'Ativa' : 'Inativa'}
                          color={field.value ? 'success' : 'default'}
                          variant="outlined"
                          onClick={() => field.onChange(!field.value)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Stack>
                    </Box>
                  )}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isCreating || isUpdating}
                    startIcon={isCreating || isUpdating ? <CircularProgress size={16} /> : <IconPlus size={16} />}
                    sx={{ flex: 1 }}
                  >
                    {editingConta ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  
                  {editingConta && (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      startIcon={<IconX size={16} />}
                    >
                      Cancelar
                    </Button>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Contas */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      Contas Financeiras
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contas.length} conta{contas.length !== 1 ? 's' : ''} cadastrada{contas.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${contas.length} contas`}
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {contas.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}
                >
                  <IconCreditCard size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Typography variant="h6" gutterBottom>
                    Nenhuma conta cadastrada
                  </Typography>
                  <Typography variant="body2">
                    Comece adicionando suas primeiras contas financeiras
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {contas.map((conta: any, index: number) => {
                    const despesa = despesas.find((d: any) => d.id === conta.despesaId);
                    return (
                      <Box key={conta.id}>
                        <ListItem
                          sx={{
                            py: 2,
                            px: 3,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              backgroundColor: conta.status ? 'success.light' : 'grey.300',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: conta.status ? 'success.main' : 'grey.600',
                              mr: 2,
                            }}
                          >
                            <IconCreditCard size={20} />
                          </Box>
                          
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body1" fontWeight={500}>
                                  {conta.nome}
                                </Typography>
                                <Chip 
                                  label={conta.status ? 'Ativa' : 'Inativa'}
                                  color={conta.status ? 'success' : 'default'}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  Categoria: {despesa?.nome || 'N/A'}
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                  {conta.valorEstimado && (
                                    <Typography variant="caption" color="text.secondary">
                                      Valor: {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(conta.valorEstimado)}
                                    </Typography>
                                  )}
                                  {conta.diaVencimento && (
                                    <Typography variant="caption" color="text.secondary">
                                      Vence dia {conta.diaVencimento}
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>
                            }
                          />
                          
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditWithScroll(conta)}
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': { backgroundColor: 'primary.light' }
                                }}
                              >
                                <IconEdit size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(conta)}
                                sx={{ 
                                  color: 'error.main',
                                  '&:hover': { backgroundColor: 'error.light', color: 'error.main' }
                                }}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < contas.length - 1 && <Divider />}
                      </Box>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'error.main',
              }}
            >
              <IconTrash size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Confirmar Exclusão
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta ação não pode ser desfeita
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a conta <strong>"{deleteDialog.conta?.nome}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            startIcon={<IconX size={16} />}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <IconTrash size={16} />}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}