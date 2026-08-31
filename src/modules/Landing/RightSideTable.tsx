import {
  Alert,
  Box,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

import AllocationManagement from "./AllocationManagement";
import DynamicRoleTable from "./DynamicRoleTable";
import LeaveManagement from "./LeaveManagement";
import { useAppDispatch } from "../../store/hooks";
import { breThunk } from "../../store/thunks/breThunk";
import { claimTaskThunk } from "../../store/thunks/claimTaskThunk";
import { searchThunk } from "../../store/thunks/searchAppThunk";
import { getSearchApplicationPath } from "../../routes/routes";
import { useNavigate } from "react-router-dom";
import type { SearchApiResponse } from "../../types/search.types";

interface RightSideTableProps {
  selectedRole: string | null;
  selectedTask: string | null;
  selectedTaskData: Record<string, unknown>[];
  selectedApplication: Record<string, unknown> | null;
  isDashboardTask?: boolean;
  onApplicationClick: (
    application: Record<string, unknown>,
  ) => void;
  onApplicationBack: () => void;
}

interface StoredCaseContext {
  applicationNumber?: string;
  businessType?: string;
  roleType?: string;
  taskId?: string;
  instanceId?: string;
  taskCompositeId?: string;
  [key: string]: unknown;
}

const normalizeRoleKey = (value: string) =>
  value.replace(/[\s_-]/g, "").toUpperCase();

const normalizeTaskKey = (value: string) =>
  value.replace(/_/g, " ");

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getFirstNonEmptyValue = (...values: unknown[]): string => {
  for (const value of values) {
    const normalizedValue = String(value ?? "").trim();

    if (normalizedValue && normalizedValue !== "[object Object]") {
      return normalizedValue;
    }
  }

  return "";
};

const getTaskIdFromIdentifier = (value: string): string => {
  const parts = value
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.at(-1) ?? "";
};

const getInstanceIdFromCompositeId = (value: string): string => {
  const parts = value
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1
    ? parts.slice(0, -1).join(".")
    : "";
};

const getStoredCaseContext = (): StoredCaseContext => {
  try {
    return JSON.parse(
      localStorage.getItem("selectedCaseContext") ?? "{}",
    ) as StoredCaseContext;
  } catch {
    return {};
  }
};

const storeTaskContext = ({
  applicationNumber,
  businessType,
  roleType,
  taskId,
  instanceId,
  taskCompositeId,
}: Required<
  Pick<
    StoredCaseContext,
    | "applicationNumber"
    | "businessType"
    | "roleType"
    | "taskId"
    | "instanceId"
    | "taskCompositeId"
  >
>) => {
  localStorage.setItem("applicationNumber", applicationNumber);
  localStorage.setItem("businessType", businessType);
  localStorage.setItem("roleType", roleType);
  localStorage.setItem("taskId", taskId);
  localStorage.setItem("instanceId", instanceId);

  if (taskCompositeId) {
    localStorage.setItem(
      "taskCompositeId",
      taskCompositeId,
    );
  } else {
    localStorage.removeItem("taskCompositeId");
  }

  const currentContext = getStoredCaseContext();

  localStorage.setItem(
    "selectedCaseContext",
    JSON.stringify({
      ...currentContext,
      applicationNumber,
      businessType,
      roleType,
      taskId,
      instanceId,
      taskCompositeId,
    }),
  );
};

const RightSideTable = ({
  selectedRole,
  selectedTask,
  selectedTaskData,
  selectedApplication,
  isDashboardTask = false,
  onApplicationClick,
}: RightSideTableProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [claimError, setClaimError] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);

  const handleApplicationClick = async (
    application: Record<string, unknown>,
  ) => {
    const username = localStorage.getItem("username") ?? "";
    const password = localStorage.getItem("password") ?? "";
    const instance = toRecord(application.instance);

    const taskCompositeId = getFirstNonEmptyValue(
      application.taskCompositeId,
      application.task_composite_id,
      instance.taskCompositeId,
    );

    const rawTaskId = getFirstNonEmptyValue(
      application.taskId,
      application.task_id,
      instance.taskId,
      instance.task,
      taskCompositeId,
    );

    const taskId = getTaskIdFromIdentifier(rawTaskId);
    const instanceId = getFirstNonEmptyValue(
      application.instanceId,
      application.instance_id,
      application.processInstanceId,
      instance.instanceId,
      instance.id,
      getInstanceIdFromCompositeId(taskCompositeId),
      getInstanceIdFromCompositeId(rawTaskId),
    );

    const applicationNumber = getFirstNonEmptyValue(
      application.applicationNo,
      application.applicationNumber,
      application.application_no,
    );

    const businessType =
      getFirstNonEmptyValue(
        application.businessType,
        localStorage.getItem("businessType"),
        "retail",
      ).toLowerCase() || "retail";

    const roleType = getFirstNonEmptyValue(
      application.roleType,
      selectedTask,
      localStorage.getItem("roleType"),
    ).toUpperCase();

    if (isDashboardTask) {
      if (!applicationNumber) {
        setClaimError("Application number is missing. Unable to open this case.");
        return;
      }

      try {
        setClaimLoading(true);
        setClaimError("");

        const searchData = await dispatch(
          searchThunk({ applicationNo: applicationNumber, businessType }),
        ).unwrap() as SearchApiResponse;

        if (!searchData?.data) {
          setClaimError("No data found for this application.");
          return;
        }

        localStorage.setItem(
          "selectedCaseContext",
          JSON.stringify({
            ...getStoredCaseContext(),
            applicationNumber,
            businessType,
            roleType,
            readOnly: true,
            source: "dashboardRole",
          }),
        );

        navigate(getSearchApplicationPath(), {
          state: {
            applicationNumber,
            businessType,
            roleType,
            fromDashboardRole: true,
            searchData,
          },
        });
      } catch (error) {
        setClaimError(
          typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : "Unable to fetch application details.",
        );
      } finally {
        setClaimLoading(false);
      }

      return;
    }

    if (!taskId) {
      setClaimError(
        "Task ID is missing. Unable to claim this case.",
      );
      return;
    }

    if (!instanceId) {
      setClaimError(
        "Instance ID is missing in the selected task row.",
      );
      return;
    }

    if (
      roleType !== "PRE_LOGIN_CUW_TASK" &&
      !applicationNumber
    ) {
      setClaimError(
        "Application number is missing. Unable to run BRE.",
      );
      return;
    }

    try {
      setClaimLoading(true);
      setClaimError("");

      const response = await dispatch(
        claimTaskThunk({
          username,
          password,
          taskId,
        }),
      ).unwrap();

      const isClaimed =
        response.success === true ||
        response.state?.toLowerCase() === "claimed";

      if (!isClaimed) {
        setClaimError(
          response.message || "Failed to claim task.",
        );
        return;
      }

      if (roleType !== "PRE_LOGIN_CUW_TASK") {
        const eventName =
          businessType === "group"
            ? "BRE-GROUP"
            : "BRE-RETAIL";

        await dispatch(
          breThunk({
            eventName,
            applicationNumber,
            businessType,
          }),
        ).unwrap();
      }

      const resolvedCompositeId =
        taskCompositeId || `${instanceId}.${taskId}`;

      const applicationWithTaskContext = {
        ...application,
        taskId,
        instanceId,
        taskCompositeId: resolvedCompositeId,
      };

      // Make the IDs available to anything the parent callback runs.
      storeTaskContext({
        applicationNumber,
        businessType,
        roleType,
        taskId,
        instanceId,
        taskCompositeId: resolvedCompositeId,
      });

      onApplicationClick(applicationWithTaskContext);

      // Run after the parent callback so its context update cannot remove IDs.
      storeTaskContext({
        applicationNumber,
        businessType,
        roleType,
        taskId,
        instanceId,
        taskCompositeId: resolvedCompositeId,
      });
    } catch (error) {
      setClaimError(
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Unable to claim the task or run BRE.",
      );
    } finally {
      setClaimLoading(false);
    }
  };

  if (selectedApplication) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        {/* Your existing ApplicationWorkspace here */}
      </Box>
    );
  }

  if (selectedRole) {
    const role = normalizeRoleKey(selectedRole);

    if (role === "LEAVEMANAGEMENT") {
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          <LeaveManagement />
        </Box>
      );
    }

    if (role === "ALLOCATIONDETAILS") {
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          <AllocationManagement />
        </Box>
      );
    }

    return (
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          sx={{
            fontSize: "13px",
            color: "#777",
          }}
        >
          {selectedRole}
        </Typography>
      </Paper>
    );
  }

  if (selectedTask) {
    return (
      <>
        <DynamicRoleTable
          title={`${normalizeTaskKey(selectedTask)} Details`}
          data={selectedTaskData}
          onApplicationClick={handleApplicationClick}
          showAddButton={
            selectedRole
              ? normalizeRoleKey(selectedRole) ===
                "USERMANAGEMENT"
              : false
          }
        />

        <Snackbar
          open={Boolean(claimError)}
          autoHideDuration={3000}
          onClose={() => setClaimError("")}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Alert
            onClose={() => setClaimError("")}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {claimError}
          </Alert>
        </Snackbar>

        {claimLoading && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.25)",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#fff",
                padding: "20px 30px",
                borderRadius: "8px",
              }}
            >
              <Typography>
                Claiming task and running BRE...
              </Typography>
            </Box>
          </Box>
        )}
      </>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
      }}
    >
      <Typography
        sx={{
          fontSize: "13px",
          color: "#777",
        }}
      >
        Select a task or role
      </Typography>
    </Paper>
  );
};

export default RightSideTable;
