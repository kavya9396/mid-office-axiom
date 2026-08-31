import {
  Box,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  KeyDownArrowIcon,
  KeyRightArrowIcon,
  KeyUpArrowIcon,
  SearchIcon,
} from "../../icons/Icons";

import LastLogin from "./LastLogin";
import type { MenuItem } from "../../types/inboxTypes";
import { toDisplayLabel } from "../../utils/inboxUtils";
import { useNavigate } from "react-router-dom";
import { getBulkUploadPath, getSearchApplicationPath } from "../../routes/routes";

interface LeftTaskProps {
  roles: string[];

  menuItems: MenuItem[];

  selectedRole: string | null;

  selectedTask: string | null;

  isRolesOpen: boolean;

  isCollapsed: boolean;

  lastLoginAt: string;

  poolData: Record<string, Record<string, unknown>[]>;

  onRoleSelect: (role: string) => void;

  onTaskSelect: (task: string) => void;

  onToggleRoles: () => void;

  onToggleCollapse: () => void;
}

const normalizeKey = (value: string) =>
  value.replace(/[\s_-]/g, "").toUpperCase();

const USER_HANDLE_ROLES = new Set([
  "USERMANAGEMENT",
  "LEAVEMANAGEMENT",
]);

interface DashboardTaskConfig {
  label: string;
  taskKey: string;
}

const DASHBOARD_ROLE_CONFIG: Record<string, DashboardTaskConfig[]> = {
  RETAIL_DASH_MED: [{ label: "AMR Medical", taskKey: "AMR_MEDICAL_TASK" }],
  GROUP_DASH_MED: [{ label: "AMR Medical", taskKey: "AMR_MEDICAL_TASK" }],
  RETAIL_DASH_NONMED: [{ label: "AMR Non Medical", taskKey: "AMR_NON_MEDICAL_TASK" }],
  GROUP_DASH_NONMED: [{ label: "AMR Non Medical", taskKey: "AMR_NON_MEDICAL_TASK" }],
  RETAIL_DASH_ACCUITY: [{ label: "Acuity", taskKey: "ACCUITY_TASK" }],
  GROUP_DASH_ACCUITY: [{ label: "Acuity", taskKey: "ACCUITY_TASK" }],
  RETAIL_DASH_RISK: [{ label: "Risk", taskKey: "RISK_TASK" }],
  GROUP_DASH_RISK: [{ label: "Risk", taskKey: "RISK_TASK" }],
  RETAIL_DASH_IIFL: [{ label: "IIFL", taskKey: "IIFL_TASK" }],
  GROUP_DASH_IIFL: [{ label: "IIFL", taskKey: "IIFL_TASK" }],
  RETAIL_DASH_PAYATS: [
    { label: "Reconsideration", taskKey: "RECONSIDERATION_TASK" },
    { label: "Hold", taskKey: "HOLD_TASK" },
    { label: "Payment & ATS", taskKey: "PAYMENT_ATS_TASK" },
    { label: "Wait for Combo Policy", taskKey: "WAIT_FOR_COMBO_POLICY_TASK" },
    { label: "Post Issuance Doc Wait", taskKey: "POST_ISSUANCE_DOC_WAIT_TASK" },
    { label: "Pre Issuance Doc Wait", taskKey: "PRE_ISSUANCE_DOC_WAIT_TASK" },
    { label: "SPC DE", taskKey: "SPC_DE_TASK" }
  ],
  GROUP_DASH_PAYATS: [{ label: "Reconsideration", taskKey: "RECONSIDERATION_TASK" },
    { label: "Hold", taskKey: "HOLD_TASK" },
    { label: "Payment & ATS", taskKey: "PAYMENT_ATS_TASK" },
    { label: "Wait for Combo Policy", taskKey: "WAIT_FOR_COMBO_POLICY_TASK" },
    { label: "Post Issuance Doc Wait", taskKey: "POST_ISSUANCE_DOC_WAIT_TASK" },
    { label: "Pre Issuance Doc Wait", taskKey: "PRE_ISSUANCE_DOC_WAIT_TASK" },
    { label: "SPC DE", taskKey: "SPC_DE_TASK" }],
};

