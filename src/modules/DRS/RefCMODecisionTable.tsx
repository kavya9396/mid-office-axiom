// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from "@mui/material";

// export interface RefCMODecisionRow {
//   id?: string | number;
//   fupCode: string;
//   medicalType: string;
//   raisedDate: string;
//   receivedDate: string;
//   vendorCmoOpinion?: string;
//   vendorCmoRemarks?: string;
//   hoCmoDecision?: string;
//   hoCmoRemarks?: string;
// }

// export const REF_CMO_HARDCODED_ROWS: RefCMODecisionRow[] = [
//   {
//     id: 1,
//     fupCode: "-",
//     medicalType: "Special Medical",
//     raisedDate: "1 Sep 2026",
//     receivedDate: "2 Sep 2026",
//     vendorCmoOpinion: "STD",
//     vendorCmoRemarks: "All medical parameters are within acceptable limits.",
//     hoCmoDecision: "STD",
//     hoCmoRemarks: "Vendor CMO opinion reviewed and accepted.",
//   },
//   {
//     id: 2,
//     fupCode: "-",
//     medicalType: "Special Medical",
//     raisedDate: "1 Sep 2026",
//     receivedDate: "3 Sep 2026",
//     vendorCmoOpinion: "Refer to 2nd Opinion",
//     vendorCmoRemarks: "Borderline ECG findings; cardiology review advised.",
//     hoCmoDecision: "Sub STD",
//     hoCmoRemarks: "Second opinion reviewed; apply sub-standard terms.",
//   },
// ];

// interface RefCMODecisionTableProps {
//   title?: string;
//   rows?: RefCMODecisionRow[];
// }

// const headerCellSx = {
//   minWidth: 0,
//   backgroundColor: "#FFEAD7",
//   color: "#000000",
//   fontSize: "11px",
//   fontWeight: 600,
//   py: 0.75,
//   px: 0.75,
//   lineHeight: 1.2,
//   borderBottom: "1px solid #D6D6D6",
//   whiteSpace: "normal",
//   overflowWrap: "anywhere",
//   wordBreak: "break-word",
// };

// const bodyCellSx = {
//   minWidth: 0,
//   color: "#4A4A4A",
//   fontSize: "10px",
//   py: 0.65,
//   px: 0.75,
//   lineHeight: 1.3,
//   borderBottom: "1px solid #E1E1E1",
//   whiteSpace: "normal",
//   overflowWrap: "anywhere",
//   wordBreak: "break-word",
// };

// const displayValue = (value?: string) => value?.trim() || "-";

// export default function RefCMODecisionTable({
//   title = "Decision History",
//   rows = REF_CMO_HARDCODED_ROWS,
// }: RefCMODecisionTableProps) {
//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         width: "100%",
//         maxWidth: "100%",
//         border: "1px solid #D8D8D8",
//         borderRadius: "14px",
//         overflow: "hidden",
//       }}
//     >
//       {title && (
//         <Box
//           sx={{
//             backgroundColor: "#E45F14",
//             color: "#FFFFFF",
//             px: 3,
//             py: 1.2,
//             display: "flex",
//             alignItems: "center",
//           }}
//         >
//           <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
//             {title}
//           </Typography>
//         </Box>
//       )}

