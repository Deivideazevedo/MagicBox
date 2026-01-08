"use client";

import { useCategorias } from "@/app/(Private)/cadastros/hooks/useCategorias";
import { useDespesas } from "@/app/(Private)/cadastros/hooks/useDespesas";
import { useFontesRenda } from "@/app/(Private)/cadastros/hooks/useFontesRenda";
import { useLancamentoDrawer } from "../hooks/useLancamentoDrawer";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import CustomToggle from "@/app/components/forms/CustomToggle";
import {
  HookCurrencyField,
  HookDatePicker,
  HookDecimalField,
  HookSelect,
  HookTextField,
} from "@/app/components/forms/hooksForm";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Drawer,
  Fab,
  Grid,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconCreditCard,
  IconDeviceFloppy,
  IconEraser,
  IconPlus,
  IconSwitchHorizontal,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
import { IconCoin } from "@tabler/icons-react";
import { IconCalendarEvent } from "@tabler/icons-react";
import { Categoria } from "@/core/categorias/types";
import { FonteRenda } from "@/core/fontesRenda/types";

const DrawerWidth = "420px";

export default function LancamentoDrawer() {
  const theme = useTheme();

  // Hooks de dados
  const categoriasHook = useCategorias();
  const despesasHook = useDespesas();
  const fontesRendaHook = useFontesRenda();

  const categoriasList = categoriasHook.formProps?.categorias || [];
  const despesasList = despesasHook.listProps?.despesas || [];
  const fontesRendaList = fontesRendaHook.listProps?.fontesRenda || [];

  // Hook do drawer
  const { drawerProps, formProps } = useLancamentoDrawer({
    categorias: categoriasList,
    despesas: despesasList,
    fontesRenda: fontesRendaList,
  });

  const {
    showDrawer,
    handleOpenDrawer,
    handleCloseDrawer,
    isDespesa,
    corTema,
    toggleOrigem,
  } = drawerProps;

  const {
    handleSubmit,
    control,
    tipo,
    parcelar,
    parcelas,
    valor,
    valorTotal,
    handleTipoChange,
    isCreating,
    itens,
    reset,
    defaultValues,
  } = formProps;

  return (
    <>
      {/* Botão Flutuante */}
      <Tooltip title="Novo Lançamento">
        <Fab
          color="primary"
          aria-label="novo-lancamento"
          sx={{
            position: "fixed",
            right: "25px",
            bottom: "85px",
          }}
          onClick={handleOpenDrawer}
        >
          <IconPlus stroke={1.5} />
        </Fab>
      </Tooltip>

      {/* Drawer Lateral */}
      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={handleCloseDrawer}
        sx={{
          zIndex: 999,
        }}
        PaperProps={{
          sx: {
            width: {
              xs: "100%",
              sm: "400px",
              md: DrawerWidth,
            },
            maxWidth: "100vw",
            background: theme.palette.grey[100],
          },
        }}
      >
        <Scrollbar
          sx={{
            minHeight: "calc(100vh - 170px)",
          }}
        >
          <Box
            p={2.3}
            px={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              backgroundColor: "background.paper",
              borderRadius: 0,
            }}
          >
            <Typography variant="h4" fontWeight={600} color={"primary"}>
              Novo Lançamento
            </Typography>

            <IconButton color="inherit" onClick={handleCloseDrawer}>
              <IconX size="1rem" />
            </IconButton>
          </Box>

          <Divider />

          <Box py={2} px={3} component="form" onSubmit={handleSubmit}>
            {/* <Box> */}
            <Card
              elevation={1}
              sx={{
                borderRadius: 3,
                // border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
                // backgroundColor: alpha(theme.palette.primary.light, 0.4),
                pb: `0px !important`,
              }}
            >
              <CardContent
                sx={{
                  px: 1.5,
                  py: 1.5,
                  pb: `${tipo === "agendamento" ? 27 : 7}px !important`,
                }}
              >
                {/* Header com Switch de Origem */}
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      backgroundColor: `${corTema}.main`,
                      color: "white",
                      position: "relative",
                    }}
                  >
                    {isDespesa ? (
                      <IconCreditCard size={24} />
                    ) : (
                      <IconWallet size={24} />
                    )}

                    {/* Botão de Switch */}
                    <Tooltip
                      title={
                        isDespesa ? "Lançar Fonte de Renda" : "Lançar Despesa"
                      }
                      placement="top"
                      arrow
                    >
                      <Box
                        component="span"
                        sx={{ position: "absolute", top: -10, right: -10 }}
                      >
                        <IconButton
                          size="small"
                          onClick={toggleOrigem}
                          color="inherit"
                          sx={{
                            backgroundColor: "primary.main",
                            boxShadow: 1,
                            width: 24,
                            height: 24,
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: isDespesa
                              ? "rotateY(0deg)"
                              : "rotateY(180deg)",
                            "&:hover": {
                              color: "white",
                              backgroundColor: "primary.dark",
                            },
                          }}
                        >
                          <IconSwitchHorizontal size={14} />
                        </IconButton>
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Lançamento de {isDespesa ? "Despesa" : "Fonte de Renda"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isDespesa
                        ? "Registre um pagamento ou agendamento"
                        : "Registre um recebimento"}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2.5}>
                  {/* Tipo de Lançamento - Estilo Floating Segmented Control */}
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      mb={1.5}
                      color="text.secondary"
                    >
                      Tipo de Lançamento
                    </Typography>

                    <ToggleButtonGroup
                      value={tipo}
                      exclusive
                      onChange={handleTipoChange}
                      fullWidth
                      sx={{
                        backgroundColor: (theme) =>
                          alpha(theme.palette.grey[200], 0.6),
                        padding: "4px",
                        borderRadius: "12px", // Arredondado moderno
                        border: "1px solid",
                        borderColor: "divider",
                        display: "grid", // Garante 50% para cada
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4px", // Espaço entre os botões

                        "& .MuiToggleButton-root": {
                          border: "1px solid transparent",
                          borderRadius: "8px !important", // Borda interna menor
                          textTransform: "none",
                          fontWeight: 600,
                          color: "text.secondary",
                          transition: "all 0.2s ease-in-out",
                          py: 1.2,

                          "&:hover": {
                            borderColor: (theme) =>
                              alpha(theme.palette.divider, 0.1),
                            backgroundColor: (theme) =>
                              alpha(theme.palette.background.paper, 0.6),
                          },

                          "&.Mui-selected": {
                            backgroundColor: "background.paper",
                            color: "primary.main",
                            border: "1px solid",
                            borderColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.4),
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.08)", // Sombra suave (o efeito "lift")
                            "&:hover": {
                              backgroundColor: "background.paper",
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="pagamento" disableRipple>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconCoin size={18} />
                          <span>Pagamento</span>
                        </Box>
                      </ToggleButton>

                      <ToggleButton value="agendamento" disableRipple>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconCalendarEvent size={18} />
                          <span>Agendamento</span>
                        </Box>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>

                  {/* Categoria */}
                  <Grid item xs={12}>
                    <HookSelect
                      name="categoriaId"
                      control={control}
                      options={categoriasList}
                      label="Categoria"
                      placeholder="Selecione"
                      displayEmpty
                      getValue={(obj: any) => obj.id}
                      getLabel={(obj: any) => obj.nome}
                    />
                  </Grid>

                  {/* Despesa/Fonte de Renda */}
                  <Grid item xs={12}>
                    <HookSelect
                      name="itemId"
                      control={control}
                      options={itens}
                      label={isDespesa ? "Despesa" : "Fonte de Renda"}
                      placeholder="Selecione"
                      displayEmpty
                      disabled={!formProps.categoriaId}
                      getValue={(obj: Categoria | FonteRenda) => obj.id}
                      getLabel={(obj: Categoria | FonteRenda) => obj.nome}
                    />
                  </Grid>

                  {/* Valor */}
                  <Grid item xs={12}>
                    <HookCurrencyField
                      label="Valor"
                      name="valor"
                      control={control}
                      placeholder="R$ 0,00"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Data */}
                  <Grid item xs={12}>
                    <HookDatePicker
                      label={
                        tipo === "pagamento"
                          ? isDespesa
                            ? "Data do Pagamento"
                            : "Data do Recebimento"
                          : "Data do Agendamento"
                      }
                      name="data"
                      control={control}
                      shrinkLabel={true}
                    />
                  </Grid>

                  {/* Descrição */}
                  <Grid item xs={12}>
                    <HookTextField
                      label="Descrição (opcional)"
                      name="descricao"
                      control={control}
                      placeholder={
                        isDespesa
                          ? "Ex: Conta de luz de janeiro"
                          : "Ex: Salário de janeiro"
                      }
                      multiline
                      rows={2}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          padding: 0,
                        },
                        "& .MuiOutlinedInput-input": {
                          padding: "14px 14px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    {/* Parcelamento (apenas para agendamentos) */}
                    <Collapse in={tipo === "agendamento"} timeout={400}>
                      <CustomToggle
                        control={control}
                        name="parcelar"
                        variant="switch"
                        titleActive="Parcelamento Ativado"
                        titleInactive="Parcelamento Desativado"
                        descriptionActive="Criar múltiplos lançamentos mensais"
                        descriptionInactive="Clique para ativar o parcelamento"
                      />

                      <Collapse in={parcelar} timeout={400}>
                        <Box mt={2}>
                          <HookDecimalField
                            label="Número de Parcelas"
                            name="parcelas"
                            control={control}
                            returnAsNumber
                            placeholder="Ex: 12"
                            InputLabelProps={{ shrink: true }}
                          />
                          {parcelar && parcelas && valorTotal > 0 ? (
                            <Box
                              mt={1.5}
                              p={1.5}
                              sx={{
                                backgroundColor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.08),
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {parcelas}x de R$ {valor} ={" "}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  fontWeight={600}
                                  color="primary"
                                  fontSize={13.5}
                                >
                                  R$ {valorTotal.toFixed(2)}
                                </Typography>
                              </Typography>
                            </Box>
                          ) : null}
                        </Box>
                      </Collapse>
                    </Collapse>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Floating Action Buttons */}
            <Box
              sx={{
                position: "sticky",
                zIndex: 10,
                bottom: 16,
                mt: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "transparent",
              }}
            >
              {/* Botão Salvar - Lado Esquerdo */}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  // border: 1,
                  borderColor: "divider",
                  alignItems: "center",
                }}
              >
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<IconEraser size={18} />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                    color="error"
                    disabled={isCreating}
                    onClick={() => reset(defaultValues)}
                  >
                    Resetar
                  </Button>

                  <LoadingButton
                    variant="contained"
                    color="primary"
                    startIcon={<IconDeviceFloppy size={18} />}
                    loading={isCreating}
                    type="submit"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      "&:focus-visible": {
                        boxShadow: "none",
                      },
                    }}
                  >
                    Salvar
                  </LoadingButton>
                </Stack>
              </Paper>

              {/* Botão Limpar - Lado Direito */}
              {/* <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  // border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<IconEraser size={18} />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                  color="error"
                  disabled={isCreating}
                  onClick={() => reset(defaultValues)}
                >
                  Limpar
                </Button>
              </Paper> */}
            </Box>
          </Box>
        </Scrollbar>
      </Drawer>
    </>
  );
}
