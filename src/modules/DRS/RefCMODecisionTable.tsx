import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export interface RefCMODecisionRow {
  id?: string | number;
  fupCode: string;
  medicalType: string;
  raisedDate: string;
  receivedDate: string;
  vendorCmoOpinion?: string;
  vendorCmoRemarks?: string;
  hoCmoDecision?: string;
  hoCmoRemarks?: string;
}

export const REF_CMO_HARDCODED_ROWS: RefCMODecisionRow[] = [
  {
    id: 1,
    fupCode: "-",
    medicalType: "Special Medical",
    raisedDate: "1 Sep 2026",
    receivedDate: "2 Sep 2026",
    vendorCmoOpinion: "STD",
    vendorCmoRemarks: "All medical parameters are within acceptable limits.",
    hoCmoDecision: "STD",
    hoCmoRemarks: "Vendor CMO opinion reviewed and accepted.",
  },
  {
    id: 2,
    fupCode: "-",
    medicalType: "Special Medical",
    raisedDate: "1 Sep 2026",
    receivedDate: "3 Sep 2026",
    vendorCmoOpinion: "Refer to 2nd Opinion",
    vendorCmoRemarks: "Borderline ECG findings; cardiology review advised.",
    hoCmoDecision: "Sub STD",
    hoCmoRemarks: "Second opinion reviewed; apply sub-standard terms.",
  },
];

interface RefCMODecisionTableProps {
  title?: string;
  rows?: RefCMODecisionRow[];
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

const displayValue = (value?: string) => value?.trim() || "-";

export default function RefCMODecisionTable({
  title = "Ref CMO Decision",
  rows = REF_CMO_HARDCODED_ROWS,
}: RefCMODecisionTableProps) {
  return (
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
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Table
          size="small"
          aria-readonly="true"
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
                HO CMO Decision
              </TableCell>
              <TableCell sx={{ ...headerCellSx, width: "15%" }}>
                HO CMO Remarks
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
                    {displayValue(row.vendorCmoOpinion)}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {displayValue(row.vendorCmoRemarks)}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {displayValue(row.hoCmoDecision)}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {displayValue(row.hoCmoRemarks)}
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