const getDashboardConfig = (
  role: string,
): DashboardTaskConfig[] => {
  const normalizedRole = role.trim().toUpperCase();
  const configuredRole = DASHBOARD_ROLE_CONFIG[normalizedRole];

  if (configuredRole) {
    return configuredRole;
  }

  const dashboardName = normalizedRole
    .replace(/^(RETAIL|GROUP)_DASH_/, "")
    .replace(/^DASH_/, "")
    .replace(/_TASK$/, "");

  const isDashboardPermission =
    /^(RETAIL|GROUP)_DASH_/.test(normalizedRole) ||
    normalizedRole.startsWith("DASH_");

  return [{
    label: toDisplayLabel(dashboardName),
    taskKey: isDashboardPermission
      ? `${dashboardName}_TASK`
      : normalizedRole,
  }];
};

const getTwoCharacterInitials = (value: string): string => {
  const words = toDisplayLabel(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  const singleWord = words[0] ?? "";

  if (!singleWord) {
    return "--";
  }

  return singleWord
    .slice(0, 2)
    .padEnd(2, singleWord[0])
    .toUpperCase();
};

export const SELECTED_TASK_POOL_KEY = "selectedTaskPoolKey";

const LeftTask = ({
  roles,
  menuItems,
  selectedRole,
  selectedTask,
  isRolesOpen,
  isCollapsed,
  lastLoginAt,
  poolData,
  onRoleSelect,
  onTaskSelect,
  onToggleRoles,
  onToggleCollapse,
}: LeftTaskProps) => {

  const navigate = useNavigate();
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const userHandleItems = useMemo(
    () => roles
      .filter((role) => USER_HANDLE_ROLES.has(normalizeKey(role)))
      .map((role) => ({
        role,
        label: normalizeKey(role) === "USERMANAGEMENT"
          ? "User Management"
          : "Leave Management",
      })),
    [roles],
  );

  const dashboardItems = useMemo(() => {
    const uniqueItems = new Map<string, { label: string; taskKey: string }>();

    roles
      .filter((role) => !USER_HANDLE_ROLES.has(normalizeKey(role)))
      .forEach((role) => {
      getDashboardConfig(role).forEach((config) => {
        if (!uniqueItems.has(config.taskKey)) {
          uniqueItems.set(config.taskKey, config);
        }
      });
    });

    return Array.from(uniqueItems.values());
  }, [roles]);

  const handleTaskSelect = useCallback((taskName: string) => {
    localStorage.setItem(SELECTED_TASK_POOL_KEY, taskName);
    onTaskSelect(taskName);
  }, [onTaskSelect]);

  // ==========================================================
  // AUTO SELECT ALL CASES
  // ==========================================================

  useEffect(() => {
    if (!selectedTask && !selectedRole && menuItems.length > 0) {
      handleTaskSelect("ALL_CASES");
    }
  }, [selectedTask, selectedRole, menuItems.length, handleTaskSelect]);

  // ==========================================================
  // TOTAL CASE COUNT
  // ==========================================================

  const allCasesCount = Object.values(poolData ?? {}).reduce(
    (total, cases) => total + (Array.isArray(cases) ? cases.length : 0),
    0,
  );

  // ==========================================================
  // GET TASK COUNT
  // ==========================================================

  const getTaskCount = (taskName: string) => {
    const normalizedTask = normalizeKey(taskName);

    const matchingPool = Object.entries(poolData ?? {}).find(
      ([poolName]) => normalizeKey(poolName) === normalizedTask,
    );

    return matchingPool ? matchingPool[1].length : 0;
  };

  // ==========================================================
  // TASK ITEM
  // ==========================================================

  const renderTaskItem = (taskName: string) => {
    const isActive = selectedTask === taskName;

    const count = getTaskCount(taskName);

    return (
      <Box
        key={taskName}
        onClick={() => handleTaskSelect(taskName)}
        sx={{
          height: "38px",

          display: "flex",

          alignItems: "center",

          justifyContent: isCollapsed ? "center" : "space-between",

          px: 1.5,

          cursor: "pointer",

          borderLeft: isActive ? "3px solid #9A2529" : "3px solid transparent",

          backgroundColor: isActive ? "#fdf2f2" : "transparent",

          color: isActive ? "#9A2529" : "#333333",

          "&:hover": {
            backgroundColor: "#f8f8f8",
          },
        }}
      >
        {isCollapsed ? (
          <Tooltip
            title={toDisplayLabel(taskName)}
            placement="right"
            arrow
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {getTwoCharacterInitials(taskName)}
            </Typography>
          </Tooltip>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: "11px",

                fontWeight: isActive ? 600 : 400,

                overflow: "hidden",

                textOverflow: "ellipsis",

                whiteSpace: "nowrap",

                flex: 1,
              }}
            >
              {toDisplayLabel(taskName)}
            </Typography>

            {/* COUNT */}

            <Box
              sx={{
                minWidth: "24px",

                height: "20px",

                px: "5px",

                ml: 1,

                borderRadius: "10px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                flexShrink: 0,

                backgroundColor: isActive ? "#9A2529" : "#eeeeee",

                color: isActive ? "#ffffff" : "#555555",

                fontSize: "10px",

                fontWeight: 600,
              }}
            >
              {count}
            </Box>
          </>
        )}
      </Box>
    );
  };

  return (
   <Box
  sx={{
    width: isCollapsed ? "60px" : "220px",
    // flexShrink: 0,

    // Remaining viewport height after the 64px header
    height: "calc(100dvh - 57px)",
    // maxHeight: "calc(100dvh - 64px)",
    // minHeight: 0,

    transition: "width 0.25s ease",
    overflow: "hidden",
    boxSizing: "border-box",
  }}
>
     <Paper
  elevation={0}
  sx={{
    // height: "100%",
    // minHeight: 0,
    // display: "flex",
    // flexDirection: "column",
    // overflow: "hidden",
    // borderRight: "1px solid #e5e7eb",
    // borderRadius: 0,
    // backgroundColor: "#ffffff",
    // boxSizing: "border-box",

     height: "100%",
                    display: "flex",
                    flexDirection: "column",
  }}
>
        {/* =====================================================
            COLLAPSE BUTTON
           ===================================================== */}

        <Box
          onClick={onToggleCollapse}
          sx={{
            height: "40px",

            minHeight: "40px",

            display: "flex",

            alignItems: "center",

            justifyContent: isCollapsed ? "center" : "flex-end",

            px: 1.5,

            cursor: "pointer",

            borderBottom: "1px solid #eeeeee",
          }}
        >
          <KeyRightArrowIcon
            style={{
              color: "#9A2529",

              transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",

              transition: "transform 0.25s ease",
            }}
          />
        </Box>

        {/* =====================================================
            NAVIGATION
           ===================================================== */}

        <Box
          sx={{
            flex: 1,

            minHeight: 0,

            overflowY: "auto",

            overflowX: "hidden",

            "&::-webkit-scrollbar": {
              width: "5px",
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#cccccc",

              borderRadius: "10px",
            },
          }}
        >
          {/* ===================================================
              ROLES
             =================================================== */}

          {userHandleItems.length > 0 && (
            <Box
              sx={{
                borderBottom: "1px solid #eeeeee",
              }}
            >
              <Box
                onClick={onToggleRoles}
                sx={{
                  height: "38px",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: isCollapsed ? "center" : "space-between",

                  px: 1.5,

                  cursor: "pointer",

                  "&:hover": {
                    backgroundColor: "#f8f8f8",
                  },
                }}
              >
                {isCollapsed ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    UH
                  </Typography>
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontSize: "11px",

                        fontWeight: 700,

                        color: "#333333",
                      }}
                    >
                      User Handle
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "10px",

                        color: "#777777",
                      }}
                    >
                      {isRolesOpen ? <KeyUpArrowIcon/> : <KeyDownArrowIcon/>}
                    </Typography>
                  </>
                )}
              </Box>

              {!isCollapsed &&
                isRolesOpen &&
                userHandleItems.map(({ role, label }) => {
                  const isActive = selectedRole === role;

                  return (
                    <Box
                      key={role}
                      onClick={() => onRoleSelect(role)}
                      sx={{
                        height: "34px",

                        display: "flex",

                        alignItems: "center",

                        px: 2.5,

                        cursor: "pointer",

                        borderLeft: isActive
                          ? "3px solid #9A2529"
                          : "3px solid transparent",

                        backgroundColor: isActive ? "#fdf2f2" : "transparent",

                        color: isActive ? "#9A2529" : "#555555",

                        "&:hover": {
                          backgroundColor: "#f8f8f8",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "11px",

                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          )}

          {dashboardItems.length > 0 && (
            <Box sx={{ borderBottom: "1px solid #eeeeee" }}>
              <Box
                onClick={() => setIsDashboardOpen((previous) => !previous)}
                sx={{
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isCollapsed ? "center" : "space-between",
                  px: 1.5,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f8f8f8" },
                }}
              >
                {isCollapsed ? (
                  <Tooltip title="Dashboard" placement="right" arrow>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
                      DB
                    </Typography>
                  </Tooltip>
                ) : (
                  <>
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#333333" }}>
                      Dashboard
                    </Typography>
                    {isDashboardOpen ? <KeyUpArrowIcon /> : <KeyDownArrowIcon />}
                  </>
                )}
              </Box>

              {!isCollapsed && isDashboardOpen && dashboardItems.map((item) => {
                const isActive = selectedTask === item.taskKey;

                return (
                  <Box
                    key={item.taskKey}
                    onClick={() => handleTaskSelect(item.taskKey)}
                    sx={{
                      height: "34px",
                      display: "flex",
                      alignItems: "center",
                      px: 2.5,
                      cursor: "pointer",
                      borderLeft: isActive ? "3px solid #9A2529" : "3px solid transparent",
                      backgroundColor: isActive ? "#fdf2f2" : "transparent",
                      color: isActive ? "#9A2529" : "#555555",
                      "&:hover": { backgroundColor: "#f8f8f8" },
                    }}
                  >
                    <Typography sx={{ fontSize: "11px", fontWeight: isActive ? 600 : 400 }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}


          {/* ===================================================
            SEARCH APPLICATIONS
          =================================================== */}

          <Box
            role="button"
            tabIndex={0}
            aria-label="Search applications"
            onClick={() => navigate(getSearchApplicationPath())}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(getSearchApplicationPath());
              }
            }}
            sx={{
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed
                ? "center"
                : "space-between",
              px: 1.5,
              borderBottom: "1px solid #eeeeee",
              color: "#333333",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f8f8f8" },
              "&:focus-visible": {
                outline: "2px solid #9A2529",
                outlineOffset: "-2px",
              },
            }}
          >
            {!isCollapsed && (
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Search Applications
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <SearchIcon
                width={32}
                height={32}
              />
            </Box>
          </Box>


          {/* ===================================================
            BULK UPLOAD
          =================================================== */}

           <Box
            role="button"
            tabIndex={0}
            aria-label="Search applications"
            onClick={() => navigate(getBulkUploadPath())}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(getSearchApplicationPath());
              }
            }}
            sx={{
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed
                ? "center"
                : "space-between",
              px: 1.5,
              borderBottom: "1px solid #eeeeee",
              color: "#333333",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f8f8f8" },
              "&:focus-visible": {
                outline: "2px solid #9A2529",
                outlineOffset: "-2px",
              },
            }}
          >
            {!isCollapsed && (
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Bulk Upload
              </Typography>
            )}
          </Box>


          {/* ===================================================
              ALL CASES
             =================================================== */}

          <Box
            onClick={() => handleTaskSelect("ALL_CASES")}
            sx={{
              height: "40px",

              display: "flex",

              alignItems: "center",

              justifyContent: isCollapsed ? "center" : "space-between",

              px: 1.5,

              cursor: "pointer",

              borderBottom: "1px solid #eeeeee",

              borderLeft:
                selectedTask ===
                  "ALL_CASES"
                  ? "3px solid #9A2529"
                  : "3px solid transparent",

              backgroundColor:
                selectedTask ===
                  "ALL_CASES"
                  ? "#fdf2f2"
                  : "transparent",

              color:
                selectedTask ===
                  "ALL_CASES"
                  ? "#9A2529"
                  : "#333333",

              "&:hover": {
                backgroundColor: "#f8f8f8",
              },
            }}
          >
            {isCollapsed ? (
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {getTwoCharacterInitials("ALL_CASES")}
              </Typography>
            ) : (
              <>
                <Typography
                  sx={{
                    fontSize: "11px",

                    fontWeight: 600,
                  }}
                >
                  All Cases
                </Typography>

                <Box
                  sx={{
                    minWidth: "24px",

                    height: "20px",

                    px: "5px",

                    borderRadius: "10px",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    backgroundColor:
                      selectedTask ===
                        "ALL_CASES"
                        ? "#9A2529"
                        : "#eeeeee",

                    color:
                      selectedTask ===
                        "ALL_CASES"
                        ? "#ffffff"
                        : "#555555",

                    fontSize: "10px",

                    fontWeight: 600,
                  }}
                >
                  {allCasesCount}
                </Box>
              </>
            )}
          </Box>

          {/* ===================================================
              TASKS
             =================================================== */}

          {menuItems.map((item) => renderTaskItem(item.label))}
        </Box>

        {/* =====================================================
            LAST LOGIN
           ===================================================== */}

        {!isCollapsed && (
          <Box
            sx={{
              flexShrink: 0,
              px: 1,
              py: 1,
              borderTop: "1px solid #eeeeee",
              backgroundColor: "#FFEAD7",
              
            }}
          >
            <LastLogin lastLogin={lastLoginAt} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LeftTask;
