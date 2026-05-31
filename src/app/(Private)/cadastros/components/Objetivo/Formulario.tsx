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
  Collapse,
} from "@mui/material";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconTarget,
  IconPig,
  IconX,
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
  setValue: any;
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
    setValue,
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
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              },
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
                {isEditing
                  ? targetObjetivo?.nome
                  : watchNome || "Defina sua próxima conquista"}
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
          <Stack spacing={2.5}>
            {/* Seletor de Tipo (Meta vs Reserva/Caixinha) */}
            {!isAporte && !isEditing && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ display: "block", mb: 1, textTransform: "uppercase" }}
                >
                  Tipo de Objetivo
                </Typography>
                <ToggleButtonGroup
                  value={watchTipo}
                  exclusive
                  onChange={(_, value) => {
                    if (value) {
                      setValue("tipo", value);
                      setValue(
                        "icone",
                        value === "RESERVA" ? "IconPig" : "IconTarget",
                      );
                      if (value === "RESERVA") {
                        setValue("valorObjetivo", null);
                        setValue("dataAlvo", null);
                      } else {
                        setValue(
                          "dataAlvo",
                          new Date().toLocaleDateString("sv-SE"),
                        );
                      }
                    }
                  }}
                  fullWidth
                  sx={{
                    position: "relative",
                    bgcolor: alpha(
                      theme.palette.action.disabledBackground,
                      0.05,
                    ),
                    borderRadius: "30px",
                    p: 0.5,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px",
                    "& .MuiToggleButtonGroup-grouped": {
                      border: 0,
                      borderRadius: "30px",
                      m: 0,
                    },
                  }}
                >
                  <Box
                    style={{
                      left: watchTipo === "RESERVA" ? "calc(50% + 2px)" : "4px",
                      right:
                        watchTipo === "RESERVA" ? "4px" : "calc(50% + 2px)",
                      backgroundColor:
                        watchTipo === "RESERVA"
                          ? theme.palette.success.main
                          : theme.palette.primary.main,
                      boxShadow: `0 4px 12px ${alpha(
                        watchTipo === "RESERVA"
                          ? theme.palette.success.main
                          : theme.palette.primary.main,
                        0.25,
                      )}`,
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      bottom: 4,
                      borderRadius: "30px",
                      transition:
                        "left 0.25s cubic-bezier(0.4, 0, 0.2, 1), right 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.25s ease, box-shadow 0.25s ease",
                      zIndex: 0,
                    }}
                  />
                  <ToggleButton
                    value="META"
                    sx={{
                      p: 1,
                      borderRadius: "30px",
                      fontWeight: 700,
                      textTransform: "none",
                      gap: 0.5,
                      // fontSize: "13px",
                      whiteSpace: "nowrap",
                      color:
                        watchTipo === "META"
                          ? "primary.contrastText"
                          : "text.secondary",
                      zIndex: 1,
                      backgroundColor: "transparent !important",
                      transition: "color 0.25s ease",
                    }}
                  >
                    <IconTarget size={16} />
                    Meta
                  </ToggleButton>
                  <ToggleButton
                    value="RESERVA"
                    sx={{
                      py: 1,
                      borderRadius: "30px !important",
                      fontWeight: 700,
                      textTransform: "none",
                      gap: 0.5,
                      // fontSize: { xs: "11px", sm: "13px", md: "14px" },
                      whiteSpace: "nowrap",
                      color:
                        watchTipo === "RESERVA"
                          ? "success.contrastText"
                          : "text.secondary",
                      zIndex: 1,
                      backgroundColor: "transparent !important",
                      transition: "color 0.25s ease",
                    }}
                  >
                    <IconPig size={16} />
                    Reserva
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            {!isAporte && (
              <Stack spacing={0}>
                <HookTextField
                  label="Nome do Objetivo"
                  name="nome"
                  control={control}
                  placeholder={
                    watchTipo === "RESERVA"
                      ? "Ex: Caixinha da Diversão, Cofrinho..."
                      : "Ex: Reserva de Emergência, Viagem Disney..."
                  }
                />

                {/* Renderização Condicional de Campos para META com Collapse */}
                <Collapse
                  in={watchTipo === "META"}
                  timeout={300}
                  mountOnEnter
                  unmountOnExit
                >
                  <Stack spacing={2.5} sx={{ pt: 2.5 }}>
                    <HookMasksCurrencyField
                      name="valorObjetivo"
                      control={control}
                      label="Valor Objetivo"
                      returnAsNumber={true}
                      placeholder="Ex: 10.000,00"
                    />
                    <HookDatePicker
                      name="dataAlvo"
                      control={control}
                      label="Data Alvo"
                      helperText="Data limite para atingir o valor total pretendido."
                    />
                  </Stack>
                </Collapse>
              </Stack>
            )}

            {/* Inputs para Aporte */}
            {isAporte && (
              <Stack spacing={2}>
                <HookMasksCurrencyField
                  name="valorObjetivo"
                  control={control}
                  label="Valor do Aporte"
                  returnAsNumber={true}
                  placeholder="0,00"
                />
                <HookDatePicker
                  name="dataAlvo"
                  control={control}
                  label="Data do Aporte"
                  helperText="Data da movimentação financeira."
                />
              </Stack>
            )}

            {/* <Stack direction="column" spacing={1} sx={{ mt: 5 }}> */}
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              loading={isCreating || isUpdating || isAportando}
              color="primary"
              startIcon={<IconDeviceFloppy size={18} />}
              sx={{
                borderRadius: 3,
                mt: 0,
                py: 1.5,
                fontWeight: 700,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
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
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    color: "primary.main",
                  },
                }}
              >
                Cancelar
              </Button>
            )}
            {/* </Stack> */}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Formulario;
