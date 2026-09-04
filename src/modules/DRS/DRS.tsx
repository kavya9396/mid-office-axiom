// import {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import {
//   useLocation,
//   useNavigate,
// } from "react-router-dom";
// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";
// import {
//   Alert,
//   Box,
//   CircularProgress,
//   Snackbar,
//   Typography,
// } from "@mui/material";

// import {
//   accordionRegistry,
//   DRS_LAYOUTS,
//   getPoolWiseAvailableAccordions,
// } from "./drs-layouts";

// import { drsThunk } from "../../store/thunks/drsThunk";
// import { breThunk } from "../../store/thunks/breThunk";
// import { completeTaskThunk } from "../../store/thunks/completeTaskThunk";
// import type {
//   AppDispatch,
//   RootState,
// } from "../../store/store";
// import CustomButton from "../../components/ui/Button/Button";
// import { getInboxPath } from "../../routes/routes";
// import { preloginThunk } from "../../store/thunks/preloginThunk";
// import ApplicantApplicationSummary from "./ApplicantSummary";
// import type { ComponentType } from "react";

// interface ApplicationRow {
//   applicationNo?: string;
//   businessType?: string;
//   roleType?: string;
//   userId?: string;
//   taskId?: string;
//   instanceId?: string;
//   decision?: string;
//   remarks?: string;
//   [key: string]: unknown;
// }

// interface SelectedCaseContext {
//   applicationNo?: string;
//   userId?: string;
//   businessType?: string;
//   roleType?: string;
//   taskId?: string;
//   instanceId?: string;
//   taskCompositeId?: string;
//   source?: string;
//   readOnly?: boolean;
// }

// interface SnackbarState {
//   open: boolean;
//   message: string;
//   severity: "success" | "error" | "warning" | "info";
// }

// const mapper = {
//   CMO_TASK: "RETAIL_CMO_POOL",
//   CUW_TASK: "RETAIL_CUW_POOL",
//   CVT_TASK: "CVT_TASK",
//   CPT_TASK: "RETAIL_CPT_POOL",
//   HOD_TASK: "RETAIL_HOD_POOL",
//   SR_UW_TASK: "RETAIL_SR_UW_POOL",
//   READY_FOR_ISSUANCE_TASK: "RETAIL_READY_FOR_ISSUANCE_POOL",
//   SYSTEM_WAIT_POOL_AMR_NON_MEDICAL:
//     "RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL",
//   AMR_NON_MEDICAL_TASK: "RETAIL_AMR_NON_MEDICAL",
//   RECONSIDERATION_TASK: "RETAIL_RECONSIDERATION_POOL",
//   PRE_ISSUANCE_SERVICING_TASK:
//     "RETAIL_PRE_ISSUANCE_SERVICING_POOL",
//   POST_ISSUANCE_TASK: "POST_ISSUANCE_TASK",
//   EXCEPTIONAL_TASK: "RETAIL_EXCEPTIONAL_POOL",
//   PIVV_TASK: "PIVV_TASK",
//   DVT_TASK: "GROUP_DVT_POOL",
//   GUW_TASK: "GROUP_GUW_POOL",
//   MMT_TASK: "GROUP_MMT_POOL",
//   SUW_TASK: "RETAIL_SUW_POOL",
//   VENDOR_CMO_TASK: "RETAIL_VENDOR_CMO_POOL",
//   COPS_TASK: "RETAIL_COPS_POOL",
//   IT_TASK: "RETAIL_IT_POOL",
//   SYSTEM_WAIT_POOL_AMR_MEDICAL:
//     "RETAIL_SYSTEM_WAIT_POOL_AMR_MEDICAL",
//   RI_TASK: "RETAIL_REINSURER_POOL",
//   REQUIREMENT_POOL: "RETAIL_REQUIREMENT_REVIEW_POOL",
//   CUW_CLAIM_AUDIT_TASK: "RETAIL_CUW_CLAIM_AUDIT",
//   ACCUITY_TASK_: "RETAIL_ACCUITY_USER",
//   ECG_TASK: "RETAIL_ECG_POOL",
//   TMT_TASK: "RETAIL_TMT_POOL",
//   GRIEVANCE_TASK: "RETAIL_GRIEVANCE_POOL",
//   REJECT_TASK: "RETAIL_REJECT_POOL",
//   GUW_FORMAL_TASK: "GUW_FORMAL_TASK",
//   DVT_FORMAL_TASK: "DVT_FORMAL_TASK",
//   RISK_TASK: "RISK_TASK",
//   PRE_LOGIN_CUW_TASK: "PRE_LOGIN_CUW_TASK",
//   AMR_MEDICAL_TASK: "AMR_MEDICAL_TASK",
//   ACCUITY_TASK: "ACCUITY_TASK",
//   ISSUANCE_TASK: "ISSUANCE_TASK",
//   CPT_DATA_ENTRY_MR_TASK: "CPT_DATA_ENTRY_MR_TASK",
//   CPT_DATA_ENTRY_NMR_TASK: "CPT_DATA_ENTRY_NMR_TASK",
// } as const;

