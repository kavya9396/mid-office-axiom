import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  type DialogProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";
import { CloseIcon } from "../../../icons/Icons";

interface CustomDialogProps extends Omit<DialogProps, "title"> {
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;

  showCloseIcon?: boolean;
  onClose: () => void;

  contentSx?: SxProps<Theme>;
  paperSx?: SxProps<Theme>;
  backdropSx?: SxProps<Theme>;

  titleSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
}

const CustomDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  showCloseIcon = true,

  contentSx,
  paperSx,
  backdropSx,
  titleSx,
  actionsSx,

  maxWidth = "sm",
  fullWidth = true,
  ...rest
}: CustomDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            ...paperSx,
          },
        },
        backdrop: {
          sx: {
            ...backdropSx,
          },
        },
      }}
      {...rest}
    >
      {(title || showCloseIcon) && (
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            ...titleSx,
          }}
        >
          {title}

          {showCloseIcon && (
            <IconButton onClick={onClose} sx={{ color: "#9A2529" }}>
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent sx={{ ...contentSx }}>{children}</DialogContent>

      {actions && (
        <DialogActions sx={{ ...actionsSx }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
};

export default CustomDialog;
