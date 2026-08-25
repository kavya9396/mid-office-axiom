import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTextField from "../../../components/ui/TextField/TextField";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomButton from "../../../components/ui/Button/Button";
import CustomDialog from "../../../components/ui/Dialog/Dialog";

import { useAppSelector } from "../../../store/hooks";
import type { AppDispatch } from "../../../store/store";

import { title } from "../../../utils/constant";
import { validateDecision } from "../../../validations/decisionValidations";
import { validateApplicantTabsVisited } from "../../../validations/drsApplicantTabValidation";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";
import { breThunk } from "../../../store/thunks/breThunk";
import CustomSnackbar from "../../../components/ui/SnackBar/Snackbar";
//import { formatDate } from "../../../utils/dataFormat";
import { getInboxPath } from "../../../routes/routes";

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
  summary?: Array<{ memberType?: string }>;
}

interface DrsStateWithRequirementSaveStatus {
  data?: DrsData;
}

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toText = (value: unknown): string =>
  String(value ?? "").trim();

const getSelectedCaseContext = (): Record<string, unknown> => {
  try {
    return toRecord(
      JSON.parse(
        localStorage.getItem("selectedCaseContext") ?? "null",
      ),
    );
  } catch {
    return {};
  }
};

const splitCompositeTaskId = (
  value: unknown,
): { taskId: string; instanceId: string } => {
  const compositeId = toText(value);
  const separatorIndex = compositeId.indexOf(".");

  if (separatorIndex < 0) {
    return { taskId: compositeId, instanceId: "" };
  }

  return {
    instanceId: compositeId.slice(0, separatorIndex).trim(),
    taskId: compositeId.slice(separatorIndex + 1).trim(),
  };
};

