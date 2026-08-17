import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTextField from "../../../components/ui/TextField/TextField";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomButton from "../../../components/ui/Button/Button";
import CustomDialog from "../../../components/ui/Dialog/Dialog";

import { useAppSelector } from "../../../store/hooks";
import type { AppDispatch } from "../../../store/store";

import { title } from "../../../utils/constant";
import { validateDecision } from "../../../validations/decisionValidations";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";
import CustomSnackbar from "../../../components/ui/SnackBar/Snackbar";

interface MiscItem {
  type: string;
  code: string;
  value: string;
  description: string;
  isActive: string;
}

interface ApplicationRow {
  applicationNo?: string;
  taskId?: string;
  instanceId?: string;
  instanceID?: string;
  userId?: string;
  roleType?: string;
  taskCompositeId?: string;
}

interface LocationState {
  application?: ApplicationRow;
}

interface RequirementManagementRow {
  status?: string;
  fupCode?: string;
}

interface DrsData {
  requirementManagement?: RequirementManagementRow[];
}

interface DrsStateWithRequirementSaveStatus {
  data?: DrsData;
}

const Decision = () => {
  const dispatch = useDispatch<AppDispatch>();

  const location = useLocation();

  // =====================================================
  // COMPLETE ROW DATA
  // =====================================================

  const application =
    (location.state as LocationState | null)?.application ?? null;

  // =====================================================
  // GET VALUES FROM ROW
  // =====================================================

  const rawTaskId = String(application?.taskId ?? "").trim();

  const [instanceIdFromTask, taskIdFromTask] = rawTaskId.includes(".")
    ? rawTaskId.split(".")
    : ["", rawTaskId];

  const taskId = String(
    application?.taskId && !application.taskId.includes(".")
      ? application.taskId
      : taskIdFromTask,
  ).trim();

  const instanceId = String(
    application?.instanceId ??
      application?.instanceID ??
      instanceIdFromTask ??
      "",
  ).trim();

  const applicationNumber = String(
    application?.applicationNo ?? "",
  ).trim();

  const userId = String(
    application?.userId ??
      localStorage.getItem("username") ??
      "",
  ).trim();

  // ================= STATE =================

 const [selectedDecision, setSelectedDecision] = useState("");

  const [remarks, setRemarks] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as
      | "success"
      | "error"
      | "warning"
      | "info",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // CONFIRMATION DIALOG STATE
  // =====================================================

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState(false);

  // ================= REDUX =================

  const masterData = useAppSelector(
    (state) => state.masterData,
  );

  const finalBreData = useAppSelector(
    (state) => state.bre,
  );

  const drsState = useAppSelector(
    (state) => state.drs,
  ) as DrsStateWithRequirementSaveStatus;

  // ================= BRE STATUS =================

  const finalBreStatus =
    finalBreData?.data?.data?.breOutput?.decisionTypes?.breDecision
      ?.trim()
      ?.toUpperCase();

  // ================= ROLE =================

  const roleType = String(
    application?.roleType ??
      localStorage.getItem("roleType") ??
      "",
  ).trim();

  const decisionCodeMap: Record<string, string> = {
    CVT_TASK: "CVT",
    DVT_TASK: "DVT",
    PIVV_TASK: "PIVV",
    EXCEPTIONAL_TASK: "EXCEPTIONAL",
    RECONSIDERATION_TASK: "RECONS",
    REJECT_TASK: "RECONS",
    DVT_FORMAL_TASK: "DVT_FOR",
  };

  const decisionCode = roleType
    ? decisionCodeMap[roleType] ?? ""
    : "";

  const hasPendingRequirements =
    roleType === "CVT_TASK" &&
    (drsState.data?.requirementManagement ?? []).some(
      (row) =>
        String(row.status ?? "")
          .trim()
          .toUpperCase() === "PENDING",
    );

  const hasPivRequirement =
    roleType === "CVT_TASK" &&
    (drsState.data?.requirementManagement ?? []).some(
      (row) =>
        String(row.fupCode ?? "")
          .trim()
          .toUpperCase() === "PIV",
    );

  // ================= MASTER DATA =================

  const miscData =
    masterData?.data?.data?.misc ||
    JSON.parse(
      sessionStorage.getItem("masterData") || "{}",
    )?.data?.misc ||
    [];

  // ================= DECISION OPTIONS =================

  const decisionOptions =
    (miscData as MiscItem[])
      ?.filter(
        (item) =>
          item.type === decisionCode &&
          item.isActive === "Y",
      )
      ?.filter((item) => {
        const decisionValue = String(item.value ?? "")
          .trim()
          .toLowerCase();

        const normalizedDecisionValue = decisionValue.replace(
          /[\s_-]+/g,
          "",
        );

        if (hasPendingRequirements) {
          return normalizedDecisionValue === "raiserequirement";
        }

        if (
          hasPivRequirement &&
          normalizedDecisionValue === "reraisepivv"
        ) {
          return false;
        }

        if (
          finalBreStatus === "ST" ||
          finalBreStatus === "STD"
        ) {
          return true;
        }

        return (
          decisionValue !== "accept" &&
          decisionValue !== "standard"
        );
      })
      ?.map((item) => ({
        label: item.value,
        value: item.code, // IMPORTANT: send code in API
      })) || [];

  // ================= SNACKBAR =================

  const showSnackbar = (
    message: string,
    severity:
      | "success"
      | "error"
      | "warning"
      | "info",
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = () => {
    // =====================================================
    // VALIDATION
    // =====================================================

    const requirementSaveStorageKey = `requirementManagementSaved:${applicationNumber}:${roleType}`;
    const hasSavedRequirements =
      sessionStorage.getItem(requirementSaveStorageKey) === "true";

    if (roleType === "CVT_TASK" && !hasSavedRequirements) {
      showSnackbar(
        "Please click Save in Requirement Management before submitting the decision.",
        "warning",
      );

      return;
    }

    const validationResult = validateDecision({
      remarks,
      caseDecision: selectedDecision,
    });

    if (!validationResult.isValid) {
      showSnackbar(
        validationResult.message ||
          "Please check the fields.",
        "error",
      );

      return;
    }

    // =====================================================
    // VALIDATE REQUIRED ROW DATA
    // =====================================================

    if (!taskId) {
      showSnackbar(
        "Task ID is missing. Unable to submit decision.",
        "error",
      );

      return;
    }

    if (!instanceId) {
      showSnackbar(
        "Instance ID is missing. Unable to submit decision.",
        "error",
      );

      return;
    }

    if (!applicationNumber) {
      showSnackbar(
        "Application number is missing. Unable to submit decision.",
        "error",
      );

      return;
    }

    if (!userId) {
      showSnackbar(
        "User ID is missing. Unable to submit decision.",
        "error",
      );

      return;
    }

    // =====================================================
    // VALIDATION SUCCESSFUL
    // OPEN CONFIRMATION DIALOG
    // =====================================================

    setIsConfirmDialogOpen(true);
  };

  // =====================================================
  // CONFIRM SUBMIT
  // =====================================================

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Close dialog
      setIsConfirmDialogOpen(false);

      // =====================================================
      // API CALL
      // =====================================================

      const payload = {
        requestContext: {
          taskId,
          userId,
          appNo: applicationNumber,
          instanceId,
          remarks: remarks.trim(),
          decision: selectedDecision,
        },
      };

      console.log(
        "Complete Task API payload:",
        payload,
      );

      const response = await dispatch(
        completeTaskThunk(payload),
      ).unwrap();

      // =====================================================
      // SUCCESS
      // =====================================================

      console.log(
        "Decision API response:",
        response,
      );

      showSnackbar(
        "Decision submitted successfully.",
        "success",
      );

     
    } catch (error) {
      // =====================================================
      // API FAILURE
      // =====================================================

      console.error(
        "Decision API failed:",
        error,
      );

      showSnackbar(
        "Unable to submit decision. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // CANCEL CONFIRMATION
  // =====================================================

  const handleCancelConfirmation = () => {
    if (isSubmitting) {
      return;
    }

    setIsConfirmDialogOpen(false);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <Box sx={{ p: 1 }}>
      <CustomAccordion
        title={title?.decision ?? "Decision"}
        defaultExpanded
      >
        <Box
          sx={{
            p: 1,
            borderRadius: "6px",
            backgroundColor: "#f6f6f6",
          }}
        >
          {/* =====================================================
              REMARKS + CASE DECISION
          ===================================================== */}

          <Box
            sx={{
              display: "flex",
              gap: 3,
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* =====================================================
                REMARKS
            ===================================================== */}

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#444",
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
                  const value =
                    event.target.value;

                  if (value.length <= 10000) {
                    setRemarks(value);
                  }
                }}
                variant="outlined"
                size="small"
                sx={{
                  width: "100%",
                  backgroundColor: "#fff",
                  borderRadius: "6px",

                  "& .MuiInputBase-root": {
                    minHeight: "70px",
                    boxSizing: "border-box",
                    alignItems: "flex-start",
                  },
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

           
          </Box>
 {/* =====================================================
                CASE DECISION
            ===================================================== */}

 <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 1,
                            }}
                        >

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#444",
                  mb: 0.5,
                }}
              >
                Case Decision
              </Typography>

              <Box
                sx={{
                  width: "100%",

                  "& .MuiFormControl-root": {
                    width: "100%",
                    margin: 0,
                  },

                  "& .MuiInputBase-root": {
                    width: "100%",
                  },
                }}
              >
                <CustomSelect
                  value={selectedDecision}
                  onChange={(value) => {
                    setSelectedDecision(value);
                  }}
                  options={decisionOptions}
                />
              </Box>
            </Box>

            
</Box>
          {/* =====================================================
              SUBMIT
          ===================================================== */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "left",
              mt: "5px",
            }}
          >
            <CustomButton
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                minWidth: 150,
                height: 36,
                borderRadius: "50px",
                fontWeight: 600,
                px: 2.5,
                whiteSpace: "nowrap",
              }}
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit"}
            </CustomButton>
          </Box>
        </Box>
      </CustomAccordion>

      {/* =====================================================
          CONFIRMATION DIALOG
      ===================================================== */}

      <CustomDialog
        open={isConfirmDialogOpen}
        onClose={handleCancelConfirmation}
        title="Confirm Submission"
      >
        <Box sx={{ p: 1 }}>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#333",
            }}
          >
            Do you want to submit the case?
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 3,
            }}
          >
            <CustomButton
              variant="outlined"
              onClick={handleCancelConfirmation}
              disabled={isSubmitting}
            >
              Cancel
            </CustomButton>

            <CustomButton
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit"}
            </CustomButton>
          </Box>
        </Box>
      </CustomDialog>

      {/* =====================================================
          COMMON SNACKBAR
      ===================================================== */}

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </Box>
  );
};

export default Decision;
