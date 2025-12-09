"use client";

import { useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
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
  alpha,
  Switch,
  CircularProgress,
} from "@mui/material";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconWallet,
  IconX,
  IconCalendar,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import { useFontesRenda } from "../hooks/useFontesRenda";
import { HookTextField } from "@/app/components/forms/hooksForm";
import { LoadingButton } from "@mui/lab";
import { FonteRenda } from "@/services/types";

interface FontesRendaTabProps {
  fontesRenda: FonteRenda[];
}

export default function FontesRendaTab({
  fontesRenda: fontesRendaProps,
}: FontesRendaTabProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const {
    fontesRenda,
    editingFonteRenda,
    register,
    handleSubmit,
    control,
    errors,
    isCreating,
    isUpdating,
    isDeleting,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    deleteDialog,
  } = useFontesRenda({
    fontesRenda: fontesRendaProps,
  });
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

  const handleEditWithScroll = (fonteRenda: any) => {
    handleEdit(fonteRenda, scrollToForm);
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
              borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
              // Use 4% a 5% de opacidade no fundo. Fica um "rosa bebê" quase imperceptível.
              backgroundColor: (theme) =>
                alpha(theme.palette.success.light, 0.2),
            }}
          >
            <CardContent sx={{ px: 1, py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    display: "flex",
                    backgroundColor: "success.main",
                    color: "white",
                  }}
                >
                  <IconWallet size={24} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {editingFonteRenda
                      ? "Editar Fonte de Renda"
                      : "Nova Fonte de Renda"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingFonteRenda ? "Atualização" : "Cadastro"}
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container gap={3}>
                  <Grid item xs={12}>
                    <HookTextField
                      name="nome"
                      color="success"
                      control={control}
                      label="Nome da Fonte de Renda"
                      placeholder="Ex: Salário, Freelance, Investimentos..."
                      rules={{
                        required: "Nome da fonte de renda é obrigatório",
                        minLength: {
                          value: 2,
                          message: "Nome deve ter pelo menos 2 caracteres",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconWallet size={20} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-input": { pl: 0 } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <HookTextField
                      label="Valor Estimado"
                      color="success"
                      type="number"
                      placeholder="0,00"
                      name="valorEstimado"
                      control={control}
                      rules={{
                        required: "Obrigatório",
                        min: {
                          value: 0.01,
                          message: "Valor deve ser positivo",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconCurrencyDollar size={20} />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ step: "0.01", min: "0" }}
                      sx={{ "& .MuiOutlinedInput-input": { pl: 0 } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <HookTextField
                      name="diaRecebimento"
                      control={control}
                      label="Dia Previsto"
                      color="success"
                      type="number"
                      placeholder="15"
                      rules={{
                        min: { value: 1, message: "Dia deve ser entre 1 e 31" },
                        max: {
                          value: 31,
                          message: "Dia deve ser entre 1 e 31",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconCalendar size={20} />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ min: "1", max: "31" }}
                      sx={{ "& .MuiOutlinedInput-input": { pl: 0 } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: field.value
                              ? "success.main"
                              : "divider", // Borda fica vermelha quando ativo
                            backgroundColor: field.value
                              ? (theme) =>
                                  alpha(theme.palette.success.light, 0.2)
                              : "grey.100",
                            transition: "all 0.3s ease",
                            cursor: "pointer", // Permite clicar na caixa inteira
                          }}
                          onClick={() => field.onChange(!field.value)}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box sx={{ pr: 0 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                color={
                                  field.value ? "success.main" : "text.primary"
                                }
                              >
                                {field.value
                                  ? "Fonte de Renda Ativa"
                                  : "Fonte de Renda Inativa"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {field.value
                                  ? "Disponível para lançamentos"
                                  : "Não será exibida em lançamentos"}
                              </Typography>
                            </Box>
                            <Switch
                              checked={field.value}
                              color="success"
                              inputProps={{ "aria-label": "status switch" }}
                            />
                          </Stack>
                        </Box>
                      )}
                    />
                  </Grid>

                  <Grid container item xs={12} gap={1}>
                    <Grid item xs={12}>
                      <LoadingButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        loading={isCreating || isUpdating}
                        color="success"
                        startIcon={<IconPlus size={16} />}
                        // sx={{ flex: 1 }}
                      >
                        {editingFonteRenda ? "Atualizar" : "Adicionar"}
                      </LoadingButton>
                    </Grid>

                    {editingFonteRenda && (
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={handleCancelEdit}
                          startIcon={<IconX size={16} />}
                          // sx={{ flex: 1 }}
                        >
                          Cancelar
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "action.hover",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Status da Fonte de Renda
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {field.value
                              ? "Fonte de renda ativa"
                              : "Fonte de renda inativa"}
                          </Typography>
                        </Box>
                        <Chip
                          label={field.value ? "Ativa" : "Inativa"}
                          color={field.value ? "primary" : "default"}
                          variant="outlined"
                          onClick={() => field.onChange(!field.value)}
                          sx={{ cursor: "pointer" }}
                        />
                      </Stack>
                    </Box>
                  )}
                /> */}

                {/* <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isCreating || isUpdating}
                    startIcon={
                      isCreating || isUpdating ? (
                        <CircularProgress size={16} />
                      ) : (
                        <IconPlus size={16} />
                      )
                    }
                    sx={{ flex: 1 }}
                  >
                    {editingFonteRenda ? "Atualizar" : "Adicionar"}
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
                </Stack> */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Fontes de Renda */}
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
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
                      Fontes de Renda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fontesRenda.length} fonte
                      {fontesRenda.length !== 1 ? "s" : ""} de renda cadastrada
                      {fontesRenda.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${fontesRenda.length} Fontes`}
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {fontesRenda.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    color: "text.secondary",
                  }}
                >
                  <IconWallet
                    size={64}
                    style={{ opacity: 0.3, marginBottom: 16 }}
                  />
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
                    return (
                      <Box key={fonte.id}>
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
                              backgroundColor: fonte.status
                                ? "success.light"
                                : "grey.300",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: fonte.status ? "success.main" : "grey.600",
                              mr: 2,
                            }}
                          >
                            <IconWallet size={20} />
                          </Box>

                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography variant="body1" fontWeight={500}>
                                  {fonte.nome}
                                </Typography>
                                <Chip
                                  label={fonte.status ? "Ativa" : "Inativa"}
                                  color={fonte.status ? "success" : "default"}
                                  size="small"
                                  variant="filled"
                                />
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.5}>
                                <Stack direction="row" spacing={2}>
                                  {fonte.valorEstimado && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Valor:{" "}
                                      {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(fonte.valorEstimado)}
                                    </Typography>
                                  )}
                                  {fonte.diaRecebimento && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Previsão: Dia {fonte.diaRecebimento}
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
                                onClick={() => handleDeleteClick(fonte)}
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
            Tem certeza que deseja excluir a fonte de renda{" "}
            <strong>"{deleteDialog.fonteRenda?.nome}"</strong>?
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
