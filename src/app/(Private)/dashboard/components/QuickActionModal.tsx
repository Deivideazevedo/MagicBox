"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from "@mui/material";
import {
  IconX,
  IconPlus,
  IconWallet,
  IconCreditCard,
  IconCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

interface QuickActionModalProps {
  open: boolean;
  onClose: () => void;
  action: "despesa" | "conta" | "lancamento" | null;
  onActionComplete: () => void;
}

interface FormData {
  // Campos comuns
  observacao: string;
  valor?: number;
  
  // Campos específicos de despesa
  vencimento?: string;
  categoria?: string;
  
  // Campos específicos de conta
  tipo?: string;
  banco?: string;
  
  // Campos específicos de lançamento
  data?: string;
  contaId?: string;
  despesaId?: string;
  tipoTransacao?: "receita" | "despesa";
}

const QuickActionModal = ({ open, onClose, action, onActionComplete }: QuickActionModalProps) => {
  const [step, setStep] = useState<"select" | "form" | "success">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const getActionConfig = () => {
    switch (action) {
      case "lancamento":
        return {
          title: "Novo Lançamento",
          description: "Registre uma nova transação financeira",
          icon: <IconPlus size={48} />,
          color: "#5D87FF",
        };
      case "despesa":
        return {
          title: "Nova Despesa",
          description: "Cadastre uma nova categoria de despesa",
          icon: <IconWallet size={48} />,
          color: "#FA896B",
        };
      case "conta":
        return {
          title: "Nova Conta",
          description: "Adicione uma nova conta financeira",
          icon: <IconCreditCard size={48} />,
          color: "#13DEB9",
        };
      default:
        return null;
    }
  };

  const config = getActionConfig();

  const handleClose = () => {
    setStep("select");
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Simular chamada para API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Dados enviados:", data);
    setIsSubmitting(false);
    setStep("success");
    
    // Fechar modal após 2 segundos
    setTimeout(() => {
      handleClose();
      onActionComplete();
    }, 2000);
  };

  const renderForm = () => {
    if (!config) return null;

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Observação - campo comum */}
          <Grid item xs={12}>
            <Controller
              name="observacao"
              control={control}
              defaultValue=""
              rules={{ required: "Observação é obrigatória" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Observação"
                  variant="outlined"
                  error={!!errors.observacao}
                  helperText={errors.observacao?.message}
                />
              )}
            />
          </Grid>

          {/* Campos específicos por tipo */}
          {action === "despesa" && (
            <>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="valor"
                  control={control}
                  defaultValue={0}
                  rules={{ required: "Valor é obrigatório", min: { value: 0.01, message: "Valor deve ser maior que zero" } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Valor Estimado"
                      type="number"
                      variant="outlined"
                      error={!!errors.valor}
                      helperText={errors.valor?.message}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="vencimento"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Data de vencimento é obrigatória" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Vencimento"
                      type="date"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.vencimento}
                      helperText={errors.vencimento?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="categoria"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Categoria é obrigatória" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.categoria}>
                      <InputLabel>Categoria</InputLabel>
                      <Select {...field} label="Categoria">
                        <MenuItem value="alimentacao">Alimentação</MenuItem>
                        <MenuItem value="transporte">Transporte</MenuItem>
                        <MenuItem value="lazer">Lazer</MenuItem>
                        <MenuItem value="saude">Saúde</MenuItem>
                        <MenuItem value="educacao">Educação</MenuItem>
                        <MenuItem value="moradia">Moradia</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </>
          )}

          {action === "conta" && (
            <>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="tipo"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Tipo é obrigatório" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipo}>
                      <InputLabel>Tipo de Conta</InputLabel>
                      <Select {...field} label="Tipo de Conta">
                        <MenuItem value="corrente">Conta Corrente</MenuItem>
                        <MenuItem value="poupanca">Poupança</MenuItem>
                        <MenuItem value="investimento">Investimento</MenuItem>
                        <MenuItem value="cartao">Cartão de Crédito</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="banco"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Banco é obrigatório" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Banco/Instituição"
                      variant="outlined"
                      error={!!errors.banco}
                      helperText={errors.banco?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="valor"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Saldo Inicial (opcional)"
                      type="number"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                      }}
                    />
                  )}
                />
              </Grid>
            </>
          )}

          {action === "lancamento" && (
            <>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="tipoTransacao"
                  control={control}
                  defaultValue="despesa"
                  rules={{ required: "Tipo é obrigatório" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipoTransacao}>
                      <InputLabel>Tipo</InputLabel>
                      <Select {...field} label="Tipo">
                        <MenuItem value="receita">Receita</MenuItem>
                        <MenuItem value="despesa">Despesa</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="valor"
                  control={control}
                  defaultValue={0}
                  rules={{ required: "Valor é obrigatório", min: { value: 0.01, message: "Valor deve ser maior que zero" } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Valor"
                      type="number"
                      variant="outlined"
                      error={!!errors.valor}
                      helperText={errors.valor?.message}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="data"
                  control={control}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  rules={{ required: "Data é obrigatória" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Data"
                      type="date"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.data}
                      helperText={errors.data?.message}
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              background: `linear-gradient(45deg, ${config.color} 30%, ${config.color}AA 90%)`,
              '&:hover': {
                background: `linear-gradient(45deg, ${config.color}DD 30%, ${config.color}77 90%)`,
              },
            }}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </form>
    );
  };

  if (!config) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: step === "success" ? "300px" : "500px",
        },
      }}
    >
      <DialogTitle sx={{ position: "relative", textAlign: "center", pt: 3 }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 3 }}>
        {step === "select" && (
          <Box textAlign="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `${config.color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 3,
                color: config.color,
              }}
            >
              {config.icon}
            </Box>
            
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {config.title}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {config.description}
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => setStep("form")}
              sx={{
                background: `linear-gradient(45deg, ${config.color} 30%, ${config.color}AA 90%)`,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: `linear-gradient(45deg, ${config.color}DD 30%, ${config.color}77 90%)`,
                },
              }}
            >
              Continuar
            </Button>
          </Box>
        )}

        {step === "form" && (
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: `${config.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: config.color,
                }}
              >
                {config.icon}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {config.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Preencha os dados abaixo
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {renderForm()}
          </Box>
        )}

        {step === "success" && (
          <Box textAlign="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#13DEB920",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 3,
                color: "#13DEB9",
              }}
            >
              <IconCheck size={48} />
            </Box>
            
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Sucesso! 🎉
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {action === "despesa" && "Despesa cadastrada com sucesso!"}
              {action === "conta" && "Conta criada com sucesso!"}
              {action === "lancamento" && "Lançamento registrado com sucesso!"}
            </Typography>

            <Alert severity="success" sx={{ mt: 2 }}>
              Os dados foram salvos e já estão disponíveis no sistema.
            </Alert>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickActionModal;