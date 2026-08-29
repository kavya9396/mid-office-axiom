import {
  Alert,
  Box,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomAccordion from "../../components/ui/Accordion/Accordion";
import CustomButton from "../../components/ui/Button/Button";
import CustomTextField from "../../components/ui/TextField/TextField";
import { useAppContext } from "../../hooks/useAppContext";
import { getInboxPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { completeTaskThunk } from "../../store/thunks/completeTaskThunk";
import { grievanceApplicationThunk } from "../../store/thunks/grievanceApplicationThunk";
import type { GrievanceApplicationReport, GrievanceApplicationResponse } from "../../types/drs.types";

type SelectedCaseContext = {
  applicationNumber?: string;
  applicationNo?: string;
  applicationId?: string;
  taskId?: string;
  instanceId?: string;
  roleType?: string;
  businessType?: string;
  taskCompositeId?: string;
};

const getFirstNonEmptyValue = (...values: unknown[]): string => {
  for (const value of values) {
    const normalizedValue = String(value ?? "").trim();
    if (normalizedValue && normalizedValue !== "[object Object]") {
      return normalizedValue;
    }
  }
  return "";
};

const getSelectedCaseContext = (): SelectedCaseContext => {
  try {
    return JSON.parse(localStorage.getItem("selectedCaseContext") ?? "{}") as SelectedCaseContext;
  } catch {
    return {};
  }
};

const getValue = (row: GrievanceApplicationReport, keys: string[]): string => {
  const record = row as unknown as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined && String(value).trim()) return String(value);
  }
  return "-";
};

