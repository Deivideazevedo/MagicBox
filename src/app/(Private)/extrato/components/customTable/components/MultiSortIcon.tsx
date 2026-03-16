import { Badge, Box, Tooltip } from "@mui/material";
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";

export interface MultiSortIconProps {
  sortInfo?: {
    order: "ASC" | "DESC";
    position: number;
    total: number;
  } | null;
}

/**
 * Componente para exibir ícone de ordenação com suporte a multi-sort
 * Sempre renderiza o Box para manter o espaço, mas com opacidade 0 quando inativo
 * Quando há múltiplas ordenações, exibe um badge com a posição
 */
export function MultiSortIcon({ sortInfo = null }: MultiSortIconProps) {
  const isActive = sortInfo !== null;
  const showBadge = sortInfo && sortInfo.total > 1;

  const tooltipTitle = sortInfo
    ? `${sortInfo.order === "ASC" ? "Crescente" : "Decrescente"}${showBadge ? ` (Prioridade ${sortInfo.position})` : ""}`
    : "";

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box
        component="span"
        className="sort-icon"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          ml: 1,
          p: 0.3,
          borderRadius: "50%",
          width: 24,
          height: 24,
          minWidth: 0,
          transition: "all 0.1s linear",
          color: "primary.main",
          bgcolor: "primary.light",

          // Estado padrão (inativo e sem hover)
          opacity: 0,

          // Estado ativo (sempre visível)
          ...(isActive && {
            opacity: 1,
            ":hover": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
            },
          }),
        }}
      >
        <Badge
          badgeContent={showBadge ? sortInfo.position : 0}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.625rem",
              height: 14,
              minWidth: 14,
              padding: "0 3px",
              bgcolor: (theme) => theme.palette.secondary.main,
              color: (theme) => theme.palette.primary.contrastText,
              fontWeight: 700,
              top: -2,
              right: -3,
            },
          }}
        >
          {sortInfo?.order === "DESC" ? (
            <IconArrowDown size={19} strokeWidth={2.5} />
          ) : (
            <IconArrowUp size={19} strokeWidth={2.5} />
          )}
        </Badge>
      </Box>
    </Tooltip>
  );
}
