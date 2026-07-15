import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppSelector } from "../../../store/hooks";

type Form16Row = {
  label: string;
  year1: string;
  year2: string;
  year3: string;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toText = (value: unknown): string => String(value ?? "").trim();

const toForm16Row = (value: unknown): Form16Row => {
  const record = toRecord(value);

  return {
    label: toText(record.label) || "-",
    year1: toText(record.year1) || "NA",
    year2: toText(record.year2) || "NA",
    year3: toText(record.year3) || "NA",
  };
};

type DocumentRequiredProps = {
  data?: unknown;
};

const DocumentRequired = ({ data: dataOverride }: DocumentRequiredProps = {}) => {
  const storeData = useAppSelector((state) => state.drs.data);
  const data = dataOverride ?? storeData;
  const dataRecord = toRecord(data);
  const documentRequired = toRecord(dataRecord.documentRequired);
  const form16 = toRecord(documentRequired.form16);
  const rows = Array.isArray(form16.rows) ? form16.rows.map(toForm16Row) : [];
  const yearHeaders = Array.isArray(form16.yearHeaders)
    ? form16.yearHeaders.map(toText).filter(Boolean)
    : ["Year 1", "Year 2", "Year 3"];
  const isLifeAssuredNameSame = toText(documentRequired.isLifeAssuredNameSameWithDocName);
  const companyName = toText(documentRequired.companyName);
  const hasDetails = rows.length > 0 || isLifeAssuredNameSame || companyName;

  if (!hasDetails) {
    return null;
  }

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Documents Required" defaultExpanded>
          <Paper elevation={0} sx={{ border: "1px solid #D8D8D8", borderRadius: "12px", overflow: "hidden" }}>
            <Box sx={{ backgroundColor: "#004A80", color: "#fff", px: 2, py: 1 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
                {toText(form16.title) || "FORM 16 (Latest Assessment Year)"}
              </Typography>
            </Box>
            <TableContainer>
              <Table
                size="small"
                sx={{
                  "& th": {
                    backgroundColor: "#E9EEF3",
                    color: "#4A4A4A",
                    fontSize: "12px",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderBottom: "1px solid #D6D6D6",
                  },
                  "& td": {
                    color: "#4A4A4A",
                    fontSize: "12px",
                    px: 2,
                    py: 1,
                    borderBottom: "1px solid #E1E1E1",
                  },
                  "& tr:last-child td": {
                    borderBottom: "none",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "18%" }} />
                    <TableCell>{yearHeaders[0] ?? "Year 1"}</TableCell>
                    <TableCell>{yearHeaders[1] ?? "Year 2"}</TableCell>
                    <TableCell>{yearHeaders[2] ?? "Year 3"}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>{row.label}</TableCell>
                      <TableCell>{row.year1}</TableCell>
                      <TableCell>{row.year2}</TableCell>
                      <TableCell>{row.year3}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 180px))" },
              gap: 1.5,
              mt: 2,
              p: 1.5,
              backgroundColor: "#f6f6f6",
              borderRadius: "8px",
            }}
          >
            <CustomTextField
              label="Is Life Assured Name Same With Doc Name?"
              value={isLifeAssuredNameSame}
              slotProps={{ input: { readOnly: true } }}
              fullWidth
              sx={{ backgroundColor: "#fff" }}
            />
            <CustomTextField
              label="Company Name"
              value={companyName}
              slotProps={{ input: { readOnly: true } }}
              fullWidth
              sx={{ backgroundColor: "#fff" }}
            />
          </Box>
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default DocumentRequired;
