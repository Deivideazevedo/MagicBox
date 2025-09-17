"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
} from "@mui/material";
import {
  IconTarget,
  IconTrendingUp,
  IconArrowRight,
} from "@tabler/icons-react";
import { useGoalsProgress } from "../hooks/useGoalsProgress";

const GoalsProgress = () => {
  const {
    goals,
    formatCurrency,
    calculateProgress,
    getTimeRemaining,
    overallProgress
  } = useGoalsProgress();

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "#5D87FF20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5D87FF",
              }}
            >
              <IconTarget size={20} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Metas Financeiras
            </Typography>
          </Box>
          
          <Button
            size="small"
            endIcon={<IconArrowRight size={16} />}
            sx={{
              textTransform: "none",
              color: "primary.main",
            }}
          >
            Ver todas
          </Button>
        </Box>

        <Box sx={{ space: 3 }}>
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal.current, goal.target);
            const remaining = goal.target - goal.current;
            
            return (
              <Box key={goal.id} sx={{ mb: index < goals.length - 1 ? 3 : 0 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" fontWeight={500}>
                    {goal.title}
                  </Typography>
                  <Chip
                    label={getTimeRemaining(goal.deadline)}
                    size="small"
                    sx={{
                      backgroundColor: `${goal.color}20`,
                      color: goal.color,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color={goal.color}>
                    {progress.toFixed(1)}%
                  </Typography>
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: `${goal.color}20`,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: goal.color,
                      borderRadius: 4,
                    },
                  }}
                />
                
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    Faltam {formatCurrency(remaining)} para atingir a meta
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
            <IconTrendingUp size={20} />
            <Typography variant="body2" fontWeight={600}>
              Progresso Geral
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {overallProgress.toFixed(1)}%
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            das suas metas concluídas
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoalsProgress;