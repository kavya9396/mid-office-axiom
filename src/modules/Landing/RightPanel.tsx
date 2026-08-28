// import {
//   Alert,
//   Box,
//   List,
//   ListItem,
//   MenuItem,
//   Paper,
//   Snackbar,
//   Select,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
//   type SelectChangeEvent,
// } from "@mui/material";
// import { CircularProgress } from "@mui/material";

// import { columnFlex, modalTitleStyles } from "../../utils/styles";
// import CustomButton from "../../components/ui/Button/Button";
// import CustomTextField from "../../components/ui/TextField/TextField";

// import type { TableColumn, tableData } from "../../types/inbox";
// import { allColumns } from "../../store/inbox.columns";

// import {
//   FilterIcon,
//   KeyLeftArrowIcon,
//   KeyRightArrowIcon,
//   SearchIcon,
//   SettingsIcon,
// } from "../../icons/Icons";

// import SearchBar from "../../components/ui/SearchBar/SearchBar";
// import { useEffect, useMemo, useState } from "react";

// import CustomDialog from "../../components/ui/Dialog/Dialog";
// import CustomCheckbox from "../../components/ui/Checkbox/Checkbox";
// import { useColumnConfig } from "../../hooks/useColumnConfig";
// import Badge from "../../components/ui/Badge/Badge";

// import { useNavigate } from "react-router-dom";

// import FilterTable from "./FilterTable";

// import {
//   getDRSPath,
//   getGrievanceApplicationPath,
//   normalizeBusinessType,
//   getInboxPath,
// } from "../../routes/routes";

// import SearchApplication from "./SearchApplication";
// import { toFilterComparableValue } from "../../utils/filter";

// import { useAppDispatch } from "../../store/hooks";
// import { claimTaskThunk } from "../../store/thunks/claimTaskThunk";
// import { drsThunk } from "../../store/thunks/drsThunk";
// import { breRetriggerThunk } from "../../store/thunks/breRetriggerThunk";

// import {
//   setDrsData,
//   setBreExternalApiOutputs,
// } from "../../store/slices/drsSlice";

// import { useAppContext } from "../../hooks/useAppContext";
// import { formatDateForUI } from "../../utils/helpers";

// type SortDirection = "asc" | "desc";

// type PoolStatusFilter = "All" | "Active" | "Error";

// type TaskTimingStatus = "normal" | "atRisk" | "due";

// type TaskTimingColumnKey =
//   | "start_time"
//   | "at_risk_time"
//   | "due_date";

// const IST_TIME_ZONE = "Asia/Kolkata";

// const ISO_TIME_ZONE_PATTERN =
//   /(Z|[+-]\d{2}:?\d{2})$/i;

// const TASK_TIMING_COLUMN_KEYS = new Set([
//   "start_time",
//   "at_risk_time",
//   "due_date",
// ]);

// const EXCLUDED_ROW_COLUMN_KEYS = new Set(
//   ["id", "taskid", "instanceid", "state", "roleType"].map((key) =>
//     key.toLowerCase(),
//   ),
// );

// const taskTimingFormatter = new Intl.DateTimeFormat("en-IN", {
//   timeZone: IST_TIME_ZONE,
//   year: "numeric",
//   month: "2-digit",
//   day: "2-digit",
//   hour: "2-digit",
//   minute: "2-digit",
//   second: "2-digit",
//   hour12: false,
// });

// const TASK_TIMING_ROW_STYLES: Record<
//   TaskTimingStatus,
//   {
//     backgroundColor: string;
//     hoverColor: string;
//     textColor: string;
//   }
// > = {
//   normal: {
//     backgroundColor: "inherit",
//     hoverColor: "#f5faff",
//     textColor: "inherit",
//   },
//   atRisk: {
//     backgroundColor: "#FFF4D6",
//     hoverColor: "#FFE9A8",
//     textColor: "#7A4E00",
//   },
//   due: {
//     backgroundColor: "#FDE8E8",
//     hoverColor: "#FBD5D5",
//     textColor: "#9A2529",
//   },
// };

// const sanitizeFileNamePart = (value: string) =>
//   value
//     .trim()
//     .replace(/[^a-z0-9]+/gi, "_")
//     .replace(/^_+|_+$/g, "") || "table";

// const escapeHtml = (value: unknown) =>
//   String(value ?? "")
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");

// const isAllowedRowColumnKey = (key: string) =>
//   !EXCLUDED_ROW_COLUMN_KEYS.has(key.toLowerCase());

// const toColumnLabel = (key: string) =>
//   key
//     .replace(/_/g, " ")
//     .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
//     .replace(/\b\w/g, (char) => char.toUpperCase());

// const getExportValue = (value: unknown) => {
//   if (value === undefined || value === null) {
//     return "";
//   }

//   if (typeof value === "object") {
//     return JSON.stringify(value);
//   }

//   return String(value);
// };

// const getExportColumnKeys = (rows: tableData[]) => {
//   const rowKeys = new Set<string>();

//   rows.forEach((row) => {
//     Object.keys(
//       row as unknown as Record<string, unknown>,
//     ).forEach((key) => {
//       if (isAllowedRowColumnKey(key)) {
//         rowKeys.add(key);
//       }
//     });
//   });

//   const configuredKeys = allColumns
//     .map((column) => String(column.key))
//     .filter((key) => rowKeys.has(key));

//   const extraKeys = Array.from(rowKeys).filter(
//     (key) => !configuredKeys.includes(key),
//   );

//   return [...configuredKeys, ...extraKeys];
// };

// const downloadRowsAsExcel = ({
//   rows,
//   columnKeys,
//   columnLabels,
//   selectedPool,
// }: {
//   rows: tableData[];
//   columnKeys: string[];
//   columnLabels: Map<string, string>;
//   selectedPool: string;
// }) => {
//   const headerCells = columnKeys
//     .map(
//       (key) =>
//         `<th>${escapeHtml(columnLabels.get(key) ?? key)}</th>`,
//     )
//     .join("");

//   const bodyRows = rows
//     .map((row) => {
//       const rowData =
//         row as unknown as Record<string, unknown>;

//       const cells = columnKeys
//         .map(
//           (key) =>
//             `<td style="mso-number-format:'\\@';">${escapeHtml(
//               getExportValue(rowData[key]),
//             )}</td>`,
//         )
//         .join("");

//       return `<tr>${cells}</tr>`;
//     })
//     .join("");

//   const worksheetName = escapeHtml(
//     sanitizeFileNamePart(selectedPool).slice(0, 31),
//   );

//   const workbook = `
//     <html xmlns:o="urn:schemas-microsoft-com:office:office"
//           xmlns:x="urn:schemas-microsoft-com:office:excel"
//           xmlns="http://www.w3.org/TR/REC-html40">
//       <head>
//         <meta charset="UTF-8" />
//         <xml>
//           <x:ExcelWorkbook>
//             <x:ExcelWorksheets>
//               <x:ExcelWorksheet>
//                 <x:Name>${worksheetName}</x:Name>
//                 <x:WorksheetOptions>
//                   <x:DisplayGridlines/>
//                 </x:WorksheetOptions>
//               </x:ExcelWorksheet>
//             </x:ExcelWorksheets>
//           </x:ExcelWorkbook>
//         </xml>
//       </head>
//       <body>
//         <table>
//           <thead>
//             <tr>${headerCells}</tr>
//           </thead>
//           <tbody>
//             ${bodyRows}
//           </tbody>
//         </table>
//       </body>
//     </html>
//   `;

