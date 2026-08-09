import { Box, Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { KeyRightArrowIcon } from "../../icons/Icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchInboxThunk } from "../../store/thunks/inboxThunk";
import LastLogin from "./LastLogin";
import DynamicRoleTable from "./DynamicRoleTable";
import ApplicationWorkspace from "./ApplicationWorkspace";

interface InboxItem {
  id: string | number;
  [key: string]: unknown;
}

type PoolData = Record<string, InboxItem[]>;
const ROLE_SECTIONS: Record<
  string,
  {
    key: string;
    label: string;
  }[]
> = {
  CVT_TASK: [
     {
      key: "drsSummary",
      label: "DRS Summary",
    },
    {
      key: "breDecision1",
      label: "BRE Decision",
    },
    {
      key: "summary",
      label: "Summary",
    },
    {
      key: "applicationOverview1",
      label: "Application Overview",
    },
    {
      key: "pivvSection",
      label: "PIVV Section",
    },
    {
      key: "requirementManagement",
      label: "Requirement Management",
    },
    {
      key: "decision",
      label: "Decision",
    },
    {
      key: "quickLinks",
      label: "Quick Links",
    },
  ],
};


const UPPERCASE_LABEL_PARTS = new Set([
  "ACCUITY",
  "AMR",
  "CMO",
  "COPS",
  "CPT",
  "CUW",
  "CVT",
  "DVT",
  "ECG",
  "GOPS",
  "GUW",
  "HOD",
  "IT",
  "MMT",
  "MR",
  "NMR",
  "PIVV",
  "RI",
  "SR",
  "SUW",
  "TMT",
  "UW",
]);

const toDisplayLabel = (value: string): string =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      const upperPart = part.toUpperCase();

      if (UPPERCASE_LABEL_PARTS.has(upperPart)) {
        return upperPart;
      }

      return (
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
      );
    })
    .join(" ");

const Inbox1 = () => {
  const dispatch = useAppDispatch();

  // ============================================================
  // AUTH
  // ============================================================

  const reduxUsername = useAppSelector(
    (state) => state.api.auth.credentials?.username ?? "",
  );

  const reduxPassword = useAppSelector(
    (state) => state.api.auth.credentials?.password ?? "",
  );

  const roles = useAppSelector(
    (state) => state.api.auth.credentials?.roles ?? [],
  );

  // ============================================================
  // INBOX DATA
  // ============================================================

  const poolData = useAppSelector(
    (state) => state.inbox.data?.poolData ?? {},
  ) as PoolData;

  // ============================================================
  // LOCAL STATE
  // ============================================================

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState("");

  const [isRolesOpen, setIsRolesOpen] = useState(true);
  const [selectedApplication, setSelectedApplication] =
  useState<Record<string, unknown> | null>(null);

  // ============================================================
  // LOGIN DETAILS
  // ============================================================

  const effectiveUsername =
    reduxUsername ||
    localStorage.getItem("username") ||
    "";

  const effectivePassword =
    reduxPassword ||
    localStorage.getItem("password") ||
    "";

  const lastLoginAt =
    localStorage.getItem("lastLoginAt") ?? "";

  // ============================================================
  // SIDEBAR ITEMS
  // ============================================================

  /**
   * poolData keys are the task/pool names.
   *
   * Example:
   *
   * RISK_TASK
   * CPT_DATA_ENTRY_NMR_TASK
   */

  const menuItems = Object.keys(poolData)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      label: key,
      icon: "📂",
    }));

  // ============================================================
  // ACTIVE MENU
  // ============================================================

const activeMenu =
  selectedMenu &&
  menuItems.some(
    (item) => item.label === selectedMenu,
  )
    ? selectedMenu
    : menuItems[0]?.label || "";
  // ============================================================
  // SELECTED TASK DATA
  // ============================================================

  const selectedTaskData =
    activeMenu
      ? poolData[activeMenu] ?? []
      : [];
