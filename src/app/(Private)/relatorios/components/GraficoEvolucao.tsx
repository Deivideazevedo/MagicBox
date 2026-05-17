import React, { useMemo, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { EvolucaoMensalItem } from "@/core/relatorios/relatorio.dto";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface GraficoEvolucaoProps {
  evolucao: EvolucaoMensalItem[];
  incluirProjecao: boolean;
  isLoading?: boolean;
  dataInicio: string;
  dataFim: string;
  onMesClick?: (dataInicio: string, dataFim: string) => void;
}

export default function GraficoEvolucao({
  evolucao,
  incluirProjecao,
  isLoading,
  dataInicio,
  dataFim,
  onMesClick,
}: GraficoEvolucaoProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Seletor de semestre: inicializa com o semestre do mês atual
  const [semestre, setSemestre] = useState<1 | 2>(() => {
    const mesAtual = new Date().getMonth(); // 0-11
    return mesAtual < 6 ? 1 : 2;
  });

  const [mesSelecionado, setMesSelecionado] =
    useState<EvolucaoMensalItem | null>(null);

  const formatPeriodo = useCallback((dataIso: string) => {
    try {
      const [year, month] = dataIso.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      const mesExtenso = date.toLocaleString("pt-BR", { month: "short" });
      const mesFormatado =
        mesExtenso.charAt(0).toUpperCase() +
        mesExtenso.slice(1).replace(".", "");
      return `${mesFormatado} de ${year}`;
    } catch (e) {
      return "";
    }
  }, []);

  const [mesClicado, setMesClicado] = useState<EvolucaoMensalItem | null>(null);

  const periodoFormatado = useMemo(() => {
    if (mesSelecionado?.dataReferencia) {
      return formatPeriodo(mesSelecionado.dataReferencia);
    }
    return formatPeriodo(dataInicio);
  }, [dataInicio, mesSelecionado, formatPeriodo]);

  const isSingleMonth = useMemo(() => {
    if (!dataInicio || !dataFim) return false;
    try {
      const [yStart, mStart, dStart] = dataInicio.split("-").map(Number);
      const [yEnd, mEnd, dEnd] = dataFim.split("-").map(Number);
      
      if (yStart !== yEnd || mStart !== mEnd) return false;
      if (dStart !== 1) return false;
      
      const lastDay = new Date(yStart, mStart, 0).getDate();
      return dEnd === lastDay;
    } catch (e) {
      return false;
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    if (isSingleMonth && dataInicio && evolucao && evolucao.length > 0) {
      // Tenta encontrar o mês correspondente em evolucao
      const [yStart, mStart] = dataInicio.split("-").map(Number);
      const targetRef = `${yStart}-${String(mStart).padStart(2, "0")}`;

      const mesEncontrado = evolucao.find(
        (e) => e.dataReferencia && e.dataReferencia.startsWith(targetRef)
      );
      if (mesEncontrado) {
        setMesSelecionado(mesEncontrado);
        setMesClicado(mesEncontrado);
        return;
      }
    }

    // Se não for um único mês válido ou não encontrar, aí sim reseta
    setMesSelecionado(null);
    setMesClicado(null);
  }, [dataInicio, dataFim, evolucao, isSingleMonth]);

  // Filtra os 6 meses do semestre selecionado
  const dadosSemestre = useMemo(() => {
    if (!evolucao || evolucao.length === 0) return [];
    const inicio = semestre === 1 ? 0 : 6;
    return evolucao.slice(inicio, inicio + 6);
  }, [evolucao, semestre]);

  // Escolhe todos os meses se for desktop, ou particiona se for mobile
  const dadosExibidos = useMemo(() => {
    return isMobile ? dadosSemestre : evolucao;
  }, [isMobile, dadosSemestre, evolucao]);

  if (isLoading) {
    return (
      <Card
        elevation={0}
        sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}
      >
        <CardContent>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton
            variant="rounded"
            width="100%"
            height={350}
            sx={{ mt: 2, borderRadius: 2 }}
          />
        </CardContent>
      </Card>
    );
  }

  // Cores do gráfico — ordem: Receita, RecPrevista, Despesa, DesPrevista, Metas
  const coresSemProjecao = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];
  const coresComProjecao = [
    theme.palette.success.main,
    alpha(theme.palette.success.main, 0.45),
    theme.palette.error.main,
    alpha(theme.palette.error.main, 0.45),
    theme.palette.info.main,
  ];

  const activeColors = incluirProjecao ? coresComProjecao : coresSemProjecao;

  const categories = dadosExibidos.map((e) => e.mes);

  const options: ApexCharts.ApexOptions = {
    chart: {
      id: "evolucao-financeira-relatorios",
      type: "bar",
      height: 250,
      fontFamily: "inherit",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      selection: {
        enabled: false,
      },
      animations: {
        enabled: false,
      },
      events: {
        click: (event, chartContext, config) => {
          const dataIndex = config?.dataPointIndex;
          if (
            dataIndex !== undefined &&
            dataIndex !== -1 &&
            dadosExibidos[dataIndex]
          ) {
            const mes = dadosExibidos[dataIndex];
            setMesSelecionado(mes);
            setMesClicado(mes);

            if (onMesClick && mes.dataReferencia) {
              const [year, month] = mes.dataReferencia.split("-").map(Number);
              const dataInicio = `${year}-${String(month).padStart(2, "0")}-01`;
              const dataFimDate = new Date(year, month, 0);
              const dataFim = `${year}-${String(month).padStart(2, "0")}-${String(
                dataFimDate.getDate(),
              ).padStart(2, "0")}`;

              onMesClick(dataInicio, dataFim);
            }
          }
        },
        dataPointMouseEnter: (event, chartContext, config) => {
          const dataIndex = config?.dataPointIndex;
          if (
            dataIndex !== undefined &&
            dataIndex !== -1 &&
            dadosExibidos[dataIndex]
          ) {
            setMesSelecionado(dadosExibidos[dataIndex]);
          }
        },
      },
    },
    markers: {
      size: 0,
      strokeWidth: 0,
      colors: ["transparent"],
      hover: { size: 0 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: incluirProjecao ? "85%" : "55%",
        borderRadius: 3,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    colors: activeColors,
    states: {
      active: {
        filter: {
          type: "none",
        },
      },
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    xaxis: {
      type: "category",
      categories,
      tickPlacement: "between",
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        hideOverlappingLabels: false,
        trim: false,
        style: {
          colors: theme.palette.text.secondary,
          fontSize: "11px",
          fontWeight: 500,
        },
      },
      crosshairs: {
        show: true,
        width: "tickWidth",
        position: "back",
        opacity: 1,
        stroke: {
          width: 0,
        },
        fill: {
          type: "solid",
          color: alpha(theme.palette.primary.main, 0.1),
        },
      },
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: true,
      custom: () => "",
      marker: {
        show: false,
      },
    },
    legend: {
      show: false, // Legenda customizada abaixo
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      padding: {
        left: 20,
        right: 20,
        top: 0,
        bottom: 0,
      },
    },
  };

  const seriesSemProjecao: ApexCharts.ApexOptions["series"] = [
    { name: "Receita", data: dadosExibidos.map((e) => Math.abs(e.receitas)) },
    { name: "Despesa", data: dadosExibidos.map((e) => Math.abs(e.despesas)) },
    { name: "Metas", data: dadosExibidos.map((e) => Math.abs(e.metas)) },
  ];

  const seriesComProjecao: ApexCharts.ApexOptions["series"] = [
    { name: "Receita", data: dadosExibidos.map((e) => Math.abs(e.receitas)) },
    {
      name: "Receita Prevista",
      data: dadosExibidos.map((e) => Math.abs(e.receitasPrevistas)),
    },
    { name: "Despesa", data: dadosExibidos.map((e) => Math.abs(e.despesas)) },
    {
      name: "Despesa Prevista",
      data: dadosExibidos.map((e) => Math.abs(e.despesasPrevistas)),
    },
    { name: "Metas", data: dadosExibidos.map((e) => Math.abs(e.metas)) },
  ];

  const series = incluirProjecao ? seriesComProjecao : seriesSemProjecao;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const renderLegendItem = (item: {
    label: string;
    color: string;
    valor?: number;
  }) => (
    <Box
      key={item.label}
      sx={{ display: "flex", alignItems: "center", gap: 1 }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "3px",
          bgcolor: item.color,
          flexShrink: 0,
        }}
      />
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ whiteSpace: "nowrap" }}
        >
          {item.label}
        </Typography>
        {item.valor !== undefined && (
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.primary"
            sx={{ fontSize: "0.7rem" }}
          >
            {formatCurrency(item.valor)}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Card
      elevation={0}
      onMouseLeave={() => setMesSelecionado(mesClicado)}
      sx={{
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        "& .apexcharts-legend-marker svg": {
          borderRadius: "6px !important",
        },
        "& .apexcharts-canvas, & .apexcharts-canvas svg": {
          cursor: "pointer !important",
        },
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 1 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, pt: 2 }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Evolução Financeira
            </Typography>
            {isSingleMonth && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Referente a {periodoFormatado}
              </Typography>
            )}
          </Box>
          <ToggleButtonGroup
            value={semestre}
            exclusive
            onChange={(_, val) => {
              if (val !== null) {
                setSemestre(val as 1 | 2);
                setMesSelecionado(null);
                setMesClicado(null);
              }
            }}
            size="small"
            sx={{
              display: { xs: "flex", md: "none" }, // Só aparece no mobile/tablet, oculto no desktop
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "none",
                borderColor: alpha(theme.palette.primary.main, 0.2),
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
              },
            }}
          >
            <ToggleButton value={1}>1º Sem</ToggleButton>
            <ToggleButton value={2}>2º Sem</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ height: 250 }}>
          {dadosExibidos.length > 0 ? (
            <Chart options={options} series={series} type="bar" height="100%" />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography color="text.secondary">
                Sem dados de evolução para o período
              </Typography>
            </Box>
          )}
        </Box>

        {/* Legenda Customizada - 3 Caixas Distribuídas */}
        <Box
          sx={{
            mt: 3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignItems: "flex-start",
            gap: 2,
            px: 2,
          }}
        >
          {/* Caixa Receitas */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {renderLegendItem({
              label: "Receita Realizada",
              color: theme.palette.success.main,
              valor: mesSelecionado
                ? Math.abs(mesSelecionado.receitas)
                : undefined,
            })}
            {incluirProjecao &&
              renderLegendItem({
                label: "Receita Prevista",
                color: alpha(theme.palette.success.main, 0.45),
                valor: mesSelecionado
                  ? Math.abs(mesSelecionado.receitasPrevistas)
                  : undefined,
              })}
          </Box>

          {/* Caixa Despesas */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {renderLegendItem({
              label: "Despesa Realizada",
              color: theme.palette.error.main,
              valor: mesSelecionado
                ? Math.abs(mesSelecionado.despesas)
                : undefined,
            })}
            {incluirProjecao &&
              renderLegendItem({
                label: "Despesa Prevista",
                color: alpha(theme.palette.error.main, 0.45),
                valor: mesSelecionado
                  ? Math.abs(mesSelecionado.despesasPrevistas)
                  : undefined,
              })}
          </Box>

          {/* Caixa Metas */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {renderLegendItem({
              label: "Metas",
              color: theme.palette.info.main,
              valor: mesSelecionado
                ? Math.abs(mesSelecionado.metas)
                : undefined,
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
