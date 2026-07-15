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
import { normalizeMasterOptions, toMasterLabel } from "../../../utils/masterOptions";

const ExceptionDecision = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { applicationNumber, businessType } = useAppContext();
  const masters = useAppSelector((state) => state.drs.masters);

  const [decision, setDecision] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const roleType = localStorage.getItem("roleType") ?? "";
  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const decisionOptions = useMemo(
    () => normalizeMasterOptions(masters.exceptionDecision),
    [masters.exceptionDecision],
  );

  const isSubmitEnabled = decision.trim().length > 0;

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
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="UW Decision" defaultExpanded>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: "8px",
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
                  mt: 1,
                  fontSize: 13,
                  color: submitMessage.toLowerCase().includes("success") ? "#0F8A3D" : "#DE2C3B",
                }}
              >
                {submitMessage}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", mt: 2 }}>
            <CustomButton
              variant="contained"
              disabled={!isSubmitEnabled || submitLoading}
              onClick={() => setOpenConfirmation(true)}
              sx={{ minWidth: 140, borderRadius: "999px" }}
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
