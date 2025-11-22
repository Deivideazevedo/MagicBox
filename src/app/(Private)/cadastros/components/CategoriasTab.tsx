"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  TextField,
  Typography
} from "@mui/material";
import {
  IconCategory,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX
} from "@tabler/icons-react";
import { useRef } from "react";
import { useCategorias } from "../hooks/useCategorias";

export default function CategoriasTab() {
  const formRef = useRef<HTMLDivElement>(null);
  
  const {
    categorias,
    isLoading,
    error,
    editingCategoria,
    register,
    handleSubmit,
    errors,
    isCreating,
    isUpdating,
    isDeleting,
    onSubmit,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    deleteDialog
  } = useCategorias();

  const scrollToForm = () => {
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 200; // 120px de offset do topo

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleEditWithScroll = (categoria: any) => {
    handleEdit(categoria, scrollToForm);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Erro ao carregar categorias. Tente novamente.
      </Alert>
    );
  }

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Card 
            ref={formRef}
            elevation={2}
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <IconCategory size={24} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingCategoria ? 'Atualize os dados da categoria' : 'Adicione uma nova categoria'}
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  fullWidth
                  label="Nome da Categoria"
                  placeholder="Ex: Alimentação, Transporte..."
                  {...register("nome")}
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCategory size={20} color="gray" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isCreating || isUpdating}
                    startIcon={isCreating || isUpdating ? <CircularProgress size={16} /> : <IconPlus size={16} />}
                    sx={{ flex: 1 }}
                  >
                    {editingCategoria ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  
                  {editingCategoria && (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      startIcon={<IconX size={16} />}
                    >
                      Cancelar
                    </Button>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Categorias */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      Categorias
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {categorias.length} categoria{categorias.length !== 1 ? 's' : ''} cadastrada{categorias.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${categorias.length} categorias`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {categorias.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}
                >
                  <IconCategory size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
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
                          px: 3,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            backgroundColor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main',
                            mr: 2,
                          }}
                        >
                          <IconCategory size={20} />
                        </Box>
                        
                        <ListItemText
                          primary={categoria.nome}
                          secondary={`Criada em ${new Date(categoria.createdAt).toLocaleDateString('pt-BR')}`}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: 'text.primary'
                          }}
                        />
                        
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditWithScroll(categoria)}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.light' }
                              }}
                            >
                              <IconEdit size={18} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(categoria)}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': { backgroundColor: 'error.light' }
                              }}
                            >
                              <IconTrash size={18} />
                            </IconButton>
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
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'error.main',
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
            Tem certeza que deseja excluir a categoria <strong>"{deleteDialog.categoria?.nome}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            startIcon={<IconX size={16} />}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <IconTrash size={16} />}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}