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

export const HO_CMO_DECISION_OPTIONS = [
  "STD",
  "Sub STD",
  "Cannot Opine",
  "Refer to 2nd Opinion",
  "Do not pay to TPA",
] as const;

export type HOCMODecision =
  (typeof HO_CMO_DECISION_OPTIONS)[number];

export interface HOCMOMedicalDecisionRow {
  id?: string | number;
  fupCode: string;
  medicalType: string;
  raisedDate: string;
  receivedDate: string;
  vendorCmoOpinion?: string;
  vendorCmoRemarks?: string;
  cmoDecision?: HOCMODecision | "";
  cmoRemarks?: string;
}

export const HO_CMO_HARDCODED_ROWS: HOCMOMedicalDecisionRow[] = [
  {
    id: 1,
    fupCode: "",
    medicalType: "Special Medical",
    raisedDate: "1 Sep 2026",
    receivedDate: "2 Sep 2026",
    vendorCmoOpinion: "STD",
    vendorCmoRemarks: "All medical parameters are within acceptable limits.",
    cmoDecision: "",
    cmoRemarks: "",
  },
  {
    id: 2,
    fupCode: "",
    medicalType: "Special Medical",
    raisedDate: "1 Sep 2026",
    receivedDate: "3 Sep 2026",
    vendorCmoOpinion: "Refer to 2nd Opinion",
    vendorCmoRemarks: "Borderline ECG findings; cardiology review advised.",
    cmoDecision: "",
    cmoRemarks: "",
  }
];

interface HOCMOMedicalDecisionTableProps {
  title?: string;
  rows?: HOCMOMedicalDecisionRow[];
  readOnly?: boolean;
  onRowsChange?: (rows: HOCMOMedicalDecisionRow[]) => void;
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

export default function HOCMODecisionTable({
  title = "HO CMO Medical Decision",
  rows: controlledRows,
  readOnly = false,
  onRowsChange,
}: HOCMOMedicalDecisionTableProps) {
  const [internalRows, setInternalRows] = useState<HOCMOMedicalDecisionRow[]>(
    () => HO_CMO_HARDCODED_ROWS.map((row) => ({ ...row })),
  );

  const shouldUseHardcodedRows =
    controlledRows === undefined || controlledRows.length === 0;
  // const rows = shouldUseHardcodedRows ? internalRows : controlledRows;

  const rows = internalRows; 
  const updateRow = (
    rowIndex: number,
    changes: Partial<HOCMOMedicalDecisionRow>,
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
              <TableCell sx={{ ...headerCellSx, width: "9%" }}>
                FUP Code
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "12%" }}>
                Medical Type
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "10%" }}>
                Raised Date
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "10%" }}>
                Received Date
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "14%" }}>
                Vendor CMO Opinion
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "16%" }}>
                Vendor CMO Remarks
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "14%" }}>
                CMO Decision
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "15%" }}>
                CMO Remarks
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={bodyCellSx}>
                  <Typography sx={{ fontSize: "11px", py: 1 }}>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow key={row.id ?? rowIndex}>
                  <TableCell sx={bodyCellSx}>
                    {row.fupCode || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.medicalType || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.raisedDate || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.receivedDate || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.vendorCmoOpinion || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.vendorCmoRemarks || "-"}
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Select<string>
                      fullWidth
                      size="small"
                      displayEmpty
                      value={row.cmoDecision ?? ""}
                      disabled={!isEditable}
                      onChange={(event: SelectChangeEvent) =>
                        updateRow(rowIndex, {
                          cmoDecision:
                            event.target.value as HOCMODecision | "",
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

                      {HO_CMO_DECISION_OPTIONS.map((option) => (
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
                      size="small"
                      value={row.cmoRemarks ?? ""}
                      disabled={!isEditable}
                      placeholder="Enter remarks"
                      multiline
                      minRows={1}
                      maxRows={3}
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