// const SUMMARY_SECTION_ROLES = new Set([
//   "CPT_DATA_ENTRY_NMR_TASK",
//   "CPT_DATA_ENTRY_MR_TASK",
//   "PIVV_TASK",
// ]);

// const APP_HEADER_HEIGHT = 57;

// const getSelectedCaseContext = (): SelectedCaseContext => {
//   try {
//     const value = localStorage.getItem("selectedCaseContext");

//     return value
//       ? (JSON.parse(value) as SelectedCaseContext)
//       : {};
//   } catch {
//     return {};
//   }
// };

// const normalizeTaskId = (value: string): string => {
//   const normalizedValue = value.trim();

//   if (!normalizedValue) {
//     return "";
//   }

//   const parts = normalizedValue.split(".");
//   return parts.at(-1)?.trim() ?? normalizedValue;
// };

// const isBrowserRefresh = (): boolean => {
//   const [navigationEntry] = performance.getEntriesByType(
//     "navigation",
//   ) as PerformanceNavigationTiming[];

//   return navigationEntry?.type === "reload";
// };

// const normalizeAccordionId = (value: string): string =>
//   value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

// const isUwToolkitAccordion = (accordionId: string): boolean =>
//   normalizeAccordionId(accordionId) === "uwtoolkit";

// const normalizeValue = (value: unknown): string =>
//   String(value ?? "").trim().toUpperCase();

// const toRecord = (value: unknown): Record<string, unknown> =>
//   value && typeof value === "object" && !Array.isArray(value)
//     ? (value as Record<string, unknown>)
//     : {};

// const getNestedData = (value: unknown): Record<string, unknown> => {
//   let current = toRecord(value);

//   for (let depth = 0; depth < 4; depth += 1) {
//     const nested = toRecord(current.data);

//     if (Object.keys(nested).length === 0) {
//       break;
//     }

//     current = nested;
//   }

//   return current;
// };

// const getRequirementRows = (value: unknown): Record<string, unknown>[] => {
//   const payload = getNestedData(value);
//   const requirements = payload.requirementManagement;

//   return Array.isArray(requirements)
//     ? requirements.map(toRecord)
//     : [];
// };

// const getMiscItems = (value: unknown): Record<string, unknown>[] => {
//   const payload = getNestedData(value);
//   const misc = payload.misc;

//   return Array.isArray(misc) ? misc.map(toRecord) : [];
// };

// const getActiveCptDecisionCode = (
//   miscItems: Record<string, unknown>[],
//   codes: string[],
// ): string => {
//   const normalizedCodes = new Set(codes.map(normalizeValue));
//   const item = miscItems.find(
//     (masterItem) =>
//       normalizeValue(masterItem.type) === "CPT" &&
//       normalizeValue(masterItem.isActive) === "Y" &&
//       normalizedCodes.has(normalizeValue(masterItem.code)),
//   );

