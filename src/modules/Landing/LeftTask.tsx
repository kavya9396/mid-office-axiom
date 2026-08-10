import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import {
  KeyRightArrowIcon,
} from "../../icons/Icons";

import LastLogin from "./LastLogin";
import type { MenuItem } from "../../types/inboxTypes";
import { toDisplayLabel } from "../../utils/inboxUtils";



interface LeftTaskProps {
  roles: string[];

  menuItems: MenuItem[];

  selectedRole: string | null;

  selectedTask: string | null;

  isRolesOpen: boolean;

  isCollapsed: boolean;

  lastLoginAt: string;

  onRoleSelect: (
    role: string,
  ) => void;

  onTaskSelect: (
    task: string,
  ) => void;

  onToggleRoles: () => void;

  onToggleCollapse: () => void;
}

const LeftTask = ({
  roles,
  menuItems,
  selectedRole,
  selectedTask,
  isRolesOpen,
  isCollapsed,
  lastLoginAt,
  onRoleSelect,
  onTaskSelect,
  onToggleRoles,
  onToggleCollapse,
}: LeftTaskProps) => {
  return (
    <Box
      sx={{
        width: isCollapsed
          ? "60px"
          : "220px",

        flexShrink: 0,

        height: "100%",

        transition:
          "width 0.25s ease",

        overflow: "hidden",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          height: "100%",

          display: "flex",

          flexDirection:
            "column",

          overflow: "hidden",

          borderRight:
            "1px solid #e5e7eb",

          borderRadius: 0,

          backgroundColor:
            "#ffffff",
        }}
      >
        {/* =========================================
            COLLAPSE BUTTON
           ========================================= */}

        <Box
          onClick={
            onToggleCollapse
          }
          sx={{
            height: "40px",

            minHeight: "40px",

            display: "flex",

            alignItems: "center",

            justifyContent:
              isCollapsed
                ? "center"
                : "flex-end",

            px: 1.5,

            cursor: "pointer",

            borderBottom:
              "1px solid #eeeeee",
          }}
        >
          <KeyRightArrowIcon
            style={{
              color: "#9A2529",

              transform:
                isCollapsed
                  ? "rotate(0deg)"
                  : "rotate(180deg)",

              transition:
                "transform 0.25s ease",
            }}
          />
        </Box>

        {/* =========================================
            NAVIGATION
           ========================================= */}

        <Box
          sx={{
            flex: 1,

            minHeight: 0,

            overflowY: "auto",

            overflowX: "hidden",

            "&::-webkit-scrollbar":
              {
                width: "5px",
              },

            "&::-webkit-scrollbar-thumb":
              {
                backgroundColor:
                  "#cccccc",

                borderRadius:
                  "10px",
              },
          }}
        >
          {/* =======================================
              ROLES
             ======================================= */}

          {roles.length > 0 && (
            <Box
              sx={{
                borderBottom:
                  "1px solid #eeeeee",
              }}
            >
              <Box
                onClick={
                  onToggleRoles
                }
                sx={{
                  height: "38px",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    isCollapsed
                      ? "center"
                      : "space-between",

                  px: 1.5,

                  cursor: "pointer",

                  "&:hover": {
                    backgroundColor:
                      "#f8f8f8",
                  },
                }}
              >
                {isCollapsed ? (
                  <Typography
                    sx={{
                      fontSize:
                        "16px",
                    }}
                  >
                    👥
                  </Typography>
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontSize:
                          "11px",

                        fontWeight:
                          700,

                        color:
                          "#333333",
                      }}
                    >
                      User Handle
                    </Typography>

                    <Typography
                      sx={{
                        fontSize:
                          "10px",

                        color:
                          "#777777",
                      }}
                    >
                      {isRolesOpen
                        ? "▲"
                        : "▼"}
                    </Typography>
                  </>
                )}
              </Box>

              {/* ROLE LIST */}

              {!isCollapsed &&
                isRolesOpen &&
                roles.map(
                  (role) => {
                    const isActive =
                      selectedRole ===
                      role;

                    return (
                      <Box
                        key={role}
                        onClick={() =>
                          onRoleSelect(
                            role,
                          )
                        }
                        sx={{
                          height:
                            "34px",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          px: 2.5,

                          cursor:
                            "pointer",

                          borderLeft:
                            isActive
                              ? "3px solid #9A2529"
                              : "3px solid transparent",

                          backgroundColor:
                            isActive
                              ? "#fdf2f2"
                              : "transparent",

                          color:
                            isActive
                              ? "#9A2529"
                              : "#555555",

                          "&:hover":
                            {
                              backgroundColor:
                                "#f8f8f8",
                            },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize:
                              "11px",

                            fontWeight:
                              isActive
                                ? 600
                                : 400,
                          }}
                        >
                          {toDisplayLabel(
                            role,
                          )}
                        </Typography>
                      </Box>
                    );
                  },
                )}
            </Box>
          )}

          {/* =======================================
              TASKS
             ======================================= */}

          {menuItems.map(
            (item) => {
              const isActive =
                selectedTask ===
                item.label;

              return (
                <Box
                  key={item.label}
                  onClick={() =>
                    onTaskSelect(
                      item.label,
                    )
                  }
                  sx={{
                    height: "38px",

                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      isCollapsed
                        ? "center"
                        : "flex-start",

                    px: 1.5,

                    cursor:
                      "pointer",

                    borderLeft:
                      isActive
                        ? "3px solid #9A2529"
                        : "3px solid transparent",

                    backgroundColor:
                      isActive
                        ? "#fdf2f2"
                        : "transparent",

                    color:
                      isActive
                        ? "#9A2529"
                        : "#333333",

                    "&:hover": {
                      backgroundColor:
                        "#f8f8f8",
                    },
                  }}
                >
                  {isCollapsed ? (
                    <Typography>
                      📂
                    </Typography>
                  ) : (
                    <Typography
                      sx={{
                        fontSize:
                          "11px",

                        fontWeight:
                          isActive
                            ? 600
                            : 400,
                      }}
                    >
                      {toDisplayLabel(
                        item.label,
                      )}
                    </Typography>
                  )}
                </Box>
              );
            },
          )}
        </Box>

        {/* =========================================
            LAST LOGIN
           ========================================= */}

        {!isCollapsed && (
          <Box
            sx={{
              flexShrink: 0,

              px: 1,

              py: 1,

              borderTop:
                "1px solid #eeeeee",
            }}
          >
            <LastLogin
              lastLogin={
                lastLoginAt
              }
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LeftTask;