//   const blob = new Blob([workbook], {
//     type: "application/vnd.ms-excel",
//   });

//   const url = URL.createObjectURL(blob);

//   const link = document.createElement("a");

//   link.href = url;
//   link.download = `${sanitizeFileNamePart(
//     selectedPool,
//   )}_${new Date().toISOString().slice(0, 10)}.xls`;

//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

//   URL.revokeObjectURL(url);
// };

// const getTimestamp = (value?: string) => {
//   const trimmedValue = value?.trim();

//   if (!trimmedValue) {
//     return null;
//   }

//   const utcValue = ISO_TIME_ZONE_PATTERN.test(trimmedValue)
//     ? trimmedValue
//     : `${trimmedValue}Z`;

//   const timestamp = Date.parse(utcValue);

//   return Number.isNaN(timestamp) ? null : timestamp;
// };

// const formatTaskTimingValue = (value: unknown) => {
//   if (typeof value !== "string") {
//     return String(value ?? "");
//   }

//   const timestamp = getTimestamp(value);

//   return timestamp === null
//     ? value
//     : taskTimingFormatter.format(new Date(timestamp));
// };

// const getTaskTimingStatus = (
//   row: tableData,
//   now: number,
// ): TaskTimingStatus => {
//   const startTime = getTimestamp(row.start_time);
//   const atRiskTime = getTimestamp(row.at_risk_time);
//   const dueDate = getTimestamp(row.due_date);

//   if (startTime !== null && now < startTime) {
//     return "normal";
//   }

//   if (dueDate !== null && now >= dueDate) {
//     return "due";
//   }

//   if (atRiskTime !== null && now >= atRiskTime) {
//     return "atRisk";
//   }

//   return "normal";
// };

// const roleMapper: Record<string, string> = {
//   CUW_TASK: "CUW_TASK",
//   UW_TASK: "CUW Pool",
//   CMO_TASK: "CMO_TASK",
//   CVT_TASK: "CVT_TASK",
//   CPT_TASK: "CPT_TASK",
//   CPT_DATA_ENTRY_NMR_TASK: "CPT_DATA_ENTRY_NMR_TASK",
//   CPT_DATA_ENTRY_MR_TASK: "CPT_DATA_ENTRY_MR_TASK",
//   DVT_TASK: "DVT_TASK",
//   PIVV_TASK: "PIVV_TASK",
//   PRE_ISSUANCE_SERVICING_TASK: "PRE_ISSUANCE_SERVICING_TASK",
//   EXCEPTIONAL_TASK: "EXCEPTIONAL_TASK",
//   GUW_TASK: "GUW_TASK",
//   HOD_TASK: "HOD_TASK",
//   MMT_TASK: "MMT_TASK",
//   SR_UW_TASK: "Sr UW Pool",
//   SUW_TASK: "SUW_TASK",
//   VENDOR_CMO_TASK: "VENDOR_CMO_TASK",
//   COPS_TASK: "COPS_TASK",
//   IT_TASK: "IT_TASK",
//   RI_TASK: "RI_TASK",
//   SYSTEM_WAIT_POOL_AMR_MEDICAL: "SYSTEM_WAIT_POOL_AMR_MEDICAL",
//   SYSTEM_WAIT_POOL_AMR_NON_MEDICAL: "SYSTEM_WAIT_POOL_AMR_NON_MEDICAL",
//   REQUIREMENT_POOL: "REQUIREMENT_POOL",
//   CUW_CLAIM_AUDIT_TASK: "CUW_CLAIM_AUDIT_TASK",
//   ACCUITY_TASK: "ACCUITY_TASK",
//   AMR_MEDICAL_TASK: "AMR_MEDICAL_TASK",
//   AMR_NON_MEDICAL_TASK: "AMR_NON_MEDICAL_TASK",
//   NON_MEDICAL_POOL: "AMR_NON_MEDICAL_TASK",
//   ECG_TASK: "ECG_TASK",
//   TMT_TASK: "TMT_TASK",
//   GRIEVANCE_TASK: "GRIEVANCE_TASK",
//   RECONSIDERATION_TASK: "RECONSIDERATION_TASK",
//   REJECT_TASK: "REJECT_TASK",
//   READY_FOR_ISSUANCE_TASK: "READY_FOR_ISSUANCE_TASK",
//   ISSUANCE_TASK: "ISSUANCE_TASK",
//   GUW_FORMAL_TASK: "GUW_FORMAL_TASK",
//   DVT_FORMAL_TASK: "DVT_FORMAL_TASK",
//   RISK_TASK: "RISK_TASK",
//   ACCUITY_TASK: "ACCUITY_TASK",
// };

// const NON_TRANSFERABLE_COLUMNS = new Set([
//   "applicationNo",
// ]);

// interface RightPanelProps {
//   selectedPool: string;
//   rows: tableData[];
// }

// const RightPanel = ({
//   selectedPool,
//   rows,
// }: RightPanelProps) => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();

//   const { businessType } = useAppContext();

//   const [openFilterDialog, setOpenFilterDialog] =
//     useState(false);

//   const username = localStorage.getItem("username") ?? "";
//   const password = localStorage.getItem("password") ?? "";

//   const safeBusinessType =
//     normalizeBusinessType(businessType) ??
//     normalizeBusinessType(
//       localStorage.getItem("businessType"),
//     ) ??
//     "retail";

//   const {
//     config,
//     updateConfig,
//     allowedColumns,
//     maxVisibleColumns,
//   } = useColumnConfig(username, selectedPool, rows);

//   const [left, setLeft] = useState<string[]>([]);
//   const [right, setRight] = useState<string[]>([]);
//   const [checked, setChecked] = useState<string[]>([]);

//   const [openTransferDialog, setOpenTransferDialog] =
//     useState(false);

//   const [isSearchOpen, setIsSearchOpen] =
//     useState(false);

//   const [searchText, setSearchText] = useState("");

//   const [page, setPage] = useState(0);

//   const [rowsPerPage, setRowsPerPage] =
//     useState(10);

//   const [sortKey, setSortKey] = useState<
//     keyof tableData | ""
//   >("");

//   const [sortDirection, setSortDirection] =
//     useState<SortDirection>("asc");

//   const [currentTimeMs, setCurrentTimeMs] =
//     useState(() => Date.now());

//   const [poolStatusFilter] =
//     useState<PoolStatusFilter>("All");

//   const [claimError, setClaimError] =
//     useState("");

//   const [openingCaseLoading, setOpeningCaseLoading] =
//     useState(false);

//   const [addLeavesFormPool, setAddLeavesFormPool] =
//     useState("");

//   const [filterValues, setFilterValues] =
//     useState<Record<string, string[]>>({});

//   const isLeaveManagementPool =
//     selectedPool === "LEAVE_MANAGEMENT_POOL";

//   const showAddLeavesForm =
//     isLeaveManagementPool &&
//     addLeavesFormPool === selectedPool;

//   useEffect(() => {
//     const intervalId = window.setInterval(() => {
//       setCurrentTimeMs(Date.now());
//     }, 30000);

//     return () => window.clearInterval(intervalId);
//   }, []);

//   const renderLeaveField = ({
//     label,
//     disabled = false,
//   }: {
//     label: string;
//     disabled?: boolean;
//   }) => (
//     <Box>
//       <Typography
//         sx={{
//           fontSize: "11px",
//           color: "#555",
//           mb: 0.7,
//         }}
//       >
//         {label}
//       </Typography>

