import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconDeviceFloppy,
  IconExclamationCircle,
  IconInfoCircle,
  IconPlus,
  IconSquarePlus,
  IconTrash,
} from "@tabler/icons-react";

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  color?: "error" | "primary" | "warning" | "info" | "success";
  icon?: React.ComponentType<any>;
  onConfirm?: () => Promise<void> | void;
  children?: ReactNode;
}

type ResolveFn = (value: boolean) => void;

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const resolverRef = useRef<ResolveFn | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    setLoading(false);
    setVisible(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = async () => {
    if (options?.onConfirm) {
      setVisible(false);
      setLoading(true);
      try {
        await options.onConfirm();
        setOpen(false);
        resolverRef.current?.(true);
      } catch (error) {
        setLoading(false);
        setVisible(true);
      } finally {
        resolverRef.current = null;
      }
    } else {
      setVisible(false);
      setLoading(true);
      resolverRef.current?.(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setOpen(false);
    resolverRef.current?.(false);
    resolverRef.current = null;
    setLoading(false);
    setVisible(true);
  };

  const handleClose = () => {
    if (!loading) {
      handleCancel();
    }
  };

  const color = options?.color || "primary";
  const IconComponent = options?.icon || IconAlertTriangle;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        disableRestoreFocus
        disableEscapeKeyDown={loading}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 4,
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", pb: 2, pt: 4 }}>
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <IconComponent size={38} stroke={1.5} />
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
            {options?.title}
          </Typography>

          {options?.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: options.children ? 2 : 0, lineHeight: 1.6 }}
            >
              {options.description}
            </Typography>
          )}

          {options?.children}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Grid container spacing={1.5}>
            {visible && (
              <Grid item xs={12} sm={6}>
                <Button
                  onClick={handleCancel}
                  variant="outlined"
                  fullWidth
                  size="large"
                  autoFocus
                  disableFocusRipple
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:focus": {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: "2px",
                      boxShadow: "none",
                    },
                  }}
                >
                  {options?.cancelText || "Cancelar"}
                </Button>
              </Grid>
            )}
            <Grid item xs={12} sm={visible ? 6 : 12}>
              <LoadingButton
                onClick={handleConfirm}
                color={color}
                variant="text"
                loading={!visible || loading}
                fullWidth
                size="large"
                startIcon={visible ? <IconComponent size={18} /> : undefined}
                disableFocusRipple
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  boxShadow: "none",
                  bgcolor: alpha(theme.palette[color].main, 0.1),
                  color: `${color}.main`,
                  "&:hover": {
                    bgcolor: alpha(theme.palette[color].main, 0.95),
                    boxShadow: "none",
                    color: theme.palette.common.white,
                  },
                  "&:focus": {
                    outline: `2px solid ${theme.palette[color].main}`,
                    outlineOffset: "2px",
                    boxShadow: "none",
                  },
                }}
              >
                {options?.confirmText || "Confirmar"}
              </LoadingButton>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx)
    throw new Error("useConfirm must be used within ConfirmDialogProvider");

  return {
    show: ctx.confirm,

    delete: (opts: Partial<ConfirmOptions>) => {
      const { children, ...rest } = opts;
      return ctx.confirm({
        title: "Excluir Registro?",
        color: "error",
        icon: IconTrash,
        confirmText: "Excluir",
        ...rest,
        children: (
          <Box sx={{ mt: 2 }}>
            {children ? (
              children
            ) : (
              <Typography variant="body2" color="text.secondary">
                Essa ação não poderá ser desfeita.
              </Typography>
            )}
          </Box>
        ),
      } as ConfirmOptions);
    },

    create: (opts: Partial<ConfirmOptions>) =>
      ctx.confirm({
        title: "Confirmar Cadastro",
        color: "success",
        icon: IconSquarePlus,
        confirmText: "Cadastrar",
        ...opts,
      } as ConfirmOptions),

    update: (opts: Partial<ConfirmOptions>) =>
      ctx.confirm({
        title: "Salvar Alterações",
        color: "primary",
        icon: IconDeviceFloppy,
        confirmText: "Salvar",
        ...opts,
      } as ConfirmOptions),
  };
}
