import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
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
import {
  IconCreditCard,
  IconEdit,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

interface ListProps {
  despesas: Despesa[];
  handleOpenDialog: (despesa: Despesa) => void;
  handleEdit: (despesa: Despesa) => void;
}

export const Listagem = (formProps: ListProps) => {
  const { despesas, handleOpenDialog, handleEdit } = formProps;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDespesas = despesas.filter((d) =>
    d.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
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
                Despesas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {despesas.length} despesa
                {despesas.length !== 1 ? "s" : ""} cadastrada
                {despesas.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
            <Chip
              label={`${despesas.length} despesas`}
              color="error"
              variant="outlined"
            />
          </Stack>
          <TextField
            fullWidth
            size="small"
            placeholder="Pesquisar despesa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <IconSearch size={20} stroke={1.5} color="gray" style={{ marginRight: 8 }} />,
            }}
          />
        </Box>

        {filteredDespesas.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <IconCreditCard
              size={64}
              style={{ opacity: 0.3, marginBottom: 16 }}
            />
            <Typography variant="h6" gutterBottom>
              Nenhuma despesa encontrada
            </Typography>
            <Typography variant="body2">
              {searchTerm 
                ? "Tente alterar o termo de busca."
                : "Comece adicionando suas primeiras despesas"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredDespesas.map((despesa: Despesa, index: number) => {
              const bg = despesa.cor 
                ? alpha(despesa.cor, 0.15) 
                : (despesa.status ? "error.light" : "grey.300");
              const fg = despesa.cor 
                ? despesa.cor 
                : (despesa.status ? "error.main" : "grey.600");

              return (
                <Box key={despesa.id}>
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
                        name={despesa.icone} 
                        size={20} 
                        fallbackIcon={despesa.mensalmente ? "IconRepeat" : "IconCreditCard"} 
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
                            {despesa.nome}
                          </Typography>
                          {despesa.mensalmente && (
                            <Chip
                              label="Mensal"
                              color="error"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={despesa.status ? "Ativa" : "Inativa"}
                            color={despesa.status ? "success" : "default"}
                            size="small"
                            variant="filled"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0}>
                          <Typography variant="caption" color="text.secondary">
                            Categoria: {despesa.categoria?.nome || "N/A"}
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            {despesa.mensalmente && despesa.valorEstimado && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Valor:{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(despesa.valorEstimado)}
                              </Typography>
                            )}
                            {despesa.mensalmente && despesa.diaVencimento && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Vence dia {despesa.diaVencimento}
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
                          onClick={() => handleEdit(despesa)}
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
                          onClick={() => handleOpenDialog(despesa)}
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
                  {index < despesas.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