//       <CustomTextField
//         placeholder="Select"
//         disabled={disabled}
//         fullWidth
//         sx={{
//           backgroundColor: disabled
//             ? "#E9E9E9"
//             : "#FFFFFF",
//           borderRadius: "6px",
//           "& .MuiOutlinedInput-root": {
//             height: 31,
//             borderRadius: "6px",
//             fontSize: "12px",
//           },
//         }}
//       />
//     </Box>
//   );

//   const renderAddLeavesForm = () => (
//     <Paper
//       sx={{
//         flexGrow: 1,
//         p: 3,
//         borderRadius: "0 0 6px 6px",
//         backgroundColor: "#FFFFFF",
//       }}
//     >
//       <Typography
//         sx={{
//           fontSize: "16px",
//           fontWeight: 700,
//           color: "#222",
//           mb: 3,
//         }}
//       >
//         Add Leaves
//       </Typography>

//       <Box
//         sx={{
//           backgroundColor: "#F5F5F5",
//           borderRadius: "6px",
//           p: 1.5,
//           maxWidth: 960,
//         }}
//       >
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns:
//               "repeat(3, minmax(180px, 1fr))",
//             columnGap: 3,
//             rowGap: 2,
//             "@media (max-width: 900px)": {
//               gridTemplateColumns:
//                 "repeat(2, minmax(180px, 1fr))",
//             },
//             "@media (max-width: 640px)": {
//               gridTemplateColumns: "1fr",
//             },
//           }}
//         >
//           {renderLeaveField({
//             label: "UW Name",
//           })}

//           {renderLeaveField({
//             label: "User ID",
//             disabled: true,
//           })}

//           {renderLeaveField({
//             label: "Leave Date From",
//           })}

//           {renderLeaveField({
//             label: "Leave Date Till",
//           })}

//           {renderLeaveField({
//             label: "Leave Reason",
//           })}

//           {renderLeaveField({
//             label: "Case To Reassign To UW",
//           })}

//           {renderLeaveField({
//             label: "User ID",
//             disabled: true,
//           })}
//         </Box>

//         <CustomButton
//           variant="contained"
//           sx={{
//             mt: 4,
//             minWidth: 164,
//             height: 38,
//             borderRadius: "22px",
//             backgroundColor: "#A72A2F",
//             color: "#FFFFFF",
//             fontWeight: 700,
//             textTransform: "none",
//             "&:hover": {
//               backgroundColor: "#8F2428",
//             },
//           }}
//         >
//           Submit
//         </CustomButton>

//         <CustomButton
//           variant="contained"
//           sx={{
//             mt: 4,
//             ml: 1,
//             minWidth: 164,
//             height: 38,
//             borderRadius: "22px",
//             backgroundColor: "#A72A2F",
//             color: "#FFFFFF",
//             fontWeight: 700,
//             textTransform: "none",
//             "&:hover": {
//               backgroundColor: "#8F2428",
//             },
//           }}
//           onClick={() =>
//             setAddLeavesFormPool("")
//           }
//         >
//           Close
//         </CustomButton>
//       </Box>
//     </Paper>
//   );

//   /**
//    * =========================================================
//    * APPLICATION NUMBER CLICK
//    * =========================================================
//    *
//    * IMPORTANT:
//    * The COMPLETE row is now passed through React Router state.
//    *
//    * DRS page can access:
//    *
//    * location.state.application
//    *
//    * Example:
//    *
//    * application.taskId
//    * application.instanceId
//    * application.applicationNo
//    * application.userId
//    * application.roleType
//    * application.businessType
//    *
//    * and every other property available in `row`.
//    */
//   const handleApplicationClick = async (
//     e: React.MouseEvent,
//     row: tableData,
//   ) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const rawTaskId = String(
//       row.taskId ?? "",
//     ).trim();

//     const [
//       instanceFromTaskId = "",
//       taskFromTaskId = "",
//     ] = rawTaskId.includes(".")
//       ? rawTaskId.split(".")
//       : ["", rawTaskId];

//     const claimTaskId = taskFromTaskId;

//     const rowData =
//       row as unknown as Record<string, unknown>;

//     const instanceId = String(
//       rowData.instanceId ??
//         rowData.instanceID ??
//         instanceFromTaskId ??
//         "",
//     ).trim();

//     const mappedRoleType =
//       roleMapper[row.roleType] ??
//       row.roleType;

//     const skipClaim =
//       mappedRoleType ===
//         "AMR_MEDICAL_TASK" ||
//       mappedRoleType ===
//         "AMR_NON_MEDICAL_TASK";

//     if (!skipClaim && !claimTaskId) {
//       setClaimError(
//         "Task id is missing. Unable to claim this case.",
//       );
//       return;
//     }

//     try {
//       setOpeningCaseLoading(true);

//       /**
//        * -------------------------------------------------------
//        * CLAIM TASK
//        * -------------------------------------------------------
//        */
//       if (!skipClaim) {
//         const claimResponse =
//           await dispatch(
//             claimTaskThunk({
//               username,
//               password,
//               taskId: claimTaskId,
//             }),
//           ).unwrap();

//         const isClaimed =
//           claimResponse.success === true ||
//           claimResponse.state?.toLowerCase() ===
//             "claimed";

//         if (!isClaimed) {
//           setClaimError(
//             claimResponse.message ||
//               "Failed to claim task.",
//           );

//           setOpeningCaseLoading(false);
//           return;
//         }
//       }

//       /**
//        * -------------------------------------------------------
//        * STORE CURRENT CONTEXT
//        * -------------------------------------------------------
//        */
//       localStorage.setItem(
//         "roleType",
//         mappedRoleType,
//       );

//       localStorage.setItem(
//         "taskCompositeId",
//         rawTaskId,
//       );

//       if (claimTaskId) {
//         localStorage.setItem(
//           "taskId",
//           claimTaskId,
//         );
//       }

//       if (instanceId) {
//         localStorage.setItem(
//           "instanceId",
//           instanceId,
//         );
//       }

//       localStorage.setItem(
//         "selectedCaseContext",
//         JSON.stringify({
//           applicationNo: String(
//             row.applicationNo ?? "",
//           ).trim(),
//           roleType: String(
//             row.roleType ?? "",
//           ).trim(),
//           taskId: claimTaskId,
//           instanceId,
//           taskCompositeId: rawTaskId,
//         }),
//       );

//       const targetBusinessType =
//         normalizeBusinessType(
//           row.businessType,
//         ) ?? safeBusinessType;

//       try {
//         localStorage.setItem(
//           "businessType",
//           targetBusinessType,
//         );
//       } catch {
//         // Ignore storage errors.
//       }

//       const targetPath =
//         row.roleType === "Grievance Pool"
//           ? getGrievanceApplicationPath(
//               targetBusinessType,
//               row.applicationNo,
//             )
//           : getDRSPath(
//               targetBusinessType,
//               row.applicationNo,
//             );

//       const appNo = String(
//         row.applicationNo ?? "",
//       ).trim();

//       /**
//        * -------------------------------------------------------
//        * DRS API
//        * -------------------------------------------------------
//        */
//       const drsPromise = (async () => {
//         try {
//           const drsResp =
//             await dispatch(
//               drsThunk({
//                 applicationNo: appNo,
//                 userId: username,
//                 roleType: mappedRoleType,
//                 sections: [],
//               }),
//             ).unwrap();

//           dispatch(
//             setDrsData(drsResp.data),
//           );

//           return {
//             ok: true,
//           };
//         } catch (error) {
//           return {
//             ok: false,
//             error,
//           };
//         }
//       })();

