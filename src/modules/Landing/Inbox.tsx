import {
  Box,
  Grid,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAppDispatch,
  useAppSelector,
} from "../../store/hooks";

import {
  fetchInboxThunk,
} from "../../store/thunks/inboxThunk";

import LeftTask from "./LeftTask";
import RightSideTable from "./RightSideTable";
import ApplicationWorkspace from "./ApplicationWorkspace";
import { getDRSPath } from "../../routes/routes";
import { useNavigate } from "react-router-dom";

interface InboxItem {
  id: string | number;
  [key: string]: unknown;
}

type PoolData = Record<string, InboxItem[]>;

interface RoleSection {
  key: string;
  label: string;
}

const ROLE_SECTIONS: Record<
  string,
  RoleSection[]
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

const Inbox1 = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ============================================================
  // AUTH
  // ============================================================

  const reduxUsername = useAppSelector(
    (state) =>
      state.api.auth.credentials?.username ?? "",
  );

  const reduxPassword = useAppSelector(
    (state) =>
      state.api.auth.credentials?.password ?? "",
  );

  const roles = useAppSelector(
    (state) =>
      state.api.auth.credentials?.roles ?? [],
  );

  // ============================================================
  // INBOX DATA
  // ============================================================

  const poolData = useAppSelector(
    (state) =>
      state.inbox.data?.poolData ?? {},
  ) as PoolData;

  // ============================================================
  // LOCAL STATE
  // ============================================================

  const [
    isCollapsed,
    setIsCollapsed,
  ] = useState(false);

  const [
    isRolesOpen,
    setIsRolesOpen,
  ] = useState(true);

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<string | null>(null);

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<string | null>(null);

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState<Record<
    string,
    unknown
  > | null>(null);

  // ============================================================
  // LOGIN
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
  // TASK MENU
  // ============================================================

  const menuItems = useMemo(
    () =>
      Object.keys(poolData)
        .sort((a, b) =>
          a.localeCompare(b),
        )
        .map((key) => ({
          label: key,
          icon: "📂",
        })),
    [poolData],
  );

  // ============================================================
  // ALL CASES
  // ============================================================
  //
  // Combine every pool into one array.
  //
  // poolName is added to each record so we know
  // which pool the case belongs to.
  //
  // ============================================================

  const allCases = useMemo(() => {
    return Object.entries(poolData).flatMap(
      ([poolName, cases]) =>
        Array.isArray(cases)
          ? cases.map((item) => ({
            ...item,
            poolName,
          }))
          : [],
    );
  }, [poolData]);

  // ============================================================
  // ACTIVE TASK
  // ============================================================
  //
  // No setState/useEffect is required here.
  //
  // When API data is available and there is no explicit
  // selection, ALL_CASES automatically becomes active.
  //
  // ============================================================

  const activeTask =
    selectedTask ??
    (menuItems.length > 0
      ? "ALL_CASES"
      : null);

  // ============================================================
  // ACTIVE ROLE
  // ============================================================
  //
  // If a task is active, task selection takes priority
  // over role selection.
  //
  // ============================================================

  const activeRole = activeTask
    ? null
    : selectedRole ??
    (roles.length > 0
      ? roles[0]
      : null);

  // ============================================================
  // SELECTED TASK DATA
  // ============================================================
  //
  // ALL_CASES
  //     -> records from every pool
  //
  // CVT_TASK
  //     -> only CVT_TASK records
  //
  // CPT_TASK
  //     -> only CPT_TASK records
  //
  // ============================================================

  const selectedTaskData = useMemo(() => {
    if (activeTask === "ALL_CASES") {
      return allCases;
    }

    if (activeTask) {
      const taskCases =
        poolData[activeTask] ?? [];

      return taskCases.map((item) => ({
        ...item,
        poolName: activeTask,
      }));
    }

    return [];
  }, [
    activeTask,
    allCases,
    poolData,
  ]);

  // ============================================================
  // APPLICATION SECTIONS
  // ============================================================

  const applicationSections =
    activeTask &&
      activeTask !== "ALL_CASES"
      ? ROLE_SECTIONS[activeTask] ?? []
      : [];

  // ============================================================
  // FETCH INBOX
  // ============================================================

  useEffect(() => {
    if (
      !effectiveUsername ||
      !effectivePassword
    ) {
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
  // ROLE CLICK
  // ============================================================

  const handleRoleSelect = (
    role: string,
  ) => {
    console.log(
      "ROLE CLICKED:",
      role,
    );

    setSelectedRole(role);
    setSelectedTask(null);
    setSelectedApplication(null);
  };

  // ============================================================
  // TASK CLICK
  // ============================================================

  const handleTaskSelect = (
    task: string,
  ) => {
    setSelectedTask(task);
    setSelectedRole(null);
    setSelectedApplication(null);
  };

  // ============================================================
  // APPLICATION CLICK
  // ============================================================

  const handleApplicationClick = (
    application: Record<string, unknown>,
  ) => {
    console.log('application', application)
    const applicationNo = application.applicationNo as string;
    const targetBusinessType =
      application.businessType as string;

    const drsPath = getDRSPath(
      targetBusinessType,
      applicationNo,
    );

    if (drsPath) {
      navigate(drsPath, {
        state: {
          application: application
        }
      });
    }
  };

  // ============================================================
  // APPLICATION BACK
  // ============================================================

  const handleApplicationBack =
    () => {
      setSelectedApplication(
        null,
      );
    };

  // ============================================================
  // SIDEBAR
  // ============================================================

  const handleToggleCollapse =
    () => {
      setIsCollapsed(
        (previous) =>
          !previous,
      );
    };

  const handleToggleRoles =
    () => {
      setIsRolesOpen(
        (previous) =>
          !previous,
      );
    };

  // ============================================================
  // APPLICATION WORKSPACE
  // ============================================================

  if (selectedApplication) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "91vh",
          backgroundColor:
            "#f5f7fa",
        }}
      >
        <ApplicationWorkspace
          application={
            selectedApplication
          }
          sections={
            applicationSections
          }
          onBack={
            handleApplicationBack
          }
        />
      </Box>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <Box
    // sx={{
    //   width: "100%",
    //   height: "100%",
    // }}
    >
      {/* <Grid
        container
        sx={{
          flexWrap: "nowrap",
          height: "91vh",
          minHeight: 0,
        }}
      > */}
      <Grid container sx={{ flexWrap: "nowrap" }}>
        {/* ================================================== */}
        {/* LEFT SIDE */}
        {/* ================================================== */}

        <LeftTask
          roles={roles}
          menuItems={menuItems}
          selectedRole={activeRole}
          selectedTask={activeTask}
          isRolesOpen={isRolesOpen}
          isCollapsed={isCollapsed}
          lastLoginAt={lastLoginAt}
          poolData={poolData}
          onRoleSelect={
            handleRoleSelect
          }
          onTaskSelect={
            handleTaskSelect
          }
          onToggleRoles={
            handleToggleRoles
          }
          onToggleCollapse={
            handleToggleCollapse
          }
        />

        {/* ================================================== */}
        {/* RIGHT SIDE */}
        {/* ================================================== */}

        {/* <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            p: 0,
            overflow: "hidden",
            backgroundColor: "#f5f7fa",
          }}
        > */}
        <Box sx={{ flex: 1 }}>
          <RightSideTable
            selectedRole={activeRole}
            selectedTask={activeTask}
            selectedTaskData={selectedTaskData}
            selectedApplication={selectedApplication}
            onApplicationClick={handleApplicationClick}
            onApplicationBack={handleApplicationBack}
          />
        </Box>
        {/* </Box> */}
      </Grid>
    </Box>
  );
};

export default Inbox1;