const GrievanceApplication = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { businessType, applicationNumber } = useAppContext();
  const userId = localStorage.getItem("username") ?? "";
  const selectedCaseContext = useMemo(
    () => getSelectedCaseContext(),
    [],
  );
  const taskCompositeId = getFirstNonEmptyValue(
    selectedCaseContext.taskCompositeId,
    localStorage.getItem("taskCompositeId"),
  );
  const compositeParts = taskCompositeId
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);
  const taskIdFromComposite = compositeParts.at(-1) ?? "";
  const instanceIdFromComposite =
    compositeParts.length > 1 ? compositeParts.slice(0, -1).join(".") : "";

  const safeBusinessType = getFirstNonEmptyValue(
    selectedCaseContext.businessType,
    businessType,
    localStorage.getItem("businessType"),
    "retail",
  ).toLowerCase();
  const safeApplicationId = getFirstNonEmptyValue(
    selectedCaseContext.applicationNumber,
    selectedCaseContext.applicationNo,
    selectedCaseContext.applicationId,
    applicationNumber,
    localStorage.getItem("applicationNumber"),
  );
  const roleType = getFirstNonEmptyValue(
    selectedCaseContext.roleType,
    localStorage.getItem("roleType"),
  );
  const taskId = getFirstNonEmptyValue(
    selectedCaseContext.taskId,
    localStorage.getItem("taskId"),
    taskIdFromComposite,
  );
  const instanceId = getFirstNonEmptyValue(
    selectedCaseContext.instanceId,
    localStorage.getItem("instanceId"),
    instanceIdFromComposite,
  );

  const [applicationData, setApplicationData] = useState<GrievanceApplicationResponse | null>(null);
  const [reports, setReports] = useState<GrievanceApplicationReport[]>([]);
  const [tpaRemarks, setTpaRemarks] = useState<Record<string, string>>({});
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const areAllTpaRemarksFilled = reports.length > 0 && reports.every(
    (row) => Boolean(tpaRemarks[String(row.id)]?.trim()),
  );

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const response = await dispatch(grievanceApplicationThunk({ applicationId: safeApplicationId, roleType })).unwrap();
        const responseReports = response.reports ?? [];
        setApplicationData(response);
        setReports(responseReports);
        setSelectedReportIds(new Set(responseReports.map((row) => String(row.id))));
        setTpaRemarks(Object.fromEntries(responseReports.map((row) => [
          String(row.id),
          getValue(row, ["tpaRemarks", "remarksByTPA", "remarksByTpa"]).replace(/^-$|^null$/i, ""),
        ])));
      } catch (error) {
        setFetchError(error instanceof Error ? error.message : "Failed to load grievance application.");
      } finally {
        setLoading(false);
      }
    };
    void fetchApplication();
  }, [dispatch, roleType, safeApplicationId]);

  const handleSubmit = () => {
    if (!taskId || !instanceId || !userId || !safeApplicationId) {
      setSubmitError("Task ID, instance ID, user ID, or application number is missing.");
      return;
    }

    if (selectedReportIds.size === 0) {
      setSubmitError("Please select at least one grievance record.");
      return;
    }

    if (!areAllTpaRemarksFilled) {
      setSubmitError("TPA remarks are mandatory for all grievance records.");
      return;
    }

    setSubmitError(null);
    setConfirmationOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!areAllTpaRemarksFilled) {
      setConfirmationOpen(false);
      setSubmitError("TPA remarks are mandatory for all grievance records.");
      return;
    }

    try {
      setConfirmationOpen(false);
      setSubmitLoading(true);
      setSubmitError(null);
      await dispatch(completeTaskThunk({
        businessType: safeBusinessType,
        requestContext: {
          taskId,
          instanceId,
          userId,
          appNo: safeApplicationId,
          decision: "CLS_TASK",
          remarks: "",
          tpaRemarks: reports
            .filter((row) => selectedReportIds.has(String(row.id)))
            .map((row) => tpaRemarks[String(row.id)]?.trim())
            .filter((remark): remark is string => Boolean(remark))
            .join("\n"),
        },
      })).unwrap();
      navigate(getInboxPath(safeBusinessType), { state: { snackbarMessage: "Task completed successfully." } });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to complete task.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderRows = (editable: boolean) => {
    const columnCount = editable ? 7 : 6;
    if (loading) return <TableRow><TableCell colSpan={columnCount} align="center" sx={{ py: 4 }}>Loading reports...</TableCell></TableRow>;
    if (!reports.length) return <TableRow><TableCell colSpan={columnCount} align="center" sx={{ py: 4 }}>No Data Found!</TableCell></TableRow>;

    return reports.map((row) => {
      const rowId = String(row.id);
      return (
        <TableRow
          key={`${editable ? "editable" : "readonly"}-${rowId}`}
          hover
          sx={{ height: 42 }}
        >
          {/* {editable && (
            <TableCell padding="checkbox" sx={{ width: 42 }}>
              <Checkbox
                size="small"
                checked
                disabled
              />
            </TableCell>
          )} */}
          <TableCell>{getValue(row, ["user", "raisedBy", "userName"])}</TableCell>
          <TableCell>{getValue(row, ["fupCode", "fupcode", "reports"])}</TableCell>
          <TableCell>{getValue(row, ["Profile", "profile", "lifeAssuredProposer"])}</TableCell>
          <TableCell>{getValue(row, ["grievanceRaisedRemark", "grievanceRaisedRemarks", "remarksByUser"])}</TableCell>
          <TableCell>{getValue(row, ["grievanceRaisedDate"])}</TableCell>
          <TableCell sx={{ minWidth: 220 }}>
            {editable ? (
              <CustomTextField
                fullWidth
                size="small"
                placeholder="Enter TPA remarks *"
                value={tpaRemarks[rowId] ?? ""}
                onChange={(event) => {
                  setTpaRemarks((current) => ({ ...current, [rowId]: event.target.value }));
                  setSubmitError(null);
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    height: 32,
                    fontSize: 12,
                    backgroundColor: "#fff",
                  },
                  "& .MuiInputBase-input": {
                    px: 1.25,
                    py: 0.5,
                  },
                }}
              />
            ) : getValue(row, ["tpaRemarks", "remarksByTPA", "remarksByTpa"])}
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderTable = (editable: boolean) => (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        sx={{
          minWidth: 950,
          tableLayout: "fixed",
          "& .MuiTableCell-root": {
            px: 1.5,
            py: 0.65,
            height: 42,
            borderColor: "#E2E2E2",
            fontSize: 12,
            lineHeight: 1.25,
            verticalAlign: "middle",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            height: 36,
            py: 0.5,
            color: "#222",
            backgroundColor: "#FDE8D7",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
          },
        }}
      >
        <TableHead><TableRow>
          {/* {editable && (
            <TableCell padding="checkbox" sx={{ width: 42 }}>
              <Checkbox
                size="small"
                checked={reports.length > 0 && selectedReportIds.size === reports.length}
                disabled
              />
            </TableCell>
          )} */}
          <TableCell>User</TableCell><TableCell>FUP Code</TableCell><TableCell>Profile</TableCell>
          <TableCell>Grievance Raised Remark</TableCell><TableCell>Grievance Raised Date</TableCell><TableCell>TPA Remarks</TableCell>
        </TableRow></TableHead>
        <TableBody>{renderRows(editable)}</TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ backgroundColor: "#F0F3F8", minHeight: "90vh", pb: 4 }}>
      <Container disableGutters>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>Grievance Application</Typography>
        <CustomAccordion title="Application Details" defaultExpanded>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, backgroundColor: "#F6F6F6", border: "1px solid #E6E6E6", borderRadius: "8px", p: 2 }}>
            {[
              ["Application Number", applicationData?.applicationId], ["Product", applicationData?.productOpted],
              ["Premium", applicationData?.premium], ["Sum Assured", applicationData?.sumAssured],
              ["Medical Raised Date", applicationData?.medicalRaisedDate], ["Medicals Received Date", applicationData?.medicalsReceivedDate],
            ].map(([label, value]) => <Box key={String(label)}><Typography sx={{ fontSize: 12, color: "#6B7280" }}>{label}</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{value ?? "-"}</Typography></Box>)}
          </Box>
        </CustomAccordion>

        <Paper sx={{ mt: 1.5, border: "1px solid #D9D9D9", borderRadius: "10px", overflow: "hidden", boxShadow: "none" }}>
          <Box sx={{ backgroundColor: "#ED5A0A", color: "#fff", px: 2, py: 0.9 }}><Typography sx={{ fontSize: 13, fontWeight: 700 }}>Grievance History</Typography></Box>
          <Box sx={{ backgroundColor: "#fff" }}>{renderTable(false)}</Box>
        </Paper>

        <Paper sx={{ mt: 1.5, border: "1px solid #D9D9D9", borderRadius: "10px", overflow: "hidden", boxShadow: "none" }}>
          <Box sx={{ backgroundColor: "#ED5A0A", color: "#fff", px: 2, py: 0.9 }}><Typography sx={{ fontSize: 13, fontWeight: 700 }}>TPA Grievance Details</Typography></Box>
          <Box sx={{ backgroundColor: "#fff" }}>{renderTable(true)}</Box>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CustomButton sx={{ borderRadius: "50px", minWidth: 180 }} onClick={handleSubmit} disabled={submitLoading || loading}>
            {submitLoading ? "Submitting..." : "Submit"}
          </CustomButton>
        </Box>

        <Dialog
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>
            Confirm Submission
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: 14 }}>
              Do you want to submit the selected grievance response and close the task?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <CustomButton
              sx={{ minWidth: 100 }}
              onClick={() => setConfirmationOpen(false)}
              disabled={submitLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              sx={{ minWidth: 100 }}
              onClick={() => void handleConfirmSubmit()}
              disabled={submitLoading}
            >
              Confirm
            </CustomButton>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={Boolean(fetchError || submitError)}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={() => {
            setFetchError(null);
            setSubmitError(null);
          }}
        >
          <Alert
            severity="error"
            variant="filled"
            onClose={() => {
              setFetchError(null);
              setSubmitError(null);
            }}
            sx={{ width: "100%" }}
          >
            {submitError ?? fetchError}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default GrievanceApplication;
