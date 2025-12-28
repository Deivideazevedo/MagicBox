import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  itemName: string;
  icon: React.ComponentType<any>;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  loading?: boolean;
  color?: "error" | "primary" | "secondary" | "warning" | "info" | "success";
  children: React.ReactNode;
}

export default function DeleteConfirmationDialog({
  open,
  onClose,
  title,
  children,
  itemName,
  icon: Icon,
  confirmButtonText = "Excluir",
  cancelButtonText = "Cancelar",
  onConfirm,
  loading = false,
  color = "error",
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
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
          {open && !loading && (
            <Grid item xs={6}>
              <Button
                onClick={onClose}
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 4,
                }}
              >
                {cancelButtonText}
              </Button>
            </Grid>
          )}
          <Grid item xs={6}>
            <LoadingButton
              onClick={onConfirm}
              color={color}
              variant="text"
              loading={loading}
              fullWidth
              size="large"
              startIcon={<Icon size={18} />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1,
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