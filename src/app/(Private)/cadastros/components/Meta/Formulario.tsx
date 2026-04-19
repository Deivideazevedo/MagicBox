import {
  HookCurrencyField,
  HookDatePicker,
  HookTextField,
  IconColorMenuPicker,
} from "@/app/components/forms/hooksForm";
import { MetaFormData } from "../../hooks/useMetas";
import { Meta } from "@/core/metas/types";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconTarget,
  IconX
} from "@tabler/icons-react";
import { Control, useWatch } from "react-hook-form";

interface FormProps {
  isEditing: boolean;
  row: Meta | null;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<MetaFormData>;
  isCreating: boolean;
  isUpdating: boolean;
  isAporte?: boolean;
  isRetirada?: boolean;
  isAportando?: boolean;
  targetMeta?: Meta | null;
}

export const Formulario = (formProps: FormProps) => {
  const theme = useTheme();
  const {
    isEditing,
    row,
    handleSubmit,
    control,
    isCreating,
    isUpdating,
    isAporte = false,
    isRetirada = false,
    isAportando = false,
    handleCancelEdit,
    targetMeta,
  } = formProps;

  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });

  const getTitle = () => {
    if (isAporte) return "Fazer Aporte";
    if (isRetirada) return "Retirar Valor";
    return isEditing ? "Editar Objetivo" : "Novo Objetivo";
  };

  const getButtonText = () => {
    if (isAporte) return "Confirmar Aporte";
    if (isRetirada) return "Confirmar Retirada";
    return isEditing ? "Salvar Alterações" : "Confirmar Meta";
  };

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.2),
        backgroundColor: "background.paper",
        // boxShadow: theme.shadows[8],
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
        {!isAporte && !isRetirada && (
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconColorMenuPicker
              control={control}
              iconName="icone"
              colorName="cor"
              watchIcon={watchIcon}
              watchColor={watchColor}
              fallbackIcon="IconTarget"
              fallbackColor={theme.palette.primary.main}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {isAporte ? "Aportando em:" : (isRetirada ? "Retirando de:" : (isEditing ? "Editando Objetivo:" : "Novo Objetivo"))}
              </Typography>
              <Typography variant="body2" color={isRetirada ? "error.main" : "primary.main"}>
                {watchNome || (isEditing ? row?.nome : "Defina sua próxima conquista")}
              </Typography>
            </Box>
          </Box>
        )}

        {(isAporte || isRetirada) && (
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {isAporte ? "Aportando em:" : "Retirando de:"}
              </Typography>
              <Typography variant="body2" color={isRetirada ? "error.main" : "primary.main"}>
                {targetMeta?.nome || watchNome}
              </Typography>
            </Box>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {!isAporte && !isRetirada && (
              <Grid item xs={12}>
                <HookTextField
                  label="Nome do Objetivo"
                  name="nome"
                  control={control}
                  placeholder="Ex: Reserva de Emergência, Viagem Disney..."
                />
              </Grid>
            )}

            {!isAporte && !isRetirada && (
              <Grid item xs={12}>
                <HookCurrencyField
                  name="valorMeta"
                  control={control}
                  label="Valor Objetivo"
                  returnAsNumber={true}
                  placeholder="Ex: 10.000,00"
                />
              </Grid>
            )}

            {(isAporte || isRetirada) && (
              <Grid item xs={12}>
                <HookCurrencyField
                  name="valorMeta"
                  control={control}
                  label={isRetirada ? "Valor da Retirada" : "Valor do Aporte"}
                  returnAsNumber={true}
                  placeholder="0,00"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <HookDatePicker
                name="dataAlvo"
                control={control}
                label={isAporte ? "Data do Aporte" : (isRetirada ? "Data da Retirada" : "Data Alvo")}
              />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="column" spacing={1.5}>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isCreating || isUpdating || isAportando}
                  color={isRetirada ? "error" : "primary"}
                  startIcon={<IconDeviceFloppy size={18} />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 700,
                    boxShadow: isRetirada
                      ? `0 8px 16px ${alpha(theme.palette.error.main, 0.2)}`
                      : `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isRetirada
                        ? `0 12px 20px ${alpha(theme.palette.error.main, 0.3)}`
                        : `0 12px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                >
                  {getButtonText()}
                </LoadingButton>

                {(isEditing || isAporte || isRetirada) && (
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
