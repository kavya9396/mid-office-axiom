// import {
//   Box,
//   MenuItem,
//   Paper,
//   Select,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
//   type SelectChangeEvent,
// } from "@mui/material";

// export const CMO_DECISION_OPTIONS = [
//   "STD",
//   "Sub STD",
//   "Cannot Opine",
//   "Refer to 2nd Opinion",
//   "Do not pay to TPA",
// ] as const;

// export type CMODecision = (typeof CMO_DECISION_OPTIONS)[number];

// export interface CMOMedicalDecisionRow {
//   id?: string | number;
//   fupCode: string;
//   medicalType: string;
//   raisedDate: string;
//   receivedDate: string;
//   decision?: CMODecision | "";
//   remarks?: string;
// }

// interface CMOMedicalDecisionTableProps {
//   title?: string;
//   rows: CMOMedicalDecisionRow[];
//   readOnly?: boolean;
//   onRowsChange?: (rows: CMOMedicalDecisionRow[]) => void;
// }

// const headerCellSx = {
//   backgroundColor: "#FFEAD7",
//   color: "#000000",
//   fontSize: "12px",
//   fontWeight: 600,
//   py: 0.75,
//   px: 1,
//   lineHeight: 1.2,
//   borderBottom: "1px solid #D6D6D6",
// };

// const bodyCellSx = {
//   color: "#4A4A4A",
//   fontSize: "10px",
//   py: 0.6,
//   px: 1,
//   lineHeight: 1.2,
//   borderBottom: "1px solid #E1E1E1",
//   whiteSpace: "normal",
//   overflowWrap: "anywhere",
//   wordBreak: "break-word",
// };

// export default function CMOMedicalDecisionTable({
//   title = "CMO Medical Decision",
//   rows,
//   readOnly = false,
//   onRowsChange,
// }: CMOMedicalDecisionTableProps) {
//   const updateRow = (
//     rowIndex: number,
//     changes: Partial<CMOMedicalDecisionRow>,
//   ) => {
//     if (!onRowsChange) {
//       return;
//     }

//     onRowsChange(
//       rows.map((row, index) =>
//         index === rowIndex ? { ...row, ...changes } : row,
//       ),
//     );
//   };

//   const isEditable = !readOnly && Boolean(onRowsChange);

//   return (
//     <Paper
//       elevation={0}
//       sx={{
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