const applicationSections =
  ROLE_SECTIONS[activeMenu] ?? [];
  // ============================================================
  // FETCH INBOX
  // ============================================================

  useEffect(() => {
    if (!effectiveUsername || !effectivePassword) {
      return;
    }

    dispatch(
      fetchInboxThunk({
        username: effectiveUsername,
        password: effectivePassword,
      }),
    );
  }, [
    dispatch,
    effectiveUsername,
    effectivePassword,
  ]);

  // ============================================================
  // AUTO SELECT FIRST MENU
  // ============================================================

  // useEffect(() => {
  //   if (
  //     !selectedMenu &&
  //     menuItems.length > 0
  //   ) {
  //     setSelectedMenu(
  //       menuItems[0].label,
  //     );
  //   }
  // }, [
  //   selectedMenu,
  //   menuItems,
  // ]);

  // ============================================================
  // RESET SELECTED MENU IF API DATA CHANGES
  // ============================================================

  // useEffect(() => {
  //   if (
  //     selectedMenu &&
  //     menuItems.length > 0 &&
  //     !menuItems.some(
  //       (item) =>
  //         item.label === selectedMenu,
  //     )
  //   ) {
  //     setSelectedMenu(
  //       menuItems[0].label,
  //     );
  //   }
  // }, [
  //   selectedMenu,
  //   menuItems,
  // ]);

  // ============================================================
  // RENDER
  // ============================================================
