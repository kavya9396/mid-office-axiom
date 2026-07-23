import { Box, Container, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";
import { normalizeMasterOptions } from "../../../utils/masterOptions";

type DecisionOption = {
  label: string;
  value: string;
};

const fallbackReinsurerDecisionOptions: DecisionOption[] = [
  { label: "Accept", value: "Accept" },
  { label: "Reject", value: "Reject" },
  { label: "Counter Offer", value: "Counter Offer" },
  { label: "Refer Back", value: "Refer Back" },
];

const fallbackReinsurerDecisionIdOptions: DecisionOption[] = [
  { label: "RES001", value: "RES001" },
  { label: "RES002", value: "RES002" },
  { label: "RES003", value: "RES003" },
  { label: "RES004", value: "RES004" },
  { label: "RES005", value: "RES005" },
];

const ReinsureDecision = () => {
  const navigate = useNavigate();
  const { businessType } = useAppContext();

  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const [decision, setDecision] = useState("");
  const [decisionId, setDecisionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const drsData = useSelector((state: RootState) => state.drs.data as unknown as Record<string, unknown> | null);
  const masters = useSelector((state: RootState) => state.drs.masters);

  const reinsurerDecisionOptions = useMemo(() => {
    const masterOptions = normalizeMasterOptions(masters.reinsurerDecision);
    return masterOptions.length > 0 ? masterOptions : fallbackReinsurerDecisionOptions;
  }, [masters.reinsurerDecision]);

  const reinsurerDecisionIdOptions = useMemo(() => {
    const masterOptions = normalizeMasterOptions(masters.reinsurerDecisionId);
    return masterOptions.length > 0 ? masterOptions : fallbackReinsurerDecisionIdOptions;
  }, [masters.reinsurerDecisionId]);

  const dialogMessage = `Kindly reconfirm if you want to proceed with the reinsurer decision as "${decision}"`;

  const isSubmitDisabled = !decision || !decisionId || remarks.trim() === "";

  const handleSubmitIntent = () => {
    const requirementValidation = validateRequirementDecision(drsData, decision);
    if (!requirementValidation.isValid) {
      setSubmitMessage(requirementValidation.message);
      return;
    }

    setSubmitMessage(null);
    setIsConfirmOpen(true);
  };

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Reinsurer Decision" defaultExpanded>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: "12px",
              backgroundColor: "#f6f6f6",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#444",
                  mb: 1,
                }}
              >
                Reinsurer Remarks
              </Typography>
              <CustomTextField
                fullWidth
                multiline
                minRows={3}
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
                  borderRadius: "10px",
                }}
              />
              <Typography
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: "12px",
                  color: "#888",
                  mt: 0.5,
                }}
              >
                {remarks.length}/10000
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 2,
              }}
            >
              <CustomSelect
                label="Reinsurer Decision"
                value={decision}
                onChange={setDecision}
                options={reinsurerDecisionOptions}
              />

              <CustomSelect
                label="Reinsurer Decision ID No."
                value={decisionId}
                onChange={setDecisionId}
                options={reinsurerDecisionIdOptions}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
            }}
          >
            <CustomButton
              variant="contained"
              disabled={isSubmitDisabled}
              onClick={handleSubmitIntent}
              sx={{
                minWidth: 200,
                height: 44,
                borderRadius: "50px",
                fontWeight: 600,
                px: 3,
                whiteSpace: "nowrap",
              }}
            >
              Submit
            </CustomButton>
          </Box>
          {submitMessage && (
            <Typography sx={{ mt: 1, fontSize: 12, color: "#DE2C3B" }}>
              {submitMessage}
            </Typography>
          )}
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

export default ReinsureDecision;