//   return String(item?.code ?? "").trim();
// };

// const DRS = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();

//   const application = location.state?.application as
//     | ApplicationRow
//     | undefined;

//   const drsData = useSelector(
//     (state: RootState) => state.drs.data,
//   );

//   const masterData = useSelector(
//     (state: RootState) => state.masterData,
//   );

//   const [isPageLoading, setIsPageLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [snackbar, setSnackbar] = useState<SnackbarState>({
//     open: false,
//     message: "",
//     severity: "info",
//   });

//   const lastRequestKeyRef = useRef<string | null>(null);
//   const isBrowserRefreshRef = useRef(isBrowserRefresh());

//   const selectedCaseContext = useMemo(
//     () => getSelectedCaseContext(),
//     [],
//   );

//   const storedRoleType =
//     localStorage.getItem("roleType")?.trim() ?? "";

//   const roleType =
//     application?.roleType?.trim() ||
//     selectedCaseContext.roleType?.trim() ||
//     storedRoleType;

//   const layout = mapper[roleType as keyof typeof mapper];

//   useEffect(() => {
//     if (!application) {
//       return;
//     }

//     const valuesToPersist = {
//       applicationNo: application.applicationNo,
//       userId: application.userId,
//       businessType: application.businessType,
//       roleType: application.roleType,
//     };

//     Object.entries(valuesToPersist).forEach(([key, value]) => {
//       const normalizedValue = value?.trim();

//       if (normalizedValue) {
//         localStorage.setItem(key, normalizedValue);
//       }
//     });
//   }, [application]);

//   const layoutAccordions = useMemo(
//     () => (layout ? DRS_LAYOUTS[layout] ?? [] : []),
//     [layout],
//   );

//   const sections = useMemo(
//     () =>
//       Array.from(
//         new Set([
//           ...layoutAccordions.map(String),
//           "requirementCategoryInfo",
//           "latestBreDecision",
//           ...(SUMMARY_SECTION_ROLES.has(roleType.toUpperCase())
//             ? ["summary"]
//             : []),
//         ]),
//       ),
//     [layoutAccordions, roleType],
//   );

//   const applicationNo = String(
//     application?.applicationNo ??
//     selectedCaseContext.applicationNo ??
//     localStorage.getItem("applicationNo") ??
//     "",
//   ).trim();

//   const userId = String(
//     application?.userId ??
//     selectedCaseContext.userId ??
//     localStorage.getItem("userId") ??
//     localStorage.getItem("username") ??
//     "",
//   ).trim();

//   const businessType = String(
//     application?.businessType ??
//     selectedCaseContext.businessType ??
//     localStorage.getItem("businessType") ??
//     "retail",
//   )
//     .trim()
//     .toLowerCase();

//   const eventName =
//     businessType === "group"
//       ? "BRE-GROUP"
//       : "BRE-RETAIL";
//       console.log('eventName',businessType,eventName)

//   useEffect(() => {
//     if (
//       !applicationNo ||
//       !userId ||
//       !roleType
//     ) {
//       void Promise.resolve().then(() => {
//         setIsPageLoading(false);
//       });

//       return;
//     }

//     const requestKey = [
//       applicationNo,
//       userId,
//       roleType,
//       businessType,
//       sections.join(","),
//     ].join("|");

//     if (lastRequestKeyRef.current === requestKey) {
//       return;
//     }

//     lastRequestKeyRef.current = requestKey;

//     const loadPageData = async () => {
//       setIsPageLoading(true);

//       try {
//         const requests: Promise<unknown>[] = [
//           dispatch(
//             drsThunk({
//               applicationNo,
//               userId,
//               roleType,
//               sections,
//               businessType,
//             }),
//           ).unwrap(),
//         ];

//         // BRE is required only when entering the DRS page. On a browser
//         // refresh, reuse the existing BRE data and fetch only the DRS data.
//         if (!isBrowserRefreshRef.current) {
//           requests.push(
//             dispatch(
//               breThunk({
//                 eventName,
//                 applicationNumber: applicationNo,
//                 businessType,
//               }),
//             ).unwrap(),
//           );
//         }

//         if (roleType === "PRE_LOGIN_CUW_TASK") {
//           requests.push(
//             dispatch(
//               preloginThunk({
//                 applicationNumber: applicationNo,
//               }),
//             ).unwrap(),
//           );
//         }

//         await Promise.all(requests);
//       } catch (error) {
//         console.error("Failed to load application details:", error);
//       } finally {
//         if (
//           lastRequestKeyRef.current === requestKey
//         ) {
//           setIsPageLoading(false);
//         }
//       }
//     };

//     void Promise.resolve().then(loadPageData);
//   }, [
//     dispatch,
//     applicationNo,
//     userId,
//     roleType,
//     businessType,
//     sections,
//     eventName,
//   ]);

//   const visibleAccordions = useMemo(
//     () =>
//       getPoolWiseAvailableAccordions(
//         layout,
//         drsData,
//       ),
//     [layout, drsData],
//   );

//   const movedAccordionIds = useMemo(
//     () =>
//       visibleAccordions.filter((accordionId) => {
//         const normalizedId = normalizeAccordionId(String(accordionId));
//         return (
//           normalizedId === "requirementmanagement" ||
//           normalizedId === "decisionhistory"
//         );
//       }),
//     [visibleAccordions],
//   );

//   const pageAccordionIds = useMemo(
//     () =>
//       visibleAccordions.filter(
//         (accordionId) => !movedAccordionIds.includes(accordionId),
//       ),
//     [movedAccordionIds, visibleAccordions],
//   );

//   const getRegisteredAccordion = (normalizedName: string) => {
//     const registryEntry = Object.entries(accordionRegistry).find(
//       ([accordionId]) =>
//         normalizeAccordionId(String(accordionId)) === normalizedName,
//     );

//     return registryEntry
//       ? (registryEntry[1] as ComponentType<{ embedded?: boolean }>)
//       : null;
//   };

//   const RequirementManagementPanel = getRegisteredAccordion(
//     "requirementmanagement",
//   );
//   const DecisionHistoryPanel = getRegisteredAccordion("decisionhistory");

//   const handleSubmit = async () => {
//     if (isSubmitting) {
//       return;
//     }

//     const rawTaskId = String(
//       application?.taskId ??
//       selectedCaseContext.taskId ??
//       selectedCaseContext.taskCompositeId ??
//       localStorage.getItem("taskId") ??
//       localStorage.getItem("taskCompositeId") ??
//       "",
//     ).trim();

//     const taskId = normalizeTaskId(rawTaskId);

//     const instanceId = String(
//       application?.instanceId ??
//       selectedCaseContext.instanceId ??
//       localStorage.getItem("instanceId") ??
//       "",
//     ).trim();

//     if (!applicationNo || !userId) {
//       setSnackbar({
//         open: true,
//         message: "Application number or user ID is missing.",
//         severity: "error",
//       });
//       return;
//     }

//     if (!taskId || !instanceId) {
//       setSnackbar({
//         open: true,
//         message: "Task ID or instance ID is missing.",
//         severity: "error",
//       });
//       return;
//     }

//     let decision = "AMR";

//     if (roleType === "CPT_DATA_ENTRY_NMR_TASK") {
//       const requirementRows = getRequirementRows(drsData);
//       const statuses = requirementRows.map((row) =>
//         normalizeValue(row.status),
//       );
//       const hasPendingRequirement = statuses.includes("PENDING");
//       const areAllRequirementsAccepted =
//         statuses.length > 0 &&
//         statuses.every((status) =>
//           ["ACCEPT", "ACCEPTED"].includes(status),
//         );
//       const miscItems = getMiscItems(masterData);

