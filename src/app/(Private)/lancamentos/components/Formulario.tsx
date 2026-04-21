"use client";

import CustomToggle from "@/app/components/forms/CustomToggle";
import {
  HookAutocomplete,
  HookCurrencyField,
  HookDatePicker,
  HookDecimalField,
  HookTextField,
} from "@/app/components/forms/hooksForm";
import { Despesa } from "@/core/despesas/types";
import { Receita } from "@/core/receitas/types";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
  Divider,
} from "@mui/material";
import {
  IconEdit,
  IconMinus,
  IconPlus,
  IconSwitchHorizontal,
  IconTarget,
  IconWallet,
  IconCreditCard,
  IconArrowRight,
  IconCoin,
  IconCalendarEvent,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import {
  Control,
  UseFormReset,
  UseFormSetFocus,
  UseFormSetValue,
} from "react-hook-form";
import { LancamentoFormData } from "../hooks/useLancamentoForm";
import { useMemo } from "react";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";

interface FormularioProps {
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<LancamentoFormData>;
  tipo: "pagamento" | "agendamento" | "investimento" | "retirada";
  parcelar: boolean;
  parcelas: number | null | undefined;
  valor: number;
  valorTotal: number;
  handleTipoChange: (
    event: React.MouseEvent<HTMLElement>,
    newTipo: "pagamento" | "agendamento" | "investimento" | "retirada" | null,
  ) => void;
  isCreating: boolean;
  itens: any[];
  selectedItem: any | null;
  reset: UseFormReset<LancamentoFormData>;
  defaultValues: LancamentoFormData;
  setFocus: UseFormSetFocus<LancamentoFormData>;
  setValue: UseFormSetValue<LancamentoFormData>;
  isDespesa: boolean;
  isMeta: boolean;
  corTema: string;
  handleOrigemChange: (event: React.MouseEvent<HTMLElement>, novaOrigem: "despesa" | "receita" | "meta" | null) => void;
  origem: "despesa" | "receita" | "meta";
  despesasApi: any[];
  receitasApi: any[];
  metasApi: any[];
  id?: number;
  itemId?: number;
  destinoOrigem?: "despesa" | "receita";
  destinoId?: number;
}

/** Renderiza o ícone do item selecionado (Tabler icon por nome string ou fallback) */
function ItemIconAdornment({ item, isDespesa, isMeta }: { item: any | null; isDespesa: boolean; isMeta: boolean }) {
  const theme = useTheme();
  const color = isMeta ? theme.palette.primary.main : isDespesa ? theme.palette.error.main : theme.palette.success.main;
  const itemColor = item?.cor || color;

  return (
    <InputAdornment position="end">
      <Box
        sx={{
          width: 28,
          height: 28,
          p: 0.1,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: itemColor,
          flexShrink: 0,
        }}
      >
        <DynamicIcon
          name={item?.icone}
          size={18}
          color={itemColor}
          fallbackIcon={isMeta ? "IconTarget" : isDespesa ? "IconCreditCard" : "IconWallet"}
        />
      </Box>
    </InputAdornment>
  );
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
  selectedItem,
  reset,
  defaultValues,
  setFocus,
  setValue,
  isDespesa,
  isMeta,
  corTema,
  handleOrigemChange,
  origem,
  despesasApi,
  receitasApi,
  metasApi,
  id,
  itemId,
  destinoOrigem,
  destinoId,
}: FormularioProps) {
  const theme = useTheme();

  // Itens para o destino da retirada
  const itensDestino = destinoOrigem === "despesa" ? despesasApi : receitasApi;
  const selectedDestino = (itensDestino as any[]).find(i => i.id === destinoId) || null;

  return (
    <Box py={2} px={3} component="form" onSubmit={handleSubmit}>
      {/* Seletor Segmentado de Origem (Apenas modo Novo) */}
      {!id && (
        <Box mb={2.5}>
          <ToggleButtonGroup
            value={origem}
            exclusive
            onChange={handleOrigemChange}
            fullWidth
            sx={{
              backgroundColor: (theme) => alpha(theme.palette.grey[200], 0.6),
              padding: "4px",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "4px",
              "& .MuiToggleButton-root": {
                border: "1px solid transparent",
                borderRadius: "8px !important",
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "text.secondary",
                gap: 1,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                py: 1,

                "&:hover": {
                  backgroundColor: "background.paper",
                  borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                },

                "&.Mui-selected": {
                  backgroundColor: "background.paper",
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
                  border: "1px solid",
                  "&.despesa": { color: "error.main", borderColor: alpha(theme.palette.error.main, 0.3) },
                  "&.receita": { color: "success.main", borderColor: alpha(theme.palette.success.main, 0.3) },
                  "&.meta": { color: "primary.main", borderColor: alpha(theme.palette.primary.main, 0.3) },
                },
              },
            }}
          >
            <ToggleButton value="despesa" className="despesa">
              <IconCreditCard size={18} /> Despesa
            </ToggleButton>
            <ToggleButton value="receita" className="receita">
              <IconWallet size={18} /> Receita
            </ToggleButton>
            <ToggleButton value="meta" className="meta">
              <IconTarget size={18} /> Meta
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      <Box
        component={Paper}
        elevation={1}
        sx={{
          borderRadius: 3,
          p: 3,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          backgroundColor: 'background.paper'
        }}
      >
        {/* Header com Switch de Origem */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              borderRadius: 2,
              p: 1,
              display: "flex",
              backgroundColor: selectedItem?.cor || `${corTema}.main`,
              color: "white",
              position: "relative",
              transition: "background-color 0.3s ease",
            }}
          >
            <DynamicIcon
              name={selectedItem?.icone}
              size={24}
              fallbackIcon={isMeta ? "IconTarget" : isDespesa ? "IconCreditCard" : "IconWallet"}
              color="white"
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Lançamento de {isMeta ? "Meta" : isDespesa ? "Despesa" : "Receita"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isMeta
                ? "Registre um investimento ou retirada"
                : isDespesa
                  ? "Registre um pagamento ou agendamento"
                  : "Registre um recebimento"}
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
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  py: 1.2,

                  "&:hover": {
                    // backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.02),
                    borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                    backgroundColor: "background.paper",
                  },

                  "&.Mui-selected": {
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
                    "&:hover": {
                      backgroundColor: "background.paper",
                    },
                    "&[value='investimento']": {
                      color: "success.main",
                      borderColor: (theme) => alpha(theme.palette.success.main, 0.4),
                    },
                    "&[value='retirada']": {
                      color: "error.main",
                      borderColor: (theme) => alpha(theme.palette.error.main, 0.4),
                    },
                    "&[value='agendamento']": {
                      color: "warning.main",
                      borderColor: (theme) => alpha(theme.palette.warning.main, 0.4),
                    },
                    "&[value='pagamento']": {
                      color: `${corTema}.main`,
                      borderColor: (theme) => alpha(theme.palette[corTema as 'primary'].main, 0.4),
                    }
                  },
                },
              }}
            >
              {isMeta ? (
                <>
                  <ToggleButton value="investimento">
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconPlus size={18} />
                      <span>Investimento</span>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="retirada">
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconMinus size={18} />
                      <span>Retirada</span>
                    </Box>
                  </ToggleButton>
                </>
              ) : (
                <>
                  <ToggleButton value="pagamento">
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCoin size={18} />
                      <span>Pagamento</span>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="agendamento">
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCalendarEvent size={18} />
                      <span>Agendamento</span>
                    </Box>
                  </ToggleButton>
                </>
              )}
            </ToggleButtonGroup>
          </Grid>

          {/* Despesa / Receita — Autocomplete com ícone */}
          <Grid item xs={12}>
            <HookAutocomplete<LancamentoFormData, any>
              name="itemId"
              control={control}
              options={itens}
              label={isMeta
                ? (tipo === "retirada" ? "Meta de Origem (Onde sai o saldo)" : "Meta Selecionada")
                : isDespesa ? "Despesa" : "Receita"}
              placeholder={isMeta ? "Buscar meta..." : isDespesa ? "Buscar despesa..." : "Buscar receita..."}
              getOptionLabel={(opt) => opt.nome}
              getOptionValue={(opt) => opt.id}
              shrinkLabel
              forcePopupIcon={false}
              textFieldProps={{
                InputProps: {
                  startAdornment: (
                    <ItemIconAdornment
                      item={selectedItem}
                      isDespesa={isDespesa}
                      isMeta={isMeta}
                    />
                  ),
                },
              }}
              sx={{
                // Remove o margin negativo que você estava tentando usar e foca no padding do input
                "& .MuiOutlinedInput-root": {
                  paddingLeft: "0px",
                },
                "& .MuiOutlinedInput-adornmentStart": {
                  marginRight: "4px", // Espaço entre o ícone e o texto
                },
              }}
              onChange={(_, value) => {
                value && setTimeout(() => setFocus("valor"), 0);
              }}
            />
          </Grid>

          {/* DESTINO DA RETIRADA (Exclusivo para Meta + Retirada no modo Novo lançamento) */}
          {isMeta && tipo === "retirada" && !id && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  border: "1px dashed",
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                }}
              >
                <Typography variant="body2" fontWeight={700} color="primary" mb={2} display="flex" alignItems="center" gap={1}>
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
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      py: 1,

                      "&:hover": {
                        backgroundColor: "background.paper",
                        boxShadow: "0px 4px 8px rgba(0,0,0,0.06)",
                        borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                      },

                      "&.Mui-selected": {
                        backgroundColor: "background.paper",
                        border: "1px solid",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
                        "&:hover": {
                          backgroundColor: "background.paper",
                        },
                        "&[value='despesa']": { color: "error.main", borderColor: alpha(theme.palette.error.main, 0.4) },
                        "&[value='receita']": { color: "success.main", borderColor: alpha(theme.palette.success.main, 0.4) },
                      },
                    },
                  }}
                >
                  <ToggleButton value="despesa">
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCreditCard size={18} />
                      <span>Despesa</span>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="receita">
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconWallet size={18} />
                      <span>Receita</span>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>

                <HookAutocomplete
                  name="destinoId"
                  control={control}
                  options={itensDestino}
                  label={destinoOrigem === "despesa" ? "Despesa de Destino" : "Receita de Destino"}
                  placeholder={destinoOrigem === "despesa" ? "Pagar qual despesa?" : "Como qual receita?"}
                  getOptionLabel={(opt) => opt.nome}
                  getOptionValue={(opt) => opt.id}
                  forcePopupIcon={false}
                  textFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <ItemIconAdornment
                          item={selectedDestino}
                          isDespesa={destinoOrigem === "despesa"}
                          isMeta={false}
                        />
                      ),
                    },
                  }}
                />
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
                isMeta
                  ? tipo === "investimento"
                    ? "Data do Investimento (Aporte)"
                    : "Data da Retirada (Resgate)"
                  : tipo === "pagamento"
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

          {/* Observação */}
          <Grid item xs={12}>
            <HookTextField
              label="Observação (opcional)"
              name="observacao"
              control={control}
              placeholder={
                isMeta
                  ? "Ex: Aporte extra do décimo terceiro"
                  : isDespesa
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
      </Box>
    </Box>
  );
}
