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

import CustomDialog from "../../../components/ui/Dialog/Dialog";
import { EyeIcon, UserProfileIcon } from "../../../icons/Icons";

export const HO_CMO_DECISION_OPTIONS = [
  "STD",
  "Sub STD",
  "Cannot Opine",
  "Refer to 2nd Opinion",
] as const;

export type HOCMODecision =
  (typeof HO_CMO_DECISION_OPTIONS)[number];

export interface CMORemarksHistoryItem {
  role: string;
  name: string;
  ntid: string;
  date: string;
  decision: string;
  remarks: string;
}

export interface HOCMOMedicalDecisionRow {
  id?: string | number;
  fupCode: string;
  medicalType: string;
  raisedDate: string;
  receivedDate: string;
  vendorCmoOpinion?: string;
  vendorCmoRemarks?: string;
  vendorCmoName?: string;
  vendorCmoNtid?: string;
  vendorCmoDate?: string;
  remarksHistory?: CMORemarksHistoryItem[];
  cmoDecision?: HOCMODecision | "";
  cmoRemarks?: string;
}

export const HO_CMO_HARDCODED_ROWS: HOCMOMedicalDecisionRow[] = [
  {
    id: 1,
    fupCode: "2DE",
    medicalType: "2DECHO",
    raisedDate: "1 Sep 2026",
    receivedDate: "2 Sep 2026",
    vendorCmoOpinion: "STD",
    vendorCmoRemarks: "All medical parameters are within acceptable limits.",
    remarksHistory: [
      {
        role: "Vendor CMO",
        name: "Dr. Alpana Gandhi",
        ntid: "IPRU84213",
        date: "02 Sep 2026, 09:45",
        decision: "STD",
        remarks: "All medical parameters are within acceptable limits.",
      }
    ],
    cmoDecision: "",
    cmoRemarks: "",
  },
  {
    id: 2,
    fupCode: "CXR",
    medicalType: "CXR",
    raisedDate: "1 Sep 2026",
    receivedDate: "3 Sep 2026",
    vendorCmoOpinion: "Refer to 2nd Opinion",
    vendorCmoRemarks: "Borderline ECG findings; cardiology review advised.",
    remarksHistory: [
      {
        role: "Vendor CMO",
        name: "Dr. Alpana Gandhi",
        ntid: "IPRU84213",
        date: "03 Sep 2026, 09:15",
        decision: "Refer to 2nd Opinion",
        remarks: "Borderline ECG findings; cardiology review advised.",
      },
    ],
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

const getRemarksHistory = (
  row: HOCMOMedicalDecisionRow,
): CMORemarksHistoryItem[] => {
  if (row.remarksHistory?.length) {
    return row.remarksHistory;
  }

  if (row.vendorCmoOpinion || row.vendorCmoRemarks) {
    return [
      {
        role: "Vendor CMO",
        name: row.vendorCmoName || "-",
        ntid: row.vendorCmoNtid || "-",
        date: row.vendorCmoDate || row.receivedDate || "-",
        decision: row.vendorCmoOpinion || "-",
        remarks: row.vendorCmoRemarks || "-",
      },
    ];
  }

  return [];
};

const HISTORY_TONES = ["#E34F4F", "#8A5BD7", "#2E8FB8"] as const;

export default function HOCMODecisionTable({
  title = "HO CMO Medical Decision",
  rows: controlledRows,
  readOnly = false,
  onRowsChange,
}: HOCMOMedicalDecisionTableProps) {
  const [internalRows, setInternalRows] = useState<HOCMOMedicalDecisionRow[]>(
    () => HO_CMO_HARDCODED_ROWS.map((row) => ({ ...row })),
  );
  const [selectedHistoryRow, setSelectedHistoryRow] =
    useState<HOCMOMedicalDecisionRow | null>(null);

  const shouldUseHardcodedRows =
    controlledRows === undefined || controlledRows.length === 0;
  // const rows = shouldUseHardcodedRows ? internalRows : controlledRows;

  const rows = internalRows;
  const selectedRemarksHistory = selectedHistoryRow
    ? getRemarksHistory(selectedHistoryRow)
    : [];
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
    <>
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
              <TableCell sx={{ ...headerCellSx, width: "6%" }}>
                FUP Code
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "8%" }}>
                Medical Test
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "8%" }}>
                Profile
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
              rows.map((row, rowIndex) => (
                <TableRow key={row.id ?? rowIndex}>
                  <TableCell sx={bodyCellSx}>
                    {row.fupCode || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.medicalType || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {"Life Assured"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.raisedDate || "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.receivedDate || "-"}
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

                    <TableCell align="center" sx={bodyCellSx}>
                    <Tooltip title="View remarks history" arrow>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={`View remarks history for ${row.medicalType || "medical requirement"}`}
                          disabled={getRemarksHistory(row).length === 0}
                          onClick={() => setSelectedHistoryRow(row)}
                          sx={{
                            width: 30,
                            height: 30,
                            border: "1px solid #E6D8D2",
                            bgcolor: "#FFF8F3",
                            "&:hover": {
                              bgcolor: "#FFEAD7",
                            },
                            "& svg": {
                              width: 17,
                              height: 17,
                            },
                          }}
                        >
                          <EyeIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
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
                    position: "relative",
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
                      "& svg": {
                        width: 16,
                        height: 16,
                      },
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
                          {history.role || "-"}
                        </Box>

                        <Typography
                          component="span"
                          sx={{
                            color: "#2F3035",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {history.name || "-"}
                        </Typography>

                        <Typography
                          component="span"
                          sx={{ color: "#85868C", fontSize: 9.5 }}
                        >
                          | {history.ntid || "-"}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          flexShrink: 0,
                          color: "#909198",
                          fontSize: 9,
                        }}
                      >
                        {history.date || "-"}
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
                        {history.decision || "-"}
                      </Box>
                      {" - "}
                      {history.remarks || "-"}
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
