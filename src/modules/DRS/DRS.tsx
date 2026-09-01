import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";

import {
  accordionRegistry,
  DRS_LAYOUTS,
  getPoolWiseAvailableAccordions,
} from "./drs-layouts";

import { drsThunk } from "../../store/thunks/drsThunk";
import { breThunk } from "../../store/thunks/breThunk";
import { completeTaskThunk } from "../../store/thunks/completeTaskThunk";
import type {
  AppDispatch,
  RootState,
} from "../../store/store";
import BackButton from "../../components/layout/BackButton";
import CustomButton from "../../components/ui/Button/Button";
import { title } from "../../utils/constant";
import { getInboxPath } from "../../routes/routes";
import { preloginThunk } from "../../store/thunks/preloginThunk";

interface ApplicationRow {
  applicationNo?: string;
  businessType?: string;
  roleType?: string;
  userId?: string;
  taskId?: string;
  instanceId?: string;
  decision?: string;
  remarks?: string;
  [key: string]: unknown;
}

interface SelectedCaseContext {
  applicationNo?: string;
  userId?: string;
  businessType?: string;
  roleType?: string;
  taskId?: string;
  instanceId?: string;
  taskCompositeId?: string;
  source?: string;
  readOnly?: boolean;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const mapper = {
  CMO_TASK: "RETAIL_CMO_POOL",
  CUW_TASK: "RETAIL_CUW_POOL",
  CVT_TASK: "CVT_TASK",
  CPT_TASK: "RETAIL_CPT_POOL",
  HOD_TASK: "RETAIL_HOD_POOL",
  SR_UW_TASK: "RETAIL_SR_UW_POOL",
  READY_FOR_ISSUANCE_TASK: "RETAIL_READY_FOR_ISSUANCE_POOL",
  SYSTEM_WAIT_POOL_AMR_NON_MEDICAL:
    "RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL",
  AMR_NON_MEDICAL_TASK: "RETAIL_AMR_NON_MEDICAL",
  RECONSIDERATION_TASK: "RETAIL_RECONSIDERATION_POOL",
  PRE_ISSUANCE_SERVICING_TASK:
    "RETAIL_PRE_ISSUANCE_SERVICING_POOL",
  POST_ISSUANCE_TASK: "POST_ISSUANCE_TASK",
  EXCEPTIONAL_TASK: "RETAIL_EXCEPTIONAL_POOL",
  PIVV_TASK: "PIVV_TASK",
  DVT_TASK: "GROUP_DVT_POOL",
  GUW_TASK: "GROUP_GUW_POOL",
  MMT_TASK: "GROUP_MMT_POOL",
  SUW_TASK: "RETAIL_SUW_POOL",
  VENDOR_CMO_TASK: "RETAIL_VENDOR_CMO_POOL",
  COPS_TASK: "RETAIL_COPS_POOL",
  IT_TASK: "RETAIL_IT_POOL",
  SYSTEM_WAIT_POOL_AMR_MEDICAL:
    "RETAIL_SYSTEM_WAIT_POOL_AMR_MEDICAL",
  RI_TASK: "RETAIL_REINSURER_POOL",
  REQUIREMENT_POOL: "RETAIL_REQUIREMENT_REVIEW_POOL",
  CUW_CLAIM_AUDIT_TASK: "RETAIL_CUW_CLAIM_AUDIT",
  ACCUITY_TASK_: "RETAIL_ACCUITY_USER",
  ECG_TASK: "RETAIL_ECG_POOL",
  TMT_TASK: "RETAIL_TMT_POOL",
  GRIEVANCE_TASK: "RETAIL_GRIEVANCE_POOL",
  REJECT_TASK: "RETAIL_REJECT_POOL",
  GUW_FORMAL_TASK: "GUW_FORMAL_TASK",
  DVT_FORMAL_TASK: "DVT_FORMAL_TASK",
  RISK_TASK: "RISK_TASK",
  PRE_LOGIN_CUW_TASK: "PRE_LOGIN_CUW_TASK",
  AMR_MEDICAL_TASK: "AMR_MEDICAL_TASK",
  ACCUITY_TASK: "ACCUITY_TASK",
  ISSUANCE_TASK: "ISSUANCE_TASK",
  CPT_DATA_ENTRY_MR_TASK: "CPT_DATA_ENTRY_MR_TASK",
  CPT_DATA_ENTRY_NMR_TASK: "CPT_DATA_ENTRY_NMR_TASK",
} as const;

const SUMMARY_SECTION_ROLES = new Set([
  "CPT_DATA_ENTRY_NMR_TASK",
  "CPT_DATA_ENTRY_MR_TASK",
  "PIVV_TASK",
]);

const getSelectedCaseContext = (): SelectedCaseContext => {
  try {
    const value = localStorage.getItem("selectedCaseContext");

    return value
      ? (JSON.parse(value) as SelectedCaseContext)
      : {};
  } catch {
    return {};
  }
};

const normalizeTaskId = (value: string): string => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "";
  }

  const parts = normalizedValue.split(".");
  return parts.at(-1)?.trim() ?? normalizedValue;
};

