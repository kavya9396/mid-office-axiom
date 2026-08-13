import { Box, Typography } from "@mui/material";
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
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";

type PivvDecisionOption = {
  label: string;
  value: string;
  workflowPool: "COPS Pool" | "CUW Pool";
};

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
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const roleType = localStorage.getItem("roleType") ?? "";
  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const taskContext = useMemo(
    () => getDecisionTaskContext(drsData, applicationNumber),
    [applicationNumber, drsData],
  );

  const workflowPool = useMemo(() => {
    const byMaster = Array.isArray(masters.pivvDecision) ? masters.pivvDecision : [];
    const matched = byMaster.find((item) => item.value === decision || item.description === decision || item.code === decision) as PivvDecisionOption | undefined;
    if (matched) return matched.workflowPool ?? "";

    // fallback to misc
    const misc = (masters as Record<string, unknown> | undefined)?.misc;
    const miscList = Array.isArray(misc) ? misc as unknown[] : [];
    const matchedMisc = miscList.find((item) => {
      const row = item as Record<string, unknown>;
      const code = String(row.code ?? row.value ?? "").trim();
      const desc = String(row.description ?? row.value ?? "").trim();
      return code === decision || desc === decision;
    }) as Record<string, unknown> | undefined;

    return String(matchedMisc?.workflowPool ?? "");
  }, [decision, masters]);

  const isSubmitEnabled = decision.trim().length > 0 && remarks.trim().length > 0;

  const handleSubmit = async () => {
    console.log("Decision selected", decision.trim())
    const breValidation = validateDrsFinalBre(drsData);
    if (!breValidation.canPerformAction) {
      setSubmitMessage(breValidation.message);
      return;
    }

    if (!taskContext.appNo || !roleType || !taskContext.taskId || !taskContext.instanceId || !taskContext.userId || !workflowPool) {
      setSubmitMessage("Missing required case information. Please open the case from inbox again.");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitMessage(null);

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
      setSubmitMessage(message);
      if (!success) {
        return;
      }

      navigate(getInboxPath(safeBusinessType), {
        state: {
          snackbarMessage: message,
        },
      });
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to submit PIVV decision.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitIntent = () => {
    const breValidation = validateDrsFinalBre(drsData);
    if (!breValidation.canPerformAction) {
      setSubmitMessage(breValidation.message);
      return;
    }
    const requirementValidation = validateRequirementDecision(drsData, decision);
    if (!requirementValidation.isValid) {
      setSubmitMessage(requirementValidation.message);
      return;
    }

    setSubmitMessage(null);
    setConfirmationDialogOpen(true);
  };

  return (
    // <Container disableGutters>
      <Box sx={{ p: 1 }}>
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
                  setSubmitMessage(null);
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
                  setSubmitMessage(null);
                }
              }}
              sx={{ backgroundColor: "#fff" }}
            />

            <Typography sx={{ display: "flex", justifyContent: "flex-end", fontSize: "11px", color: "#888", mt: 0.25 }}>
              {remarks.length}/10000
            </Typography>

            {!taskContext.taskId && (
              <Typography sx={{ mt: 0.75, fontSize: 12, color: "#DE2C3B" }}>
                Task ID is missing. Please open the case from inbox again.
              </Typography>
            )}

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

          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <CustomButton
              variant="contained"
              disabled={!isSubmitEnabled || !taskContext.taskId || submitLoading}
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
            void handleSubmit();
          }}
        />
      </Box>
    // </Container>
  );
};

export default PIVVDecision;
