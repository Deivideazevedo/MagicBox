import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { IconCheck, IconX } from "@tabler/icons-react";
import { User } from "next-auth";

interface StatusToggleDialogProps {
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function StatusToggleDialog({
  user,
  onClose,
  onConfirm,
  loading = false,
}: StatusToggleDialogProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);

  if (!user) return null;

  const isActivating = user.status !== "A";
  const color = isActivating ? "success" : "error";
  const Icon = isActivating ? IconCheck : IconX;
  const title = isActivating ? "Ativar Usuário?" : "Inativar Usuário?";
  const actionText = isActivating ? "Ativar" : "Inativar";

  const handleConfirm = () => {
    setVisible(false);
    onConfirm();
  };

  return (
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableRestoreFocus={true}
      keepMounted={false}
      disableEscapeKeyDown={loading}
      TransitionProps={{
        onExited: () => setVisible(true),
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
        },
      }}
    >
      <DialogContent sx={{ textAlign: "center", pb: 3 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            bgcolor: (theme) => theme.palette[color].light,
            color: `${color}.main`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <Icon size={32} stroke={1.5} />
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          {title}
        </Typography>

        <Typography variant="body1" color="textSecondary">
          Tem certeza que deseja <strong>{actionText.toLowerCase()}</strong> o usuário{" "}
          <strong>{user.name || user.username}</strong>?
          {isActivating
            ? " O usuário voltará a ter acesso ao sistema."
            : " O usuário perderá o acesso ao sistema imediatamente."}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          {visible && (
            <Grid item xs={6}>
              <Button
                onClick={onClose}
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:focus": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: "2px",
                  },
                }}
              >
                Cancelar
              </Button>
            </Grid>
          )}
          <Grid item xs={6}>
            <LoadingButton
              onClick={handleConfirm}
              color={color}
              variant="text"
              loading={!visible || loading}
              fullWidth
              size="large"
              startIcon={<Icon size={18} />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                "&:focus": {
                  outline: `2px solid ${theme.palette[color].main}`,
                  outlineOffset: "2px",
                },
              }}
            >
              Confirmar
            </LoadingButton>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
