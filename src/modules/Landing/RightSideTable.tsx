import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import DynamicRoleTable from "./DynamicRoleTable";
import UserManagementForm from "./UserManagement";
import LeaveManagement from "./LeaveManagement";
import AllocationManagement from "./AllocationManagement";

interface RightSideTableProps {
  selectedRole: string | null;
  selectedTask: string | null;

  selectedTaskData: Record<
    string,
    unknown
  >[];

  selectedApplication:
    | Record<string, unknown>
    | null;

  onApplicationClick: (
    application: Record<
      string,
      unknown
    >,
  ) => void;

  onApplicationBack: () => void;
}

const normalizeRoleKey = (
  value: string,
) =>
  value
    .replace(/[\s_-]/g, "")
    .toUpperCase();

const RightSideTable = ({
  selectedRole,
  selectedTask,
  selectedTaskData,
  selectedApplication,
  onApplicationClick,
}: RightSideTableProps) => {
  // ==========================================================
  // APPLICATION WORKSPACE
  // ==========================================================

  if (selectedApplication) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        {/* your existing ApplicationWorkspace here */}
      </Box>
    );
  }

  // ==========================================================
  // ROLE SCREENS
  // ==========================================================

  if (selectedRole) {
    const role =
      normalizeRoleKey(
        selectedRole,
      );

    // USER MANAGEMENT
    if (role === "USERMANAGEMENT") {
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          <UserManagementForm />
        </Box>
      );
    }

    // LEAVE MANAGEMENT
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

    // ALLOCATION DETAILS
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

    // FALLBACK FOR ANY OTHER ROLE
    return (
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border:
            "1px solid #e5e7eb",
          borderRadius: "10px",
          backgroundColor:
            "#ffffff",
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

  // ==========================================================
  // NORMAL TASK TABLE
  // ==========================================================

  if (selectedTask) {
    return (
      <DynamicRoleTable
        title={`${selectedTask} Details`}
        data={selectedTaskData}
        onApplicationClick={
          onApplicationClick
        }
      />
    );
  }

  // ==========================================================
  // EMPTY
  // ==========================================================

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border:
          "1px solid #e5e7eb",
        borderRadius: "10px",
        backgroundColor:
          "#ffffff",
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