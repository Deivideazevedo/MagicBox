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

interface DeleteConfirmationDialogProps<T> {
  open: T | null;
  onClose: () => void;
  title: string;
  icon: React.ComponentType<any>;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  loading?: boolean;
  color?: "error" | "primary" | "secondary" | "warning" | "info" | "success";
  children: React.ReactNode;
}

export default function DeleteConfirmationDialog<T>({
  open,
  onClose,
  title,
  children,
  icon: Icon,
  confirmButtonText = "Excluir",
  cancelButtonText = "Cancelar",
  onConfirm,
  loading = false,
  color = "error",
}: DeleteConfirmationDialogProps<T>) {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);

  const handleConfirm = () => {
    setVisible(false);
    onConfirm();
  };

  return (
    <Dialog
      open={Boolean(open)}
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

        {children}
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
                autoFocus
                disableFocusRipple
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 4,
                  "&:focus": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: "2px",
                    boxShadow: "none", // Remove o "círculo branco" do tema atual
                  },
                }}
              >
                {cancelButtonText}
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
              disableFocusRipple
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1,
                "&:focus": {
                  outline: `2px solid ${theme.palette[color].main}`,
                  outlineOffset: "2px",
                  boxShadow: "none", // Remove o "círculo branco" do tema atual
                },
              }}
            >
              {confirmButtonText}
            </LoadingButton>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