const Decision = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const location = useLocation();

  // =====================================================
  // COMPLETE ROW DATA
  // =====================================================

  const application =
    (location.state as LocationState | null)?.application ?? null;
  const storedCaseContext = getSelectedCaseContext();
  const routeApplicationNumber = toText(application?.applicationNo);
  const storedApplicationNumber = toText(
    storedCaseContext.applicationNo ??
      storedCaseContext.applicationNumber,
  );
  const selectedCaseContext =
    !routeApplicationNumber ||
    !storedApplicationNumber ||
    routeApplicationNumber === storedApplicationNumber
      ? storedCaseContext
      : {};

  // =====================================================
  // GET VALUES FROM ROW
  // =====================================================

  const routeTask = splitCompositeTaskId(
    application?.taskCompositeId || application?.taskId,
  );
  const storedTask = splitCompositeTaskId(
    selectedCaseContext.taskCompositeId ||
      selectedCaseContext.taskId,
  );

  const taskId = routeTask.taskId || storedTask.taskId;

  const instanceId =
    toText(application?.instanceId) ||
    toText(application?.instanceID) ||
    routeTask.instanceId ||
    toText(selectedCaseContext.instanceId) ||
    toText(selectedCaseContext.instanceID) ||
    storedTask.instanceId;

  const applicationNumber = String(
    application?.applicationNo ??
      selectedCaseContext.applicationNo ??
      selectedCaseContext.applicationNumber ??
      localStorage.getItem("applicationNo") ??
      "",
  ).trim();

  const userId = String(
    application?.userId ??
      selectedCaseContext.userId ??
      localStorage.getItem("username") ??
      "",
  ).trim();

  // const [decisionTimestamp] = useState(() =>
  //   new Intl.DateTimeFormat("en-GB", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     hour12: false,
  //     timeZone: "Asia/Kolkata",
  //   }).format(new Date()),
  // );

  // ================= STATE =================

  const [selectedDecision, setSelectedDecision] = useState("");

  const [remarks, setRemarks] = useState("");

  const [doNotPayToTpa, setDoNotPayToTpa] = useState(false);

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
      selectedCaseContext.roleType ??
      localStorage.getItem("roleType") ??
      "",
  ).trim();

  // const showDecisionAuditFields =
  //   roleType === "HOD_TASK" ||
  //   roleType === "SR_UW_TASK" ||
  //   roleType === "CMO_TASK" ||
  //   roleType === "VENDOR_CMO_TASK" ||
  //   roleType === "HO_CMO_TASK";

  const showDoNotPayToTpa =
    roleType === "CMO_TASK" || roleType === "HO_CMO_TASK" || roleType === "VENDOR_CMO_TASK";

  const decisionCodeMap: Record<string, string> = {
    CVT_TASK: "CVT",
    DVT_TASK: "DVT",
    PIVV_TASK: "PIVV",
    EXCEPTIONAL_TASK: "EXCEPTIONAL",
    RECONSIDERATION_TASK: "RECONS",
    REJECT_TASK: "RECONS",
    DVT_FORMAL_TASK: "DVT_FOR",
    HOD_TASK:"HOD",
    SR_UW_TASK:"SUW",
    CMO_TASK:"CMO",
    HO_CMO_TASK:"CMO"
  };

  const decisionCode = roleType
    ? decisionCodeMap[roleType] ?? ""
    : "";

  const hasOutstandingRequirements =
    roleType === "CVT_TASK" &&
    (drsState.data?.requirementManagement ?? []).some(
      (row) =>
        !["ACCEPT", "ACCEPTED"].includes(
          String(row.status ?? "")
            .trim()
            .toUpperCase(),
        ),
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

        if (roleType === "CVT_TASK" && hasOutstandingRequirements) {
          return normalizedDecisionValue === "raiserequirement";
        }

        if (
          roleType === "CVT_TASK" &&
          !hasOutstandingRequirements &&
          normalizedDecisionValue === "raiserequirement"
        ) {
          return false;
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

    if (!hasSavedRequirements) {
      showSnackbar(
        "Save button is mandatory in Requirement Management before proceeding.",
        "warning",
      );

      return;
    }

    const applicantTabsValidation =
  validateApplicantTabsVisited(
    drsState.data,
    applicationNumber,
    roleType,
  );

    if (!applicantTabsValidation.isValid) {
      showSnackbar(
        applicantTabsValidation.message ??
          "Please visit all Applicant Profile tabs before submitting the decision.",
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
    let breSucceeded = false;

    try {
      setIsSubmitting(true);

      // Close dialog
      setIsConfirmDialogOpen(false);

      // =====================================================
      // CALL BRE FIRST
      // =====================================================

      await dispatch(
        breThunk({
          eventName: "BRE-RETAIL",
          applicationNumber,
        }),
      ).unwrap();

      breSucceeded = true;

      // =====================================================
      // CALL COMPLETE TASK ONLY AFTER BRE SUCCESS
      // =====================================================

      const payload = {
        requestContext: {
          taskId,
          userId,
          appNo: applicationNumber,
          instanceId,
          remarks: remarks.trim(),
          decision: selectedDecision,
          ...(showDoNotPayToTpa && {
            doNotPayToTPA: doNotPayToTpa,
          }),
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
      navigate(getInboxPath());

     
    } catch (error) {
      // =====================================================
      // API FAILURE
      // =====================================================

      console.error(
        breSucceeded
          ? "Complete Task API failed:"
          : "BRE API failed:",
        error,
      );

      showSnackbar(
        breSucceeded
          ? "BRE completed, but the decision could not be submitted. Please try again."
          : "BRE failed. The decision was not submitted. Please try again.",
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
              gridTemplateColumns: {
                xs: "1fr",
                md:"repeat(3, 1fr)"
              },
              gap: 1,
              width: "100%",
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

            {/* {showDecisionAuditFields && (
              <>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#444",
                      mb: 0.5,
                    }}
                  >
                    User ID
                  </Typography>

                  <CustomTextField
                    fullWidth
                    value={userId}
                    disabled
                    variant="outlined"
                    size="small"
                    sx={{ backgroundColor: "#fff" }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#444",
                      mb: 0.5,
                    }}
                  >
                    Date & Timestamp
                  </Typography>
                  <CustomTextField
                    fullWidth
                    value={formatDate(decisionTimestamp)}
                    disabled
                    variant="outlined"
                    size="small"
                    sx={{ backgroundColor: "#fff" }}
                  />
                </Box>
              </>
            )} */}
          </Box>

          {showDoNotPayToTpa && (
            <FormControlLabel
              sx={{
                mt: 0.75,
                ml: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: "12px",
                  color: "#444",
                },
              }}
              control={
                <Checkbox
                  checked={doNotPayToTpa}
                  onChange={(event) =>
                    setDoNotPayToTpa(event.target.checked)
                  }
                  size="small"
                  sx={{ p: 0.5, mr: 0.5 }}
                />
              }
              label="Do not pay to TPA"
            />
          )}
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
