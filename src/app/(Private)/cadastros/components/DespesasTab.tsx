"use client";

import { HookSelect, HookTextField } from "@/app/components/forms/hooksForm";
import CustomToggle from "@/app/components/forms/CustomToggle";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Switch,
  Typography,
  alpha,
  CircularProgress,
  Collapse,
} from "@mui/material";
import {
  IconCalendar,
  IconCategory,
  IconCheck,
  IconCreditCard,
  IconCurrencyDollar,
  IconEdit,
  IconPlus,
  IconRepeat,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useRef } from "react";
import { Controller } from "react-hook-form";
import { useDespesas } from "../hooks/useDespesas";
import { Despesa } from "@/core/despesas/types";
import { Categoria } from "@/core/categorias/types";

interface DespesasTabProps {
  despesas: Despesa[];
  categorias: Categoria[];
}

export default function DespesasTab({ despesas: despesasProps, categorias: categoriasProps }: DespesasTabProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const {
    despesas,
    categorias,
    isEdditing,
    mensalmente,
    handleSubmit,
    control,
    isCreating,
    isUpdating,
    isDeleting,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    deleteDialog,
  } = useDespesas({ despesas: despesasProps, categorias: categoriasProps });

  const scrollToForm = () => {
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 180;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleEditWithScroll = (despesa: any) => {
    handleEdit(despesa, scrollToForm);
  };

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Card
            ref={formRef}
            elevation={0} // Fica mais moderno sem sombra se tiver borda
            sx={{
              borderRadius: 3,
              border: "1px solid",
              // Use a cor main com baixíssima opacidade para a borda ficar elegante
              borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              // Use 4% a 5% de opacidade no fundo. Fica um "rosa bebê" quase imperceptível.
              backgroundColor: (theme) => alpha(theme.palette.error.light, 0.05),
            }}
          >
            <CardContent sx={{ px: 1, py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    display: "flex",
                    backgroundColor: "error.main",
                    color: "white",
                  }}
                >
                  <IconCreditCard size={24} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {isEdditing ? "Editar Despesa" : "Nova Despesa"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isEdditing
                      ? "Atualize os dados da despesa"
                      : "Adicione uma nova despesa"}
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  {/* Categoria */}
                  <Grid item xs={12}>
                    <HookSelect
                      name="categoriaId"
                      color="error"
                      control={control}
                      options={categorias}
                      label="Categoria"
                      placeholder="Selecione"
                      displayEmpty 
                      getValue={(obj) => obj.id}
                      getLabel={(obj) => obj.nome}
                      startAdornment={
                        <InputAdornment position="start">
                          <IconCategory size={20} />
                        </InputAdornment>
                      }
                      sx={{
                        "& .MuiOutlinedInput-input": {
                          paddingLeft: "0px",
                        },
                      }}
                    />
                  </Grid>

                  {/* Nome da Despesa */}
                  <Grid item xs={12}>
                    <HookTextField
                      label="Nome da Despesa"
                      name="nome"
                      color="error"
                      control={control}
                      placeholder="Ex: Conta de Luz, Gasolina..."
                      rules={{
                        required: "Obrigatório",
                        minLength: {
                          value: 2,
                          message: "Mín. 2 caracteres",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconCreditCard size={20} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-input": { paddingLeft: "0px" },
                      }}
                    />
                  </Grid>

                  {/* Campos condicionais - aparecem quando "mensalmente" está ativo */}
                  <Grid item xs={12} sx={{  pt: "0px !important" }}>
                    <Collapse in={mensalmente} timeout={400}>
                      <Box sx={{ pt: 2.5 }}>
                        <Grid container spacing={2.5}>
                          <Grid item xs={12} >
                            <HookTextField
                              color="error"
                              label="Valor Estimado"
                              type="number"
                              placeholder="0,00"
                              name="valorEstimado"
                              control={control}
                              inputProps={{ step: "0.01", min: "0" }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <IconCurrencyDollar size={20} />
                                  </InputAdornment>
                                ),
                              }}
                              rules={{
                                required: "Obrigatório para despesas mensais",
                                min: {
                                  value: 0.01,
                                  message: "Valor deve ser positivo",
                                },
                              }}
                              sx={{ "& .MuiOutlinedInput-input": { paddingLeft: 0 } }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <HookTextField
                              color="error"
                              label="Dia do Vencimento"
                              type="number"
                              name="diaVencimento"
                              placeholder="Ex: 5"
                              control={control}
                              rules={{
                                required: "Obrigatório para despesas mensais",
                                min: { value: 1, message: "Dia deve ser entre 1 e 31" },
                                max: { value: 31, message: "Dia deve ser entre 1 e 31" },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <IconCalendar size={20} />
                                  </InputAdornment>
                                ),
                              }}
                              inputProps={{ min: "1", max: "31" }}
                              sx={{ "& .MuiOutlinedInput-input": { paddingLeft: 0 } }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Grid>

                  {/* Controles - Repetir Mensalmente e Status */}
                  <Grid item xs={12}>
                    <Stack spacing={1.5}>
                      {/* Toggle Repetir Mensalmente */}
                      <CustomToggle
                        control={control}
                        name="mensalmente"
                        color="error"
                        variant="checkbox"
                        iconActive={
                          <IconRepeat size={12} color="white" strokeWidth={3} />
                        }
                        titleActive="Repetir mensalmente"
                        titleInactive="Repetir mensalmente"
                        descriptionActive="Despesa recorrente todo mês"
                        descriptionInactive="Ativar para despesas mensais"
                      />

                      {/* Toggle Status */}
                      <CustomToggle
                        control={control}
                        name="status"
                        color="success"
                        variant="switch"
                        iconActive={
                          <Box
                            component="svg"
                            viewBox="0 0 24 24"
                            sx={{ width: 12, height: 12 }}
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </Box>
                        }
                        titleActive="Despesa Ativa"
                        titleInactive="Despesa Inativa"
                        descriptionActive="Disponível para lançamentos"
                        descriptionInactive="Não será exibida"
                      />
                    </Stack>
                  </Grid>

                  {/* Botões de Ação */}
                  <Grid item xs={12}>
                    <Stack spacing={1.5}>
                      <LoadingButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        loading={isCreating || isUpdating}
                        color="error"
                        startIcon={<IconPlus size={16} />}
                      >
                        {isEdditing ? "Atualizar" : "Adicionar"}
                      </LoadingButton>

                      {isEdditing && (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={handleCancelEdit}
                          startIcon={<IconX size={16} />}
                        >
                          Cancelar
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Despesas */}
        <Grid item xs={12} md={8}>
          <Card
           elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              // backgroundColor: (theme) => alpha(theme.palette.error.main, 0.04),
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{ p:2, borderBottom: "1px solid", borderColor: "divider" }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="text.primary"
                    >
                      Despesas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {despesas.length} despesa
                      {despesas.length !== 1 ? "s" : ""} cadastrada
                      {despesas.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${despesas.length} despesas`}
                    color="error"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {despesas.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    color: "text.secondary",
                  }}
                >
                  <IconCreditCard
                    size={64}
                    style={{ opacity: 0.3, marginBottom: 16 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Nenhuma despesa cadastrada
                  </Typography>
                  <Typography variant="body2">
                    Comece adicionando suas primeiras despesas
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {despesas.map((despesa: any, index: number) => {
                    const categoria = categorias.find(
                      (d: any) => d.id === despesa.categoriaId
                    );
                    return (
                      <Box key={despesa.id}>
                        <ListItem
                          sx={{
                            py: 2,
                            px: 2,
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              backgroundColor: despesa.status
                                ? "error.light"
                                : "grey.300",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: despesa.status ? "error.main" : "grey.600",
                              mr: 2,
                            }}
                          >
                            {despesa.mensalmente ? (
                              <IconRepeat size={20} />
                            ) : (
                              <IconCreditCard size={20} />
                            )}
                          </Box>

                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography variant="body1" fontWeight={500}>
                                  {despesa.nome}
                                </Typography>
                                {despesa.mensalmente && (
                                  <Chip
                                    label="Mensal"
                                    color="error"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600 }}
                                  />
                                )}
                                <Chip
                                  label={despesa.status ? "Ativa" : "Inativa"}
                                  color={despesa.status ? "success" : "default"}
                                  size="small"
                                  variant="filled"
                                />
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.5}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Categoria: {categoria?.nome || "N/A"}
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                  {despesa.mensalmente && despesa.valorEstimado && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Valor:{" "}
                                      {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(despesa.valorEstimado)}
                                    </Typography>
                                  )}
                                  {despesa.mensalmente && despesa.diaVencimento && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Vence dia {despesa.diaVencimento}
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
                                onClick={() => handleEditWithScroll(despesa)}
                                sx={{
                                  color: "primary.main",
                                  "&:hover": {
                                    backgroundColor: "primary.light",
                                  },
                                }}
                              >
                                <IconEdit size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(despesa)}
                                sx={{
                                  color: "error.main",
                                  "&:hover": { backgroundColor: "error.light" },
                                }}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < despesas.length - 1 && <Divider />}
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
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "error.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "error.main",
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
            Tem certeza que deseja excluir a despesa{" "}
            <strong>"{deleteDialog.despesa?.nome}"</strong>?
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
            startIcon={
              isDeleting ? (
                <CircularProgress size={16} />
              ) : (
                <IconTrash size={16} />
              )
            }
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
