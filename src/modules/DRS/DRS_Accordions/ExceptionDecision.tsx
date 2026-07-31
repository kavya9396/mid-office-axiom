import { Box, Container, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { referToItThunk } from "../../../store/thunks/referToItThunk";
import { normalizeDecisionOptions, toMasterLabel } from "../../../utils/masterOptions";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";

const ExceptionDecision = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { applicationNumber, businessType } = useAppContext();
  const masters = useAppSelector((state) => state.drs.masters);
  const drsData = useAppSelector((state) => state.drs.data as unknown as Record<string, unknown> | null);

  const [decision, setDecision] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const roleType = localStorage.getItem("roleType") ?? "";
  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const decisionOptions = useMemo(() => normalizeDecisionOptions(masters, "exceptionDecision"), [masters]);

  const isSubmitEnabled = decision.trim().length > 0;

  const handleSubmitIntent = () => {
    const selectedDecision = toMasterLabel(decision, decisionOptions);
    const requirementValidation = validateRequirementDecision(drsData, selectedDecision);
    if (!requirementValidation.isValid) {
      setSubmitMessage(requirementValidation.message);
      return;
    }

    setSubmitMessage(null);
    setOpenConfirmation(true);
  };

  const handleSubmit = async () => {
    if (!applicationNumber || !roleType || !decision) {
      setSubmitMessage("Missing required case information.");
      return;
    }

    const selectedDecision = toMasterLabel(decision, decisionOptions);

    if (selectedDecision === "Refer to IT") {
      try {
        setSubmitLoading(true);
        setSubmitMessage(null);

        const response = await dispatch(
          referToItThunk({
            applicationId: applicationNumber,
            roleType,
            decision,
          }),
        ).unwrap();

        const message = response.message || "Case has been referred to IT successfully.";
        setSubmitMessage(message);

        navigate(getInboxPath(safeBusinessType), {
          state: {
            snackbarMessage: message,
          },
        });
      } catch (error) {
        setSubmitMessage(error instanceof Error ? error.message : "Failed to refer to IT.");
      } finally {
        setSubmitLoading(false);
      }

      return;
    }

    navigate(getInboxPath(safeBusinessType), {
      state: {
        snackbarMessage: "Case sent back to last UW successfully.",
      },
    });
  };

  return (
    <Container disableGutters>
      <Box sx={{ mt: 1 }}>
        <CustomAccordion title="UW Decision" defaultExpanded>
          <Box
            sx={{
              mt: 0.75,
              p: 1.25,
              borderRadius: "6px",
              backgroundColor: "#F6F6F6",
            }}
          >
            <Box sx={{ maxWidth: 520 }}>
              <CustomSelect
                label="Exception PoolDecision"
                value={decision}
                onChange={(value: string) => {
                  setDecision(value);
                  setSubmitMessage(null);
                }}
                options={decisionOptions}
                placeholder="Select"
              />
            </Box>

            {submitMessage && (
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 12,
                  color: submitMessage.toLowerCase().includes("success") ? "#0F8A3D" : "#DE2C3B",
                }}
              >
                {submitMessage}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", mt: 1 }}>
            <CustomButton
              variant="contained"
              disabled={!isSubmitEnabled || submitLoading}
              onClick={handleSubmitIntent}
              sx={{ minWidth: 130, height: 36, borderRadius: "999px" }}
            >
              {submitLoading ? "Submitting..." : "Submit"}
            </CustomButton>
          </Box>
        </CustomAccordion>

        <ConfirmationDialog
          open={openConfirmation}
          message="Do you want to submit the case?"
          onClose={() => setOpenConfirmation(false)}
          onConfirm={() => {
            void handleSubmit();
          }}
        />
      </Box>
    </Container>
  );
};

export default ExceptionDecision;
