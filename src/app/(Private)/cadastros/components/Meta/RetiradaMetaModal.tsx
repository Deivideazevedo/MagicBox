"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { IconArrowLeft, IconCreditCard, IconWallet, IconX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HookAutocomplete,
  HookCurrencyField,
  HookDatePicker,
  HookTextField,
} from "@/app/components/forms/hooksForm";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { useCreateLancamentoMutation } from "@/services/endpoints/lancamentosApi";
import { useSession } from "next-auth/react";
import { SwalToast } from "@/utils/swalert";
import { Meta } from "@/core/metas/types";
import { format } from "date-fns";

const schema = z.object({
  itemId: z.number().min(1, "Selecione uma despesa ou receita"),
  valor: z.union([z.number(), z.string()]).refine((v) => Number(v) > 0, "Valor obrigatório").nullable(),
  data: z.string().min(1, "Data obrigatória"),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RetiradaMetaModalProps {
  open: boolean;
  onClose: () => void;
  meta: Meta | null;
}

// Sub-componente para exibir o ícone selecionado no Autocomplete
function ItemIconAdornment({ item, isDespesa }: { item: any; isDespesa: boolean }) {
  const theme = useTheme();
  const color = isDespesa ? theme.palette.error.main : theme.palette.success.main;
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
          fallbackIcon={isDespesa ? "IconCreditCard" : "IconWallet"}
        />
      </Box>
    </InputAdornment>
  );
}

export default function RetiradaMetaModal({ open, onClose, meta }: RetiradaMetaModalProps) {
  const theme = useTheme();
  const { data: session } = useSession();
  const [step, setStep] = useState<1 | 2>(1);
  const [origem, setOrigem] = useState<"despesa" | "receita" | null>(null);

  const { data: despesasApi = [] } = useGetDespesasQuery(undefined, { skip: !session });
  const { data: receitasApi = [] } = useGetReceitasQuery(undefined, { skip: !session });
  const [createLancamento, { isLoading: isCreating }] = useCreateLancamentoMutation();

  const isDespesa = origem === "despesa";
  const itens = isDespesa ? despesasApi : receitasApi;

  const { control, handleSubmit, reset, watch, setFocus } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemId: 0,
      valor: "",
      data: format(new Date(), "yyyy-MM-dd"),
      observacao: "",
    },
  });

  const itemId = watch("itemId");
  const selectedItem = useMemo(() => itens.find((i) => i.id === itemId) || null, [itemId, itens]);

  const handleEscolha = (escolha: "despesa" | "receita") => {
    setOrigem(escolha);
    setStep(2);
    setTimeout(() => setFocus("itemId"), 150);
  };

  const onSubmit = async (data: FormData) => {
    if (!meta || !session?.user?.id || !origem || !selectedItem) return;

    try {
      const nomeDestino = selectedItem.nome;
      const userId = Number(session.user.id);
      const vinculoId = `${Date.now()}-${userId}`;

      // Usando Promise.all como requisitado. 
      // Falhas engatilham o catch e rola o erro antes de mostrar a mensagem de sucesso.
      await Promise.all([
        // Mutação 1 - Retira da Meta sangrando (valor negativo e fixado como 'pagamento')
        createLancamento({
          metaId: meta.id,
          valor: -Math.abs(Number(data.valor)),
          tipo: "pagamento",
          data: data.data,
          userId,
          vinculoId,
          observacao: `Retirada destinada para: ${nomeDestino}`,
        }).unwrap(),

        // Mutação 2 - Lança a Receita/Despesa (valor positivo, pois afeta saldo ou dívida no balanço do mês)
        createLancamento({
          despesaId: origem === "despesa" ? data.itemId : null,
          receitaId: origem === "receita" ? data.itemId : null,
          valor: Math.abs(Number(data.valor)),
          tipo: "pagamento", // Fixado, já que é pagamento garantido do que tá retirando
          data: data.data,
          userId,
          vinculoId,
          observacao: data.observacao || `Dinheiro realocado da meta: ${meta.nome}`,
        }).unwrap(),
      ]);

      SwalToast.fire({
        icon: "success",
        title: "Retirada realizada!",
      });

      onClose();
    } catch (error) {
      // Como padronizamos anteriormente, os erros são tratados a níveis globais do RTK,
      // aqui o catch apenas barra a execução paralela de seguir pro SWAL de sucesso de as promises falharem
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isCreating ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, position: "relative" } }}
      TransitionProps={{
        onEnter: () => {
          if (open) {
            setStep(1);
            setOrigem(null);
            reset({
              itemId: 0,
              valor: "",
              data: format(new Date(), "yyyy-MM-dd"),
              observacao: "",
            });
          }
        }
      }}
    >
      <IconButton
        onClick={onClose}
        disabled={isCreating}
        sx={{ position: "absolute", right: 10, top: 10, color: "text.secondary", zIndex: 5 }}
      >
        <IconX size={20} />
      </IconButton>

      {step === 1 ? (
        <DialogContent sx={{ textAlign: "center", pt: 6, pb: 5 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <IconWallet size={32} stroke={1.5} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Destinar Retirada
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Como deseja destinar a quantia retirada dessa meta no seu fluxo de caixa?
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                startIcon={<IconCreditCard size={20} />}
                onClick={() => handleEscolha("despesa")}
                sx={{ py: 1.5, borderRadius: 2, justifyContent: "center", px: 3, fontWeight: 700 }}
              >
                Como Despesa
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="success"
                fullWidth
                size="large"
                startIcon={<IconWallet size={20} />}
                onClick={() => handleEscolha("receita")}
                sx={{ py: 1.5, borderRadius: 2, justifyContent: "center", px: 3, fontWeight: 700 }}
              >
                Como Receita
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 4, pb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <IconButton
                size="small"
                onClick={() => setStep(1)}
                disabled={isCreating}
                sx={{
                  color: "text.secondary",
                  "&:hover": { bgcolor: alpha(theme.palette.action.active, 0.05) }
                }}
              >
                <IconArrowLeft size={22} />
              </IconButton>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexGrow: 1,
                  ml: 0.5
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(origem === "receita" ? theme.palette.success.main : theme.palette.error.main, 0.1),
                    color: origem === "receita" ? "success.main" : "error.main",
                  }}
                >
                  {origem === "receita" ? <IconWallet size={22} /> : <IconCreditCard size={22} />}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    lineHeight={1.1}
                    color="text.primary"
                    sx={{ letterSpacing: "-0.01em" }}
                  >
                    Lançamento de {origem === "despesa" ? "Despesa" : "Receita"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Destino da quantia retirada
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <HookAutocomplete<FormData, any>
                  name="itemId"
                  control={control}
                  options={itens}
                  label={isDespesa ? "Despesa Selecionada" : "Receita Selecionada"}
                  placeholder={isDespesa ? "Buscar despesa..." : "Buscar receita..."}
                  getOptionLabel={(opt) => opt.nome}
                  getOptionValue={(opt) => opt.id}
                  shrinkLabel
                  forcePopupIcon={false}
                  textFieldProps={{
                    InputProps: {
                      startAdornment: <ItemIconAdornment item={selectedItem} isDespesa={isDespesa} />,
                    },
                  }}
                  onChange={() => setTimeout(() => setFocus("valor"), 0)}
                />
              </Grid>
              <Grid item xs={12}>
                <HookCurrencyField
                  label="Valor da Retirada"
                  name="valor"
                  control={control}
                  placeholder="R$ 0,00"
                  InputLabelProps={{ shrink: true }}
                  returnAsNumber
                />
              </Grid>
              <Grid item xs={12}>
                <HookDatePicker
                  label="Data da Transação"
                  name="data"
                  control={control}
                  shrinkLabel
                />
              </Grid>
              <Grid item xs={12}>
                <HookTextField
                  label="Observação (Opcional)"
                  name="observacao"
                  control={control}
                  placeholder="Motivo ou descrição desta operação..."
                  multiline
                  rows={2}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": { padding: 0 },
                    "& .MuiOutlinedInput-input": { padding: "14px 14px" },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <LoadingButton
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              type="submit"
              loading={isCreating}
              sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, textTransform: 'none', fontSize: 16 }}
            >
              Confirmar Destino
            </LoadingButton>
          </DialogActions>
        </form>
      )
      }
    </Dialog >
  );
}
