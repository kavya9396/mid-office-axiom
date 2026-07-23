import { Alert, Box, Container, Snackbar, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppContext } from "../../../hooks/useAppContext";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { reconsiderationDecisionOptions as fallbackReconsiderationDecisionOptions } from "../../../utils/constant";
import { getCompleteTaskResult } from "./completeTaskResponse";
import { getDecisionTaskContext } from "./decisionTaskContext";
import { normalizeMasterOptions, toMasterLabel } from "../../../utils/masterOptions";
import { validateDrsFinalBre } from "../../../validations/drsBreValidation";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";

const ReconsiderationPoolDecision = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useAppSelector((state) => state.drs.data as unknown as Record<string, unknown> | null);
  const masters = useAppSelector((state) => state.drs.masters);
  const reconsiderationDecisionOptions = useMemo(() => {
    const masterOptions = normalizeMasterOptions(masters.reconsiderationDecision);
    return masterOptions.length > 0 ? masterOptions : fallbackReconsiderationDecisionOptions;
  }, [masters.reconsiderationDecision]);

  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const [remark, setRemark] = useState("");
  const [decision, setDecision] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"success" | "failure" | null>(null);

  const isSubmitDisabled = !decision || remark.trim() === "";
  const dialogMessage = `Kindly reconfirm if you want to proceed with the reconsideration pool decision as "${toMasterLabel(decision, reconsiderationDecisionOptions)}"`;
  const taskContext = getDecisionTaskContext(drsData, applicationNumber);

  const handleSubmit = async () => {
    const breValidation = validateDrsFinalBre(drsData);
    if (!breValidation.canPerformAction) {
      setSubmitMessage(breValidation.message);
      setSubmitStatus("failure");
      return;
    }

    if (!taskContext.taskId || !taskContext.userId || !taskContext.appNo || !taskContext.instanceId) {
      setSubmitMessage("Missing required case information. Please open the case from inbox again.");
      setSubmitStatus("failure");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitMessage(null);
      setSubmitStatus(null);

      const response = await dispatch(
        completeTaskThunk({
          requestContext: {
            taskId: taskContext.taskId,
            userId: taskContext.userId,
            appNo: taskContext.appNo,
            instanceId: taskContext.instanceId,
            remarks: remark.trim(),
            decision: decision.trim(),
          },
        }),
      ).unwrap();

      const { success, message } = getCompleteTaskResult(response);
      setSubmitMessage(message);
      setSubmitStatus(success ? "success" : "failure");

      if (success) {
        navigate(getInboxPath(safeBusinessType), {
          state: {
            snackbarMessage: message,
          },
        });
      }
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to complete task.");
      setSubmitStatus("failure");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitIntent = () => {
    const decisionLabel = toMasterLabel(decision, reconsiderationDecisionOptions);
    const requirementValidation = validateRequirementDecision(drsData, decisionLabel);
    if (!requirementValidation.isValid) {
      setSubmitMessage(requirementValidation.message);
      setSubmitStatus("failure");
      return;
    }

    setSubmitMessage(null);
    setSubmitStatus(null);
    setIsConfirmOpen(true);
  };

  return (
    <Container disableGutters>
      <Box sx={{ mt: 1 }}>
        <CustomAccordion title="Reconsideration Pool Decision" defaultExpanded>
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
                Remark
              </Typography>
              <CustomTextField
                fullWidth
                multiline
                minRows={2}
                placeholder="Enter remark..."
                value={remark}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.length <= 10000) {
                    setRemark(value);
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
                {remark.length}/10000
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 420px)" },
                gap: 1,
              }}
            >
              <CustomSelect
                label="Reconsideration Pool Decision"
                value={decision}
                onChange={(value) => {
                  setDecision(value);
                  setSubmitMessage(null);
                  setSubmitStatus(null);
                }}
                options={reconsiderationDecisionOptions}
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
              disabled={isSubmitDisabled || submitLoading}
              onClick={handleSubmitIntent}
              sx={{
                minWidth: 150,
                height: 36,
                borderRadius: "50px",
                fontWeight: 600,
                px: 2.5,
                whiteSpace: "nowrap",
              }}
            >
              {submitLoading ? "Submitting..." : "Submit"}
            </CustomButton>
          </Box>
        </CustomAccordion>

        <ConfirmationDialog
          open={isConfirmOpen}
          message={dialogMessage}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false);
            void handleSubmit();
          }}
        />
        <Snackbar
          open={Boolean(submitMessage) && submitStatus === "failure"}
          autoHideDuration={3000}
          onClose={() => {
            setSubmitMessage(null);
            setSubmitStatus(null);
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => {
              setSubmitMessage(null);
              setSubmitStatus(null);
            }}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {submitMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ReconsiderationPoolDecision;