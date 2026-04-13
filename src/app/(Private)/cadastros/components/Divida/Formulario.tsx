import CustomToggle from "@/app/components/forms/CustomToggle";
import {
  HookCurrencyField,
  HookDecimalField,
  HookSelect,
  HookTextField,
  IconColorMenuPicker,
} from "@/app/components/forms/hooksForm";
import { Despesa } from "@/core/despesas/types";
import { DespesaFormData } from "../../hooks/useDespesas";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Categoria } from "@/core/categorias/types";
import { IconCalendar, IconCalculator, IconCreditCard, IconCategory, IconCurrencyDollar, IconPlus, IconX } from "@tabler/icons-react";
import { Control, useWatch } from "react-hook-form";

interface FormProps {
  isEditing: boolean;
  isCollapsed: boolean;
  row: Despesa | null;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<DespesaFormData>;
  isCreating: boolean;
  isUpdating: boolean;
  categorias: Categoria[];
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
    categorias,
    handleCancelEdit,
  } = formProps;

  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.warning.main, 0.2),
        backgroundColor: (theme) => alpha(theme.palette.warning.light, 0.05),
      }}
    >
      <CardContent sx={{ px: 1, py: 1.5 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconColorMenuPicker
            control={control}
            iconName="icone"
            colorName="cor"
            watchIcon={watchIcon}
            watchColor={watchColor}
            fallbackIcon="IconCreditCard"
            fallbackColor={theme.palette.warning.main}
          />
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary"
            >
              {isEditing ? `Editando Dívida:` : `Nova Dívida`}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={isEditing ? 600 : 400}
              color="warning.main"
            >
              {watchNome || (isEditing ? row?.nome : "Preencha os dados abaixo")}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Nome */}
            <Grid item xs={12}>
              <HookTextField
                label="Nome da Dívida"
                name="nome"
                color="warning"
                control={control}
                placeholder="Ex: Financiamento Carro, Empréstimo..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCreditCard size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Categoria */}
            <Grid item xs={12}>
              <HookSelect
                name="categoriaId"
                color="warning"
                control={control}
                options={categorias}
                label="Categoria"
                placeholder="Selecione"
                displayEmpty
                getValue={(obj) => obj.id}
                getLabel={(obj) => obj.nome}
                startAdornment={
                  <InputAdornment position="start">
                    <IconCategory size={20} />
                  </InputAdornment>
                }
              />
            </Grid>

            {/* Valor Total */}
            <Grid item xs={12}>
              <HookCurrencyField
                name="valorTotal"
                color="warning"
                control={control}
                label="Valor Total da Dívida"
                returnAsNumber={true}
                placeholder="Ex: 50.000,00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCalculator size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Data de Início */}
            <Grid item xs={12}>
              <HookTextField
                name="dataInicio"
                color="warning"
                control={control}
                label="Data de Início"
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

            {/* Campos Opcionais (Collapse) */}
            <Grid item xs={12}>
              <Collapse in={!!watchNome || isEditing} timeout={400}>
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <HookCurrencyField
                        name="valorEstimado"
                        color="warning"
                        control={control}
                        label="Valor da Parcela"
                        returnAsNumber={true}
                        placeholder="(opcional)"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconCurrencyDollar size={20} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <HookDecimalField
                        name="diaVencimento"
                        color="warning"
                        control={control}
                        label="Dia do Vencimento"
                        returnAsNumber={true}
                        placeholder="Ex: 5"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconCalendar size={20} />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{ min: "1", max: "31", maxLength: 2 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Grid>

            {/* Status */}
            <Grid item xs={12} mt={-1}>
              <CustomToggle
                control={control}
                name="status"
                activeValue="A"
                inactiveValue="I"
                color="success"
                variant="switch"
                titleActive="Dívida Ativa"
                titleInactive="Dívida Inativa"
                descriptionActive="Disponível para lançamentos"
                descriptionInactive="Oculta para lançamentos"
              />
            </Grid>

            {/* Botões de Ação */}
            <Grid item xs={12} sx={{ pt: 2 }}>
              <Stack spacing={1.5}>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isCreating || isUpdating}
                  color="warning"
                  startIcon={<IconPlus size={16} />}
                >
                  {isEditing ? "Atualizar" : "Adicionar"}
                </LoadingButton>

                {isEditing && (
                  <Button variant="outlined" fullWidth onClick={handleCancelEdit} startIcon={<IconX size={16} />}>
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