//       if (hasPendingRequirement) {
//         decision = getActiveCptDecisionCode(miscItems, ["AMR"]);
//       } else if (areAllRequirementsAccepted) {
//         decision = getActiveCptDecisionCode(miscItems, [
//           "CLS_TASK",
//           "CLOSE_TASK",
//         ]);
//       } else {
//         setSnackbar({
//           open: true,
//           message:
//             requirementRows.length === 0
//               ? "No requirements are available to submit."
//               : "Every requirement must be either Pending or Accepted before submitting.",
//           severity: "error",
//         });
//         return;
//       }

//       if (!decision) {
//         setSnackbar({
//           open: true,
//           message: hasPendingRequirement
//             ? "Active AMR decision is not configured for CPT in the misc master."
//             : "Active close-task decision is not configured for CPT in the misc master.",
//           severity: "error",
//         });
//         return;
//       }
//     }

//     /*
//      * These values are now guaranteed to be strings
//      * because the missing-value checks have completed.
//      */
//     const payload = {
//       businessType,
//       requestContext: {
//         taskId,
//         userId,
//         appNo: applicationNo,
//         instanceId,
//         remarks: "",
//         decision,
//       },
//     };

//     setIsSubmitting(true);

//     try {
//       // Complete-task is called only after BRE succeeds.
//       await dispatch(
//         breThunk({
//           eventName,
//           applicationNumber: applicationNo,
//           businessType,
//         }),
//       ).unwrap();

//       await dispatch(
//         completeTaskThunk(payload),
//       ).unwrap();

//       setSnackbar({
//         open: true,
//         message: "Application submitted successfully.",
//         severity: "success",
//       });

//       window.setTimeout(() => {
//         navigate(getInboxPath());
//       }, 800);
//     } catch (error) {
//       console.error(
//         "Failed to submit application:",
//         error,
//       );

//       setSnackbar({
//         open: true,
//         message:
//           typeof error === "string"
//             ? error
//             : "Unable to submit the application. Please try again.",
//         severity: "error",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const renderSubmitButton = () => (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         mt: 0.75,
//         mb: 0.75,
//       }}
//     >
//       <CustomButton
//         onClick={handleSubmit}
//         disabled={isSubmitting}
//         sx={{
//           minWidth: 170,
//           borderRadius: "28px",
//           bgcolor: "#ad252a",
//           py: 0.65,
//           textTransform: "none",
//           fontSize: "13px",
//           fontWeight: 600,
//           boxShadow: "none",
//           "&:hover": {
//             bgcolor: "#941f24",
//             boxShadow: "none",
//           }
//         }}
//       >
//         <Box
//           component="span"
//           sx={{
//             display: "inline-flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 1,
//             minWidth: 110,
//           }}
//         >
//           {isSubmitting && (
//             <CircularProgress
//               size={17}
//               thickness={5}
//               sx={{ color: "inherit" }}
//             />
//           )}

//           {isSubmitting ? "Submitting..." : "Submit"}
//         </Box>
//       </CustomButton>
//     </Box>
//   );

//   if (isPageLoading) {
//     return (
//       <Box
//         sx={{
//           width: "100%",
//           height: `calc(100dvh - ${APP_HEADER_HEIGHT}px)`,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: 1.5,
//           backgroundColor: "#f5f7fa",
//           overflow: "hidden",
//         }}
//       >
//         <CircularProgress
//           size={42}
//           thickness={4}
//           sx={{ color: "#f58220" }}
//         />

//         <Typography
//           variant="body2"
//           sx={{
//             color: "text.secondary",
//             fontWeight: 500,
//           }}
//         >
//           Loading application details...
//         </Typography>
//       </Box>
//     );
//   }

//   const hasUwToolkit = pageAccordionIds.some(
//     (accordionId) =>
//       isUwToolkitAccordion(String(accordionId)),
//   );
//   const shouldShowSubmitButton =
//     roleType === "CPT_DATA_ENTRY_NMR_TASK" ||
//     roleType === "CPT_DATA_ENTRY_MR_TASK";

//   return (
//     <>
//       <Box
//         component="main"
//         sx={{
//           width: "100%",
//           height: `calc(100dvh - ${APP_HEADER_HEIGHT}px)`,
//           minHeight: 0,
//           overflowY: "auto",
//           overflowX: "hidden",
//           overscrollBehavior: "contain",
//           scrollbarGutter: "stable",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 1,
//             pb: 1,
//           }}
//         >
//           <ApplicantApplicationSummary
//             stickyTop={0}
//             onBackToInbox={() => navigate(getInboxPath())}
//             requirementManagement={
//               RequirementManagementPanel ? (
//                 <RequirementManagementPanel embedded />
//               ) : null
//             }
//             decisionHistory={
//               DecisionHistoryPanel ? (
//                 <DecisionHistoryPanel embedded />
//               ) : null
//             }
//           />

//           {pageAccordionIds.map((accordionId) => {
//             const AccordionComponent =
//               accordionRegistry[accordionId];

//             if (!AccordionComponent) {
//               return null;
//             }

//             const showSubmitBeforeAccordion =
//               isUwToolkitAccordion(
//                 String(accordionId),
//               );

//             return (
//               <Box key={accordionId}>
//                 {shouldShowSubmitButton && showSubmitBeforeAccordion &&
//                   renderSubmitButton()}

//                 <AccordionComponent />
//               </Box>
//             );
//           })}

