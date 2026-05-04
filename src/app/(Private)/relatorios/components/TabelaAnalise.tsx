import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Chip,
  alpha,
  useTheme,
  Grid,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  InfoOutlined,
  History,
} from "@mui/icons-material";
import { 
  IconArrowDown, 
  IconArrowUp, 
  IconTarget,
  IconCategory
} from "@tabler/icons-react";
import { AVAILABLE_ICONS } from "@/app/components/forms/hooksForm/HookIconPicker";
import { CategoriaRelatorio, ItemRelatorio } from "@/core/relatorios/relatorio.dto";

interface TabelaAnaliseProps {
  categorias: CategoriaRelatorio[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA") => void;
  historicoItem: any[];
  loadingHistorico: boolean;
  itemSelecionadoParaHistorico: number | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function Row({ 
  categoria, 
  selectedIds, 
  onToggle, 
  onSelectItem,
  itemSelecionadoParaHistorico 
}: { 
  categoria: CategoriaRelatorio; 
  selectedIds: Set<number>; 
  onToggle: (id: number) => void;
  onSelectItem: (id: number, tipo: "RECEITA" | "DESPESA") => void;
  itemSelecionadoParaHistorico: number | null;
}) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  return (
    <React.Fragment>
      {/* Linha da Categoria */}
      <TableRow 
        sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          "& td": { borderBottom: "1px solid", borderColor: "divider", py: 1.5 } 
        }}
      >
        <TableCell padding="checkbox" width={50}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: categoria.cor ? alpha(categoria.cor, 0.15) : "primary.light",
                color: categoria.cor || "primary.main",
                "& svg": { width: 18, height: 18 },
              }}
            >
              {categoria.icone && AVAILABLE_ICONS[categoria.icone as keyof typeof AVAILABLE_ICONS] ? (
                AVAILABLE_ICONS[categoria.icone as keyof typeof AVAILABLE_ICONS]
              ) : (
                <IconCategory />
              )}
            </Avatar>
            <Typography variant="subtitle2" fontWeight={700}>
              {categoria.nome}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="right">
          <Typography fontWeight={600} color="textSecondary">{formatCurrency(categoria.valorPlanejado)}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography fontWeight={700}>{formatCurrency(categoria.valorRealizado)}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography 
            fontWeight={700} 
            color={categoria.deficit > 0 ? "error.main" : "success.main"}
          >
            {formatCurrency(categoria.deficit)}
          </Typography>
        </TableCell>
        <TableCell align="right">-</TableCell>
      </TableRow>
      
      {/* Itens da Categoria */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, border: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small">
                <TableBody>
                  {categoria.itens.map((item) => {
                    const isDespesa = item.tipo === "DESPESA";
                    const isMeta = item.tipo === "META";
                    
                    let chipIcon = <IconArrowUp size={14} />;
                    let chipColor: any = "success";
                    let chipLabel = "Receita";
                    
                    if (isDespesa) {
                      chipIcon = <IconArrowDown size={14} />;
                      chipColor = "error";
                      chipLabel = "Despesa";
                    } else if (isMeta) {
                      chipIcon = <IconTarget size={14} />;
                      chipColor = "info";
                      chipLabel = "Meta";
                    }

                    return (
                      <TableRow 
                        key={item.id} 
                        hover 
                        selected={itemSelecionadoParaHistorico === item.id}
                        sx={{ 
                          cursor: "pointer",
                          "& td": { borderBottom: "1px solid", borderColor: "divider" },
                          "&:last-child td": { borderBottom: 0 },
                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                          ...(selectedIds.has(item.id) && { bgcolor: alpha(theme.palette.primary.main, 0.08) })
                        }}
                        onClick={() => onSelectItem(item.id, item.tipo as any)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIds.has(item.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              onToggle(item.id);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Chip 
                              size="small" 
                              icon={chipIcon} 
                              label={chipLabel} 
                              color={chipColor} 
                              variant="outlined" 
                              sx={{ fontWeight: 600, fontSize: "0.7rem", height: 24 }} 
                            />
                            <Typography variant="body2">{item.nome}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="textSecondary">{formatCurrency(item.valorPlanejado)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>{formatCurrency(item.valorRealizado)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color={item.deficit > 0 ? "error.main" : "success.main"}>
                            {formatCurrency(item.deficit)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="textSecondary">{formatCurrency(item.mediaMensal)}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function TabelaAnalise({ 
  categorias, 
  selectedIds, 
  onToggle,
  onSelectItem,
  historicoItem,
  loadingHistorico,
  itemSelecionadoParaHistorico
}: TabelaAnaliseProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell width={50} />
                <TableCell><Typography variant="subtitle2" fontWeight={700}>Categoria / Conta</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={700}>Vlr. Est.</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={700}>Vlr. Gasto</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={700}>Déficit</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={700}>Média Mensal</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.map((cat) => (
                <Row 
                  key={cat.id} 
                  categoria={cat} 
                  selectedIds={selectedIds} 
                  onToggle={onToggle} 
                  onSelectItem={onSelectItem}
                  itemSelecionadoParaHistorico={itemSelecionadoParaHistorico}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            border: `1px solid ${theme.palette.divider}`,
            height: "100%",
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.01)
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <History color="primary" />
            <Typography variant="h6" fontWeight={700}>Resumo de Gastos Mensais</Typography>
          </Stack>

          {!itemSelecionadoParaHistorico ? (
            <Box sx={{ textAlign: "center", py: 8, opacity: 0.6 }}>
              <InfoOutlined sx={{ fontSize: 48, mb: 2 }} />
              <Typography>Selecione um item na tabela para ver o histórico</Typography>
            </Box>
          ) : loadingHistorico ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="caption" fontWeight={700}>Mês</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Ano</Typography></TableCell>
                    <TableCell align="right"><Typography variant="caption" fontWeight={700}>Total</Typography></TableCell>
                    <TableCell align="right"><Typography variant="caption" fontWeight={700}>Déficit</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historicoItem.map((h, i) => (
                    <TableRow key={i} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ color: "primary.main", fontWeight: 700 }}>{h.mes}</TableCell>
                      <TableCell>{h.ano}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(h.total)}</TableCell>
                      <TableCell align="right" sx={{ color: "error.main" }}>{formatCurrency(h.deficit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}