//       /**
//        * -------------------------------------------------------
//        * BRE API
//        * -------------------------------------------------------
//        */
//       const brePromise = (async () => {
//         const eventName =
//           safeBusinessType === "retail"
//             ? "BRE-RETAIL"
//             : "BRE-GROUP";

//         try {
//           const breResp =
//             await dispatch(
//               breRetriggerThunk({
//                 eventName,
//                 applicationNumber: appNo,
//               }),
//             ).unwrap();

//           dispatch(
//             setBreExternalApiOutputs({
//               breOutput:
//                 breResp.data?.breOutput,
//               initialBreOutput:
//                 breResp.data?.initialBreOutput,
//               breRetriggerStatus: "success",
//               medicalBreOutput:
//                 breResp.data?.medicalBreOutput,
//               financialBreOutput:
//                 breResp.data?.financialBreOutput,
//             }),
//           );

//           return {
//             ok: true,
//           };
//         } catch (error) {
//           dispatch(
//             setBreExternalApiOutputs({
//               initialBreOutput: undefined,
//               breRetriggerStatus: "failure",
//             }),
//           );

//           return {
//             ok: false,
//             error,
//           };
//         }
//       })();

//       const [
//         drsResult,
//         breResult,
//       ] = await Promise.all([
//         drsPromise,
//         brePromise,
//       ]);

//       /**
//        * =======================================================
//        * IMPORTANT CHANGE
//        * =======================================================
//        *
//        * Pass the COMPLETE selected row to the DRS page.
//        *
//        * `row` contains everything from the table:
//        *
//        * taskId
//        * instanceId
//        * applicationNo
//        * userId
//        * roleType
//        * businessType
//        * etc.
//        */
//       if (
//         drsResult.ok ||
//         breResult.ok
//       ) {
//         navigate(targetPath, {
//           state: {
//             application: row,

//             /**
//              * These are optional convenience values.
//              * The DRS page can use either:
//              *
//              * location.state.application.taskId
//              *
//              * OR
//              *
//              * location.state.taskId
//              */
//             taskId: claimTaskId,
//             instanceId,
//             applicationNo: appNo,
//             userId: username,
//             roleType: mappedRoleType,
//             businessType:
//               targetBusinessType,
//           },
//         });

//         return;
//       }

//       /**
//        * Both DRS and BRE failed.
//        */
//       navigate(
//         getInboxPath(targetBusinessType),
//         {
//           state: {
//             snackbarMessage:
//               "Failed to open case. Please try again.",
//           },
//         },
//       );
//     } catch (error) {
//       setClaimError(
//         error instanceof Error
//           ? error.message
//           : "Failed to claim task.",
//       );
//     } finally {
//       setOpeningCaseLoading(false);
//     }
//   };

//   /**
//    * ---------------------------------------------------------
//    * COLUMN CONFIGURATION
//    * ---------------------------------------------------------
//    */
//   const columnByKey = useMemo(() => {
//     const configuredColumns = new Map<
//       string,
//       TableColumn
//     >(
//       allColumns.map((column) => [
//         String(column.key),
//         column,
//       ]),
//     );

//     allowedColumns.forEach(
//       (columnKey) => {
//         if (
//           !configuredColumns.has(
//             columnKey,
//           )
//         ) {
//           configuredColumns.set(
//             columnKey,
//             {
//               key:
//                 columnKey as keyof tableData,
//               label:
//                 toColumnLabel(
//                   columnKey,
//                 ),
//             },
//           );
//         }
//       },
//     );

//     return configuredColumns;
//   }, [allowedColumns]);

//   const visibleColumns = config.visible
//     .map((columnKey) =>
//       columnByKey.get(columnKey),
//     )
//     .filter(
//       (
//         column,
//       ): column is TableColumn =>
//         Boolean(column),
//     );

//   const exportColumnKeys = useMemo(
//     () => getExportColumnKeys(rows),
//     [rows],
//   );

//   const exportColumnLabels = useMemo(() => {
//     const labels = new Map(
//       allColumns.map((column) => [
//         String(column.key),
//         column.label,
//       ]),
//     );

//     exportColumnKeys.forEach(
//       (columnKey) => {
//         if (!labels.has(columnKey)) {
//           labels.set(
//             columnKey,
//             toColumnLabel(columnKey),
//           );
//         }
//       },
//     );

//     return labels;
//   }, [exportColumnKeys]);

//   const hasTableData =
//     rows.length > 0;

//   /**
//    * ---------------------------------------------------------
//    * COLUMN DIALOG
//    * ---------------------------------------------------------
//    */
//   const openColumnDialog = () => {
//     const hiddenWithoutNonTransferable =
//       config.hidden.filter(
//         (key) =>
//           !NON_TRANSFERABLE_COLUMNS.has(
//             key,
//           ),
//       );

//     const visibleWithNonTransferable =
//       Array.from(
//         new Set([
//           ...(config.visible ?? []),
//           ...Array.from(
//             NON_TRANSFERABLE_COLUMNS,
//           ),
//         ]),
//       );

//     setLeft(
//       hiddenWithoutNonTransferable,
//     );

//     setRight(
//       visibleWithNonTransferable,
//     );

//     setChecked([]);

//     setOpenTransferDialog(true);
//   };

//   const handleToggle =
//     (item: string) => () => {
//       if (
//         NON_TRANSFERABLE_COLUMNS.has(
//           item,
//         )
//       ) {
//         return;
//       }

//       setChecked((prev) =>
//         prev.includes(item)
//           ? prev.filter(
//               (i) => i !== item,
//             )
//           : [...prev, item],
//       );
//     };

//   const moveRight = () => {
//     const checkedFromAvailable =
//       checked.filter((item) =>
//         left.includes(item),
//       );

//     const availableSlots =
//       maxVisibleColumns -
//       right.length;

//     if (availableSlots <= 0) {
//       setClaimError(
//         `Only ${maxVisibleColumns} columns can be visible at a time.`,
//       );
//       return;
//     }

//     const transferable =
//       checkedFromAvailable.filter(
//         (item) =>
//           !NON_TRANSFERABLE_COLUMNS.has(
//             item,
//           ),
//       );

//     const itemsToMove =
//       transferable.slice(
//         0,
//         availableSlots,
//       );

//     if (
//       checkedFromAvailable.length >
//       availableSlots
//     ) {
//       setClaimError(
//         `Only ${maxVisibleColumns} columns can be visible at a time.`,
//       );
//     }

//     setLeft((prev) =>
//       prev.filter(
//         (item) =>
//           !itemsToMove.includes(item),
//       ),
//     );

//     setRight((prev) => [
//       ...prev,
//       ...itemsToMove,
//     ]);

//     setChecked([]);
//   };

//   const moveLeft = () => {
//     const itemsToRemove =
//       checked.filter(
//         (item) =>
//           !NON_TRANSFERABLE_COLUMNS.has(
//             item,
//           ),
//       );

//     setRight((prev) =>
//       prev.filter(
//         (item) =>
//           !itemsToRemove.includes(
//             item,
//           ),
//       ),
//     );

//     setLeft((prev) => [
//       ...prev,
//       ...itemsToRemove,
//     ]);

//     setChecked([]);
//   };

//   /**
//    * ---------------------------------------------------------
//    * SORT
//    * ---------------------------------------------------------
//    */
//   const handleSort = (
//     columnKey: keyof tableData,
//   ) => {
//     setPage(0);

//     if (sortKey === columnKey) {
//       setSortDirection(
//         (prev) =>
//           prev === "asc"
//             ? "desc"
//             : "asc",
//       );

