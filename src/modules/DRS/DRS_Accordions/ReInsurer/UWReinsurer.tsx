import { Box, Divider, TextField, Typography } from "@mui/material";
import ReinsurerMatrix from "./ReinsurerMatrix";
import { centerFlex, fieldStyles, labelStyles, modalTitleStyles } from "../../../../utils/styles";
import { PlusIcon } from "../../../../icons/Icons";
import { useMemo, useState } from "react";
import CustomSelect from "../../../../components/ui/Select/Select";
import CustomButton from "../../../../components/ui/Button/Button";
import CustomDialog from "../../../../components/ui/Dialog/Dialog";
import { ReinsurerOptions } from "../../../../utils/constant";

const reinsurerFields = [
  {
    label: "Reinsurer 1",
    value: "Swiss Re",
    type: "text",
    disabled: true,
  },
  {
    label: "Reinsurer 2",
    value: "Munich Re",
    type: "text",
    disabled: true,
  },
  {
    label: "Reinsurer 3",
    value: "SCOR Re",
    type: "text",
    disabled: true,
  },
  {
    label: "Reinsurer 4",
    type: "select",
  },
];

export const UWReinsurerFields = () => {
  const [reInsurer4, setReInsurer4] = useState("");

   const filteredReinsurerOptions = useMemo(() => {
    const existingReinsurers = reinsurerFields
      .filter(
        (field): field is typeof field & { value: string } =>
          field.type === "text" && !!field.value
      )
      .map((field) => field.value);

    return ReinsurerOptions.filter(
      (option) => !existingReinsurers.includes(option.value)
    );
  }, []);

  const renderReinsurerFields = () => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 2,
      }}
    >
      {reinsurerFields.map((field) => {
        if (field.type === "select") {
          return (
            <CustomSelect
              key={field.label}
              label={field.label}
              value={reInsurer4}
              onChange={setReInsurer4}
              options={filteredReinsurerOptions}
            />
          );
        }

        return (
          <Box key={field.label}>
            <Typography sx={labelStyles}>
              {field.label}
            </Typography>

            <TextField
              fullWidth
              value={field.value}
              disabled={field.disabled}
              size="small"
              sx={fieldStyles}
            />
          </Box>
        );
      })}
    </Box>
  );

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            color: "#444",
            mb: 1,
          }}
        >
          Select Reinsurers
        </Typography>
         {renderReinsurerFields()}
      </Box>
    </>
  )
}

type Props = {
  onOpenConfirmation: () => void;
};

const UWReinsurer = ({ onOpenConfirmation }: Props) => {
  const [openEmail, setOpenEmail] = useState(false);

  return (
    <Box sx={{ mt: 2 }}>
      <ReinsurerMatrix />
      <Box
        sx={{
          ...centerFlex,
          backgroundColor: "#F0F0F0",
          height: "56px",
          borderRadius: "16px",
        }}
      >
        <Box
          sx={{
            p: 0.5,
            px: 1,
            mr: 1,
            backgroundColor: "#E3E3E3",
            borderRadius: "50%",
            cursor: "not-allowed",
          }}
        >
          <Box sx={{ mt: 0.5 }}>
            <PlusIcon />
          </Box>
        </Box>

        <Typography sx={{ color: "#6C6C6C", cursor: "not-allowed" }}>
          upload and assign referral sheet
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Add remarks..."
          // onChange={(e) => setUwDecisionRemarks(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: "#fff",
            borderRadius: "10px",
          }}
        />
      </Box>

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <>
          <CustomButton
            variant="outlined"
            onClick={onOpenConfirmation}
            sx={{
              borderRadius: "50px",
              px: 8,
              py: 1,
            }}
          >
            Generate Referral Sheet
          </CustomButton>

          <CustomButton
            variant="contained"
            onClick={() => setOpenEmail(true)}
            sx={{
              borderRadius: "50px",
              px: 8,
              py: 1,
            }}
          >
            Email to Reinsurers
          </CustomButton>
        </>
      </Box>

      <CustomDialog
        open={openEmail}
        onClose={() => setOpenEmail(false)}
        maxWidth="md"
        title={
          <Typography
            sx={{
              ...modalTitleStyles
            }}
          >
            Email Preview
          </Typography>
        }
        actionsSx={{ justifyContent: "center", pb: 2 }}
      >
        {
          <Box
            sx={{
              ...centerFlex,
              backgroundColor: "#D9D9D9",
              height: "800px",
            }}
          >
            <Typography
              sx={{
                fontSize: "32px",
                color: "#9D9D9D",
                textTransform: "uppercase",
              }}
            >
              Email Viewer
            </Typography>
          </Box>
        }
      </CustomDialog>
    </Box>
  );
};

export default UWReinsurer;
