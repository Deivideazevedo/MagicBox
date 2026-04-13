import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  InputAdornment,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { useForm } from "react-hook-form";
import {
  HookCurrencyField,
  HookTextField,
  HookDatePicker,
} from "@/app/components/forms/hooksForm";
import { IconX, IconSquareRoundedPlus, IconSquareRoundedMinus, IconCheck } from "@tabler/icons-react";
import { LoadingButton } from "@mui/lab";
import { useCreateLancamentoMutation } from "@/services/endpoints/lancamentosApi";
import Swal from "sweetalert2";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  type: "meta" | "divida";
  targetId: number;
  targetName: string;
  defaultAmount?: number;
  categoriaId: number;
}

export const TransactionModal = ({
  open,
  onClose,
  type,
  targetId,
  targetName,
  defaultAmount = 0,
  categoriaId
}: TransactionModalProps) => {
  const [createLancamento, { isLoading }] = useCreateLancamentoMutation();
  
  const isMeta = type === "meta";
  const color = isMeta ? "primary" : "warning";
  
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      valor: defaultAmount,
      data: new Date().toISOString(),
      observacao: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        tipo: "pagamento", // Lançamento efetivado
        valor: data.valor,
        data: data.data,
        observacao: data.observacao || `${isMeta ? "Aporte em" : "Pagamento de"} ${targetName}`,
        categoriaId: categoriaId,
        userId: 0, // Backend resolve via token
        ...(isMeta ? { metaId: targetId } : { despesaId: targetId })
      };

      await createLancamento(payload as any).unwrap();
      Swal.fire({
        icon: "success",
        title: isMeta ? "Aporte realizado!" : "Pagamento registrado!",
        showConfirmButton: false,
        timer: 1500
      });
      handleClose();
    } catch (error) {
       Swal.fire({
        icon: "error",
        title: "Erro ao registrar transação",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
           {isMeta ? (
             <IconSquareRoundedPlus color="var(--mui-palette-primary-main)" size={28} />
           ) : (
             <IconSquareRoundedMinus color="var(--mui-palette-warning-main)" size={28} />
           )}
           <Typography variant="h6" fontWeight={700}>
              {isMeta ? "Novo Aporte" : "Amortização"}
           </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={3}>
           {isMeta 
             ? `Quanto você deseja guardar para "${targetName}"?` 
             : `Registrar pagamento para a dívida "${targetName}".`}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <HookCurrencyField
              name="valor"
              control={control}
              label="Valor"
              color={color}
              returnAsNumber
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <HookDatePicker
              name="data"
              control={control}
              label="Data da Operação"
            />
          </Grid>
          <Grid item xs={12}>
            <HookTextField
              name="observacao"
              control={control}
              label="Observação (Opcional)"
              placeholder="Ex: Reserva do 13º salário"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: "grey.100" }}>
        <Button onClick={handleClose} color="inherit" disabled={isLoading}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color={color}
          loading={isLoading}
          onClick={handleSubmit(onSubmit)}
          startIcon={<IconCheck size={18} />}
        >
          Confirmar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;
