import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  const hasTitle = Boolean(title);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={{
        paper: {
          sx: {
            position: "relative",
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
      {showCloseIcon && (
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 2,
            color: "#9A2529",
          }}
        >
          <CloseIcon />
        </IconButton>
      )}

      {hasTitle && (
        <DialogTitle
          sx={{
            pr: showCloseIcon ? 7 : 3,
            pb: 1,
            fontWeight: 700,
            ...titleSx,
          }}
        >
          {title}
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          pt: hasTitle ? 1 : 0.5,
          pr: showCloseIcon ? 6 : 3,
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ ...actionsSx }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
};

export default CustomDialog;
