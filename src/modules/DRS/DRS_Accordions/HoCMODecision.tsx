import { Box, Container, FormControlLabel, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";

type DecisionOption = {
  label: string;
  value: string;
};

const hoCmoDecisionOptions: DecisionOption[] = [
  { label: "Approve", value: "Approve" },
  { label: "Reject", value: "Reject" },
  { label: "Refer Back", value: "Refer Back" },
  { label: "Refer to Risk", value: "Refer to Risk" },
];

const HoCMODecision = () => {
  const navigate = useNavigate();
  const { businessType } = useAppContext();

  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");
  const [doNotPayToTpa, setDoNotPayToTpa] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const dialogMessage = `Kindly reconfirm if you want to proceed with the HO CMO decision as "${decision}"`;

  const isSubmitDisabled = !decision || remarks.trim() === "";

  return (
    <Container disableGutters>
      <Box sx={{ mt: 1 }}>
        <CustomAccordion title="HO CMO Decision" defaultExpanded>
          <Box
            sx={{
              mt: 0.75,
              p: 1.25,
              borderRadius: "6px",
              backgroundColor: "#f6f6f6",
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#444",
                  mb: 0.5,
                }}
              >
                HO CMO Remarks
              </Typography>
              <CustomTextField
                fullWidth
                multiline
                minRows={2}
                placeholder="Enter remarks..."
                value={remarks}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.length <= 10000) {
                    setRemarks(value);
                  }
                }}
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                }}
              />
              <Typography
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: "11px",
                  color: "#888",
                  mt: 0.25,
                }}
              >
                {remarks.length}/10000
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 1,
              }}
            >
              <CustomSelect
                label="HO CMO Decision"
                value={decision}
                onChange={setDecision}
                options={hoCmoDecisionOptions}
              />
            </Box>

            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    checked={doNotPayToTpa}
                    onChange={(e) => setDoNotPayToTpa(e.target.checked)}
                    style={{
                      width: 16,
                      height: 16,
                      cursor: "pointer",
                    }}
                  />
                }
                label="Do Not Pay To TPA"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#4A4A4A",
                  },
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 1,
            }}
          >
            <CustomButton
              variant="contained"
              disabled={isSubmitDisabled}
              onClick={() => setIsConfirmOpen(true)}
              sx={{
                minWidth: 150,
                height: 36,
                borderRadius: "50px",
                fontWeight: 600,
                px: 2.5,
                whiteSpace: "nowrap",
              }}
            >
              Submit
            </CustomButton>
          </Box>
        </CustomAccordion>

        <ConfirmationDialog
          open={isConfirmOpen}
          message={dialogMessage}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => navigate(getInboxPath(safeBusinessType))}
        />
      </Box>
    </Container>
  );
};

export default HoCMODecision;