//           {shouldShowSubmitButton && !hasUwToolkit &&
//             renderSubmitButton()}
//         </Box>
//       </Box>
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         anchorOrigin={{
//           vertical: "top",
//           horizontal: "right",
//         }}
//         onClose={() =>
//           setSnackbar((current) => ({
//             ...current,
//             open: false,
//           }))
//         }
//       >
//         <Alert
//           severity={snackbar.severity}
//           variant="filled"
//           onClose={() =>
//             setSnackbar((current) => ({
//               ...current,
//               open: false,
//             }))
//           }
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default DRS;


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
import CustomButton from "../../components/ui/Button/Button";
import { getInboxPath } from "../../routes/routes";
import { preloginThunk } from "../../store/thunks/preloginThunk";
import ApplicantApplicationSummary from "./ApplicantSummary";
import VendorCMOApplicationSummary from "./VendorCMOApplicationSummary";
import type { ComponentType } from "react";
import MemberSelection from "./MemberSeclection";
import HOCMOApplicationSummary from "./HOCMOApplicationSummary";
import RefCMOApplicationSummary from "./RefCMOApplicationSummary";

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

const APP_HEADER_HEIGHT = 57;

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
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(
    null,
  );

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

  useEffect(() => {
    setSelectedMemberIndex(null);
  }, [applicationNo]);

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

  const movedAccordionIds = useMemo(
    () =>
      visibleAccordions.filter((accordionId) => {
        const normalizedId = normalizeAccordionId(String(accordionId));
        return (
          normalizedId === "requirementmanagement" ||
          normalizedId === "decisionhistory"
        );
      }),
    [visibleAccordions],
  );

  const pageAccordionIds = useMemo(
    () =>
      visibleAccordions.filter(
        (accordionId) => !movedAccordionIds.includes(accordionId),
      ),
    [movedAccordionIds, visibleAccordions],
  );

  const getRegisteredAccordion = (normalizedName: string) => {
    const registryEntry = Object.entries(accordionRegistry).find(
      ([accordionId]) =>
        normalizeAccordionId(String(accordionId)) === normalizedName,
    );

    return registryEntry
      ? (registryEntry[1] as ComponentType<{ embedded?: boolean }>)
      : null;
  };

  const RequirementManagementPanel = getRegisteredAccordion(
    "requirementmanagement",
  );
  const DecisionHistoryPanel = getRegisteredAccordion("decisionhistory");

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
          height: `calc(100dvh - ${APP_HEADER_HEIGHT}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          backgroundColor: "#f5f7fa",
          overflow: "hidden",
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

  const hasUwToolkit = pageAccordionIds.some(
    (accordionId) =>
      isUwToolkitAccordion(String(accordionId)),
  );
  const shouldShowSubmitButton =
    roleType === "CPT_DATA_ENTRY_NMR_TASK" ||
    roleType === "CPT_DATA_ENTRY_MR_TASK";

  const drsRecord = toRecord(drsData);
  const summaryMembers = Array.isArray(drsRecord.summary)
    ? drsRecord.summary
    : [];
  const shouldShowMemberSelection =
    summaryMembers.length > 1 && selectedMemberIndex === null;

  if (shouldShowMemberSelection) {
    return (
      <Box
        component="main"
        sx={{
          width: "100%",
          height: `calc(100dvh - ${APP_HEADER_HEIGHT}px)`,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "#F8F6F5",
        }}
      >
        <MemberSelection
          applicationNumber={applicationNo}
          source={drsData}
          onMemberSelect={setSelectedMemberIndex}
        />
      </Box>
    );
  }

  return (
    <>
      <Box
        component="main"
        sx={{
          width: "100%",
          height: `calc(100dvh - ${APP_HEADER_HEIGHT}px)`,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          scrollbarGutter: "stable",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            pb: 1,
          }}
        > 
                  {
            normalizeValue(roleType) === "CMO_TASK" ? (
            <HOCMOApplicationSummary
              stickyTop={0}
              onBackToInbox={() => navigate(getInboxPath())}
              requirementManagement={
                RequirementManagementPanel ? (
                  <RequirementManagementPanel embedded />
                ) : null
              }
              decisionHistory={
                DecisionHistoryPanel ? (
                  <DecisionHistoryPanel embedded />
                ) : null
              }
            />
          ) :
            normalizeValue(roleType) === "REF_CMO_TASK" ? (
            <RefCMOApplicationSummary
              stickyTop={0}
              onBackToInbox={() => navigate(getInboxPath())}
              requirementManagement={
                RequirementManagementPanel ? (
                  <RequirementManagementPanel embedded />
                ) : null
              }
              decisionHistory={
                DecisionHistoryPanel ? (
                  <DecisionHistoryPanel embedded />
                ) : null
              }
            />
          ) :
          normalizeValue(roleType) === "VENDOR_CMO_TASK" ? (
            <VendorCMOApplicationSummary
              stickyTop={0}
              onBackToInbox={() => navigate(getInboxPath())}
              requirementManagement={
                RequirementManagementPanel ? (
                  <RequirementManagementPanel embedded />
                ) : null
              }
              decisionHistory={
                DecisionHistoryPanel ? (
                  <DecisionHistoryPanel embedded />
                ) : null
              }
            />
          ) : (
            <ApplicantApplicationSummary
              stickyTop={0}
              onBackToInbox={() => navigate(getInboxPath())}
              requirementManagement={
                RequirementManagementPanel ? (
                  <RequirementManagementPanel embedded />
                ) : null
              }
              decisionHistory={
                DecisionHistoryPanel ? (
                  <DecisionHistoryPanel embedded />
                ) : null
              }
            />
          )}

          {pageAccordionIds.map((accordionId) => {
            const AccordionComponent =
              accordionRegistry[accordionId];

            if (!AccordionComponent) {
              return null;
            }

            const showSubmitBeforeAccordion =
              isUwToolkitAccordion(
                String(accordionId),
              );

            return (
              <Box key={accordionId}>
                {shouldShowSubmitButton && showSubmitBeforeAccordion &&
                  renderSubmitButton()}

                <AccordionComponent />
              </Box>
            );
          })}

          {shouldShowSubmitButton && !hasUwToolkit &&
            renderSubmitButton()}
        </Box>
      </Box>
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