//       return;
//     }

//     setSortKey(columnKey);
//     setSortDirection("asc");
//   };

//   const getSortIndicator = (
//     columnKey: keyof tableData,
//   ) => {
//     if (sortKey !== columnKey) {
//       return "⇅";
//     }

//     return sortDirection === "asc"
//       ? "▲"
//       : "▼";
//   };

//   const compareByColumn = (
//     a: tableData,
//     b: tableData,
//     column: TableColumn,
//   ) => {
//     const aRaw = a[column.key];
//     const bRaw = b[column.key];

//     const aText =
//       toFilterComparableValue(
//         aRaw,
//       ).trim();

//     const bText =
//       toFilterComparableValue(
//         bRaw,
//       ).trim();

//     if (!aText && !bText) {
//       return 0;
//     }

//     if (!aText) {
//       return 1;
//     }

//     if (!bText) {
//       return -1;
//     }

//     if (column.numeric) {
//       const aNum = Number(
//         aText
//           .toString()
//           .replace(/,/g, ""),
//       );

//       const bNum = Number(
//         bText
//           .toString()
//           .replace(/,/g, ""),
//       );

//       if (
//         Number.isFinite(aNum) &&
//         Number.isFinite(bNum)
//       ) {
//         return aNum - bNum;
//       }
//     }

//     const aDate = Date.parse(aText);
//     const bDate = Date.parse(bText);

//     if (
//       !Number.isNaN(aDate) &&
//       !Number.isNaN(bDate)
//     ) {
//       return aDate - bDate;
//     }

//     return aText.localeCompare(
//       bText,
//       undefined,
//       {
//         numeric: true,
//         sensitivity: "base",
//       },
//     );
//   };

//   /**
//    * ---------------------------------------------------------
//    * APPLY COLUMN CONFIG
//    * ---------------------------------------------------------
//    */
//   const handleApply = async () => {
//     try {
//       const finalVisible =
//         Array.from(
//           new Set([
//             ...(right ?? []),
//             ...Array.from(
//               NON_TRANSFERABLE_COLUMNS,
//             ),
//           ]),
//         );

//       const finalHidden =
//         (left ?? []).filter(
//           (key) =>
//             !NON_TRANSFERABLE_COLUMNS.has(
//               key,
//             ),
//         );

//       await updateConfig({
//         visible: finalVisible,
//         hidden: finalHidden,
//       });

//       setOpenTransferDialog(false);
//     } catch (error) {
//       setClaimError(
//         error instanceof Error
//           ? error.message
//           : "Failed to save column sequence.",
//       );
//     }
//   };

//   /**
//    * ---------------------------------------------------------
//    * TABLE HEADER
//    * ---------------------------------------------------------
//    */
//   const headerContent = () => (
//     <TableRow
//       sx={{
//         "&:hover": {
//           backgroundColor: "#f5faff",
//           cursor: "pointer",
//         },
//       }}
//     >
//       {visibleColumns.map(
//         (column: TableColumn) => (
//           <TableCell
//             key={String(column.key)}
//             variant="head"
//             align={
//               column.numeric
//                 ? "right"
//                 : "left"
//             }
//             onClick={() =>
//               handleSort(column.key)
//             }
//             sx={{
//               backgroundColor:
//                 "#E9EEF3",
//               fontWeight: "bold",
//               fontSize: "12px",
//               width: column.width,
//               padding: "7px",
//               userSelect: "none",
//               whiteSpace: "nowrap",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent:
//                   column.numeric
//                     ? "flex-end"
//                     : "flex-start",
//                 gap: 0.5,
//                 flexWrap: "nowrap",
//               }}
//             >
//               <Typography
//                 component="span"
//                 sx={{
//                   fontSize: "13px",
//                   fontWeight: "bold",
//                   whiteSpace:
//                     "nowrap",
//                 }}
//               >
//                 {column.label}
//               </Typography>

//               <Typography
//                 component="span"
//                 sx={{
//                   fontSize: "11px",
//                   color: "#4A4A4A",
//                 }}
//               >
//                 {getSortIndicator(
//                   column.key,
//                 )}
//               </Typography>
//             </Box>
//           </TableCell>
//         ),
//       )}
//     </TableRow>
//   );

//   /**
//    * ---------------------------------------------------------
//    * CUSTOM COLUMN LIST
//    * ---------------------------------------------------------
//    */
//   const customList = (
//     title: string,
//     items: string[],
//   ) => {
//     const isAvailableList =
//       title === "Available";

//     return (
//       <Paper
//         sx={{
//           width: 300,
//           height: 400,
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <Box
//           sx={{
//             px: 2,
//             py: 1,
//             backgroundColor: "#f5f5f5",
//           }}
//         >
//           <Typography variant="subtitle1">
//             {title}
//           </Typography>
//         </Box>

//         <Box
//           sx={{
//             flexGrow: 1,
//             overflowY: "auto",
//             overflowX: "hidden",
//           }}
//         >
//           <List dense>
//             {items.map((item) => (
//               <ListItem
//                 key={item}
//                 disablePadding
//               >
//                 <Box sx={{ px: 2 }}>
//                   <CustomCheckbox
//                     label={
//                       columnByKey.get(
//                         item,
//                       )?.label ?? item
//                     }
//                     checked={checked.includes(
//                       item,
//                     )}
//                     disabled={
//                       isAvailableList &&
//                       right.length >=
//                         maxVisibleColumns &&
//                       !checked.includes(
//                         item,
//                       )
//                     }
//                     onChange={handleToggle(
//                       item,
//                     )}
//                   />
//                 </Box>
//               </ListItem>
//             ))}
//           </List>
//         </Box>
//       </Paper>
//     );
//   };

//   /**
//    * ---------------------------------------------------------
//    * FILTER
//    * ---------------------------------------------------------
//    */
//   const filteredRows = rows
//     .filter((row) => {
//       if (
//         poolStatusFilter ===
//         "All"
//       ) {
//         return true;
//       }

//       const rowData =
//         row as unknown as Record<
//           string,
//           unknown
//         >;

//       const poolStatus = String(
//         rowData.poolStatus ?? "",
//       )
//         .trim()
//         .toLowerCase();

//       return (
//         poolStatus ===
//         poolStatusFilter.toLowerCase()
//       );
//     })
//     .filter((row) => {
//       const activeFilters =
//         Object.entries(
//           filterValues,
//         );

//       if (!activeFilters.length) {
//         return true;
//       }

//       return activeFilters.every(
//         ([key, values]) => {
//           if (!values.length) {
//             return true;
//           }

//           const rowValue =
//             toFilterComparableValue(
//               row[
//                 key as keyof typeof row
//               ],
//             );

//           return values.includes(
//             rowValue,
//           );
//         },
//       );
//     })
//     .filter((row) => {
//       if (!searchText.trim()) {
//         return true;
//       }

//       const search =
//         searchText.toLowerCase();

//       return visibleColumns.some(
//         (column) => {
//           const value =
//             row[column.key];

//           return String(value ?? "")
//             .toLowerCase()
//             .includes(search);
//         },
//       );
//     });

//   /**
//    * ---------------------------------------------------------
//    * SORTED ROWS
//    * ---------------------------------------------------------
//    */
//   const sortedRows = useMemo(() => {
//     if (!sortKey) {
//       return filteredRows;
//     }

//     const sortColumn =
//       visibleColumns.find(
//         (column) =>
//           column.key === sortKey,
//       );

//     if (!sortColumn) {
//       return filteredRows;
//     }

