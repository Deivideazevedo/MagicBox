import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { Receita } from "@/core/receitas/types";
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
  TextField,
  Typography,
} from "@mui/material";
import { IconRepeat } from "@tabler/icons-react";
import {
  IconEdit,
  IconSearch,
  IconTrash,
  IconWallet,
} from "@tabler/icons-react";
import { useState } from "react";

interface ListProps {
  receitas: Receita[];
  handleOpenDialog: (receita: Receita) => void;
  handleEdit: (receita: Receita) => void;
}

export const Listagem = (formProps: ListProps) => {
  const { receitas, handleOpenDialog, handleEdit } = formProps;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReceitas = receitas.filter((r) =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
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
                Receitas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {receitas.length} receita
                {receitas.length !== 1 ? "s" : ""} cadastrada
                {receitas.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
            <Chip
              label={`${receitas.length} receitas`}
              color="success"
              variant="outlined"
            />
          </Stack>
          <TextField
            fullWidth
            size="small"
            placeholder="Pesquisar receita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <IconSearch size={20} stroke={1.5} color="gray" style={{ marginRight: 8 }} />,
            }}
          />
        </Box>

        {filteredReceitas.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <IconWallet
              size={64}
              style={{ opacity: 0.3, marginBottom: 16 }}
            />
            <Typography variant="h6" gutterBottom>
              Nenhuma receita encontrada
            </Typography>
            <Typography variant="body2">
              {searchTerm
                ? "Tente alterar o termo de busca."
                : "Comece adicionando suas primeiras receitas"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredReceitas.map((receita: Receita, index: number) => {
              const bg = receita.cor
                ? alpha(receita.cor, 0.15)
                : (receita.status ? "success.light" : "grey.300");
              const fg = receita.cor
                ? receita.cor
                : (receita.status ? "success.main" : "grey.600");

              return (
                <Box key={receita.id}>
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
                      <DynamicIcon
                        name={receita.icone}
                        size={20}
                        fallbackIcon={receita.tipo === "FIXA" ? "IconRepeat" : "IconWallet"}
                      />
                    </Box>

                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          component="div"
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {receita.nome}
                          </Typography>
                          {receita.tipo === "FIXA" && (
                            <Chip
                              label="Fixa"
                              color="success"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={receita.status ? "Ativa" : "Inativa"}
                            color={receita.status ? "success" : "default"}
                            size="small"
                            variant="filled"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0}>
                          <Typography variant="caption" color="text.secondary">
                            Categoria: {receita.categoria?.nome || "N/A"}
                          </Typography>
                          <Stack direction="row" spacing={2} >
                            {receita.valorEstimado && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Valor Estimado:{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(Number(receita.valorEstimado))}
                              </Typography>
                            )}
                            {receita.diaRecebimento && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Recebe dia {receita.diaRecebimento}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      }
                      secondaryTypographyProps={{ component: "div" }}
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(receita)}
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: "primary.light",
                            },
                          }}
                        >
                          <IconEdit size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(receita)}
                          sx={{
                            color: "error.main",
                            "&:hover": { backgroundColor: "error.light" },
                          }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < receitas.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
