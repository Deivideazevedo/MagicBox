"use client";

import {
  HookAutocomplete,
  HookCurrencyField,
  HookDatePicker,
  HookDecimalField,
  HookTextField,
} from "@/app/components/forms/hooksForm";
import CustomToggle from "@/app/components/forms/CustomToggle";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Collapse,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
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

interface ReceitaFormProps {
  lancamentoParaEditar?: LancamentoResposta | null;
  dadosIniciais?: any | null;
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
    valor,
    valorTotal,
    handleTipoChange,
    isCreating,
    itens,
    selectedItem,
    setFocus,
  } = useReceitaForm({ lancamentoParaEditar, dadosIniciais, onSuccess });

  // Focar no campo de item ao montar o formulário
  useEffect(() => {
    setTimeout(() => lancamentoParaEditar?.id ? setFocus("valor") : setFocus("itemId"), 300);
  }, [setFocus]);

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
          backgroundColor: 'background.paper'
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              borderRadius: 2,
              p: 1,
              display: "flex",
              backgroundColor: selectedItem?.cor || "success.main",
              color: "white",
              position: "relative",
              transition: "background-color 0.3s ease",
            }}
          >
            <DynamicIcon
              name={selectedItem?.icone}
              size={24}
              fallbackIcon="IconWallet"
              color="white"
            />
          </Box>
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
            <Typography variant="body2" fontWeight={600} mb={1.5} color="text.secondary">
              Tipo de Lançamento
            </Typography>

            <ToggleButtonGroup
              value={tipo}
              exclusive
              onChange={handleTipoChange}
              fullWidth
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.grey[200], 0.6),
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
                  py: 1.2,
                  "&.Mui-selected": {
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
                    "&[value='pagamento']": {
                      color: "success.main",
                      borderColor: (theme) => alpha(theme.palette.success.main, 0.4),
                    },
                    "&[value='agendamento']": {
                      color: "warning.main",
                      borderColor: (theme) => alpha(theme.palette.warning.main, 0.4),
                    },
                  },
                },
              }}
            >
              <ToggleButton value="pagamento">
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCoin size={18} />
                  <span>Recebimento</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="agendamento">
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCalendarEvent size={18} />
                  <span>Agendamento</span>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
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
              forcePopupIcon={false}
              textFieldProps={{
                InputProps: {
                  startAdornment: (
                    <ItemIconAdornment
                      item={selectedItem}
                      isReceita
                    />
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": { paddingLeft: "0px" },
                "& .MuiOutlinedInput-adornmentStart": { marginRight: "4px" },
              }}
              onChange={(_, value) => {
                value && setTimeout(() => setFocus("valor"), 0);
              }}
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
              label={tipo === "pagamento" ? "Data do Recebimento" : "Data do Agendamento"}
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
              placeholder="Ex: Salário de janeiro"
              multiline
              rows={2}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": { padding: 0 },
                "& .MuiOutlinedInput-input": { padding: "14px 14px" },
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
            {/* Parcelamento */}
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
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
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
