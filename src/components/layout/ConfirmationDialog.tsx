import { Typography } from "@mui/material";
import CustomDialog from "../ui/Dialog/Dialog";
import { modalTitleStyles } from "../../utils/styles";
import CustomButton from "../ui/Button/Button";

type ConfirmationDialogProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  buttonText?: string;
};

const ConfirmationDialog = ({
  open,
  message,
  onClose,
  onConfirm,
  title = "Confirmation",
  buttonText = "Yes",
}: ConfirmationDialogProps) => {
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={
        <Typography sx={modalTitleStyles}>
          {title}
        </Typography>
      }
      actionsSx={{
        justifyContent: "center",
        pb: 2,
      }}
      actions={
        <CustomButton
          onClick={() => {
            onConfirm?.();
            onClose();
          }}
          sx={{
            borderRadius: "50px",
            px: 5,
          }}
        >
          {buttonText}
        </CustomButton>
      }
    >
      <Typography sx={{ fontSize: "12px", color: "#161616" }}>
        {message}
      </Typography>
    </CustomDialog>
  );
};

export default ConfirmationDialog;