//     const sorted = [
//       ...filteredRows,
//     ].sort((a, b) =>
//       compareByColumn(
//         a,
//         b,
//         sortColumn,
//       ),
//     );

//     return sortDirection === "asc"
//       ? sorted
//       : sorted.reverse();
//   }, [
//     filteredRows,
//     sortDirection,
//     sortKey,
//     visibleColumns,
//   ]);

//   /**
//    * ---------------------------------------------------------
//    * PAGINATION
//    * ---------------------------------------------------------
//    */
//   const paginatedRows =
//     rowsPerPage === -1
//       ? sortedRows
//       : sortedRows.slice(
//           page * rowsPerPage,
//           page * rowsPerPage +
//             rowsPerPage,
//         );

//   const totalCount =
//     sortedRows.length;

//   const totalPages =
//     rowsPerPage === -1
//       ? 1
//       : Math.ceil(
//           totalCount / rowsPerPage,
//         );

//   const startRecord =
//     totalCount === 0
//       ? 0
//       : rowsPerPage === -1
//         ? 1
//         : page * rowsPerPage + 1;

//   const endRecord =
//     rowsPerPage === -1
//       ? totalCount
//       : Math.min(
//           (page + 1) * rowsPerPage,
//           totalCount,
//         );

//   const handleChangeRowsPerPage = (
//     event: SelectChangeEvent,
//   ) => {
//     const value = Number(
//       event.target.value,
//     );

//     setRowsPerPage(value);
//     setPage(0);
//   };

//   /**
//    * ---------------------------------------------------------
//    * DOWNLOAD
//    * ---------------------------------------------------------
//    */
//   const handleDownloadExcel = () => {
//     if (
//       !sortedRows.length ||
//       !exportColumnKeys.length
//     ) {
//       return;
//     }

//     downloadRowsAsExcel({
//       rows: sortedRows,
//       columnKeys:
//         exportColumnKeys,
//       columnLabels:
//         exportColumnLabels,
//       selectedPool,
//     });
//   };

//   /**
//    * ---------------------------------------------------------
//    * PAGE BUTTONS
//    * ---------------------------------------------------------
//    */
//   const renderPageButtons = () => {
//     const pages: Array<
//       number | string
//     > = [];

//     if (totalPages <= 7) {
//       for (
//         let i = 1;
//         i <= totalPages;
//         i += 1
//       ) {
//         pages.push(i);
//       }
//     } else if (page <= 3) {
//       pages.push(
//         1,
//         2,
//         3,
//         4,
//         "...",
//         totalPages - 1,
//         totalPages,
//       );
//     } else if (
//       page >= totalPages - 4
//     ) {
//       pages.push(
//         1,
//         2,
//         "...",
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       );
//     } else {
//       pages.push(
//         1,
//         2,
//         "...",
//         page + 1,
//         "...",
//         totalPages - 1,
//         totalPages,
//       );
//     }

//     return pages.map(
//       (item, index) =>
//         typeof item === "number" ? (
//           <CustomButton
//             key={item}
//             size="small"
//             variant={
//               item === page + 1
//                 ? "outlined"
//                 : "text"
//             }
//             onClick={() =>
//               setPage(item - 1)
//             }
//             sx={{
//               minWidth: 32,
//               borderRadius: "134px",
//               px: "10px",
//               py: "6px",
//               fontWeight:
//                 item === page + 1
//                   ? 600
//                   : 400,
//               ...(item !== page + 1 && {
//                 color: "#444444",
//               }),
//             }}
//           >
//             {item}
//           </CustomButton>
//         ) : (
//           <Typography
//             key={`${item}-${index}`}
//             sx={{
//               mx: 1,
//               color:
//                 "text.secondary",
//             }}
//           >
//             {item}
//           </Typography>
//         ),
//     );
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         backgroundColor: "#F0F3F8",
//         height: "90vh",
//       }}
//     >
//       {openingCaseLoading && (
//         <Box
//           sx={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 2000,
//             display: "flex",
//             alignItems: "center",
//             justifyContent:
//               "center",
//             backgroundColor:
//               "rgba(0,0,0,0.25)",
//           }}
//         >
//           <CircularProgress
//             size={64}
//             sx={{
//               color: "#fff",
//             }}
//           />
//         </Box>
//       )}

//       <Box
//         sx={{
//           width: "100%",
//           backgroundColor:
//             "transparent",
//           ...columnFlex,
//           margin: 1,
//         }}
//       >
//         {/* =====================================================
//             HEADER
//         ====================================================== */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent:
//               "space-between",
//             alignItems: "center",
//             p: 0.7,
//             pl: 2,
//             borderRadius:
//               "20px 20px 0 0",
//             backgroundColor: "#004A80",
//             color: "#FFFFFF",
//           }}
//         >
//           <Typography
//             sx={{
//               fontSize: "14px",
//               fontWeight: 600,
//               textTransform:
//                 "capitalize",
//             }}
//           >
//             {selectedPool
//               ? selectedPool.replace(
//                   /_/g,
//                   " ",
//                 )
//               : ""}
//           </Typography>

//           {(isLeaveManagementPool ||
//             selectedPool ===
//               "UW Details") && (
//             <CustomButton
//               variant="contained"
//               size="small"
//               onClick={() => {
//                 if (
//                   isLeaveManagementPool
//                 ) {
//                   setAddLeavesFormPool(
//                     selectedPool,
//                   );
//                 }
//               }}
//               sx={{
//                 backgroundColor:
//                   "white",
//                 color: "#063E6F",
//                 fontWeight: 700,
//                 fontSize: "14px",
//                 "&:hover": {
//                   backgroundColor:
//                     "white",
//                 },
//                 mr: 2,
//               }}
//             >
//               {isLeaveManagementPool
//                 ? "Add Leaves"
//                 : "+ Add"}
//             </CustomButton>
//           )}
//         </Box>

//         {selectedPool !==
//           "Search Applications" && (
//           <>
//             {isLeaveManagementPool &&
//             showAddLeavesForm ? (
//               renderAddLeavesForm()
//             ) : (
//               <>
//                 {/* =================================================
//                     SEARCH / FILTER / SETTINGS
//                 ================================================== */}
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent:
//                       "space-between",
//                     alignItems:
//                       "center",
//                     top: 8,
//                     right: 24,
//                     gap: 1,
//                     backgroundColor:
//                       "#fff",
//                     px: 2,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems:
//                         "center",
//                       gap: 1,
//                       width: "100%",
//                       justifyContent:
//                         "flex-end",
//                     }}
//                   >
//                     <CustomButton
//                       size="small"
//                       variant="outlined"
//                       onClick={
//                         handleDownloadExcel
//                       }
//                       disabled={
//                         !sortedRows.length
//                       }
//                       sx={{
//                         mr: 1,
//                         whiteSpace:
//                           "nowrap",
//                         backgroundColor:
//                           "#FFFFFF",
//                       }}
//                     >
//                       Download Excel
//                     </CustomButton>

//                     {/* SEARCH */}
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems:
//                           "center",
//                         justifyContent:
//                           "flex-end",
//                         flex: 1,
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           width:
//                             isSearchOpen
//                               ? 280
//                               : 0,
//                           opacity:
//                             isSearchOpen
//                               ? 1
//                               : 0,
//                           overflow:
//                             "hidden",
//                           whiteSpace:
//                             "nowrap",
//                           transition:
//                             "width 300ms ease-in-out, opacity 200ms ease-in-out",
//                           ml:
//                             isSearchOpen
//                               ? 1
//                               : 0,
//                           mr:
//                             isSearchOpen
//                               ? 2
//                               : 0,
//                           pointerEvents:
//                             isSearchOpen
//                               ? "auto"
//                               : "none",
//                         }}
//                       >
//                         <SearchBar
//                           value={
//                             searchText
//                           }
//                           onChange={(event) => {
//                             setSearchText(
//                               event
//                                 .target
//                                 .value,
//                             );
//                             setPage(0);
//                           }}
//                         />
//                       </Box>

