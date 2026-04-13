import {
  HookCurrencyField,
  HookTextField,
  IconColorMenuPicker,
} from "@/app/components/forms/hooksForm";
import { Meta } from "@/core/metas/types";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { IconCalendar, IconTarget, IconPlus, IconX } from "@tabler/icons-react";
import { RefObject } from "react";
import { Control, useWatch } from "react-hook-form";

interface FormProps {
  isEditing: boolean;
  isCollapsed: boolean;
  row: Meta | null;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<any>;
  isCreating: boolean;
  isUpdating: boolean;
  formRef: RefObject<HTMLDivElement>;
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
    handleCancelEdit,
    formRef,
  } = formProps;

  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });

  return (
    <Card
      ref={formRef}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
        mb: 3
      }}
    >
      <CardContent sx={{ px: 2, py: 2 }}>
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
              {isEditing ? "Editando Objetivo:" : "Novo Objetivo"}
            </Typography>
            <Typography variant="body2" color="primary.main">
              {watchNome || (isEditing ? row?.nome : "Defina sua próxima conquista")}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <HookTextField
                label="Nome do Objetivo"
                name="nome"
                control={control}
                placeholder="Ex: Reserva de Emergência, Viagem Disney..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconTarget size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <HookCurrencyField
                name="valorMeta"
                control={control}
                label="Valor Objetivo"
                returnAsNumber={true}
                placeholder="Ex: 10.000,00"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <HookTextField
                name="dataAlvo"
                control={control}
                label="Data Alvo"
                type="date"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCalendar size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1.5}>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isCreating || isUpdating}
                  color="primary"
                  startIcon={<IconPlus size={16} />}
                  sx={{ borderRadius: 2 }}
                >
                  {isEditing ? "Atualizar Meta" : "Criar Meta"}
                </LoadingButton>

                {isEditing && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancelEdit}
                    startIcon={<IconX size={16} />}
                    sx={{ borderRadius: 2 }}
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