//       <TableContainer sx={{ overflowX: "auto" }}>
//         <Table
//           size="small"
//           sx={{
//             width: "100%",
//             minWidth: 900,
//             tableLayout: "fixed",
//             "& tr:last-child td": {
//               borderBottom: "none",
//             },
//           }}
//         >
//           <TableHead>
//             <TableRow>
//               <TableCell sx={{ ...headerCellSx, width: "13%" }}>
//                 FUP Code
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "17%" }}>
//                 Medical Type
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "13%" }}>
//                 Raised Date
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "13%" }}>
//                 Received Date
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "20%" }}>
//                 Decision
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "24%" }}>
//                 Remarks
//               </TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {rows.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} align="center" sx={bodyCellSx}>
//                   <Typography sx={{ fontSize: "11px", py: 1 }}>
//                     No data available
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             ) : (
//               rows.map((row, rowIndex) => (
//                 <TableRow key={row.id ?? rowIndex}>
//                   <TableCell sx={bodyCellSx}>{row.fupCode || "-"}</TableCell>
//                   <TableCell sx={bodyCellSx}>{row.medicalType || "-"}</TableCell>
//                   <TableCell sx={bodyCellSx}>{row.raisedDate || "-"}</TableCell>
//                   <TableCell sx={bodyCellSx}>{row.receivedDate || "-"}</TableCell>

//                   <TableCell sx={bodyCellSx}>
//                     <Select<string>
//                       fullWidth
//                       size="small"
//                       displayEmpty
//                       value={row.decision ?? ""}
//                       disabled={!isEditable}
//                       onChange={(event: SelectChangeEvent) =>
//                         updateRow(rowIndex, {
//                           decision: event.target.value as CMODecision | "",
//                         })
//                       }
//                       renderValue={(selected) =>
//                         selected || (
//                           <Typography
//                             component="span"
//                             sx={{ color: "#8A8A8A", fontSize: "10px" }}
//                           >
//                             Select decision
//                           </Typography>
//                         )
//                       }
//                       sx={{
//                         height: 32,
//                         backgroundColor: "#FFFFFF",
//                         fontSize: "10px",
//                         "& .MuiSelect-select": {
//                           py: 0.6,
//                         },
//                       }}
//                     >
//                       <MenuItem value="" disabled>
//                         Select decision
//                       </MenuItem>

//                       {CMO_DECISION_OPTIONS.map((option) => (
//                         <MenuItem key={option} value={option} sx={{ fontSize: "11px" }}>
//                           {option}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </TableCell>

//                   <TableCell sx={bodyCellSx}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       value={row.remarks ?? ""}
//                       disabled={!isEditable}
//                       placeholder="Enter remarks"
//                       multiline
//                       minRows={1}
//                       maxRows={3}
//                       onChange={(event) =>
//                         updateRow(rowIndex, {
//                           remarks: event.target.value,
//                         })
//                       }
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           minHeight: 32,
//                           backgroundColor: "#FFFFFF",
//                           fontSize: "10px",
//                         },
//                         "& .MuiInputBase-input": {
//                           py: 0.6,
//                         },
//                       }}
//                     />
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
//   MenuItem,
//   Paper,
//   Select,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Tooltip,
//   Typography,
//   type SelectChangeEvent,
// } from "@mui/material";
// import { useState } from "react";
// import CustomDialog from "../../components/ui/Dialog/Dialog";

// export const CMO_DECISION_OPTIONS = [
//   "STD",
//   "Sub STD",
//   "Cannot Opine",
//   "Refer to 2nd Opinion",
//   "Do not pay to TPA",
// ] as const;

// export type CMODecision = (typeof CMO_DECISION_OPTIONS)[number];

// interface EditIconProps {
//   width?: number;
//   height?: number;
// }

// export const EditIcon = ({
//   width = 20,
//   height = 20,
// }: EditIconProps) => (
//   <svg
//     width={width}
//     height={height}
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path d="M5.53999 19.5201C4.92999 19.5201 4.35999 19.31 3.94999 18.92C3.42999 18.43 3.17999 17.69 3.26999 16.89L3.63999 13.65C3.70999 13.04 4.07999 12.23 4.50999 11.79L12.72 3.10005C14.77 0.930049 16.91 0.870049 19.08 2.92005C21.25 4.97005 21.31 7.11005 19.26 9.28005L11.05 17.97C10.63 18.42 9.84999 18.84 9.23999 18.9401L6.01999 19.49C5.84999 19.5 5.69999 19.5201 5.53999 19.5201ZM15.93 2.91005C15.16 2.91005 14.49 3.39005 13.81 4.11005L5.59999 12.8101C5.39999 13.0201 5.16999 13.5201 5.12999 13.8101L4.75999 17.05C4.71999 17.38 4.79999 17.65 4.97999 17.82C5.15999 17.99 5.42999 18.05 5.75999 18L8.97999 17.4501C9.26999 17.4001 9.74999 17.14 9.94999 16.93L18.16 8.24005C19.4 6.92005 19.85 5.70005 18.04 4.00005C17.24 3.23005 16.55 2.91005 15.93 2.91005Z" />
//     <path d="M17.3399 10.9498C17.3199 10.9498 17.2899 10.9498 17.2699 10.9498C14.1499 10.6398 11.6399 8.26985 11.1599 5.16985C11.0999 4.75985 11.3799 4.37985 11.7899 4.30985C12.1999 4.24985 12.5799 4.52985 12.6499 4.93985C13.0299 7.35985 14.9899 9.21985 17.4299 9.45985C17.8399 9.49985 18.1399 9.86985 18.0999 10.2798C18.0499 10.6598 17.7199 10.9498 17.3399 10.9498Z" />
//     <path d="M21 22.75H3C2.59 22.75 2.25 22.41 2.25 22C2.25 21.59 2.59 21.25 3 21.25H21C21.41 21.25 21.75 21.59 21.75 22C21.75 22.41 21.41 22.75 21 22.75Z" />
//   </svg>
// );

// export interface CMOMedicalDecisionRow {
//   id?: string | number;
//   fupCode: string;
//   medicalType: string;
//   raisedDate: string;
//   receivedDate: string;
//   decision?: CMODecision | "";
//   remarks?: string;
// }

// export const CMO_HARDCODED_ROWS: CMOMedicalDecisionRow[] = [
//   {
//     id: 1,
//     fupCode: "TMT",
//     medicalType: "TMT",
//     raisedDate: "1 Sep 2026",
//     receivedDate: "2 Sep 2026",
//     decision: "",
//     remarks: "",
//   },
//   {
//     id: 2,
//     fupCode: "ECG",
//     medicalType: "ECG",
//     raisedDate: "1 Sep 2026",
//     receivedDate: "3 Sep 2026",
//     decision: "",
//     remarks: "",
//   },
// ];

// interface CMOMedicalDecisionTableProps {
//   title?: string;
//   rows?: CMOMedicalDecisionRow[];
//   readOnly?: boolean;
//   onRowsChange?: (rows: CMOMedicalDecisionRow[]) => void;
// }

// const headerCellSx = {
//   backgroundColor: "#FFEAD7",
//   color: "#000000",
//   fontSize: "12px",
//   fontWeight: 600,
//   py: 0.75,
//   px: 1,
//   lineHeight: 1.2,
//   borderBottom: "1px solid #D6D6D6",
//   minWidth: 0,
//   whiteSpace: "normal",
//   overflowWrap: "anywhere",
//   wordBreak: "break-word",
// };

// const bodyCellSx = {
//   color: "#4A4A4A",
//   fontSize: "10px",
//   py: 0.6,
//   px: 1,
//   lineHeight: 1.2,
//   borderBottom: "1px solid #E1E1E1",
//   whiteSpace: "normal",
//   overflowWrap: "anywhere",
//   wordBreak: "break-word",
//   minWidth: 0,
// };

// export default function CMOMedicalDecisionTable({
//   title = "CMO Medical Decision",
//   rows: controlledRows,
//   readOnly = false,
//   onRowsChange,
// }: CMOMedicalDecisionTableProps) {
//   const [internalRows, setInternalRows] = useState<CMOMedicalDecisionRow[]>(
//     () => CMO_HARDCODED_ROWS.map((row) => ({ ...row })),
//   );
//   const [selectedRow, setSelectedRow] =
//     useState<CMOMedicalDecisionRow | null>(null);

//   const shouldUseHardcodedRows =
//     controlledRows === undefined || controlledRows.length === 0;
//   const rows = shouldUseHardcodedRows ? internalRows : controlledRows;

//   const updateRow = (
//     rowIndex: number,
//     changes: Partial<CMOMedicalDecisionRow>,
//   ) => {
//     const updatedRows = rows.map((row, index) =>
//       index === rowIndex ? { ...row, ...changes } : row,
//     );

//     if (shouldUseHardcodedRows) {
//       setInternalRows(updatedRows);
//     }

//     onRowsChange?.(updatedRows);
//   };

//   const isEditable =
//     !readOnly &&
//     (shouldUseHardcodedRows || Boolean(onRowsChange));

//   return (
//     <Paper
//       elevation={0}
//       sx={{
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
//               <TableCell sx={{ ...headerCellSx, width: "11%" }}>
//                 FUP Code
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "15%" }}>
//                 Medical Type
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "12%" }}>
//                 Raised Date
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "12%" }}>
//                 Received Date
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "18%" }}>
//                 Decision
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "22%" }}>
//                 Remarks
//               </TableCell>
//               <TableCell sx={{ ...headerCellSx, width: "5%" }}>
//                 Action
//               </TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {rows.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={7} align="center" sx={bodyCellSx}>
//                   <Typography sx={{ fontSize: "11px", py: 1 }}>
//                     No data available
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             ) : (
//               rows.map((row, rowIndex) => {
//                 const rowKey = row.id ?? rowIndex;

//                 return (
//                   <TableRow key={rowKey}>
//                     <TableCell sx={bodyCellSx}>{row.fupCode || "-"}</TableCell>
//                     <TableCell sx={bodyCellSx}>{row.medicalType || "-"}</TableCell>
//                     <TableCell sx={bodyCellSx}>{row.raisedDate || "-"}</TableCell>
//                     <TableCell sx={bodyCellSx}>{row.receivedDate || "-"}</TableCell>

//                     <TableCell sx={bodyCellSx}>
//                       <Select<string>
//                         fullWidth
//                         size="small"
//                         displayEmpty
//                         value={row.decision ?? ""}
//                         disabled={!isEditable}
//                         onChange={(event: SelectChangeEvent) =>
//                           updateRow(rowIndex, {
//                             decision: event.target.value as CMODecision | "",
//                           })
//                         }
//                         renderValue={(selected) =>
//                           selected || (
//                             <Typography
//                               component="span"
//                               sx={{ color: "#8A8A8A", fontSize: "10px" }}
//                             >
//                               Select decision
//                             </Typography>
//                           )
//                         }
//                         sx={{
//                           height: 32,
//                           width: "100%",
//                           minWidth: 0,
//                           backgroundColor: "#FFFFFF",
//                           fontSize: "10px",
//                           "& .MuiSelect-select": {
//                             py: 0.6,
//                             px: 0.6,
//                             pr: "22px !important",
//                             minWidth: "0 !important",
//                             whiteSpace: "normal",
//                             overflowWrap: "anywhere",
//                           },
//                         }}
//                       >
//                         <MenuItem value="" disabled>
//                           Select decision
//                         </MenuItem>

//                         {CMO_DECISION_OPTIONS.map((option) => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: "11px" }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </TableCell>

//                     <TableCell sx={bodyCellSx}>
//                       <TextField
//                         fullWidth
//                         size="small"
//                         value={row.remarks ?? ""}
//                         disabled={!isEditable}
//                         placeholder="Enter remarks"
//                         multiline
//                         minRows={1}
//                         maxRows={3}
//                         onChange={(event) =>
//                           updateRow(rowIndex, {
//                             remarks: event.target.value,
//                           })
//                         }
//                         sx={{
//                           minWidth: 0,
//                           "& .MuiInputBase-root": {
//                             minWidth: 0,
//                             minHeight: 32,
//                             backgroundColor: "#FFFFFF",
//                             fontSize: "10px",
//                           },
//                           "& .MuiInputBase-input": {
//                             py: 0.6,
//                           },
//                         }}
//                       />
//                     </TableCell>

//                     <TableCell sx={bodyCellSx} align="center">
//                       <Tooltip title="Edit">
//                         <span>
//                           <IconButton
//                             type="button"
//                             size="small"
//                             aria-label={`Edit ${row.medicalType || row.fupCode}`}
//                             disabled={readOnly}
//                             onClick={() => setSelectedRow(row)}
//                             sx={{
//                               color: "#9A2529",
//                               border: "1px solid #9A2529",
//                               p: 0.55,
//                               "&:hover": {
//                                 backgroundColor: "rgba(154,37,41,0.08)",
//                               },
//                             }}
//                           >
//                             <EditIcon width={15} height={15} />
//                           </IconButton>
//                         </span>
//                       </Tooltip>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <CustomDialog
//         open={Boolean(selectedRow)}
//         onClose={() => setSelectedRow(null)}
//         title={
//           <Typography
//             sx={{
//               color: "#9A2529",
//               fontSize: 14,
//               fontWeight: 700,
//               textTransform: "uppercase"
//             }}
//           >
//             Edit CMO Decision
//           </Typography>
//         }
//         maxWidth="sm"
//         fullWidth
//       >
//         <Typography sx={{ color: "#5B5B5B", fontSize: "12px" }}>
//           Selected medical: {selectedRow?.medicalType || "-"}
//         </Typography>
//       </CustomDialog>
//     </Paper>
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
import SpecialMedicalForm from "./Medical Final/Special Medical/SpecialMedicalForm";
import CustomButton from "../../components/ui/Button/Button";

export const CMO_DECISION_OPTIONS = [
  "STD",
  "Sub STD",
  "Cannot Opine",
  "Refer to 2nd Opinion",
  "Do not pay to TPA",
] as const;

export type CMODecision = (typeof CMO_DECISION_OPTIONS)[number];

interface EditIconProps {
  width?: number;
  height?: number;
}

export const EditIcon = ({
  width = 20,
  height = 20,
}: EditIconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5.53999 19.5201C4.92999 19.5201 4.35999 19.31 3.94999 18.92C3.42999 18.43 3.17999 17.69 3.26999 16.89L3.63999 13.65C3.70999 13.04 4.07999 12.23 4.50999 11.79L12.72 3.10005C14.77 0.930049 16.91 0.870049 19.08 2.92005C21.25 4.97005 21.31 7.11005 19.26 9.28005L11.05 17.97C10.63 18.42 9.84999 18.84 9.23999 18.9401L6.01999 19.49C5.84999 19.5 5.69999 19.5201 5.53999 19.5201ZM15.93 2.91005C15.16 2.91005 14.49 3.39005 13.81 4.11005L5.59999 12.8101C5.39999 13.0201 5.16999 13.5201 5.12999 13.8101L4.75999 17.05C4.71999 17.38 4.79999 17.65 4.97999 17.82C5.15999 17.99 5.42999 18.05 5.75999 18L8.97999 17.4501C9.26999 17.4001 9.74999 17.14 9.94999 16.93L18.16 8.24005C19.4 6.92005 19.85 5.70005 18.04 4.00005C17.24 3.23005 16.55 2.91005 15.93 2.91005Z" />
    <path d="M17.3399 10.9498C17.3199 10.9498 17.2899 10.9498 17.2699 10.9498C14.1499 10.6398 11.6399 8.26985 11.1599 5.16985C11.0999 4.75985 11.3799 4.37985 11.7899 4.30985C12.1999 4.24985 12.5799 4.52985 12.6499 4.93985C13.0299 7.35985 14.9899 9.21985 17.4299 9.45985C17.8399 9.49985 18.1399 9.86985 18.0999 10.2798C18.0499 10.6598 17.7199 10.9498 17.3399 10.9498Z" />
    <path d="M21 22.75H3C2.59 22.75 2.25 22.41 2.25 22C2.25 21.59 2.59 21.25 3 21.25H21C21.41 21.25 21.75 21.59 21.75 22C21.75 22.41 21.41 22.75 21 22.75Z" />
  </svg>
);

export interface CMOMedicalDecisionRow {
  id?: string | number;
  fupCode: string;
  medicalType: string;
  raisedDate: string;
  receivedDate: string;
  decision?: CMODecision | "";
  remarks?: string;
}

export const CMO_HARDCODED_ROWS: CMOMedicalDecisionRow[] = [
  {
    id: 1,
    fupCode: "TMT",
    medicalType: "TMT",
    raisedDate: "1 Sep 2026",
    receivedDate: "2 Sep 2026",
    decision: "",
    remarks: "",
  },
  {
    id: 2,
    fupCode: "ECG",
    medicalType: "ECG",
    raisedDate: "1 Sep 2026",
    receivedDate: "3 Sep 2026",
    decision: "",
    remarks: "",
  },
];

interface CMOMedicalDecisionTableProps {
  title?: string;
  rows?: CMOMedicalDecisionRow[];
  readOnly?: boolean;
  onRowsChange?: (rows: CMOMedicalDecisionRow[]) => void;
}

const headerCellSx = {
  backgroundColor: "#FFEAD7",
  color: "#000000",
  fontSize: "12px",
  fontWeight: 600,
  py: 0.75,
  px: 1,
  lineHeight: 1.2,
  borderBottom: "1px solid #D6D6D6",
  minWidth: 0,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const bodyCellSx = {
  color: "#4A4A4A",
  fontSize: "10px",
  py: 0.6,
  px: 1,
  lineHeight: 1.2,
  borderBottom: "1px solid #E1E1E1",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  minWidth: 0,
};

export default function CMOMedicalDecisionTable({
  title = "CMO Medical Decision",
  rows: controlledRows,
  readOnly = false,
  onRowsChange,
}: CMOMedicalDecisionTableProps) {
  const [internalRows, setInternalRows] = useState<CMOMedicalDecisionRow[]>(
    () => CMO_HARDCODED_ROWS.map((row) => ({ ...row })),
  );
  const [selectedRow, setSelectedRow] =
    useState<CMOMedicalDecisionRow | null>(null);

  const shouldUseHardcodedRows =
    controlledRows === undefined || controlledRows.length === 0;
  const rows = shouldUseHardcodedRows ? internalRows : controlledRows;

  const updateRow = (
    rowIndex: number,
    changes: Partial<CMOMedicalDecisionRow>,
  ) => {
    const updatedRows = rows.map((row, index) =>
      index === rowIndex ? { ...row, ...changes } : row,
    );

    if (shouldUseHardcodedRows) {
      setInternalRows(updatedRows);
    }

    onRowsChange?.(updatedRows);
  };

  const isEditable =
    !readOnly &&
    (shouldUseHardcodedRows || Boolean(onRowsChange));

  return (
    <Paper
      elevation={0}
      sx={{
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
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Table
          size="small"
          sx={{
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            tableLayout: "fixed",
            "& .MuiTableCell-root": {
              minWidth: 0,
            },
            "& tr:last-child td": {
              borderBottom: "none",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, width: "11%" }}>
                FUP Code
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "15%" }}>
                Medical Type
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "12%" }}>
                Raised Date
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "12%" }}>
                Received Date
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "20%" }}>
                Decision
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "25%" }}>
                Remarks
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "5%" }}>
                Action
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
                const rowKey = row.id ?? rowIndex;

                return (
                <TableRow key={rowKey}>
                  <TableCell sx={bodyCellSx}>{row.fupCode || "-"}</TableCell>
                  <TableCell sx={bodyCellSx}>{row.medicalType || "-"}</TableCell>
                  <TableCell sx={bodyCellSx}>{row.raisedDate || "-"}</TableCell>
                  <TableCell sx={bodyCellSx}>{row.receivedDate || "-"}</TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Select<string>
                      fullWidth
                      size="small"
                      displayEmpty
                      value={row.decision ?? ""}
                      disabled={!isEditable}
                      onChange={(event: SelectChangeEvent) =>
                        updateRow(rowIndex, {
                          decision: event.target.value as CMODecision | "",
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
                        backgroundColor: "#FFFFFF",
                        fontSize: "10px",
                        "& .MuiSelect-select": {
                          py: 0.6,
                          px: 0.6,
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

                      {CMO_DECISION_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: "11px" }}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.remarks ?? ""}
                      disabled={!isEditable}
                      placeholder="Enter remarks"
                      multiline
                      minRows={1}
                      maxRows={3}
                      onChange={(event) =>
                        updateRow(rowIndex, {
                          remarks: event.target.value,
                        })
                      }
                      sx={{
                        minWidth: 0,
                        "& .MuiInputBase-root": {
                          minWidth: 0,
                          minHeight: 32,
                          backgroundColor: "#FFFFFF",
                          fontSize: "10px",
                        },
                        "& .MuiInputBase-input": {
                          py: 0.6,
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx} align="center">
                    <Tooltip title="Edit">
                      <span>
                        <IconButton
                          type="button"
                          size="small"
                          aria-label={`Edit ${row.medicalType || row.fupCode}`}
                          disabled={readOnly}
                          onClick={() => setSelectedRow(row)}
                          sx={{
                            color: "#9A2529",
                            border: "1px solid #9A2529",
                            p: 0.55,
                            "&:hover": {
                              backgroundColor: "rgba(154,37,41,0.08)",
                            },
                          }}
                        >
                          <EditIcon width={15} height={15} />
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

      <CustomDialog
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        title={
           <Typography
            sx={{
              color: "#9A2529",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase"
            }}
          >
            {selectedRow
              ? `Edit ${selectedRow.medicalType || selectedRow.fupCode}`
              : "Edit Medical"}
          </Typography>
        }
        maxWidth="lg"
        fullWidth
        contentSx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
        actionsSx={{
          justifyContent: "center",
          pb: 2,
        }}
         actions={
          <CustomButton
            sx={{ borderRadius: "50px", paddingX: "40px" }}
          >
            Confirm
          </CustomButton>
        }
      >
        {selectedRow && (
          <SpecialMedicalForm
            key={String(selectedRow.id ?? selectedRow.fupCode)}
            selectedSubSection={
              selectedRow.medicalType || selectedRow.fupCode
            }
            isEditing
          />
        )}
      </CustomDialog>
    </Paper>
  );
}
