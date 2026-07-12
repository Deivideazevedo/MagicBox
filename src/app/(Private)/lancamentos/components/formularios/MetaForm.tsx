"use client";

import { HookAutocomplete } from "@/app/components/forms/hooksForm/HookAutocomplete";
import { HookDatePicker } from "@/app/components/forms/hooksForm/HookDatePicker";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookCurrencyField } from "@/app/components/forms/hooksForm/masks";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useEffect } from "react";
import {
  IconTarget,
  IconPlus,
  IconMinus,
  IconArrowRight,
  IconCreditCard,
  IconWallet,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { ItemIconAdornment } from "./Shared/SharedComponents";
import { useMetaForm } from "./hooks/useMetaForm";
import { LancamentoResposta } from "@/core/lancamentos/types";

interface MetaFormProps {
  id?: number;
  lancamentoParaEditar?: LancamentoResposta | null;
  onSuccess?: () => void;
}

export default function MetaForm({
  id,
  lancamentoParaEditar,
  onSuccess,
}: MetaFormProps) {
  const theme = useTheme();
  const {
    handleSubmit,
    control,
    tipo,
    handleTipoChange,
    isCreating,
    itens,
    selectedItem,
    isLoading,
    setFocus,
    setValue,
    destinoOrigem,
    itensDestino,
    selectedDestino,
  } = useMetaForm({ lancamentoParaEditar, onSuccess });

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Focar no campo de item ao montar o formulário (apenas no desktop)
  useEffect(() => {
    if (isMobile) return;
    setTimeout(
      () => (lancamentoParaEditar?.id ? setFocus("valor") : setFocus("itemId")),
      300,
    );
  }, [setFocus, lancamentoParaEditar?.id, isMobile]);

  return (
    <Box py={2} px={3} component="form" onSubmit={handleSubmit}>
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
            const iconColor = selectedItem?.cor || theme.palette.primary.main;
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
                  fallbackIcon="IconTarget"
                  color={iconColor}
                />
              </Box>
            );
          })()}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Lançamento de Objetivo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registre um investimento ou retirada
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
                  "&:hover": {
                    color: "text.primary",
                  },
                  "&.Mui-selected": {
                    "&[value='investimento']": {
                      color: "success.main",
                    },
                    "&[value='retirada']": {
                      color: "error.main",
                    },
                  },
                },
              }}
            >
              {/* Indicador deslizante premium */}
              <Box
                style={{
                  left: tipo === "investimento" ? "calc(0% + 4px)" : "calc(50% + 1px)",
                  borderColor:
                    tipo === "investimento"
                      ? alpha(theme.palette.success.main, 0.4)
                      : alpha(theme.palette.error.main, 0.4),
                }}
                sx={{
                  position: "absolute",
                  top: 4,
                  bottom: 4,
                  width: "calc(50% - 7px)",
                  borderRadius: "8px",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease",
                  zIndex: 0,
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
                }}
              />

              <ToggleButton value="investimento">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconPlus size={18} />
                  <span>Investimento</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="retirada">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconMinus size={18} />
                  <span>Retirada</span>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Autocomplete Objetivo */}
          <Grid item xs={12}>
            <HookAutocomplete
              name="itemId"
              control={control}
              options={itens}
              label={
                tipo === "retirada"
                  ? "Objetivo de Origem (Onde sai o saldo)"
                  : "Objetivo Selecionado"
              }
              placeholder="Buscar objetivo..."
              getOptionLabel={(opt) => opt.nome}
              getOptionValue={(opt) => opt.id}
              shrinkLabel
              loading={isLoading}
              textFieldProps={{
                InputProps: {
                  startAdornment: (
                    <ItemIconAdornment item={selectedItem} isObjetivo />
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
                  if (item.valorObjetivo && Number(item.valorObjetivo) > 0) {
                    setValue("valor", Number(item.valorObjetivo));
                  }
                  setTimeout(
                    () =>
                      tipo === "retirada"
                        ? setFocus("destinoId")
                        : setFocus("valor"),
                    0,
                  );
                }
              }}
            />
          </Grid>

          {/* DESTINO DA RETIRADA (Apenas Novo lançamento) */}
          {tipo === "retirada" && !id && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.05),
                  border: "1px dashed",
                  borderColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.3),
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="primary"
                  mb={2}
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <IconArrowRight size={18} /> Destinar Retirada para:
                </Typography>

                <ToggleButtonGroup
                  value={destinoOrigem}
                  exclusive
                  onChange={(_, val) => val && setValue("destinoOrigem", val)}
                  fullWidth
                  size="small"
                  sx={{
                    mb: 3,
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      fontWeight: 600,
                      color: "text.secondary",
                      py: 1,
                      "&:hover": {
                        backgroundColor: "background.paper",
                        borderColor: (theme) =>
                          alpha(theme.palette.divider, 0.2),
                      },
                      "&.Mui-selected": {
                        backgroundColor: "background.paper",
                        border: "1px solid",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
                        "&[value='despesa']": {
                          color: "error.main",
                          borderColor: alpha(theme.palette.error.main, 0.4),
                        },
                        "&[value='livre']": {
                          color: "success.main",
                          borderColor: alpha(theme.palette.success.main, 0.4),
                        },
                        "&:hover": {
                          backgroundColor: "background.paper",
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="despesa">
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCreditCard size={18} />
                      <span>Pagar uma Despesa</span>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="livre">
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconWallet size={18} />
                      <span>Devolver ao Saldo Livre</span>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>

                {destinoOrigem === "despesa" && (
                  <HookAutocomplete
                    name="destinoId"
                    control={control}
                    options={itensDestino as any[]}
                    label="Despesa de Destino"
                    placeholder="Pagar qual despesa?"
                    getOptionLabel={(opt) => opt.nome}
                    getOptionValue={(opt) => opt.id}
                    forcePopupIcon={false}
                    textFieldProps={{
                      InputProps: {
                        startAdornment: (
                          <ItemIconAdornment
                            item={selectedDestino}
                            isDespesa={true}
                            isReceita={false}
                          />
                        ),
                      },
                    }}
                    onChange={(_, value) => {
                      value && setTimeout(() => setFocus("valor"), 0);
                    }}
                    sx={{
                      backgroundColor: "background.paper",
                    }}
                  />
                )}
              </Box>
            </Grid>
          )}

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
                tipo === "investimento"
                  ? "Data do Investimento (Aporte)"
                  : "Data da Retirada (Resgate)"
              }
              name="data"
              control={control}
              shrinkLabel={true}
            />
          </Grid>

          {/* Observação */}
          <Grid item xs={12}>
            <HookTextField
              label="Observação (opcional)"
              name="observacao"
              control={control}
              placeholder="Ex: Aporte extra do décimo terceiro"
              multiline
              rows={2}
              InputLabelProps={{ shrink: true }}
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
