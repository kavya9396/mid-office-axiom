import { Typography } from "@mui/material";
import CustomDialog from "../ui/Dialog/Dialog";
import CustomButton from "../ui/Button/Button";
import CustomSelect from "../ui/Select/Select";
import { modalTitleStyles } from "../../utils/styles";
import { useState } from "react";
import { breakDurationOptions, reasonOptions } from "../../utils/constant";

interface BreakTimeProps {
  dialogOpen: boolean;
  setDialogOpen: (value: boolean) => void;
}
const BreakTime = ({ dialogOpen,setDialogOpen }: BreakTimeProps) => {
     const [duration, setDuration] = useState<number>();
      const [reason, setReason] = useState<string>("");
    return(
        <CustomDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={
          <Typography
            sx={{
              ...modalTitleStyles
            }}
          >
            Set Break Time
          </Typography>
        }
        contentSx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
        actionsSx={{
          justifyContent: "center",
          pb: 2,
        }}
        actions={
          <CustomButton
            onClick={() => setDialogOpen(false)}
            sx={{ borderRadius: "50px", paddingX: "40px" }}
          >
            Confirm
          </CustomButton>
        }
      >
        <CustomSelect
          label="Break Duration"
          value={duration ? String(duration) : ""}
          onChange={(value) => setDuration(Number(value))}
          options={breakDurationOptions}
          placeholder="Select"
        />
        <CustomSelect
          label="Break Reason"
          value={reason || ""}
          onChange={setReason}
          options={reasonOptions}
          placeholder="Select"
        />
      </CustomDialog>
    )
}
export default BreakTime;