//       <TableContainer
//         sx={{
//           width: "100%",
//           maxWidth: "100%",
//           overflowX: "hidden",
//         }}
//       >
//         <Table
//           size="small"
//           aria-readonly="true"
//           sx={{
//             width: "100%",
//             minWidth: 0,
//             maxWidth: "100%",
//             tableLayout: "fixed",
//             "& .MuiTableCell-root": {
//               minWidth: 0,
//             },
//             "& tr:last-child td": {
//               borderBottom: "none",
//             },
//           }}
//         >
//           <TableHead>
//             <TableRow>
//               <TableCell sx={{ ...headerCellSx, width: "9%" }}>
//                 FUP Code
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "12%" }}>
//                 Medical Type
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "10%" }}>
//                 Raised Date
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "10%" }}>
//                 Received Date
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "14%" }}>
//                 Vendor CMO Opinion
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "16%" }}>
//                 Vendor CMO Remarks
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "14%" }}>
//                 HO CMO Decision
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "15%" }}>
//                 HO CMO Remarks
//               </TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {rows.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={8} align="center" sx={bodyCellSx}>
//                   <Typography sx={{ fontSize: "11px", py: 1 }}>
//                     No data available
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             ) : (
//               rows.map((row, rowIndex) => (
//                 <TableRow key={row.id ?? rowIndex}>
//                   <TableCell sx={bodyCellSx}>
//                     {displayValue(row.fupCode)}
//                   </TableCell>
//                   <TableCell sx={bodyCellSx}>
//                     {displayValue(row.medicalType)}
//                   </TableCell>
//                   <TableCell sx={bodyCellSx}>
//                     {displayValue(row.raisedDate)}
//                   </TableCell>
//                   <TableCell sx={bodyCellSx}>
//                     {displayValue(row.receivedDate)}
//                   </TableCell>
//                   <TableCell sx={bodyCellSx}>
//                     {displayValue(row.vendorCmoOpinion)}
//                   </TableCell>
//                   <TableCell sx={bodyCellSx}>
//                     {displayValue(row.vendorCmoRemarks)}
//                   </TableCell>
//                   <TableCell sx={bodyCellSx}>
//                     {displayValue(row.hoCmoDecision)}
//                   </TableCell>
//                   <TableCell sx={bodyCellSx}>
//                     {displayValue(row.hoCmoRemarks)}
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Paper>
//   );
// }

// import {
//   Box,
//   IconButton,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Tooltip,
//   Typography,
// } from "@mui/material";
// import { useState } from "react";

// import CustomDialog from "../../components/ui/Dialog/Dialog";
// import { EyeIcon, UserProfileIcon } from "../../icons/Icons";

// export interface RefCMORemarksHistoryItem {
//   role: string;
//   name: string;
//   ntid: string;
//   date: string;
//   decision: string;
//   remarks: string;
// }

// export interface RefCMODecisionRow {
//   id?: string | number;
//   fupCode: string;
//   medicalType: string;
//   raisedDate: string;
//   receivedDate: string;

//   // Retained for compatibility with existing API responses.
//   vendorCmoOpinion?: string;
//   vendorCmoRemarks?: string;
//   vendorCmoName?: string;
//   vendorCmoNtid?: string;
//   vendorCmoDate?: string;
//   hoCmoDecision?: string;
//   hoCmoRemarks?: string;
//   hoCmoName?: string;
//   hoCmoNtid?: string;
//   hoCmoDate?: string;
//   uwDecision?: string;
//   uwRemarks?: string;
//   uwName?: string;
//   uwNtid?: string;
//   uwDate?: string;

//   remarksHistory?: RefCMORemarksHistoryItem[];
// }

// export const REF_CMO_HARDCODED_ROWS: RefCMODecisionRow[] = [
//   {
//     id: 1,
//     fupCode: "-",
//     medicalType: "Special Medical",
//     raisedDate: "1 Sep 2026",
//     receivedDate: "2 Sep 2026",
//     vendorCmoOpinion: "STD",
//     vendorCmoRemarks: "All medical parameters are within acceptable limits.",
//     hoCmoDecision: "STD",
//     hoCmoRemarks: "Vendor CMO opinion reviewed and accepted.",
//     uwDecision: "Standard",
//     uwRemarks: "Proceed with standard terms.",
//     remarksHistory: [
//       {
//         role: "Vendor CMO",
//         name: "Dr. Alpana Gandhi",
//         ntid: "IPRU84213",
//         date: "02 Sep 2026, 09:45",
//         decision: "STD",
//         remarks: "All medical parameters are within acceptable limits.",
//       },
//       {
//         role: "HO CMO",
//         name: "Dr. Vaibha Jain",
//         ntid: "IPRU91056",
//         date: "02 Sep 2026, 10:20",
//         decision: "STD",
//         remarks: "Vendor CMO opinion reviewed and accepted.",
//       },
//       {
//         role: "Underwriter",
//         name: "Kumar Murari",
//         ntid: "IPRU65342",
//         date: "02 Sep 2026, 11:05",
//         decision: "Standard",
//         remarks: "Proceed with standard terms.",
//       },
//     ],
//   },
//   {
//     id: 2,
//     fupCode: "-",
//     medicalType: "Special Medical",
//     raisedDate: "1 Sep 2026",
//     receivedDate: "3 Sep 2026",
//     vendorCmoOpinion: "Refer to 2nd Opinion",
//     vendorCmoRemarks: "Borderline ECG findings; cardiology review advised.",
//     hoCmoDecision: "Sub STD",
//     hoCmoRemarks: "Second opinion reviewed; apply sub-standard terms.",
//     remarksHistory: [
//       {
//         role: "Vendor CMO",
//         name: "Dr. Alpana Gandhi",
//         ntid: "IPRU84213",
//         date: "03 Sep 2026, 09:15",
//         decision: "Refer to 2nd Opinion",
//         remarks: "Borderline ECG findings; cardiology review advised.",
//       },
//       {
//         role: "HO CMO",
//         name: "Dr. Vaibha Jain",
//         ntid: "IPRU91056",
//         date: "03 Sep 2026, 10:10",
//         decision: "Sub STD",
//         remarks: "Second opinion reviewed; apply sub-standard terms.",
//       },
//     ],
//   },
// ];

// interface RefCMODecisionTableProps {
//   title?: string;
//   rows?: RefCMODecisionRow[];
// }

// const headerCellSx = {
//   minWidth: 0,
//   backgroundColor: "#FFEAD7",
//   color: "#000000",
//   fontSize: "11px",
//   fontWeight: 600,
//   py: 0.75,
//   px: 0.75,
//   lineHeight: 1.2,
//   borderBottom: "1px solid #D6D6D6",
//   whiteSpace: "normal",
//   overflowWrap: "anywhere",
//   wordBreak: "break-word",
// };

// const bodyCellSx = {
//   minWidth: 0,
//   color: "#4A4A4A",
//   fontSize: "10px",
//   py: 0.65,
//   px: 0.75,
//   lineHeight: 1.3,
//   borderBottom: "1px solid #E1E1E1",
//   whiteSpace: "normal",
//   overflowWrap: "anywhere",
//   wordBreak: "break-word",
// };

// const HISTORY_TONES = ["#E34F4F", "#8A5BD7", "#2E8FB8"] as const;

// const displayValue = (value?: string) => value?.trim() || "-";

// const createHistoryItem = (
//   role: string,
//   name: string | undefined,
//   ntid: string | undefined,
//   date: string | undefined,
//   fallbackDate: string,
//   decision: string | undefined,
//   remarks: string | undefined,
// ): RefCMORemarksHistoryItem | null => {
//   if (!decision?.trim() && !remarks?.trim()) {
//     return null;
//   }

//   return {
//     role,
//     name: displayValue(name),
//     ntid: displayValue(ntid),
//     date: displayValue(date || fallbackDate),
//     decision: displayValue(decision),
//     remarks: displayValue(remarks),
//   };
// };

// const getRemarksHistory = (
//   row: RefCMODecisionRow,
// ): RefCMORemarksHistoryItem[] => {
//   if (row.remarksHistory?.length) {
//     return row.remarksHistory;
//   }

//   return [
//     createHistoryItem(
//       "Vendor CMO",
//       row.vendorCmoName,
//       row.vendorCmoNtid,
//       row.vendorCmoDate,
//       row.receivedDate,
//       row.vendorCmoOpinion,
//       row.vendorCmoRemarks,
//     ),
//     createHistoryItem(
//       "HO CMO",
//       row.hoCmoName,
//       row.hoCmoNtid,
//       row.hoCmoDate,
//       row.receivedDate,
//       row.hoCmoDecision,
//       row.hoCmoRemarks,
//     ),
//     createHistoryItem(
//       "Underwriter",
//       row.uwName,
//       row.uwNtid,
//       row.uwDate,
//       row.receivedDate,
//       row.uwDecision,
//       row.uwRemarks,
//     ),
//   ].filter((item): item is RefCMORemarksHistoryItem => item !== null);
// };

// export default function RefCMODecisionTable({
//   title = "Decision History",
//   rows = REF_CMO_HARDCODED_ROWS,
// }: RefCMODecisionTableProps) {
//   const [selectedHistoryRow, setSelectedHistoryRow] =
//     useState<RefCMODecisionRow | null>(null);
//   const selectedRemarksHistory = selectedHistoryRow
//     ? getRemarksHistory(selectedHistoryRow)
//     : [];

//   return (
//     <>
//       <Paper
//         elevation={0}
//         sx={{
//           width: "100%",
//           maxWidth: "100%",
//           border: "1px solid #D8D8D8",
//           borderRadius: "14px",
//           overflow: "hidden",
//         }}
//       >
//         {title && (
//           <Box
//             sx={{
//               backgroundColor: "#E45F14",
//               color: "#FFFFFF",
//               px: 3,
//               py: 1.2,
//               display: "flex",
//               alignItems: "center",
//             }}
//           >
//             <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
//               {title}
//             </Typography>
//           </Box>
//         )}

//         <TableContainer
//           sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}
//         >
//           <Table
//             size="small"
//             aria-readonly="true"
//             sx={{
//               width: "100%",
//               minWidth: 0,
//               maxWidth: "100%",
//               tableLayout: "fixed",
//               "& .MuiTableCell-root": { minWidth: 0 },
//               "& tr:last-child td": { borderBottom: "none" },
//             }}
//           >
//             <TableHead>
//               <TableRow>
//                 <TableCell sx={{ ...headerCellSx, width: "14%" }}>
//                   FUP Code
//                 </TableCell>
//                 <TableCell sx={{ ...headerCellSx, width: "26%" }}>
//                   Medical Type
//                 </TableCell>
//                 <TableCell sx={{ ...headerCellSx, width: "18%" }}>
//                   Raised Date
//                 </TableCell>
//                 <TableCell sx={{ ...headerCellSx, width: "18%" }}>
//                   Received Date
//                 </TableCell>
//                 <TableCell
//                   align="center"
//                   sx={{ ...headerCellSx, width: "24%" }}
//                 >
//                   Remarks History
//                 </TableCell>
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {rows.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={5} align="center" sx={bodyCellSx}>
//                     <Typography sx={{ fontSize: "11px", py: 1 }}>
//                       No data available
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 rows.map((row, rowIndex) => {
//                   const history = getRemarksHistory(row);

//                   return (
//                     <TableRow key={row.id ?? rowIndex}>
//                       <TableCell sx={bodyCellSx}>
//                         {displayValue(row.fupCode)}
//                       </TableCell>
//                       <TableCell sx={bodyCellSx}>
//                         {displayValue(row.medicalType)}
//                       </TableCell>
//                       <TableCell sx={bodyCellSx}>
//                         {displayValue(row.raisedDate)}
//                       </TableCell>
//                       <TableCell sx={bodyCellSx}>
//                         {displayValue(row.receivedDate)}
//                       </TableCell>
//                       <TableCell align="center" sx={bodyCellSx}>
//                         <Tooltip title="View remarks history" arrow>
//                           <span>
//                             <IconButton
//                               size="small"
//                               disabled={history.length === 0}
//                               aria-label={`View remarks history for ${displayValue(row.medicalType)}`}
//                               onClick={() => setSelectedHistoryRow(row)}
//                               sx={{
//                                 width: 30,
//                                 height: 30,
//                                 border: "1px solid #E6D8D2",
//                                 bgcolor: "#FFF8F3",
//                                 "&:hover": { bgcolor: "#FFEAD7" },
//                                 "& svg": { width: 17, height: 17 },
//                               }}
//                             >
//                               <EyeIcon />
//                             </IconButton>
//                           </span>
//                         </Tooltip>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       <CustomDialog
//         open={Boolean(selectedHistoryRow)}
//         onClose={() => setSelectedHistoryRow(null)}
//         title="Remarks History"
//         maxWidth="md"
//         fullWidth
//         contentSx={{ p: 0 }}
//       >
//         <Box sx={{ minWidth: 0, bgcolor: "#FFFFFF" }}>
//           {selectedRemarksHistory.length === 0 ? (
//             <Typography
//               sx={{ px: 2, py: 2.5, color: "#727272", fontSize: 12 }}
//             >
//               No remarks history available.
//             </Typography>
//           ) : (
//             selectedRemarksHistory.map((history, index) => {
//               const tone = HISTORY_TONES[index % HISTORY_TONES.length];

//               return (
//                 <Box
//                   key={`${history.role}-${history.ntid}-${history.date}-${index}`}
//                   sx={{
//                     display: "grid",
//                     gridTemplateColumns: "38px minmax(0, 1fr)",
//                     gap: 1,
//                     px: { xs: 1, sm: 1.5 },
//                     py: 1.15,
//                     borderLeft: `3px solid ${tone}`,
//                     borderBottom:
//                       index < selectedRemarksHistory.length - 1
//                         ? "1px solid #ECECEC"
//                         : "none",
//                     bgcolor: index % 2 === 0 ? "#FFFFFF" : "#FCFCFD",
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       width: 28,
//                       height: 28,
//                       display: "grid",
//                       placeItems: "center",
//                       borderRadius: "7px",
//                       border: `1px solid ${tone}33`,
//                       bgcolor: `${tone}0F`,
//                       color: tone,
//                       "& svg": { width: 16, height: 16 },
//                     }}
//                   >
//                     <UserProfileIcon />
//                   </Box>

//                   <Box sx={{ minWidth: 0 }}>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         flexWrap: "wrap",
//                         columnGap: 1.5,
//                         rowGap: 0.5,
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           minWidth: 0,
//                           display: "flex",
//                           alignItems: "center",
//                           flexWrap: "wrap",
//                           gap: 0.65,
//                         }}
//                       >
//                         <Box
//                           component="span"
//                           sx={{
//                             px: 0.75,
//                             py: 0.2,
//                             borderRadius: "10px",
//                             bgcolor: `${tone}14`,
//                             color: tone,
//                             fontSize: 9,
//                             fontWeight: 800,
//                           }}
//                         >
//                           {displayValue(history.role)}
//                         </Box>

//                         <Typography
//                           component="span"
//                           sx={{
//                             color: "#2F3035",
//                             fontSize: 11,
//                             fontWeight: 800,
//                           }}
//                         >
//                           {displayValue(history.name)}
//                         </Typography>

//                         <Typography
//                           component="span"
//                           sx={{ color: "#85868C", fontSize: 9.5 }}
//                         >
//                           | {displayValue(history.ntid)}
//                         </Typography>
//                       </Box>

//                       <Typography
//                         sx={{
//                           flexShrink: 0,
//                           color: "#909198",
//                           fontSize: 9,
//                         }}
//                       >
//                         {displayValue(history.date)}
//                       </Typography>
//                     </Box>

//                     <Typography
//                       sx={{
//                         mt: 0.65,
//                         color: "#666870",
//                         fontSize: 10.5,
//                         lineHeight: 1.45,
//                         overflowWrap: "anywhere",
//                       }}
//                     >
//                       <Box
//                         component="span"
//                         sx={{ color: "#35363B", fontWeight: 800 }}
//                       >
//                         {displayValue(history.decision)}
//                       </Box>
//                       {" - "}
//                       {displayValue(history.remarks)}
//                     </Typography>
//                   </Box>
//                 </Box>
//               );
//             })
//           )}
//         </Box>
//       </CustomDialog>
//     </>
//   );
// }



import {
  Box,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";

import CustomDialog from "../../components/ui/Dialog/Dialog";
import { EyeIcon, UserProfileIcon } from "../../icons/Icons";

export const REF_CMO_DECISION_OPTIONS = [
  "STD",
  "Sub STD",
  "Cannot Opine",
  "Refer to 2nd Opinion",
] as const;

export type RefCMODecision =
  (typeof REF_CMO_DECISION_OPTIONS)[number];

export interface RefCMORemarksHistoryItem {
  role: string;
  name: string;
  ntid: string;
  date: string;
  decision: string;
  remarks: string;
}

export interface RefCMODecisionRow {
  id?: string | number;
  fupCode: string;
  medicalType: string;
  raisedDate: string;
  receivedDate: string;

  // Retained for compatibility with existing API responses.
  vendorCmoOpinion?: string;
  vendorCmoRemarks?: string;
  vendorCmoName?: string;
  vendorCmoNtid?: string;
  vendorCmoDate?: string;
  hoCmoDecision?: string;
  hoCmoRemarks?: string;
  hoCmoName?: string;
  hoCmoNtid?: string;
  hoCmoDate?: string;
  uwDecision?: string;
  uwRemarks?: string;
  uwName?: string;
  uwNtid?: string;
  uwDate?: string;

  cmoDecision?: RefCMODecision | "";
  cmoRemarks?: string;

  remarksHistory?: RefCMORemarksHistoryItem[];
}

export const REF_CMO_HARDCODED_ROWS: RefCMODecisionRow[] = [
  {
    id: 1,
    fupCode: "2DE",
    medicalType: "2D ECHO",
    raisedDate: "1 Sep 2026",
    receivedDate: "2 Sep 2026",
    vendorCmoOpinion: "STD",
    vendorCmoRemarks: "All medical parameters are within acceptable limits.",
    hoCmoDecision: "STD",
    hoCmoRemarks: "Vendor CMO opinion reviewed and accepted.",
    uwDecision: "Standard",
    uwRemarks: "Proceed with standard terms.",
    cmoDecision: "",
    cmoRemarks: "",
    remarksHistory: [
      {
        role: "Vendor CMO",
        name: "Dr. Alpana Gandhi",
        ntid: "IPRU84213",
        date: "02 Sep 2026, 09:45",
        decision: "STD",
        remarks: "All medical parameters are within acceptable limits.",
      },
      {
        role: "HO CMO",
        name: "Dr. Vaibha Jain",
        ntid: "IPRU91056",
        date: "02 Sep 2026, 10:20",
        decision: "STD",
        remarks: "Vendor CMO opinion reviewed and accepted.",
      },
      {
        role: "Underwriter",
        name: "Kumar Murari",
        ntid: "IPRU65342",
        date: "02 Sep 2026, 11:05",
        decision: "Standard",
        remarks: "Proceed with standard terms.",
      },
    ],
  },
  {
    id: 2,
    fupCode: "CXR",
    medicalType: "CXR",
    raisedDate: "1 Sep 2026",
    receivedDate: "3 Sep 2026",
    vendorCmoOpinion: "Refer to 2nd Opinion",
    vendorCmoRemarks: "Borderline ECG findings; cardiology review advised.",
    hoCmoDecision: "Sub STD",
    hoCmoRemarks: "Second opinion reviewed; apply sub-standard terms.",
    cmoDecision: "",
    cmoRemarks: "",
    remarksHistory: [
      {
        role: "Vendor CMO",
        name: "Dr. Alpana Gandhi",
        ntid: "IPRU84213",
        date: "03 Sep 2026, 09:15",
        decision: "Refer to 2nd Opinion",
        remarks: "Borderline ECG findings; cardiology review advised.",
      },
      {
        role: "HO CMO",
        name: "Dr. Vaibha Jain",
        ntid: "IPRU91056",
        date: "03 Sep 2026, 10:10",
        decision: "Sub STD",
        remarks: "Second opinion reviewed; apply sub-standard terms.",
      },
    ],
  },
];

interface RefCMODecisionTableProps {
  title?: string;
  rows?: RefCMODecisionRow[];
  readOnly?: boolean;
  onRowsChange?: (rows: RefCMODecisionRow[]) => void;
}

const headerCellSx = {
  minWidth: 0,
  backgroundColor: "#FFEAD7",
  color: "#000000",
  fontSize: "11px",
  fontWeight: 600,
  py: 0.75,
  px: 0.75,
  lineHeight: 1.2,
  borderBottom: "1px solid #D6D6D6",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const bodyCellSx = {
  minWidth: 0,
  color: "#4A4A4A",
  fontSize: "10px",
  py: 0.65,
  px: 0.75,
  lineHeight: 1.3,
  borderBottom: "1px solid #E1E1E1",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const HISTORY_TONES = ["#E34F4F", "#8A5BD7", "#2E8FB8"] as const;

const displayValue = (value?: string) => value?.trim() || "-";

const createHistoryItem = (
  role: string,
  name: string | undefined,
  ntid: string | undefined,
  date: string | undefined,
  fallbackDate: string,
  decision: string | undefined,
  remarks: string | undefined,
): RefCMORemarksHistoryItem | null => {
  if (!decision?.trim() && !remarks?.trim()) {
    return null;
  }

  return {
    role,
    name: displayValue(name),
    ntid: displayValue(ntid),
    date: displayValue(date || fallbackDate),
    decision: displayValue(decision),
    remarks: displayValue(remarks),
  };
};

const getRemarksHistory = (
  row: RefCMODecisionRow,
): RefCMORemarksHistoryItem[] => {
  if (row.remarksHistory?.length) {
    return row.remarksHistory;
  }

  return [
    createHistoryItem(
      "Vendor CMO",
      row.vendorCmoName,
      row.vendorCmoNtid,
      row.vendorCmoDate,
      row.receivedDate,
      row.vendorCmoOpinion,
      row.vendorCmoRemarks,
    ),
    createHistoryItem(
      "HO CMO",
      row.hoCmoName,
      row.hoCmoNtid,
      row.hoCmoDate,
      row.receivedDate,
      row.hoCmoDecision,
      row.hoCmoRemarks,
    ),
    createHistoryItem(
      "Underwriter",
      row.uwName,
      row.uwNtid,
      row.uwDate,
      row.receivedDate,
      row.uwDecision,
      row.uwRemarks,
    ),
  ].filter((item): item is RefCMORemarksHistoryItem => item !== null);
};

export default function RefCMODecisionTable({
  title = "Decision History",
  rows: controlledRows,
  readOnly = false,
  onRowsChange,
}: RefCMODecisionTableProps) {
  const [internalRows, setInternalRows] = useState<RefCMODecisionRow[]>(() =>
    REF_CMO_HARDCODED_ROWS.map((row) => ({ ...row })),
  );
  const [selectedHistoryRow, setSelectedHistoryRow] =
    useState<RefCMODecisionRow | null>(null);
  const rows = controlledRows ?? internalRows;
  const selectedRemarksHistory = selectedHistoryRow
    ? getRemarksHistory(selectedHistoryRow)
    : [];

  const updateRow = (
    rowIndex: number,
    changes: Partial<RefCMODecisionRow>,
  ) => {
    const updatedRows = rows.map((row, index) =>
      index === rowIndex ? { ...row, ...changes } : row,
    );

    if (controlledRows === undefined) {
      setInternalRows(updatedRows);
    }

    onRowsChange?.(updatedRows);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "100%",
          border: "1px solid #D8D8D8",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {title && (
          <Box
            sx={{
              backgroundColor: "#E45F14",
              color: "#FFFFFF",
              px: 3,
              py: 1.2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>
        )}

        <TableContainer
          sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}
        >
          <Table
            size="small"
            aria-readonly={readOnly}
            sx={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              tableLayout: "fixed",
              "& .MuiTableCell-root": { minWidth: 0 },
              "& tr:last-child td": { borderBottom: "none" },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...headerCellSx, width: "6%" }}>
                  FUP Code
                </TableCell>
                <TableCell sx={{ ...headerCellSx, width: "8%" }}>
                  Medical Test
                </TableCell>
                <TableCell sx={{ ...headerCellSx, width: "8%" }}>
                  Raised Date
                </TableCell>
                <TableCell sx={{ ...headerCellSx, width: "8%" }}>
                  Received Date
                </TableCell>
                <TableCell sx={{ ...headerCellSx, width: "20%" }}>
                  CMO Decision
                </TableCell>
                <TableCell sx={{ ...headerCellSx, width: "25%" }}>
                  CMO Remarks
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ ...headerCellSx, width: "8%" }}
                >
                  Remarks History
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={bodyCellSx}>
                    <Typography sx={{ fontSize: "11px", py: 1 }}>
                      No data available
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, rowIndex) => {
                  const history = getRemarksHistory(row);

                  return (
                    <TableRow key={row.id ?? rowIndex}>
                      <TableCell sx={bodyCellSx}>
                        {displayValue(row.fupCode)}
                      </TableCell>
                      <TableCell sx={bodyCellSx}>
                        {displayValue(row.medicalType)}
                      </TableCell>
                      <TableCell sx={bodyCellSx}>
                        {displayValue(row.raisedDate)}
                      </TableCell>
                      <TableCell sx={bodyCellSx}>
                        {displayValue(row.receivedDate)}
                      </TableCell>
                    

                      <TableCell sx={bodyCellSx}>
                        <Select<string>
                          fullWidth
                          size="small"
                          displayEmpty
                          value={row.cmoDecision ?? ""}
                          disabled={readOnly}
                          onChange={(event: SelectChangeEvent) =>
                            updateRow(rowIndex, {
                              cmoDecision:
                                event.target.value as RefCMODecision | "",
                            })
                          }
                          renderValue={(selected) =>
                            selected || (
                              <Typography
                                component="span"
                                sx={{ color: "#8A8A8A", fontSize: "10px" }}
                              >
                                Select decision
                              </Typography>
                            )
                          }
                          sx={{
                            height: 32,
                            width: "100%",
                            minWidth: 0,
                            bgcolor: "#FFFFFF",
                            fontSize: "10px",
                            "& .MuiSelect-select": {
                              py: 0.6,
                              px: 0.75,
                              pr: "22px !important",
                              minWidth: "0 !important",
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select decision
                          </MenuItem>

                          {REF_CMO_DECISION_OPTIONS.map((option) => (
                            <MenuItem
                              key={option}
                              value={option}
                              sx={{ fontSize: "11px" }}
                            >
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>

                      <TableCell sx={bodyCellSx}>
                        <TextField
                          fullWidth
                          required
                          size="small"
                          multiline
                          minRows={1}
                          maxRows={3}
                          value={row.cmoRemarks ?? ""}
                          disabled={readOnly}
                          placeholder="Enter CMO remarks"
                          onChange={(event) =>
                            updateRow(rowIndex, {
                              cmoRemarks: event.target.value,
                            })
                          }
                          sx={{
                            minWidth: 0,
                            "& .MuiInputBase-root": {
                              minWidth: 0,
                              minHeight: 32,
                              bgcolor: "#FFFFFF",
                              fontSize: "10px",
                            },
                            "& .MuiInputBase-input": {
                              py: 0.6,
                            },
                          }}
                        />
                      </TableCell>

                        <TableCell align="center" sx={bodyCellSx}>
                        <Tooltip title="View remarks history" arrow>
                          <span>
                            <IconButton
                              size="small"
                              disabled={history.length === 0}
                              aria-label={`View remarks history for ${displayValue(row.medicalType)}`}
                              onClick={() => setSelectedHistoryRow(row)}
                              sx={{
                                width: 30,
                                height: 30,
                                border: "1px solid #E6D8D2",
                                bgcolor: "#FFF8F3",
                                "&:hover": { bgcolor: "#FFEAD7" },
                                "& svg": { width: 17, height: 17 },
                              }}
                            >
                              <EyeIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CustomDialog
        open={Boolean(selectedHistoryRow)}
        onClose={() => setSelectedHistoryRow(null)}
        title="Remarks History"
        maxWidth="md"
        fullWidth
        contentSx={{ p: 0 }}
      >
        <Box sx={{ minWidth: 0, bgcolor: "#FFFFFF" }}>
          {selectedRemarksHistory.length === 0 ? (
            <Typography
              sx={{ px: 2, py: 2.5, color: "#727272", fontSize: 12 }}
            >
              No remarks history available.
            </Typography>
          ) : (
            selectedRemarksHistory.map((history, index) => {
              const tone = HISTORY_TONES[index % HISTORY_TONES.length];

              return (
                <Box
                  key={`${history.role}-${history.ntid}-${history.date}-${index}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "38px minmax(0, 1fr)",
                    gap: 1,
                    px: { xs: 1, sm: 1.5 },
                    py: 1.15,
                    borderLeft: `3px solid ${tone}`,
                    borderBottom:
                      index < selectedRemarksHistory.length - 1
                        ? "1px solid #ECECEC"
                        : "none",
                    bgcolor: index % 2 === 0 ? "#FFFFFF" : "#FCFCFD",
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "7px",
                      border: `1px solid ${tone}33`,
                      bgcolor: `${tone}0F`,
                      color: tone,
                      "& svg": { width: 16, height: 16 },
                    }}
                  >
                    <UserProfileIcon />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        columnGap: 1.5,
                        rowGap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 0.65,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            px: 0.75,
                            py: 0.2,
                            borderRadius: "10px",
                            bgcolor: `${tone}14`,
                            color: tone,
                            fontSize: 9,
                            fontWeight: 800,
                          }}
                        >
                          {displayValue(history.role)}
                        </Box>

                        <Typography
                          component="span"
                          sx={{
                            color: "#2F3035",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {displayValue(history.name)}
                        </Typography>

                        <Typography
                          component="span"
                          sx={{ color: "#85868C", fontSize: 9.5 }}
                        >
                          | {displayValue(history.ntid)}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          flexShrink: 0,
                          color: "#909198",
                          fontSize: 9,
                        }}
                      >
                        {displayValue(history.date)}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        mt: 0.65,
                        color: "#666870",
                        fontSize: 10.5,
                        lineHeight: 1.45,
                        overflowWrap: "anywhere",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ color: "#35363B", fontWeight: 800 }}
                      >
                        {displayValue(history.decision)}
                      </Box>
                      {" - "}
                      {displayValue(history.remarks)}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </CustomDialog>
    </>
  );
}