if (selectedApplication) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "90vh",
        p: 2,
        backgroundColor: "#f5f7fa",
      }}
    >
      <ApplicationWorkspace
        application={selectedApplication}
        sections={applicationSections}
        onBack={() =>
          setSelectedApplication(null)
        }
      />
    </Box>
  );
}

  return (
    
    <Box
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <Grid
        container
        sx={{
          flexWrap: "nowrap",
          height: "90vh",
          minHeight: 0,
        }}
      >
        {/* ==================================================== */}
        {/* LEFT SIDEBAR */}
        {/* ==================================================== */}

        <Box
          sx={{
            width: isCollapsed
              ? "70px"
              : "220px",

            flexShrink: 0,

            height: "100%",

            transition:
              "width 0.3s ease",

            backgroundColor: "#fff",

            overflow: "hidden",
          }}
        >
          <Paper
            sx={{
              height: "100%",

              display: "flex",

              flexDirection: "column",

              overflow: "hidden",
            }}
          >
            {/* ================================================= */}
            {/* COLLAPSE BUTTON */}
            {/* ================================================= */}

            <Box
              onClick={() =>
                setIsCollapsed(
                  (prev) => !prev,
                )
              }
              sx={{
                height: "40px",

                minHeight: "40px",

                display: "flex",

                justifyContent:
                  isCollapsed
                    ? "center"
                    : "flex-end",

                alignItems: "center",

                px: 2,

                cursor: "pointer",

                borderBottom:
                  "1px solid #eee",
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
                    "transform 0.3s ease",
                }}
              />
            </Box>

            {/* ================================================= */}
            {/* SIDEBAR SCROLL AREA */}
            {/* ================================================= */}

            <Box
              sx={{
                flex: 1,

                minHeight: 0,

                overflowY: "auto",

                overflowX: "hidden",

                "&::-webkit-scrollbar": {
                  width: "6px",
                },

                "&::-webkit-scrollbar-thumb": {
                  backgroundColor:
                    "#c7c7c7",

                  borderRadius: "10px",
                },

                "&::-webkit-scrollbar-track": {
                  backgroundColor:
                    "#f5f5f5",
                },
              }}
            >
              {/* ============================================== */}
              {/* USER ROLES */}
              {/* ============================================== */}

              {roles.length > 0 && (
                <Box
                  sx={{
                    borderBottom:
                      "1px solid #eee",
                  }}
                >
                  {/* ------------------------------------------ */}
                  {/* USER HANDLE HEADER */}
                  {/* ------------------------------------------ */}

                  <Box
                    onClick={() =>
                      setIsRolesOpen(
                        (prev) => !prev,
                      )
                    }
                    sx={{
                      display: "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        isCollapsed
                          ? "center"
                          : "space-between",

                      px: 2,

                      py: 1.2,

                      cursor: "pointer",

                      color: "#333",

                      "&:hover": {
                        backgroundColor:
                          "#f8f8f8",
                      },
                    }}
                  >
                    {isCollapsed ? (
                      <Typography
                        sx={{
                          fontSize: "18px",
                        }}
                      >
                        👥
                      </Typography>
                    ) : (
                      <>
                        <Typography
                          sx={{
                            fontSize:
                              "12px",

                            fontWeight: 700,
                          }}
                        >
                          User Handle
                        </Typography>

                        <Typography
                          sx={{
                            fontSize:
                              "12px",
                          }}
                        >
                          {isRolesOpen
                            ? "▲"
                            : "▼"}
                        </Typography>
                      </>
                    )}
                  </Box>

                  {/* ------------------------------------------ */}
                  {/* ROLE ITEMS */}
                  {/* ------------------------------------------ */}

                  {!isCollapsed &&
                    isRolesOpen &&
                    roles.map((role) => (
                      <Box
                        key={role}
                        sx={{
                          pl: 4,

                          pr: 2,

                          py: 1,

                          color:
                            "#777",

                          backgroundColor:
                            "transparent",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize:
                              "11px",

                            fontWeight:
                              400,
                          }}
                        >
                          {toDisplayLabel(
                            role,
                          )}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              )}

              {/* ============================================== */}
              {/* POOL / TASK ITEMS */}
              {/* ============================================== */}

              {menuItems.map(
                (item) => {
                  const isActive =
                    activeMenu ===
                    item.label;

                  return (
                    <Box
                      key={item.label}
                      onClick={() =>
                        setSelectedMenu(
                          item.label,
                        )
                      }
                      sx={{
                        display: "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          isCollapsed
                            ? "center"
                            : "flex-start",

                        px: 2,

                        py: 1.2,

                        cursor:
                          "pointer",

                        color: isActive
                          ? "#9A2529"
                          : "#333",

                        backgroundColor:
                          isActive
                            ? "#fdf2f2"
                            : "transparent",

                        borderLeft:
                          isActive
                            ? "3px solid #9A2529"
                            : "3px solid transparent",

                        "&:hover": {
                          backgroundColor:
                            "#f8f8f8",
                        },
                      }}
                    >
                      {isCollapsed ? (
                        <Box>
                          {item.icon}
                        </Box>
                      ) : (
                        <Typography
                          sx={{
                            fontSize:
                              "12px",

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

            {/* ================================================= */}
            {/* LAST LOGIN */}
            {/* ================================================= */}

            {!isCollapsed && (
              <Box
                sx={{
                  flexShrink: 0,

                  py: 1.5,

                  px: 1,

                  borderTop:
                    "1px solid #eee",

                  backgroundColor:
                    "#fff",

                  width: "100%",
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

        {/* ==================================================== */}
        {/* RIGHT SIDE */}
        {/* ==================================================== */}

        <Box
          sx={{
            flex: 1,

            minWidth: 0,

            height: "100%",

            p: 2,

            overflow: "hidden",

            backgroundColor:
              "#f5f7fa",
          }}
        >
          {activeMenu ? (
           <DynamicRoleTable
  title={`${toDisplayLabel(
    activeMenu,
  )} Details`}
  data={selectedTaskData}
  onApplicationClick={(application) => {
    console.log(
      "Selected Application:",
      application,
    );

    setSelectedApplication(application);
  }}
/>
          ) : (
            <Paper
              elevation={0}
              sx={{
                height: "100%",

                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                border:
                  "1px solid #e5e7eb",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",

                  color: "#777",
                }}
              >
                No task pool
                available
              </Typography>
            </Paper>
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default Inbox1;
