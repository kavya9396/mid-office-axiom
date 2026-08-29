import { Box } from "@mui/material";
import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSnackbar from "../../../components/ui/SnackBar/Snackbar";
import {
  GridSection,
  type GridItem,
} from "../../../components/layout/GridSection";

import {
  useAppDispatch,
  useAppSelector,
} from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";

import { useAppContext } from "../../../hooks/useAppContext";
import {
  getInboxPath,
  normalizeBusinessType,
} from "../../../routes/routes";

interface ITSectionData {
  referenceNumber?: string;
  raisedBy?: string;
  raisedDate?: string;
  userRemarks?: string;
  errorCode?: string;
  errorDescription?: string;
}

interface DrsData {
  itSection?: ITSectionData;
  data?: {
    itSection?: ITSectionData;
  };
}

interface ApplicationRow {
  applicationNo?: string;
  applicationNumber?: string;
  businessType?: string;
  userId?: string;
  taskId?: string;
  taskCompositeId?: string;
  instanceId?: string;
  instanceID?: string;
  roleType?: string;
}

interface LocationState {
  application?: ApplicationRow;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

const RETRY_DECISION = "CLS_TASK";

const showValue = (value: unknown): string => {
  const normalizedValue = String(value ?? "").trim();

  return normalizedValue || "-";
};

const toText = (value: unknown): string =>
  String(value ?? "").trim();

const getSelectedCaseContext = (): ApplicationRow => {
  try {
    return JSON.parse(
      localStorage.getItem("selectedCaseContext") ?? "{}",
    ) as ApplicationRow;
  } catch {
    return {};
  }
};

const splitCompositeTaskId = (
  value: unknown,
): {
  taskId: string;
  instanceId: string;
} => {
  const compositeId = toText(value);
  const separatorIndex = compositeId.indexOf(".");

  if (separatorIndex < 0) {
    return {
      taskId: compositeId,
      instanceId: "",
    };
  }

  return {
    instanceId: compositeId
      .slice(0, separatorIndex)
      .trim(),
    taskId: compositeId
      .slice(separatorIndex + 1)
      .trim(),
  };
};

const ITDRS = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    businessType,
    applicationNumber,
  } = useAppContext();

  const [isRetrying, setIsRetrying] = useState(false);

  const [snackbar, setSnackbar] =
    useState<SnackbarState>({
      open: false,
      message: "",
      severity: "success",
    });

  const drsData = useAppSelector(
    (state: RootState) => state.drs.data,
  ) as unknown as DrsData | undefined;

  const itSection =
    drsData?.itSection ??
    drsData?.data?.itSection;

  /*
   * Resolve the current application details using:
   * 1. Router state
   * 2. selectedCaseContext
   * 3. Local storage
   */
  const application =
    (location.state as LocationState | null)
      ?.application ?? null;

  const storedCaseContext =
    getSelectedCaseContext();

  const routeApplicationNumber = toText(
    application?.applicationNo ??
    application?.applicationNumber,
  );

  const storedApplicationNumber = toText(
    storedCaseContext.applicationNo ??
    storedCaseContext.applicationNumber,
  );

  const canUseStoredCase =
    !routeApplicationNumber ||
    !storedApplicationNumber ||
    routeApplicationNumber ===
    storedApplicationNumber;

  const selectedCaseContext = canUseStoredCase
    ? storedCaseContext
    : {};

  const routeTask = splitCompositeTaskId(
    application?.taskCompositeId ??
    application?.taskId,
  );

  const storedTask = splitCompositeTaskId(
    selectedCaseContext.taskCompositeId ??
    selectedCaseContext.taskId,
  );

  const localTask = canUseStoredCase
    ? splitCompositeTaskId(
      localStorage.getItem("taskCompositeId") ??
      localStorage.getItem("taskId"),
    )
    : {
      taskId: "",
      instanceId: "",
    };

  const taskId =
    routeTask.taskId ||
    storedTask.taskId ||
    localTask.taskId;

  const instanceId =
    toText(application?.instanceId) ||
    toText(application?.instanceID) ||
    routeTask.instanceId ||
    toText(selectedCaseContext.instanceId) ||
    toText(selectedCaseContext.instanceID) ||
    storedTask.instanceId ||
    (canUseStoredCase
      ? toText(
        localStorage.getItem("instanceId"),
      )
      : "") ||
    localTask.instanceId;

  const safeBusinessType =
    normalizeBusinessType(
      application?.businessType,
    ) ??
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(
      selectedCaseContext.businessType,
    ) ??
    normalizeBusinessType(
      localStorage.getItem("businessType"),
    ) ??
    "retail";

  const safeApplicationNumber = toText(
    application?.applicationNo ??
    application?.applicationNumber ??
    selectedCaseContext.applicationNo ??
    selectedCaseContext.applicationNumber ??
    applicationNumber ??
    localStorage.getItem("applicationNo") ??
    localStorage.getItem("applicationNumber"),
  );

  const safeUserId = toText(
    application?.userId ??
    selectedCaseContext.userId ??
    localStorage.getItem("userId") ??
    localStorage.getItem("username"),
  );

  const details: GridItem[] = [
    {
      label: "Reference Number",
      value: showValue(itSection?.referenceNumber),
    },
    {
      label: "Raised By",
      value: showValue(itSection?.raisedBy),
    },
    {
      label: "Raised Date",
      value: showValue(itSection?.raisedDate),
    },
    {
      label: "Error Code",
      value: showValue(itSection?.errorCode),
    },
    {
      label: "User Remarks",
      value: showValue(itSection?.userRemarks),
    },
  ];
  const errorDescDetails: GridItem[] = [
    {
      label: "Error Description",
      value: showValue(itSection?.errorDescription),
    },
  ];

  const showError = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: "error",
    });
  };

  const handleClose = () => {
    navigate(getInboxPath(safeBusinessType));
  };

  const handleRetry = async () => {
    if (!taskId) {
      showError(
        "Task ID is missing. Unable to retry the task.",
      );
      return;
    }

    if (!instanceId) {
      showError(
        "Instance ID is missing. Unable to retry the task.",
      );
      return;
    }

    if (!safeApplicationNumber) {
      showError(
        "Application number is missing. Unable to retry the task.",
      );
      return;
    }

    if (!safeUserId) {
      showError(
        "User ID is missing. Unable to retry the task.",
      );
      return;
    }

    try {
      setIsRetrying(true);

      await dispatch(
        completeTaskThunk({
          businessType: safeBusinessType,
          requestContext: {
            taskId,
            instanceId,
            userId: safeUserId,
            appNo: safeApplicationNumber,
            remarks: "",
            decision: RETRY_DECISION,
          },
        }),
      ).unwrap();

      navigate(getInboxPath(safeBusinessType), {
        state: {
          snackbarMessage:
            "IT task retried successfully.",
        },
      });
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to retry the IT task. Please try again.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion
        title="IT Decision"
        defaultExpanded
      >
        <Box
          sx={{
            p: 1,
            bgcolor: "#f6f6f6",
          }}
        >
          <GridSection
            columns={3}
            items={details}
          />
        </Box>
        <Box
          sx={{
            p: 1,
            bgcolor: "#f6f6f6",
          }}
        >
          <GridSection
            columns={1}
            items={errorDescDetails}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mt: 2,
          }}
        >
          <CustomButton
            variant="outlined"
            disabled={isRetrying}
            onClick={handleClose}
            sx={{
              minWidth: "100px",
              borderRadius: 4,
            }}
          >
            Close
          </CustomButton>

          <CustomButton
            variant="contained"
            disabled={isRetrying}
            onClick={() => {
              void handleRetry();
            }}
            sx={{
              minWidth: "100px",
              borderRadius: 4,
            }}
          >
            {isRetrying ? "Retrying..." : "Retry"}
          </CustomButton>
        </Box>
      </CustomAccordion>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => {
          setSnackbar((previous) => ({
            ...previous,
            open: false,
          }));
        }}
      />
    </Box>
  );
};

export default ITDRS;