const isBrowserRefresh = (): boolean => {
  const [navigationEntry] = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[];

  return navigationEntry?.type === "reload";
};

const normalizeAccordionId = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

const isUwToolkitAccordion = (accordionId: string): boolean =>
  normalizeAccordionId(accordionId) === "uwtoolkit";

const isQuickLinksAccordion = (accordionId: string): boolean =>
  normalizeAccordionId(accordionId).includes("quicklink");

const SUMMARY_VIEW_ID = "__summary__";

const getAccordionLabel = (accordionId: string): string => {
  const labels: Record<string, string> = {
    applicantprofile: "Applicant Profile",
    applicationoverview: "Application Overview",
    requirementmanagement: "Requirement Management",
    requirementcategoryinfo: "Requirement Category Info",
    latestbredecision: "BRE Decision",
    uwtoolkit: "Decision",
    uwdecision: "Decision",
    riskanalytics: "Risk Analytics",
    audittrail: "Audit Trail",
  };
  const normalizedId = normalizeAccordionId(accordionId);

  return labels[normalizedId] ?? accordionId
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const normalizeValue = (value: unknown): string =>
  String(value ?? "").trim().toUpperCase();

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getNestedData = (value: unknown): Record<string, unknown> => {
  let current = toRecord(value);

  for (let depth = 0; depth < 4; depth += 1) {
    const nested = toRecord(current.data);

    if (Object.keys(nested).length === 0) {
      break;
    }

    current = nested;
  }

  return current;
};

const getRequirementRows = (value: unknown): Record<string, unknown>[] => {
  const payload = getNestedData(value);
  const requirements = payload.requirementManagement;

  return Array.isArray(requirements)
    ? requirements.map(toRecord)
    : [];
};

const getMiscItems = (value: unknown): Record<string, unknown>[] => {
  const payload = getNestedData(value);
  const misc = payload.misc;

  return Array.isArray(misc) ? misc.map(toRecord) : [];
};

const getFirstValue = (
  value: unknown,
  keys: string[],
): string => {
  const record = getNestedData(value);

  for (const key of keys) {
    const item = record[key];

    if (item !== undefined && item !== null && String(item).trim()) {
      return String(item);
    }
  }

  return "—";
};

const getAccordionByName = (
  accordionIds: string[],
  normalizedName: string,
): string | undefined =>
  accordionIds.find(
    (accordionId) =>
      normalizeAccordionId(accordionId) === normalizedName,
  );

const getActiveCptDecisionCode = (
  miscItems: Record<string, unknown>[],
  codes: string[],
): string => {
  const normalizedCodes = new Set(codes.map(normalizeValue));
  const item = miscItems.find(
    (masterItem) =>
      normalizeValue(masterItem.type) === "CPT" &&
      normalizeValue(masterItem.isActive) === "Y" &&
      normalizedCodes.has(normalizeValue(masterItem.code)),
  );

  return String(item?.code ?? "").trim();
};

const DRS = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const application = location.state?.application as
    | ApplicationRow
    | undefined;

  const drsData = useSelector(
    (state: RootState) => state.drs.data,
  );

  const masterData = useSelector(
    (state: RootState) => state.masterData,
  );

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccordionId, setSelectedAccordionId] = useState<string>("");
  const [expandedSummarySection, setExpandedSummarySection] = useState<
    "requirements" | "decision" | null
  >("requirements");

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const lastRequestKeyRef = useRef<string | null>(null);
  const isBrowserRefreshRef = useRef(isBrowserRefresh());

  const selectedCaseContext = useMemo(
    () => getSelectedCaseContext(),
    [],
  );

  const storedRoleType =
    localStorage.getItem("roleType")?.trim() ?? "";

  const roleType =
    application?.roleType?.trim() ||
    selectedCaseContext.roleType?.trim() ||
    storedRoleType;

  const layout = mapper[roleType as keyof typeof mapper];

  useEffect(() => {
    if (!application) {
      return;
    }

    const valuesToPersist = {
      applicationNo: application.applicationNo,
      userId: application.userId,
      businessType: application.businessType,
      roleType: application.roleType,
    };

    Object.entries(valuesToPersist).forEach(([key, value]) => {
      const normalizedValue = value?.trim();

      if (normalizedValue) {
        localStorage.setItem(key, normalizedValue);
      }
    });
  }, [application]);

  const layoutAccordions = useMemo(
    () => (layout ? DRS_LAYOUTS[layout] ?? [] : []),
    [layout],
  );

  const sections = useMemo(
    () =>
      Array.from(
        new Set([
          ...layoutAccordions.map(String),
          "requirementCategoryInfo",
          "latestBreDecision",
          ...(SUMMARY_SECTION_ROLES.has(roleType.toUpperCase())
            ? ["summary"]
            : []),
        ]),
      ),
    [layoutAccordions, roleType],
  );

  const applicationNo = String(
    application?.applicationNo ??
    selectedCaseContext.applicationNo ??
    localStorage.getItem("applicationNo") ??
    "",
  ).trim();

  const userId = String(
    application?.userId ??
    selectedCaseContext.userId ??
    localStorage.getItem("userId") ??
    localStorage.getItem("username") ??
    "",
  ).trim();

  const businessType = String(
    application?.businessType ??
    selectedCaseContext.businessType ??
    localStorage.getItem("businessType") ??
    "retail",
  )
    .trim()
    .toLowerCase();

  const eventName =
    businessType === "group"
      ? "BRE-GROUP"
      : "BRE-RETAIL";
      console.log('eventName',businessType,eventName)

  useEffect(() => {
    if (
      !applicationNo ||
      !userId ||
      !roleType
    ) {
      void Promise.resolve().then(() => {
        setIsPageLoading(false);
      });

      return;
    }

    const requestKey = [
      applicationNo,
      userId,
      roleType,
      businessType,
      sections.join(","),
    ].join("|");

    if (lastRequestKeyRef.current === requestKey) {
      return;
    }

    lastRequestKeyRef.current = requestKey;

    const loadPageData = async () => {
      setIsPageLoading(true);

      try {
        const requests: Promise<unknown>[] = [
          dispatch(
            drsThunk({
              applicationNo,
              userId,
              roleType,
              sections,
              businessType,
            }),
          ).unwrap(),
        ];

        // BRE is required only when entering the DRS page. On a browser
        // refresh, reuse the existing BRE data and fetch only the DRS data.
        if (!isBrowserRefreshRef.current) {
          requests.push(
            dispatch(
              breThunk({
                eventName,
                applicationNumber: applicationNo,
                businessType,
              }),
            ).unwrap(),
          );
        }

        if (roleType === "PRE_LOGIN_CUW_TASK") {
          requests.push(
            dispatch(
              preloginThunk({
                applicationNumber: applicationNo,
              }),
            ).unwrap(),
          );
        }

        await Promise.all(requests);
      } catch (error) {
        console.error("Failed to load application details:", error);
      } finally {
        if (
          lastRequestKeyRef.current === requestKey
        ) {
          setIsPageLoading(false);
        }
      }
    };

    void Promise.resolve().then(loadPageData);
  }, [
    dispatch,
    applicationNo,
    userId,
    roleType,
    businessType,
    sections,
    eventName,
  ]);

  const visibleAccordions = useMemo(
    () =>
      getPoolWiseAvailableAccordions(
        layout,
        drsData,
      ),
    [layout, drsData],
  );

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const rawTaskId = String(
      application?.taskId ??
      selectedCaseContext.taskId ??
      selectedCaseContext.taskCompositeId ??
      localStorage.getItem("taskId") ??
      localStorage.getItem("taskCompositeId") ??
      "",
    ).trim();

    const taskId = normalizeTaskId(rawTaskId);

    const instanceId = String(
      application?.instanceId ??
      selectedCaseContext.instanceId ??
      localStorage.getItem("instanceId") ??
      "",
    ).trim();

    if (!applicationNo || !userId) {
      setSnackbar({
        open: true,
        message: "Application number or user ID is missing.",
        severity: "error",
      });
      return;
    }

    if (!taskId || !instanceId) {
      setSnackbar({
        open: true,
        message: "Task ID or instance ID is missing.",
        severity: "error",
      });
      return;
    }

    let decision = "AMR";

    if (roleType === "CPT_DATA_ENTRY_NMR_TASK") {
      const requirementRows = getRequirementRows(drsData);
      const statuses = requirementRows.map((row) =>
        normalizeValue(row.status),
      );
      const hasPendingRequirement = statuses.includes("PENDING");
      const areAllRequirementsAccepted =
        statuses.length > 0 &&
        statuses.every((status) =>
          ["ACCEPT", "ACCEPTED"].includes(status),
        );
      const miscItems = getMiscItems(masterData);

      if (hasPendingRequirement) {
        decision = getActiveCptDecisionCode(miscItems, ["AMR"]);
      } else if (areAllRequirementsAccepted) {
        decision = getActiveCptDecisionCode(miscItems, [
          "CLS_TASK",
          "CLOSE_TASK",
        ]);
      } else {
        setSnackbar({
          open: true,
          message:
            requirementRows.length === 0
              ? "No requirements are available to submit."
              : "Every requirement must be either Pending or Accepted before submitting.",
          severity: "error",
        });
        return;
      }

      if (!decision) {
        setSnackbar({
          open: true,
          message: hasPendingRequirement
            ? "Active AMR decision is not configured for CPT in the misc master."
            : "Active close-task decision is not configured for CPT in the misc master.",
          severity: "error",
        });
        return;
      }
    }

    /*
     * These values are now guaranteed to be strings
     * because the missing-value checks have completed.
     */
    const payload = {
      businessType,
      requestContext: {
        taskId,
        userId,
        appNo: applicationNo,
        instanceId,
        remarks: "",
        decision,
      },
    };

    setIsSubmitting(true);

    try {
      // Complete-task is called only after BRE succeeds.
      await dispatch(
        breThunk({
          eventName,
          applicationNumber: applicationNo,
          businessType,
        }),
      ).unwrap();

      await dispatch(
        completeTaskThunk(payload),
      ).unwrap();

      setSnackbar({
        open: true,
        message: "Application submitted successfully.",
        severity: "success",
      });

      window.setTimeout(() => {
        navigate(getInboxPath());
      }, 800);
    } catch (error) {
      console.error(
        "Failed to submit application:",
        error,
      );

      setSnackbar({
        open: true,
        message:
          typeof error === "string"
            ? error
            : "Unable to submit the application. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmitButton = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 0.75,
        mb: 0.75,
      }}
    >
      <CustomButton
        onClick={handleSubmit}
        disabled={isSubmitting}
        sx={{
          minWidth: 170,
          borderRadius: "28px",
          bgcolor: "#ad252a",
          py: 0.65,
          textTransform: "none",
          fontSize: "13px",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            bgcolor: "#941f24",
            boxShadow: "none",
          }
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            minWidth: 110,
          }}
        >
          {isSubmitting && (
            <CircularProgress
              size={17}
              thickness={5}
              sx={{ color: "inherit" }}
            />
          )}

          {isSubmitting ? "Submitting..." : "Submit"}
        </Box>
      </CustomButton>
    </Box>
  );

  if (isPageLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "91vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          backgroundColor: "#f5f7fa",
        }}
      >
        <CircularProgress
          size={42}
          thickness={4}
          sx={{ color: "#f58220" }}
        />

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          Loading application details...
        </Typography>
      </Box>
    );
  }

  const hasUwToolkit = visibleAccordions.some(
    (accordionId) =>
      isUwToolkitAccordion(String(accordionId)),
  );
  const shouldShowSubmitButton =
    roleType === "CPT_DATA_ENTRY_NMR_TASK" ||
    roleType === "CPT_DATA_ENTRY_MR_TASK";
  const allSections = [
    SUMMARY_VIEW_ID,
    ...visibleAccordions,
  ];
  const quickLinksAccordion = visibleAccordions.find((accordionId) =>
    isQuickLinksAccordion(String(accordionId)),
  );
  const navigationSections = allSections.filter(
    (accordionId) =>
      accordionId === SUMMARY_VIEW_ID ||
      !isQuickLinksAccordion(String(accordionId)),
  );
  const selectedAccordion = allSections.includes(selectedAccordionId)
    ? selectedAccordionId
    : SUMMARY_VIEW_ID;
  const SelectedAccordionComponent = selectedAccordion !== SUMMARY_VIEW_ID
    ? accordionRegistry[selectedAccordion]
    : undefined;
  const requirementRows = getRequirementRows(drsData);
  const pendingRequirements = requirementRows.filter(
    (row) => normalizeValue(row.status) === "PENDING",
  ).length;
  const acceptedRequirements = requirementRows.filter((row) =>
    ["ACCEPT", "ACCEPTED", "RECEIVED"].includes(
      normalizeValue(row.status),
    ),
  ).length;
  const breData = toRecord(getNestedData(drsData).latestBreDecision);
  const applicationOverview = toRecord(
    getNestedData(drsData).applicationOverview,
  );
  const decisionAccordion =
    getAccordionByName(visibleAccordions, "uwtoolkit") ??
    getAccordionByName(visibleAccordions, "uwdecision");
  const RequirementManagementComponent = getAccordionByName(
    visibleAccordions,
    "requirementmanagement",
  )
    ? accordionRegistry[
      getAccordionByName(visibleAccordions, "requirementmanagement")!
    ]
    : undefined;
  const DecisionComponent = decisionAccordion
    ? accordionRegistry[decisionAccordion]
    : undefined;

  const renderSummaryWorkSection = (
    id: "requirements" | "decision",
    heading: string,
    description: string,
    Component: typeof RequirementManagementComponent,
  ) => {
    const isExpanded = expandedSummarySection === id;

    return (
      <Box
        sx={{
          mt: 1,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() =>
            setExpandedSummarySection((current) =>
              current === id ? null : id,
            )
          }
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            p: 1.1,
            border: 0,
            cursor: "pointer",
            textAlign: "left",
            backgroundColor: isExpanded ? "#fff7f5" : "#fff",
            fontFamily: "inherit",
            "&:hover": { backgroundColor: "#fff7f5" },
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#243447" }}>
              {heading}
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 12, color: "#64748b" }}>
              {description}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#9a2529" }}>
            {isExpanded ? "−" : "+"}
          </Typography>
        </Box>

        {isExpanded && (
          <Box sx={{ p: { xs: 1, md: 1.5 }, borderTop: "1px solid #e2e8f0" }}>
            {Component ? (
              <Component />
            ) : (
              <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
                This section is not available for the current task.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  const renderSummaryCard = (
    heading: string,
    fields: Array<{ label: string; value: string }>,
    accent: string,
  ) => (
    <Box
      sx={{
        p: 1.25,
        border: "1px solid #e7ebf0",
        borderTop: `3px solid ${accent}`,
        borderRadius: 2,
        backgroundColor: "#fff",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#243447", mb: 0.75 }}>
        {heading}
      </Typography>
      <Box sx={{ display: "grid", gap: 0.6 }}>
        {fields.map((field) => (
          <Box
            key={field.label}
            sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}
          >
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              {field.label}
            </Typography>
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: "#334155", textAlign: "right" }}
            >
              {field.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderSummaryView = () => (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1f2937" }}>
          Application Summary
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1,
        }}
      >
        {renderSummaryCard(
          "BRE Decision Summary",
          [
            { label: "Initial Decision", value: getFirstValue(breData, ["initialDecision", "initialBreDecision", "initial_decision"]) },
            { label: "Final Decision", value: getFirstValue(breData, ["finalDecision", "finalBreDecision", "breDecision", "decision"]) },
          ],
          "#9a2529",
        )}
        {renderSummaryCard(
          "Application Overview",
          [
            { label: "Product", value: getFirstValue(applicationOverview, ["productName", "product", "productType"]) },
            { label: "Applied Sum Assured", value: getFirstValue(applicationOverview, ["appliedSa", "appliedSA", "sumAssured"]) },
            { label: "Annual Premium", value: getFirstValue(applicationOverview, ["annualPremium", "premium"]) },
          ],
          "#2563eb",
        )}
      </Box>

      <Box
        sx={{
          mt: 1,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: { xs: 1, md: 2.5 },
          px: 1.5,
          py: 1,
          border: "1px solid #fde1c4",
          borderLeft: "3px solid #f58220",
          borderRadius: 1.5,
          backgroundColor: "#fffaf5",
        }}
      >
        <Typography sx={{ mr: 0.5, fontSize: 13, fontWeight: 700, color: "#4b5563" }}>
          Requirement Management
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
          Total: <Box component="span" sx={{ fontWeight: 700, color: "#334155" }}>{requirementRows.length}</Box>
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
          Pending: <Box component="span" sx={{ fontWeight: 700, color: "#b45309" }}>{pendingRequirements}</Box>
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
          Accepted / Received: <Box component="span" sx={{ fontWeight: 700, color: "#047857" }}>{acceptedRequirements}</Box>
        </Typography>
      </Box>

      {renderSummaryWorkSection(
        "requirements",
        "Requirement Management",
        "Review and update requirement status without leaving the summary.",
        RequirementManagementComponent,
      )}
      {renderSummaryWorkSection(
        "decision",
        "Decision",
        "Select and submit the case decision from this compact workspace.",
        DecisionComponent,
      )}
    </Box>
  );

  return (
    <>
      <BackButton
        label={title.backToInbox}
        onClick={() => navigate(getInboxPath())}
        rightSlot={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              whiteSpace: "nowrap",
            }}
          >
            {/* Application Number */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.65,
                borderRadius: "20px",
                backgroundColor:
                  businessType === "retail" ? "#FFEAD7" : "#9A2529",
                border:
                  businessType === "retail"
                    ? "1px solid rgba(228, 95, 20, 0.25)"
                    : "1px solid #9A2529",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: businessType === "retail" ? "#7A4A35" : "#FFEAD7",
                  letterSpacing: "0.2px",
                }}
              >
                Application No. :
              </Typography>

              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: businessType === "retail" ? "#9A2529" : "#FFEAD7",
                  letterSpacing: "0.3px",
                }}
              >
                {applicationNo}
              </Typography>
            </Box>

          </Box>
        }
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          minHeight: "calc(100vh - 126px)",
          p: { xs: 1, md: 2 },
          backgroundColor: "#f4f6f9",
        }}
      >
        <Box
          component="nav"
          aria-label="Application sections"
          sx={{
            width: { xs: 210, md: 250 },
            flexShrink: 0,
            position: "sticky",
            top: 12,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
          }}
        >
          <Typography
            sx={{
              px: 2,
              py: 1.4,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "#6b7280",
              borderBottom: "1px solid #edf0f3",
              textTransform: "uppercase",
            }}
          >
            Application sections
          </Typography>

          <Box sx={{ p: 0.75 }}>
            {navigationSections.map((accordionId) => {
              const isSelected = accordionId === selectedAccordion;

              return (
                <Box
                  key={accordionId}
                  component="button"
                  type="button"
                  onClick={() => setSelectedAccordionId(accordionId)}
                  aria-current={isSelected ? "page" : undefined}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.25,
                    py: 1.05,
                    border: 0,
                    borderRadius: 1.25,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: "left",
                    color: isSelected ? "#9a2529" : "#374151",
                    backgroundColor: isSelected ? "#fff1f2" : "transparent",
                    borderLeft: isSelected ? "3px solid #ad252a" : "3px solid transparent",
                    transition: "background-color 150ms ease, color 150ms ease",
                    "&:hover": {
                      backgroundColor: isSelected ? "#fff1f2" : "#f8fafc",
                    },
                    "&:focus-visible": {
                      outline: "2px solid #f58220",
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      flexShrink: 0,
                      backgroundColor: isSelected ? "#ad252a" : "#cbd5e1",
                    }}
                  />
                  {accordionId === SUMMARY_VIEW_ID
                    ? "Summary"
                    : getAccordionLabel(String(accordionId))}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            minHeight: "calc(100vh - 158px)",
            p: { xs: 1.5, md: 2.5 },
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
          }}
        >
          {shouldShowSubmitButton &&
            isUwToolkitAccordion(String(selectedAccordion)) &&
            renderSubmitButton()}

          {selectedAccordion === SUMMARY_VIEW_ID ? (
            renderSummaryView()
          ) : SelectedAccordionComponent ? (
            <SelectedAccordionComponent />
          ) : (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                border: "1px dashed #cbd5e1",
                borderRadius: 2,
                color: "text.secondary",
              }}
            >
              No section is available for this application.
            </Box>
          )}

          {shouldShowSubmitButton && !hasUwToolkit && renderSubmitButton()}
        </Box>
      </Box>
      {quickLinksAccordion && (
        <Box
          component="button"
          type="button"
          onClick={() => setSelectedAccordionId(quickLinksAccordion)}
          aria-label="Open Quick Links"
          sx={{
            position: "fixed",
            right: { xs: 16, md: 28 },
            bottom: { xs: 16, md: 28 },
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            px: 2,
            py: 1.15,
            border: 0,
            borderRadius: "999px",
            cursor: "pointer",
            backgroundColor: "#9a2529",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 8px 22px rgba(122, 37, 41, 0.28)",
            "&:hover": { backgroundColor: "#7d1e22" },
          }}
        >
          Quick Links
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false,
          }))
        }
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((current) => ({
              ...current,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DRS;
