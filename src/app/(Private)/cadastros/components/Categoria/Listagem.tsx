import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { Categoria } from "@/core/categorias/types";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconCategory, IconEdit, IconTrash, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

interface ListProps {
  categorias: Categoria[];
  handleExcluirCategoria: (categoria: Categoria) => void;
  handleEdit: (categoria: Categoria) => void;
  handleToggleStatus: (categoria: Categoria, checked: boolean) => void;
}

export const Listagem = (formProps: ListProps) => {
  const { categorias, handleExcluirCategoria, handleEdit, handleToggleStatus } = formProps;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategorias = categorias.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={600} color="text.primary">
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
          <TextField
            fullWidth
            size="small"
            placeholder="Pesquisar categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <IconSearch size={20} stroke={1.5} color="gray" style={{ marginRight: 8 }} />,
            }}
          />
        </Box>

        {filteredCategorias.length === 0 ? (
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
              Nenhuma categoria encontrada
            </Typography>
            <Typography variant="body2">
              {searchTerm
                ? "Tente limpar o termo de busca."
                : "Comece adicionando suas primeiras categorias"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredCategorias.map((categoria: any, index: number) => {
              const bg = categoria.cor ? alpha(categoria.cor, 0.15) : "primary.light";
              const fg = categoria.cor || "primary.main";
              const isAtiva = categoria.status === "A";

              return (
                <Box key={categoria.id} sx={{ opacity: isAtiva ? 1 : 0.55 }}>
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
                        borderRadius: "50%",
                        backgroundColor: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: fg,
                        mr: 2,
                      }}
                    >
                      <DynamicIcon name={categoria.icone} size={20} fallbackIcon="IconCategory" />
                    </Box>

                    <ListItemText
                      primary={categoria.nome}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Criada em {new Date(categoria.createdAt).toLocaleDateString("pt-BR")}
                          {!isAtiva && " • Inativa"}
                        </Typography>
                      }
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Tooltip
                          title={isAtiva ? "Desativar Categoria" : "Ativar Categoria"}
                          placement="top"
                        >
                          <Switch
                            size="small"
                            checked={isAtiva}
                            onChange={(e) => handleToggleStatus(categoria, e.target.checked)}
                            color="primary"
                          />
                        </Tooltip>

                        <Tooltip title="Editar Categoria" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(categoria)}
                            color="primary"
                          >
                            <IconEdit size={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Excluir Categoria" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleExcluirCategoria(categoria)}
                            color="error"
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredCategorias.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
