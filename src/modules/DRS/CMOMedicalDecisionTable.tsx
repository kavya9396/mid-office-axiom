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


import {
  Box,
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
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";

export const CMO_DECISION_OPTIONS = [
  "STD",
  "Sub STD",
  "Cannot Opine",
  "Refer to 2nd Opinion",
  "Do not pay to TPA",
] as const;

export type CMODecision = (typeof CMO_DECISION_OPTIONS)[number];

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
  }
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

  const shouldUseHardcodedRows =
    controlledRows === undefined || controlledRows.length === 0;
  const rows = internalRows;

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
              <TableCell sx={{ ...headerCellSx, width: "13%" }}>
                FUP Code
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "17%" }}>
                Medical Type
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "13%" }}>
                Raised Date
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "13%" }}>
                Received Date
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "20%" }}>
                Decision
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "24%" }}>
                Remarks
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={bodyCellSx}>
                  <Typography sx={{ fontSize: "11px", py: 1 }}>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow key={row.id ?? rowIndex}>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
