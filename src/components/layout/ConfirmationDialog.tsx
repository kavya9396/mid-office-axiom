import { Typography } from "@mui/material";
import CustomDialog from "../ui/Dialog/Dialog";
import { modalTitleStyles } from "../../utils/styles";
import CustomButton from "../ui/Button/Button";

type ConfirmationDialogProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
};

const ConfirmationDialog = ({
  open,
  message,
  onClose,
  onConfirm,
}: ConfirmationDialogProps) => {
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={
        <Typography sx={modalTitleStyles}>
          Confirmation
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
          Yes
        </CustomButton>
      }
    >
      <Typography sx={{ fontSize: "14px", color: "#161616" }}>
        {message}
      </Typography>
    </CustomDialog>
  );
};

export default ConfirmationDialog;