"use client";

import { useRef } from "react";
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
  IconWallet,
  IconX,
  IconCalendar,
  IconCurrencyDollar
} from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import { useFontesRenda } from "../hooks/useFontesRenda";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { useSession } from "next-auth/react";

interface FormData {
  receitaId: string;
  nome: string;
  valorEstimado?: number;
  diaRecebimento?: number;
  status: boolean;
}

export default function FontesRendaTab() {
  const formRef = useRef<HTMLDivElement>(null);
  
  const {
    fontesRenda,
    isLoading,
    error,
    editingFonteRenda,
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
  } = useFontesRenda();

  const { data: receitas = [] } = useGetReceitasQuery();
  const scrollToForm = () => {
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 180;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleEditWithScroll = (fonteRenda: any) => {
    handleEdit(fonteRenda, scrollToForm);
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
        Erro ao carregar fontes de renda. Tente novamente.
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
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <IconWallet size={24} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {editingFonteRenda ? 'Editar Fonte de Renda' : 'Nova Fonte de Renda'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingFonteRenda ? 'Atualize os dados da fonte de renda' : 'Adicione uma nova fonte de renda'}
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.receitaId}>
                  <InputLabel>Categoria de Receita</InputLabel>
                  <Controller
                    name="receitaId"
                    control={control}
                    // rules={{ required: "Receita é obrigatória" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Categoria de Receita"
                      >
                        {receitas.map((receita: any) => (
                          <MenuItem key={receita.id} value={receita.id}>
                            {receita.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.receitaId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      {errors.receitaId.message}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  label="Nome da Fonte de Renda"
                  placeholder="Ex: Salário, Freelance, Investimentos..."
                  {...register("nome", { 
                    required: "Nome da fonte de renda é obrigatório",
                    minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" }
                  })}
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconWallet size={20}/>
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
                  label="Dia do Recebimento"
                  type="number"
                  placeholder="15"
                  {...register("diaRecebimento", {
                    min: { value: 1, message: "Dia deve ser entre 1 e 31" },
                    max: { value: 31, message: "Dia deve ser entre 1 e 31" }
                  })}
                  error={!!errors.diaRecebimento}
                  helperText={errors.diaRecebimento?.message}
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
                            Status da Fonte de Renda
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {field.value ? 'Fonte de renda ativa' : 'Fonte de renda inativa'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={field.value ? 'Ativa' : 'Inativa'}
                          color={field.value ? 'primary' : 'default'}
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
                    {editingFonteRenda ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  
                  {editingFonteRenda && (
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

        {/* Lista de Fontes de Renda */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      Fontes de Renda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fontesRenda.length} fonte{fontesRenda.length !== 1 ? 's' : ''} de renda cadastrada{fontesRenda.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${fontesRenda.length} fontes`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {fontesRenda.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}
                >
                  <IconWallet size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Typography variant="h6" gutterBottom>
                    Nenhuma fonte de renda cadastrada
                  </Typography>
                  <Typography variant="body2">
                    Comece adicionando suas primeiras fontes de renda
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {fontesRenda.map((fonte: any, index: number) => {
                    const receita = receitas.find((r: any) => r.id === fonte.receitaId);
                    return (
                      <Box key={fonte.id}>
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
                              backgroundColor: fonte.status ? 'primary.light' : 'grey.300',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: fonte.status ? 'primary.main' : 'grey.600',
                              mr: 2,
                            }}
                          >
                            <IconWallet size={20} />
                          </Box>
                          
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body1" fontWeight={500}>
                                  {fonte.nome}
                                </Typography>
                                <Chip 
                                  label={fonte.status ? 'Ativa' : 'Inativa'}
                                  color={fonte.status ? 'primary' : 'default'}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  Receita: {receita?.nome || 'N/A'}
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                  {fonte.valorEstimado && (
                                    <Typography variant="caption" color="text.secondary">
                                      Valor: {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(fonte.valorEstimado)}
                                    </Typography>
                                  )}
                                  {fonte.diaRecebimento && (
                                    <Typography variant="caption" color="text.secondary">
                                      Recebe dia {fonte.diaRecebimento}
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
                                onClick={() => handleEditWithScroll(fonte)}
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': { backgroundColor: 'primary.light' }
                                }}
                              >
                                <IconEdit size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(fonte)}
                                sx={{ 
                                  color: 'error.main',
                                  '&:hover': { backgroundColor: 'error.light' }
                                }}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < fontesRenda.length - 1 && <Divider />}
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
            Tem certeza que deseja excluir a fonte de renda <strong>"{deleteDialog.fonteRenda?.nome}"</strong>?
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
