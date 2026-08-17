import {
  Alert,
  Box,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";

import DynamicRoleTable from "./DynamicRoleTable";
// import UserManagementForm from "./UserManagement";
import LeaveManagement from "./LeaveManagement";
import AllocationManagement from "./AllocationManagement";

import { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { claimTaskThunk } from "../../store/thunks/claimTaskThunk";

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
    application: Record<string, unknown>,
  ) => void;

  onApplicationBack: () => void;
}

const normalizeRoleKey = (
  value: string,
) =>
  value
    .replace(/[\s_-]/g, "")
    .toUpperCase();

const normalizeTaskKey = (
  value: string,
) =>
  value
    .replace(/_/g, " ");

const RightSideTable = ({
  selectedRole,
  selectedTask,
  selectedTaskData,
  selectedApplication,
  onApplicationClick,
}: RightSideTableProps) => {
  const dispatch = useAppDispatch();

  const [claimError, setClaimError] =
    useState("");

  const [claimLoading, setClaimLoading] =
    useState(false);

  /**
   * Handles clicking an application row.
   *
   * Claims the selected task using the username and password
   * stored in localStorage. The taskId is taken directly from
   * the selected application's row data.
   *
   * The application is opened only after the claim API succeeds.
   */
  const handleApplicationClick = async (
    application: Record<string, unknown>,
  ) => {
    const username =
      localStorage.getItem("username") ?? "";

    const password =
      localStorage.getItem("password") ?? "";

    /**
     * Task ID comes directly from the selected row.
     *
     * Example:
     * application.taskId = "23574"
     */
    const taskId = String(
      application.taskId ?? "",
    ).trim();

    if (!taskId) {
      setClaimError(
        "Task ID is missing. Unable to claim this case.",
      );

      return;
    }

    try {
      setClaimLoading(true);

      const response = await dispatch(
        claimTaskThunk({
          username,
          password,
          taskId,
        }),
      ).unwrap();

      const isClaimed =
        response.success === true ||
        response.state?.toLowerCase() ===
        "claimed";

      if (!isClaimed) {
        setClaimError(
          response.message ||
          "Failed to claim task.",
        );

        return;
      }

      /**
       * Claim successful.
       *
       * Pass the complete row to the parent so that
       * the application workspace can open.
       */
      onApplicationClick(application);
    } catch (error) {
      setClaimError(
        error instanceof Error
          ? error.message
          : "Failed to claim task.",
      );
    } finally {
      setClaimLoading(false);
    }
  };


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
      normalizeRoleKey(selectedRole);

    // USER MANAGEMENT
    // if (role === "USERMANAGEMENT") {
    //   return (
    //     <Box
    //       sx={{
    //         width: "100%",
    //         height: "100%",
    //         overflow: "auto",
    //       }}
    //     >
    //       <UserManagementForm />
    //     </Box>
    //   );
    // }

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

  // ==========================================================
  // NORMAL TASK TABLE
  // ==========================================================

  if (selectedTask) {
    return (
      <>
        <DynamicRoleTable
          title={`${normalizeTaskKey(
            selectedTask,
          )} Details`}
          data={selectedTaskData}
          onApplicationClick={
            handleApplicationClick
          }
          showAddButton={
            selectedRole
              ? normalizeRoleKey(
                selectedRole,
              ) === "USERMANAGEMENT"
              : false
          }
        />

        {/* CLAIM ERROR */}
        <Snackbar
          open={Boolean(claimError)}
          autoHideDuration={3000}
          onClose={() =>
            setClaimError("")
          }
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Alert
            onClose={() =>
              setClaimError("")
            }
            severity="error"
            variant="filled"
            sx={{
              width: "100%",
            }}
          >
            {claimError}
          </Alert>
        </Snackbar>

        {/* CLAIM LOADING */}
        {claimLoading && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                "rgba(0,0,0,0.25)",
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
                Claiming task...
              </Typography>
            </Box>
          </Box>
        )}
      </>
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