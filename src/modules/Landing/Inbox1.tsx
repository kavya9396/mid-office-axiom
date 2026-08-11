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

interface InboxItem {
  id: string | number;
  [key: string]: unknown;
}

type PoolData = Record<
  string,
  InboxItem[]
>;

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

  // ============================================================
  // AUTH
  // ============================================================

  const reduxUsername =
    useAppSelector(
      (state) =>
        state.api.auth.credentials
          ?.username ?? "",
    );

  const reduxPassword =
    useAppSelector(
      (state) =>
        state.api.auth.credentials
          ?.password ?? "",
    );

  const roles =
    useAppSelector(
      (state) =>
        state.api.auth.credentials
          ?.roles ?? [],
    );

  // ============================================================
  // INBOX DATA
  // ============================================================

  const poolData =
    useAppSelector(
      (state) =>
        state.inbox.data?.poolData ??
        {},
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

  /*
   * IMPORTANT
   *
   * null means:
   * nothing has been explicitly selected yet.
   *
   * Once the user clicks a task:
   *
   * selectedRole = null
   * selectedTask = clicked task
   *
   * Once the user clicks a role:
   *
   * selectedRole = clicked role
   * selectedTask = null
   */

  const [
    selectedRole,
    setSelectedRole,
  ] =
    useState<string | null>(null);

  const [
    selectedTask,
    setSelectedTask,
  ] =
    useState<string | null>(null);

  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState<Record<
      string,
      unknown
    > | null>(null);

  // ============================================================
  // LOGIN
  // ============================================================

  const effectiveUsername =
    reduxUsername ||
    localStorage.getItem(
      "username",
    ) ||
    "";

  const effectivePassword =
    reduxPassword ||
    localStorage.getItem(
      "password",
    ) ||
    "";

  const lastLoginAt =
    localStorage.getItem(
      "lastLoginAt",
    ) ?? "";

  // ============================================================
  // TASKS
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
  // DEFAULT SELECTION
  // ============================================================
  //
  // IMPORTANT:
  //
  // DO NOT do:
  //
  // selectedRole ?? roles[0]
  //
  // because when selectedRole is null after clicking
  // a task, it would immediately select roles[0] again.
  //
  // Instead:
  //
  // - if user has not selected anything -> first role
  // - if task is selected -> role stays null
  // - if role is selected -> task stays null
  // ============================================================

  const hasExplicitSelection =
    selectedRole !== null ||
    selectedTask !== null;

  const defaultRole =
    !hasExplicitSelection &&
    roles.length > 0
      ? roles[0]
      : null;

  const activeRole =
    selectedRole ??
    defaultRole;

  // ============================================================
  // ACTIVE TASK
  // ============================================================

  const activeTask =
    selectedTask;

  // ============================================================
  // ACTIVE MENU
  // ============================================================
  //
  // Only a TASK can create an active menu.
  //
  // If a role is active, activeMenu is null.
  // ============================================================

  const activeMenu =
    activeTask &&
    menuItems.some(
      (item) =>
        item.label === activeTask,
    )
      ? activeTask
      : null;

  // ============================================================
  // TASK DATA
  // ============================================================

  const selectedTaskData =
    activeMenu
      ? poolData[activeMenu] ?? []
      : [];

  // ============================================================
  // APPLICATION SECTIONS
  // ============================================================

  const applicationSections =
    activeMenu
      ? ROLE_SECTIONS[
          activeMenu
        ] ?? []
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
        username:
          effectiveUsername,
        password:
          effectivePassword,
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

    /*
     * Role becomes active.
     */
    setSelectedRole(role);

    /*
     * Task MUST be cleared.
     */
    setSelectedTask(null);

    /*
     * Close application workspace.
     */
    setSelectedApplication(null);
  };

  // ============================================================
  // TASK CLICK
  // ============================================================

  const handleTaskSelect = (
    task: string,
  ) => {
    console.log(
      "TASK CLICKED:",
      task,
    );

    /*
     * Task becomes active.
     */
    setSelectedTask(task);

    /*
     * VERY IMPORTANT:
     *
     * Clear role.
     *
     * This allows RightSideTable to render
     * DynamicRoleTable.
     */
    setSelectedRole(null);

    /*
     * Close application workspace.
     */
    setSelectedApplication(null);
  };

  // ============================================================
  // APPLICATION CLICK
  // ============================================================

  const handleApplicationClick = (
    application: Record<
      string,
      unknown
    >,
  ) => {
    setSelectedApplication(
      application,
    );
  };

  // ============================================================
  // APPLICATION BACK
  // ============================================================

  const handleApplicationBack =
    () => {
      setSelectedApplication(null);
    };

  // ============================================================
  // SIDEBAR
  // ============================================================

  const handleToggleCollapse =
    () => {
      setIsCollapsed(
        (previous) => !previous,
      );
    };

  const handleToggleRoles =
    () => {
      setIsRolesOpen(
        (previous) => !previous,
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
          height: "90vh",
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
        {/* ================================================== */}
        {/* LEFT SIDE */}
        {/* ================================================== */}

        <LeftTask
          roles={roles}
          menuItems={menuItems}
          selectedRole={activeRole}
          selectedTask={activeTask}
          isRolesOpen={
            isRolesOpen
          }
          isCollapsed={
            isCollapsed
          }
          lastLoginAt={
            lastLoginAt
          }
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
          <RightSideTable
  selectedRole={activeRole}
  selectedTask={activeTask}
  selectedTaskData={selectedTaskData}
  selectedApplication={selectedApplication}
  onApplicationClick={handleApplicationClick}
  onApplicationBack={handleApplicationBack}
/>
        </Box>
      </Grid>
    </Box>
  );
};

export default Inbox1;