//                       <Box
//                         sx={{
//                           width: 40,
//                           display:
//                             "flex",
//                           justifyContent:
//                             "center",
//                           flexShrink: 0,
//                           cursor:
//                             hasTableData
//                               ? "pointer"
//                               : "not-allowed",
//                           opacity:
//                             hasTableData
//                               ? 1
//                               : 0.4,
//                         }}
//                         onClick={() => {
//                           if (
//                             !hasTableData
//                           ) {
//                             return;
//                           }

//                           setIsSearchOpen(
//                             (prev) =>
//                               !prev,
//                           );
//                         }}
//                         aria-disabled={
//                           !hasTableData
//                         }
//                         data-testid="search-toggle"
//                       >
//                         <SearchIcon />
//                       </Box>
//                     </Box>

//                     {/* FILTER */}
//                     <Box
//                       sx={{
//                         cursor:
//                           hasTableData
//                             ? "pointer"
//                             : "not-allowed",
//                         opacity:
//                           hasTableData
//                             ? 1
//                             : 0.4,
//                         mt: 0.7,
//                       }}
//                       onClick={() => {
//                         if (
//                           !hasTableData
//                         ) {
//                           return;
//                         }

//                         setOpenFilterDialog(
//                           true,
//                         );
//                       }}
//                       aria-disabled={
//                         !hasTableData
//                       }
//                       data-testid="filter-toggle"
//                     >
//                       <FilterIcon />
//                     </Box>

//                     {/* SETTINGS */}
//                     <Box
//                       sx={{
//                         cursor:
//                           hasTableData
//                             ? "pointer"
//                             : "not-allowed",
//                         opacity:
//                           hasTableData
//                             ? 1
//                             : 0.4,
//                         mt: 0.7,
//                       }}
//                       onClick={() => {
//                         if (
//                           !hasTableData
//                         ) {
//                           return;
//                         }

//                         openColumnDialog();
//                       }}
//                       aria-disabled={
//                         !hasTableData
//                       }
//                       data-testid="settings-toggle"
//                     >
//                       <SettingsIcon />
//                     </Box>
//                   </Box>
//                 </Box>

//                 {/* =================================================
//                     TABLE
//                 ================================================== */}
//                 <Paper
//                   sx={{
//                     height: "100%",
//                     width: "100%",
//                     ...columnFlex,
//                     borderRadius:
//                       "0 0 20px 20px",
//                   }}
//                 >
//                   <TableContainer
//                     component={Paper}
//                     sx={{
//                       flexGrow: 1,
//                       overflowX: "auto",
//                     }}
//                   >
//                     <Table
//                       sx={{
//                         tableLayout:
//                           "auto",
//                         minWidth:
//                           "max-content",
//                       }}
//                       stickyHeader
//                     >
//                       {hasTableData && (
//                         <TableHead
//                           sx={{
//                             backgroundColor:
//                               "#E9EEF3",
//                           }}
//                         >
//                           {headerContent()}
//                         </TableHead>
//                       )}

//                       <TableBody>
//                         {paginatedRows.map(
//                           (row) => {
//                             const taskTimingStatus =
//                               getTaskTimingStatus(
//                                 row,
//                                 currentTimeMs,
//                               );

//                             const taskTimingRowStyle =
//                               TASK_TIMING_ROW_STYLES[
//                                 taskTimingStatus
//                               ];

//                             return (
//                               <TableRow
//                                 key={`${selectedPool}-${row.applicationNo ?? ""}-${row.taskId ?? ""}-${row.id ?? ""}`}
//                                 hover
//                                 sx={{
//                                   cursor:
//                                     "pointer",
//                                   backgroundColor:
//                                     taskTimingRowStyle.backgroundColor,
//                                   "& td":
//                                     {
//                                       color:
//                                         taskTimingRowStyle.textColor,
//                                     },
//                                   "&:hover":
//                                     {
//                                       backgroundColor:
//                                         taskTimingRowStyle.hoverColor,
//                                     },
//                                 }}
//                               >
//                                 {visibleColumns.map(
//                                   (
//                                     col,
//                                   ) => {
//                                     const cellValue =
//                                       row[
//                                         col.key
//                                       ];

//                                     let displayValue: string;

//                                     if (
//                                       TASK_TIMING_COLUMN_KEYS.has(
//                                         col.key as TaskTimingColumnKey,
//                                       )
//                                     ) {
//                                       displayValue =
//                                         formatTaskTimingValue(
//                                           cellValue,
//                                         );
//                                     } else if (
//                                       typeof cellValue ===
//                                         "string" &&
//                                       /date|time|timestamp/i.test(
//                                         String(
//                                           col.key,
//                                         ),
//                                       )
//                                     ) {
//                                       const formatted =
//                                         formatDateForUI(
//                                           cellValue,
//                                         );

//                                       displayValue =
//                                         formatted ||
//                                         String(
//                                           cellValue ??
//                                             "",
//                                         );
//                                     } else if (
//                                       col.key ===
//                                       "isMedical"
//                                     ) {
//                                       if (
//                                         cellValue ===
//                                           true ||
//                                         String(
//                                           cellValue,
//                                         ).toLowerCase() ===
//                                           "true"
//                                       ) {
//                                         displayValue =
//                                           "Yes";
//                                       } else if (
//                                         cellValue ===
//                                           false ||
//                                         String(
//                                           cellValue,
//                                         ).toLowerCase() ===
//                                           "false"
//                                       ) {
//                                         displayValue =
//                                           "No";
//                                       } else {
//                                         displayValue =
//                                           String(
//                                             cellValue ??
//                                               "",
//                                           );
//                                       }
//                                     } else {
//                                       displayValue =
//                                         String(
//                                           cellValue ??
//                                             "",
//                                         );
//                                     }

//                                     return (
//                                       <TableCell
//                                         key={String(
//                                           col.key,
//                                         )}
//                                         sx={{
//                                           padding:
//                                             "7px",
//                                           fontSize:
//                                             "11px",
//                                         }}
//                                       >
//                                         {col.key ===
//                                         "drc" ? (
//                                           <Badge
//                                             label={
//                                               row.drc
//                                             }
//                                             variant={
//                                               row.drc ===
//                                               "Medium"
//                                                 ? "Medium"
//                                                 : row.drc ===
//                                                     "Low"
//                                                   ? "Low"
//                                                   : "High"
//                                             }
//                                           />
//                                         ) : col.key ===
//                                           "applicationNo" ? (
//                                           <Typography
//                                             sx={{
//                                               cursor:
//                                                 "pointer",
//                                               fontWeight:
//                                                 600,
//                                               fontSize:
//                                                 "11px",
//                                               color:
//                                                 taskTimingStatus ===
//                                                 "normal"
//                                                   ? "#0E3762"
//                                                   : taskTimingRowStyle.textColor,
//                                               "&:hover":
//                                                 {
//                                                   textDecoration:
//                                                     "underline",
//                                                 },
//                                             }}
//                                             onClick={(
//                                               event,
//                                             ) => {
//                                               void handleApplicationClick(
//                                                 event,
//                                                 row,
//                                               );
//                                             }}
//                                           >
//                                             {
//                                               row.applicationNo
//                                             }
//                                           </Typography>
//                                         ) : (
//                                           displayValue
//                                         )}
//                                       </TableCell>
//                                     );
//                                   },
//                                 )}
//                               </TableRow>
//                             );
//                           },
//                         )}

