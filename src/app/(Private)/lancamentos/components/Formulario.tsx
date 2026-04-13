"use client";

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
  IconCalendarEvent,
  IconCoin,
  IconCreditCard,
  IconDeviceFloppy,
  IconEraser,
  IconSwitchHorizontal,
  IconWallet,
} from "@tabler/icons-react";
import {
  Control,
  UseFormReset,
  UseFormSetFocus,
  UseFormSetValue,
} from "react-hook-form";
import { Categoria } from "@/core/categorias/types";
import { Receita } from "@/core/receitas/types";
import { LancamentoFormData } from "../hooks/useLancamentoForm";

interface FormularioProps {
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<LancamentoFormData>;
  tipo: "pagamento" | "agendamento";
  parcelar: boolean;
  parcelas: number | null | undefined;
  valor: number;
  valorTotal: number;
  handleTipoChange: (
    event: React.MouseEvent<HTMLElement>,
    newTipo: "pagamento" | "agendamento" | null,
  ) => void;
  isCreating: boolean;
  itens: Receita[] | Categoria[];
  reset: UseFormReset<LancamentoFormData>;
  defaultValues: LancamentoFormData;
  setFocus: UseFormSetFocus<LancamentoFormData>;
  setValue: UseFormSetValue<LancamentoFormData>;
  categoriaId: string | number;
  isDespesa: boolean;
  corTema: string;
  toggleOrigem: () => void;
  categorias: Categoria[];
  id?: number;
}

export default function Formulario({
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
  setFocus,
  setValue,
  categoriaId,
  isDespesa,
  corTema,
  toggleOrigem,
  categorias,
  id,
}: FormularioProps) {
  const theme = useTheme();

  return (
    <Box py={2} px={3} component="form" onSubmit={handleSubmit}>
      <Card
        elevation={1}
        sx={{
          borderRadius: 3,
          borderColor: alpha(theme.palette.primary.main, 0.2),
          pb: `0px !important`,
        }}
      >
        <CardContent
          sx={{
            px: 1.5,
            py: 1.5,
            pb: `27px !important`,
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
                title={isDespesa ? "Lançar Fonte de Renda" : "Lançar Despesa"}
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
                Lançamento de {isDespesa ? "Despesa" : "Receita"}
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
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px",

                  "& .MuiToggleButton-root": {
                    border: "1px solid transparent",
                    borderRadius: "8px !important",
                    textTransform: "none",
                    fontWeight: 600,
                    color: "text.secondary",
                    transition: "all 0.2s ease-in-out",
                    py: 1.2,

                    "&:hover": {
                      borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                      backgroundColor: (theme) =>
                        alpha(theme.palette.background.paper, 0.6),
                    },

                    "&.Mui-selected": {
                      backgroundColor: "background.paper",
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.4),
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
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
                options={categorias}
                label="Categoria"
                placeholder="Selecione"
                displayEmpty
                getValue={(obj: Categoria) => obj.id}
                getLabel={(obj: Categoria) => obj.nome}
                onChange={() => {
                  if (id) {
                    setValue("itemId", 0);
                    setFocus("itemId");
                  }
                }}
              />
            </Grid>

            {/* Despesa/Fonte de Renda */}
            <Grid item xs={12}>
              <HookSelect
                name="itemId"
                control={control}
                options={itens}
                label={isDespesa ? "Despesa" : "Receita"}
                placeholder="Selecione"
                displayEmpty
                disabled={!categoriaId}
                getValue={(obj: Categoria | Receita) => obj.id}
                getLabel={(obj: Categoria | Receita) => obj.nome}
                onChange={() => setFocus("valor")}
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
                returnAsNumber
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
                label="Observação (opcional)"
                name="observacao"
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

            <Grid
              item
              xs={12}
              sx={{
                pt: tipo === "agendamento" ? 1.5 : "0px !important",
                transition: "padding-top 0.5s ease",
              }}
            >
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
                        <Typography variant="caption" color="text.secondary">
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

            <Grid item xs={12}>
              <LoadingButton
                variant="contained"
                color="primary"
                startIcon={<IconDeviceFloppy size={18} />}
                loading={isCreating}
                type="submit"
                fullWidth
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Floating Action Buttons */}
      {/* <Box
        sx={{
          position: "sticky",
          zIndex: 10,
          bottom: 16,
          mt: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "transparent",
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            borderRadius: 3,
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
              onClick={() => {
                reset(defaultValues);
                setTimeout(() => setFocus("categoriaId"), 0);
              }}
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
      </Box> */}
    </Box>
  );
}
