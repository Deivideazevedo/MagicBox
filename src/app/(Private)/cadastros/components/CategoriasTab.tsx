import { useRef } from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconCategory,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useCategorias } from "../hooks/useCategorias";
import { HookTextField } from "@/app/components/forms/hooksForm";
import { LoadingButton } from "@mui/lab";
import { Categoria } from "@/core/categorias/types";

interface CategoriasTabProps {
  categorias: Categoria[];
}

export default function CategoriasTab({ categorias: categoriasProps }: CategoriasTabProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const {
    categorias,
    editingCategoria,
    control,
    handleSubmit,
    isCreating,
    isUpdating,
    isDeleting,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    deleteDialog,
  } = useCategorias({ categorias: categoriasProps });

  const scrollToForm = () => {
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 200;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleEditWithScroll = (categoria: any) => {
    handleEdit(categoria, scrollToForm);
  };

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Card
            ref={formRef}
            elevation={0} // Fica mais moderno sem sombra se tiver borda
            sx={{
              borderRadius: 3,
              border: "1px solid",
              // Use a cor main com baixíssima opacidade para a borda ficar elegante
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              // Use 4% a 5% de opacidade no fundo. Fica um "rosa bebê" quase imperceptível.
              backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.4),
            }}
          >
            <CardContent sx={{ px: 1, py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    display: "flex",
                    backgroundColor: "primary.main",
                    color: "white",
                  }}
                >
                  <IconCategory size={24} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingCategoria ? "Atualização" : "Cadastro"}
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container gap={1}>
                  <Grid item xs={12}>
                    <HookTextField
                      control={control}
                      name="nome"
                      label="Nome da Categoria"
                      placeholder="Ex: Pessoal, conjugal..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconCategory size={20} />
                          </InputAdornment>
                        ),
                      }}
                      // InputLabelProps={{ shrink: true }}
                      sx={{
                        mb: 1,
                        "& .MuiOutlinedInput-input": {
                          paddingLeft: "0px",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <LoadingButton
                      type="submit"
                      fullWidth
                      variant="contained"
                      loading={isCreating || isUpdating}
                      startIcon={<IconPlus size={16} />}
                      sx={{ flex: 1 }}
                    >
                      {editingCategoria ? "Atualizar" : "Adicionar"}
                    </LoadingButton>
                  </Grid>
                  {editingCategoria && (
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleCancelEdit}
                        startIcon={<IconX size={16} />}
                        sx={{ flex: 1 }}
                      >
                        Cancelar
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Categorias */}
        <Grid item xs={12} md={8}>
          <Card
           elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              // backgroundColor: (theme) => alpha(theme.palette.error.main, 0.04),
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="text.primary"
                    >
                      Categorias
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Listagem de categorias
                    </Typography>
                  </Box>
                  <Chip
                    label={`${categorias.length} categorias`}
                    color="primary"
                    variant="outlined"
                    size="medium"
                  />
                </Stack>
              </Box>

              {categorias.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    color: "text.secondary",
                  }}
                >
                  <IconCategory
                    size={64}
                    style={{ opacity: 0.3, marginBottom: 16 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Nenhuma categoria cadastrada
                  </Typography>
                  <Typography variant="body2">
                    Comece adicionando suas primeiras categorias
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {categorias.map((categoria: any, index: number) => (
                    <Box key={categoria.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          px: 2,
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            backgroundColor: "primary.light",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "primary.main",
                            mr: 2,
                          }}
                        >
                          <IconCategory size={20} />
                        </Box>

                        <ListItemText
                          primary={categoria.nome}
                          secondary={`Criada em ${new Date(
                            categoria.createdAt
                          ).toLocaleDateString("pt-BR")}`}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: "text.primary",
                          }}
                        />

                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Editar Categoria" placement="top">
                              <IconButton
                                size="small"
                                onClick={() => handleEditWithScroll(categoria)}
                                color="primary"
                              >
                                <IconEdit size={18} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Excluir Categoria" placement="top">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(categoria)}
                                color="error"
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < categorias.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "error.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "error.main",
              }}
            >
              <IconTrash size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Confirmar Exclusão
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta ação não pode ser desfeita
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a categoria{" "}
            <strong>"{deleteDialog.categoria?.nome}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            startIcon={<IconX size={16} />}
            sx={{
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            loading={isDeleting}
            startIcon={<IconTrash size={16} />}
            sx={{
              fontWeight: 600,
            }}
          >
            Excluir
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