//                         {paginatedRows.length <=
//                           0 && (
//                           <TableRow>
//                             <TableCell
//                               colSpan={
//                                 visibleColumns.length
//                               }
//                               sx={{
//                                 height:
//                                   "60vh",
//                                 textAlign:
//                                   "center",
//                                 verticalAlign:
//                                   "middle",
//                               }}
//                             >
//                               No Data Found!
//                             </TableCell>
//                           </TableRow>
//                         )}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>

//                   {/* =================================================
//                       PAGINATION
//                   ================================================== */}
//                   {paginatedRows.length >
//                     0 && (
//                     <Box
//                       sx={{
//                         borderTop:
//                           "1px solid #e0e0e0",
//                         px: 2,
//                         py: 1.5,
//                         borderRadius:
//                           "0 0 20px",
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           display: "flex",
//                           justifyContent:
//                             "space-between",
//                           alignItems:
//                             "center",
//                           flexWrap:
//                             "wrap",
//                           gap: 2,
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             display:
//                               "flex",
//                             alignItems:
//                               "center",
//                             gap: 1,
//                           }}
//                         >
//                           <Typography
//                             sx={{
//                               fontSize: 14,
//                               color:
//                                 "#444444",
//                             }}
//                           >
//                             Show
//                           </Typography>

//                           <Select
//                             value={
//                               rowsPerPage
//                             }
//                             size="small"
//                             onChange={
//                               handleChangeRowsPerPage
//                             }
//                             sx={{
//                               minWidth:
//                                 80,
//                               height: 34,
//                               fontSize:
//                                 14,
//                             }}
//                           >
//                             <MenuItem value={10}>
//                               10
//                             </MenuItem>

//                             <MenuItem value={25}>
//                               25
//                             </MenuItem>

//                             <MenuItem value={50}>
//                               50
//                             </MenuItem>

//                             <MenuItem value={100}>
//                               100
//                             </MenuItem>

//                             <MenuItem value={-1}>
//                               All
//                             </MenuItem>
//                           </Select>
//                         </Box>

//                         <Box
//                           sx={{
//                             display:
//                               "flex",
//                             alignItems:
//                               "center",
//                             gap: 1,
//                             flexWrap:
//                               "wrap",
//                           }}
//                         >
//                           <CustomButton
//                             onClick={() =>
//                               setPage(
//                                 Math.max(
//                                   0,
//                                   page - 1,
//                                 ),
//                               )
//                             }
//                             disabled={
//                               page === 0
//                             }
//                           >
//                             <KeyLeftArrowIcon />
//                             Previous
//                           </CustomButton>

//                           {renderPageButtons()}

//                           <CustomButton
//                             onClick={() =>
//                               setPage(
//                                 Math.min(
//                                   totalPages -
//                                     1,
//                                   page + 1,
//                                 ),
//                               )
//                             }
//                             disabled={
//                               page >=
//                               totalPages -
//                                 1
//                             }
//                           >
//                             Next
//                             <KeyRightArrowIcon />
//                           </CustomButton>
//                         </Box>

//                         <Typography
//                           sx={{
//                             fontSize: 14,
//                             color:
//                               "#444444",
//                           }}
//                         >
//                           Showing{" "}
//                           {startRecord}-
//                           {endRecord} of{" "}
//                           {totalCount}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   )}
//                 </Paper>

//                 {/* =================================================
//                     FILTER
//                 ================================================== */}
//                 <FilterTable
//                   openFilterDialog={
//                     openFilterDialog
//                   }
//                   setOpenFilterDialog={
//                     setOpenFilterDialog
//                   }
//                   filterValues={
//                     filterValues
//                   }
//                   setFilterValues={
//                     setFilterValues
//                   }
//                   visibleColumns={
//                     visibleColumns
//                   }
//                   rows={rows}
//                   onApply={() =>
//                     setPage(0)
//                   }
//                 />

//                 {/* =================================================
//                     CUSTOM COLUMN DIALOG
//                 ================================================== */}
//                 <CustomDialog
//                   open={
//                     openTransferDialog
//                   }
//                   onClose={() =>
//                     setOpenTransferDialog(
//                       false,
//                     )
//                   }
//                   title="Customize Columns"
//                   maxWidth="md"
//                   fullWidth
//                   titleSx={{
//                     ...modalTitleStyles,
//                   }}
//                   contentSx={{
//                     p: 3,
//                   }}
//                   actionsSx={{
//                     justifyContent:
//                       "center",
//                     pb: 3,
//                   }}
//                   actions={
//                     <CustomButton
//                       variant="contained"
//                       onClick={
//                         handleApply
//                       }
//                       sx={{
//                         width: "150px",
//                         borderRadius:
//                           "50px",
//                       }}
//                     >
//                       Apply
//                     </CustomButton>
//                   }
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       gap: 2,
//                       justifyContent:
//                         "center",
//                       alignItems:
//                         "center",
//                       flexWrap:
//                         "wrap",
//                     }}
//                   >
//                     {customList(
//                       "Available",
//                       left,
//                     )}

//                     <Box
//                       sx={{
//                         display:
//                           "flex",
//                         flexDirection:
//                           "column",
//                         alignItems:
//                           "center",
//                         gap: 1,
//                         mt: 2,
//                       }}
//                     >
//                       <CustomButton
//                         sx={{
//                           my: 1,
//                         }}
//                         variant="outlined"
//                         size="small"
//                         onClick={
//                           moveRight
//                         }
//                         disabled={
//                           checked.filter(
//                             (item) =>
//                               left.includes(
//                                 item,
//                               ),
//                           ).length ===
//                             0 ||
//                           right.length >=
//                             maxVisibleColumns
//                         }
//                       >
//                         <Box component="span">
//                           ›
//                         </Box>
//                       </CustomButton>

//                       <CustomButton
//                         sx={{
//                           my: 1,
//                         }}
//                         variant="outlined"
//                         size="small"
//                         disabled={
//                           checked.filter(
//                             (item) =>
//                               right.includes(
//                                 item,
//                               ),
//                           ).length ===
//                           0
//                         }
//                         onClick={
//                           moveLeft
//                         }
//                       >
//                         <Box component="span">
//                           ‹
//                         </Box>
//                       </CustomButton>
//                     </Box>

//                     {customList(
//                       "Visible",
//                       right,
//                     )}
//                   </Box>
//                 </CustomDialog>
//               </>
//             )}
//           </>
//         )}

//         {/* =======================================================
//             SEARCH APPLICATIONS
//         ======================================================== */}
//         {selectedPool ===
//           "Search Applications" && (
//           <SearchApplication />
//         )}
//       </Box>

//       {/* =========================================================
//           ERROR SNACKBAR
//       ========================================================== */}
//       <Snackbar
//         open={Boolean(claimError)}
//         autoHideDuration={3000}
//         onClose={() =>
//           setClaimError("")
//         }
//         anchorOrigin={{
//           vertical: "top",
//           horizontal: "center",
//         }}
//       >
//         <Alert
//           onClose={() =>
//             setClaimError("")
//           }
//           severity="error"
//           variant="filled"
//           sx={{
//             width: "100%",
//           }}
//         >
//           {claimError}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default RightPanel;