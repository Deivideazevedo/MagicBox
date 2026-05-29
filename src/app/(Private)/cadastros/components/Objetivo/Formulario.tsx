import { HookDatePicker } from "@/app/components/forms/hooksForm/HookDatePicker";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { IconColorMenuPicker } from "@/app/components/forms/hooksForm/IconColorMenuPicker";
import { ObjetivoFormData } from "../../hooks/useObjetivos";
import { Objetivo } from "@/core/objetivos/types";
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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconTarget,
  IconPig,
  IconX
} from "@tabler/icons-react";
import { Control, useWatch } from "react-hook-form";

// Importando o HookCurrencyField do caminho correto
// Vamos verificar o import correto de HookCurrencyField no seu projeto
import { HookCurrencyField as HookMasksCurrencyField } from "@/app/components/forms/hooksForm/masks";

interface FormProps {
  isEditing: boolean;
  row: Objetivo | null;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<ObjetivoFormData>;
  isCreating: boolean;
  isUpdating: boolean;
  isAporte?: boolean;
  isAportando?: boolean;
  targetObjetivo?: Objetivo | null;
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
    isAportando = false,
    handleCancelEdit,
    targetObjetivo,
  } = formProps;

  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });
  const watchTipo = useWatch({ control, name: "tipo" });

  const getTitle = () => {
    if (isAporte) return "Fazer Aporte";
    return isEditing ? "Editar Objetivo" : "Novo Objetivo";
  };

  const getButtonText = () => {
    if (isAporte) return "Confirmar Aporte";
    return isEditing ? "Salvar Alterações" : "Confirmar Objetivo";
  };

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
              fallbackIcon={watchTipo === "RESERVA" ? "IconPig" : "IconTarget"}
              fallbackColor={watchColor || theme.palette.primary.main}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {isEditing ? "Editando:" : "Novo Objetivo"}
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight={700}>
                {isEditing ? targetObjetivo?.nome : (watchNome || "Defina sua próxima conquista")}
              </Typography>
            </Box>
          </Box>
        )}

        {isAporte && (
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Aportando em:
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight={700}>
                {targetObjetivo?.nome || watchNome}
              </Typography>
            </Box>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Seletor de Tipo (Meta vs Reserva/Caixinha) */}
            {!isAporte && !isEditing && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>
                  Tipo de Objetivo
                </Typography>
                <ToggleButtonGroup
                  value={watchTipo}
                  exclusive
                  onChange={(_, value) => {
                    if (value) {
                      control._reset({
                        ...control._defaultValues,
                        nome: watchNome || "",
                        tipo: value,
                        icone: value === "RESERVA" ? "IconPig" : "IconTarget"
                      });
                    }
                  }}
                  fullWidth
                  sx={{
                    bgcolor: alpha(theme.palette.action.disabledBackground, 0.05),
                    borderRadius: 3,
                    p: 0.5,
                    border: `1px solid ${theme.palette.divider}`,
                    "& .MuiToggleButtonGroup-grouped": {
                      border: 0,
                      borderRadius: "10px",
                      m: 0.2,
                    }
                  }}
                >
                  <ToggleButton
                    value="META"
                    sx={{
                      py: 1.2,
                      fontWeight: 700,
                      textTransform: "none",
                      gap: 1,
                      color: "text.secondary",
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        }
                      }
                    }}
                  >
                    <IconTarget size={18} />
                    Meta Planejada
                  </ToggleButton>
                  <ToggleButton
                    value="RESERVA"
                    sx={{
                      py: 1.2,
                      fontWeight: 700,
                      textTransform: "none",
                      gap: 1,
                      color: "text.secondary",
                      "&.Mui-selected": {
                        bgcolor: "success.main",
                        color: "success.contrastText",
                        "&:hover": {
                          bgcolor: "success.dark",
                        }
                      }
                    }}
                  >
                    <IconPig size={18} />
                    Reserva Livre
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            )}

            {!isAporte && (
              <Grid item xs={12}>
                <HookTextField
                  label="Nome do Objetivo"
                  name="nome"
                  control={control}
                  placeholder={watchTipo === "RESERVA" ? "Ex: Caixinha da Diversão, Cofrinho..." : "Ex: Reserva de Emergência, Viagem Disney..."}
                />
              </Grid>
            )}

            {/* Renderização Condicional de Campos para META */}
            {(!isAporte && watchTipo === "META") && (
              <>
                <Grid item xs={12}>
                  <HookMasksCurrencyField
                    name="valorObjetivo"
                    control={control}
                    label="Valor Objetivo"
                    returnAsNumber={true}
                    placeholder="Ex: 10.000,00"
                  />
                </Grid>
                <Grid item xs={12}>
                  <HookDatePicker
                    name="dataAlvo"
                    control={control}
                    label="Data Alvo"
                    helperText="Data limite para atingir o valor total pretendido."
                  />
                </Grid>
              </>
            )}

            {/* Inputs para Aporte */}
            {isAporte && (
              <>
                <Grid item xs={12}>
                  <HookMasksCurrencyField
                    name="valorObjetivo"
                    control={control}
                    label="Valor do Aporte"
                    returnAsNumber={true}
                    placeholder="0,00"
                  />
                </Grid>
                <Grid item xs={12}>
                  <HookDatePicker
                    name="dataAlvo"
                    control={control}
                    label="Data do Aporte"
                    helperText="Data da movimentação financeira."
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} mt={1}>
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
