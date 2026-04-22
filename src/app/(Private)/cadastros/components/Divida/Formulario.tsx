import {
  HookCurrencyField,
  HookDatePicker,
  HookTextField,
  IconColorMenuPicker,
  HookAutocomplete,
  HookDecimalField,
} from "@/app/components/forms/hooksForm";
import { DividaFormData } from "../../hooks/useDividas";
import { Divida } from "@/core/dividas/types";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
  Collapse,
} from "@mui/material";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconX,
  IconCreditCard
} from "@tabler/icons-react";
import { Control, useWatch } from "react-hook-form";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";

interface FormProps {
  isEditing: boolean;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<DividaFormData>;
  isCreating: boolean;
  isUpdating: boolean;
  isAporte?: boolean;
  isAportando?: boolean;
  targetDivida?: Divida | null;
  valorParcelaCalculado: number;
}

export const Formulario = (formProps: FormProps) => {
  const theme = useTheme();
  const {
    isEditing,
    handleSubmit,
    control,
    isCreating,
    isUpdating,
    isAporte = false,
    isAportando = false,
    handleCancelEdit,
    targetDivida,
    valorParcelaCalculado,
  } = formProps;

  const { data: categorias = [] } = useGetCategoriasQuery();

  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });

  const getTitle = () => {
    if (isAporte) return "Fazer Aporte / Amortização";
    return isEditing ? "Editar Dívida" : "Nova Dívida Única";
  };

  const getButtonText = () => {
    if (isAporte) return "Confirmar Pagamento";
    return isEditing ? "Salvar Alterações" : "Criar Dívida";
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.2),
        backgroundColor: "background.paper",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header do Formulário com botão Voltar */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            onClick={handleCancelEdit}
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }
            }}
          >
            <IconArrowLeft size={20} />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700}>
            {getTitle()}
          </Typography>
        </Stack>
        <IconButton size="small" onClick={handleCancelEdit}>
          <IconX size={18} />
        </IconButton>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {!isAporte && (
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconColorMenuPicker
              control={control}
              iconName="icone"
              colorName="cor"
              watchIcon={watchIcon}
              watchColor={watchColor}
              fallbackIcon="IconCreditCard"
              fallbackColor={theme.palette.primary.main}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {isEditing ? "Editando Dívida:" : "Nova Dívida Única"}
              </Typography>
              <Typography variant="body2" color="primary.main">
                {isEditing ? targetDivida?.nome : (watchNome || "Registre um novo parcelamento")}
              </Typography>
            </Box>
          </Box>
        )}

        {isAporte && (
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Amortizando parcelas de:
              </Typography>
              <Typography variant="body2" color="primary.main">
                {targetDivida?.nome || watchNome}
              </Typography>
            </Box>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {!isAporte && (
              <>
                <Grid item xs={12}>
                  <HookTextField
                    label="Nome da Dívida"
                    name="nome"
                    control={control}
                    placeholder="Ex: Cartão de Crédito, Empréstimo..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <HookAutocomplete
                    name="categoriaId"
                    control={control}
                    options={categorias}
                    label="Categoria"
                    placeholder="Selecione a categoria..."
                    getOptionLabel={(opt) => opt.nome}
                    getOptionValue={(opt) => opt.id}
                    shrinkLabel
                  />
                </Grid>
                <Grid item xs={12}>
                   <HookCurrencyField
                    name="valorTotal"
                    control={control}
                    label="Valor Total da Dívida"
                    returnAsNumber={true}
                    placeholder="R$ 0,00"
                  />
                </Grid>
                <Grid item xs={12}>
                   <HookDecimalField
                    name="totalParcelas"
                    control={control}
                    label="Quantidade de Parcelas"
                    returnAsNumber={true}
                    placeholder="Ex: 12"
                  />
                </Grid>

                <Grid item xs={12}>
                    <Collapse in={valorParcelaCalculado > 0}>
                        <Box
                          p={1.5}
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: alpha(theme.palette.primary.main, 0.3)
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                             Cálculo do Resultado:
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                             {formatCurrency(valorParcelaCalculado)} / mês
                          </Typography>
                        </Box>
                    </Collapse>
                </Grid>
              </>
            )}

            {isAporte && (
              <Grid item xs={12}>
                <HookCurrencyField
                  name="valorAporte"
                  control={control}
                  label="Valor do Pagamento"
                  returnAsNumber={true}
                  placeholder="0,00"
                />
              </Grid>
            )}

            {!isAporte && (
              <Grid item xs={12}>
                <HookDatePicker
                  name="dataInicio"
                  control={control}
                  label="Data de Início / Vencimento"
                  helperText="Data da primeira parcela. O dia definirá os próximos vencimentos."
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Stack direction="column" spacing={1.5}>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isCreating || isUpdating || isAportando}
                  color="primary"
                  startIcon={<IconDeviceFloppy size={18} />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 700,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                >
                  {getButtonText()}
                </LoadingButton>

                {(isEditing || isAporte) && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancelEdit}
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 600,
                      borderColor: alpha(theme.palette.divider, 0.2),
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        color: 'primary.main'
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Formulario;
