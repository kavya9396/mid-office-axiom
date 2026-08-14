import { Alert, Box, Container, Snackbar, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";
import { getCompleteTaskResult } from "./completeTaskResponse";
import { getDecisionTaskContext } from "./decisionTaskContext";
import { validateDrsFinalBre } from "../../../validations/drsBreValidation";
import {
  getRequirementRows,
  validateRequirementDecision,
} from "../../../validations/drsRequirementDecisionValidation";

const PIVVDecision = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { applicationNumber, businessType } = useAppContext();
  const drsData = useAppSelector((state) => state.drs.data as unknown as Record<string, unknown> | null);
  const masters = useAppSelector((state) => state.drs.masters);
  const pivvDecisionOptions = useMemo(() => {
    const misc = (masters as Record<string, unknown> | undefined)?.misc;

    const toMasterList = (options?: unknown): unknown[] => {
      if (Array.isArray(options)) return options;

      if (!options || typeof options !== "object") {
        return [];
      }

      const record = options as Record<string, unknown>;

      if (Array.isArray(record.data)) return record.data;
      if (Array.isArray(record.options)) return record.options;
      if (Array.isArray(record.values)) return record.values;

      return Object.values(record).flatMap((value) =>
        Array.isArray(value) ? value : [],
      );
    };

    const rawList = toMasterList(misc) as Array<Record<string, unknown>>;

    return rawList
      .filter(
        (option) =>
          String(option?.type ?? "").trim().toUpperCase() === "PIVV",
      )
      .map((option) => {
        const code = String(
          option.code ?? option.key ?? option.value ?? "",
        ).trim();

        const description = String(
          option.description ?? option.label ?? "",
        ).trim();

        const disabled = Boolean(
          option.disabled ??
          (String(option.isActive ?? "").trim().toUpperCase() === "N"),
        );

        if (!code || !description) return null;

        return {
          label: description,
          value: code,
          code,
          description,
          type: String(option.type ?? "").trim(),
          disabled,
        };
      })
      .filter(Boolean) as Array<{
        label: string;
        value: string;
        code: string;
        description: string;
        type: string;
        disabled?: boolean;
      }>;
  }, [masters]);

  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "error",
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const taskContext = useMemo(
    () => getDecisionTaskContext(drsData, applicationNumber),
    [applicationNumber, drsData],
  );

  const isSubmitEnabled = decision.trim().length > 0 && remarks.trim().length > 0;

  const handleSubmit = async () => {
    console.log("Decision selected", decision.trim())
    const breValidation = validateDrsFinalBre(drsData);
    if (!breValidation.canPerformAction) {
      showSnackbar(breValidation.message, "error");
      return;
    }

    try {
      setSubmitLoading(true);
      setSnackbarOpen(false);

      const response = await dispatch(
        completeTaskThunk({
          requestContext: {
            appNo: taskContext.appNo,
            userId: taskContext.userId,
            taskId: taskContext.taskId,
            instanceId: taskContext.instanceId,
            decision: decision.trim(),
            remarks: remarks.trim(),
          },
        }),
      ).unwrap();

      const { success, message } = getCompleteTaskResult(response);
      if (!success) {
        showSnackbar(message, "error");
        return;
      }

      navigate(getInboxPath(safeBusinessType), {
        state: {
          snackbarMessage: message,
        },
      });
    } catch (error) {
      showSnackbar(
        error instanceof Error
          ? error.message
          : "Failed to submit PIVV decision.",
        "error",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitIntent = () => {
    const breValidation = validateDrsFinalBre(drsData);
    if (!breValidation.canPerformAction) {
      showSnackbar(breValidation.message, "error");
      return;
    }
    const tableRequirementRows = getRequirementRows(drsData);
    const requirementValidation = validateRequirementDecision(
      drsData,
      decision,
      tableRequirementRows,
    );
    if (!requirementValidation.isValid) {
      showSnackbar(requirementValidation.message, "error");
      return;
    }

    setSnackbarOpen(false);
    setConfirmationDialogOpen(true);
  };

  return (
    <Container disableGutters>
      <Box sx={{ mt: 1 }}>
        <CustomAccordion title="PIVV Decision" defaultExpanded>
          <Box
            sx={{
              backgroundColor: "#F6F6F6",
              p: 1.25,
              mt: 0.75,
              borderRadius: "6px",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
              }}
            >
              <CustomSelect
                label="PIVV Pool Decision"
                value={decision}
                onChange={(value: string) => {
                  setDecision(value);
                  setSnackbarOpen(false);
                }}
                options={pivvDecisionOptions}
              />
            </Box>

            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 400,
                color: "#444",
                mt: 1,
                mb: 0.5,
              }}
            >
              Remarks
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
                  setSnackbarOpen(false);
                }
              }}
              sx={{ backgroundColor: "#fff" }}
            />

            <Typography sx={{ display: "flex", justifyContent: "flex-end", fontSize: "11px", color: "#888", mt: 0.25 }}>
              {remarks.length}/10000
            </Typography>

          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <CustomButton
              variant="contained"
              disabled={!isSubmitEnabled || submitLoading}
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
          open={confirmationDialogOpen}
          message="Do you want to submit the case?"
          onClose={() => setConfirmationDialogOpen(false)}
          onConfirm={() => {
            setConfirmationDialogOpen(false);
            void handleSubmit();
          }}
        />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={(_, reason) => {
            if (reason !== "clickaway") {
              setSnackbarOpen(false);
            }
          }}
        >
          <Alert
            severity={snackbarSeverity}
            variant="filled"
            onClose={() => setSnackbarOpen(false)}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default PIVVDecision;