"use client";

import { HookAutocomplete } from "@/app/components/forms/hooksForm/HookAutocomplete";
import { HookDatePicker } from "@/app/components/forms/hooksForm/HookDatePicker";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import {
  HookCurrencyField,
  HookDecimalField,
} from "@/app/components/forms/hooksForm/masks";
import CustomToggle from "@/app/components/forms/CustomToggle";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Collapse,
  Grid,
  InputAdornment,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect } from "react";
import {
  IconWallet,
  IconCoin,
  IconCalendarEvent,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { ItemIconAdornment } from "./Shared/SharedComponents";
import { useReceitaForm } from "./hooks/useReceitaForm";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { LancamentoPagamentoDados } from "@/store/apps/lancamentos/LancamentoSlice";

interface ReceitaFormProps {
  lancamentoParaEditar?: LancamentoResposta | null;
  dadosIniciais?: LancamentoPagamentoDados | null;
  onSuccess?: () => void;
}

export default function ReceitaForm({
  lancamentoParaEditar,
  dadosIniciais,
  onSuccess,
}: ReceitaFormProps) {
  const {
    handleSubmit,
    control,
    tipo,
    parcelar,
    parcelas,
    modoParcelamento,
    valor,
    valorTotal,
    valorParcelaCalculado,
    handleTipoChange,
    isCreating,
    itens,
    selectedItem,
    isLoading,
    setFocus,
    setValue,
  } = useReceitaForm({ lancamentoParaEditar, dadosIniciais, onSuccess });

  const formatarValor = (val: number) => {
    return (val ?? 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const theme = useTheme();

  // Focar no campo de item ao montar o formulário
  useEffect(() => {
    setTimeout(
      () => (lancamentoParaEditar?.id ? setFocus("valor") : setFocus("itemId")),
      300,
    );
  }, [setFocus, lancamentoParaEditar?.id]);

  return (
    <Box
      py={2}
      px={3}
      component="form"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <Box
        component={Paper}
        elevation={1}
        sx={{
          borderRadius: 3,
          p: 3,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          backgroundColor: "background.paper",
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          {(() => {
            const iconColor = selectedItem?.cor || theme.palette.success.main;
            return (
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha(iconColor, 0.1),
                  color: iconColor,
                  transition: "all 0.3s ease",
                }}
              >
                <DynamicIcon
                  name={selectedItem?.icone}
                  size={22}
                  fallbackIcon="IconWallet"
                  color={iconColor}
                />
              </Box>
            );
          })()}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Lançamento de Receita
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registre um recebimento ou agendamento
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          {/* Tipo de Lançamento */}
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
                position: "relative",
                backgroundColor: (theme) => alpha(theme.palette.grey[200], 0.6),
                padding: "4px",
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
                "& .MuiToggleButton-root": {
                  border: "0 !important",
                  borderRadius: "8px !important",
                  textTransform: "none",
                  fontWeight: 600,
                  color: "text.secondary",
                  py: 1.2,
                  px: { xs: 1, sm: 2 },
                  zIndex: 1,
                  backgroundColor: "transparent !important",
                  transition: "color 0.25s ease",
                  "&.Mui-selected": {
                    "&[value='pagamento']": {
                      color: "success.main",
                    },
                    "&[value='agendamento']": {
                      color: "warning.main",
                    },
                  },
                },
              }}
            >
              {/* Indicador deslizante premium */}
              <Box
                style={{
                  left:
                    tipo === "pagamento" ? "calc(0% + 4px)" : "calc(50% + 1px)",
                  borderColor:
                    tipo === "pagamento"
                      ? alpha(theme.palette.success.main, 0.4)
                      : alpha(theme.palette.warning.main, 0.4),
                }}
                sx={{
                  position: "absolute",
                  top: 4,
                  bottom: 4,
                  width: "calc(50% - 7px)",
                  borderRadius: "8px",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  transition:
                    "left 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease",
                  zIndex: 0,
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
                }}
              />

              <ToggleButton value="pagamento">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconCoin size={18} />
                  <span>Recebimento</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="agendamento">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconCalendarEvent size={18} />
                  <span>Agendamento</span>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Data */}
          <Grid item xs={12}>
            <HookDatePicker
              label={
                tipo === "pagamento"
                  ? "Data do Recebimento"
                  : "Data do Agendamento"
              }
              name="data"
              control={control}
              shrinkLabel={true}
            />
          </Grid>

          {/* Autocomplete Receita */}
          <Grid item xs={12}>
            <HookAutocomplete
              name="itemId"
              control={control}
              options={itens}
              label="Receita"
              placeholder="Buscar receita..."
              getOptionLabel={(opt) => opt.nome}
              getOptionValue={(opt) => opt.id}
              shrinkLabel
              loading={isLoading}
              textFieldProps={{
                InputProps: {
                  startAdornment: (
                    <ItemIconAdornment item={selectedItem} isReceita />
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": { paddingLeft: "0px" },
                "& .MuiOutlinedInput-adornmentStart": { marginRight: "4px" },
              }}
              onChange={(_, _value, _reason, selectedOption) => {
                if (selectedOption) {
                  const item = selectedOption as (typeof itens)[number];
                  if (item.valorEstimado && Number(item.valorEstimado) > 0) {
                    setValue("valor", Number(item.valorEstimado));
                  }
                  setTimeout(() => setFocus("valor"), 0);
                }
              }}
            />
          </Grid>

          {/* Valor */}
          <Grid item xs={12}>
            <HookCurrencyField
              label={
                tipo === "agendamento"
                  ? modoParcelamento === "parcela"
                    ? "Valor da parcela"
                    : "Valor total"
                  : "Valor"
              }
              name="valor"
              control={control}
              placeholder="R$ 0,00"
              InputLabelProps={{ shrink: true }}
              returnAsNumber
              autoComplete="one-time-code"
              inputProps={{
                name: "field-valor-receita",
              }}
            />
          </Grid>

          {/* Parcelamento */}
          <Grid
            item
            xs={12}
            sx={{
              pt: tipo === "agendamento" ? 1.5 : "0px !important",
              transition: "padding-top 0.5s ease",
            }}
          >
            <Collapse in={tipo === "agendamento"} timeout={400}>
              <Box mt={1}>
                <HookDecimalField
                  label="Quantidade de Parcelas"
                  name="parcelas"
                  control={control}
                  returnAsNumber
                  placeholder="Ex: 12"
                  InputLabelProps={{ shrink: true }}
                  autoComplete="one-time-code"
                  inputProps={{
                    name: "field-parcelas-receita",
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mr: -0.5 }}>
                        <Tooltip
                          title={
                            modoParcelamento === "parcela"
                              ? "Repetir: O valor informado será cobrado integralmente em cada parcela."
                              : "Dividir: O valor informado é o total e será dividido pelo número de parcelas."
                          }
                          arrow
                          placement="top"
                        >
                          <Button
                            size="small"
                            variant="text"
                            onClick={() =>
                              setValue(
                                "modoParcelamento",
                                modoParcelamento === "parcela"
                                  ? "total"
                                  : "parcela",
                              )
                            }
                            sx={{
                              fontSize: "0.7rem",
                              textTransform: "none",
                              py: 0.3,
                              px: 1.2,
                              minWidth: 0,
                              color: "primary.main",
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.08),
                              borderRadius: 1,
                              fontWeight: 700,
                              "&:hover": {
                                backgroundColor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            {modoParcelamento === "parcela"
                              ? "Repetir"
                              : "Dividir"}
                          </Button>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />

                {Number(valor) > 0 ? (
                  <Box
                    mt={1.5}
                    p={1.2}
                    sx={{
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 1.5,
                      border: "1px dashed",
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.3),
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="primary.main"
                    >
                      {modoParcelamento === "parcela" ? (
                        <>
                          {parcelas && parcelas > 0 ? parcelas : 1}x de R${" "}
                          {formatarValor(valor)} = R${" "}
                          {formatarValor(valorTotal)}
                        </>
                      ) : (
                        <>
                          R$ {formatarValor(valorParcelaCalculado)} / mês
                          (Total: R$ {formatarValor(valor)})
                        </>
                      )}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            </Collapse>
          </Grid>

          {/* Observação */}
          <Grid item xs={12}>
            <HookTextField
              label="Observação (opcional)"
              name="observacao"
              control={control}
              placeholder="Ex: Salário de janeiro"
              multiline
              rows={2}
              InputLabelProps={{ shrink: true }}
              autoComplete="one-time-code"
              inputProps={{
                name: "field-observacao-receita",
              }}
              sx={{
                "& .MuiOutlinedInput-root": { padding: 0 },
                "& .MuiOutlinedInput-input": { padding: "14px 14px" },
              }}
            />
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
              }}
            >
              Salvar
            </LoadingButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
