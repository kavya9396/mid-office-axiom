import { Box, Checkbox, Container, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../components/layout/BackButton";
import CustomButton from "../../components/ui/Button/Button";
import CustomTable, { type Column } from "../../components/ui/Table/Table";
import { HouseIcon, NoteIcon, UserProfileIcon } from "../../icons/Icons";
import { getDRSPath, getInboxPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { drsThunk } from "../../store/thunks/drsThunk";
import {
  raiseGrievanceThunk,
  type RaiseGrievanceRow,
} from "../../store/thunks/grievanceThunk";
import { columnFlex } from "../../utils/styles";

type RecordValue = Record<string, unknown>;
type NavState = { applicationNumber?: string; businessType?: string; taskId?: string; instanceId?: string } | null;
type Summary = { memberType: string; proposerName: string; lifeAssuredName: string };
type Row = RaiseGrievanceRow & { rowId: string };

const record = (value: unknown): RecordValue =>
  value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const text = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value) : "";
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const normalize = (value: unknown) => text(value).trim().toLowerCase().replace(/[\s_-]+/g, "");

const summaryName = (item: RecordValue, type: "proposer" | "life") => {
  const policy = record(item.policyDetails);
  const person = record(item.proposerSummary);
  const fullName = [person.firstName, person.middleName, person.lastName].map(text).filter(Boolean).join(" ");
  return type === "proposer" ? text(policy.proposerName) || fullName : text(policy.lifeAssuredName) || fullName;
};

const Grievance = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const navState = useLocation().state as NavState;
  const applicationNumber = navState?.applicationNumber ?? localStorage.getItem("applicationNumber") ?? "";
  const businessType = navState?.businessType ?? localStorage.getItem("businessType") ?? "retail";
  const roleType = localStorage.getItem("roleType") ?? "";
  const userId = localStorage.getItem("userId") ?? "";
  const taskId = navState?.taskId ?? localStorage.getItem("taskId") ?? "";
  const instanceId = navState?.instanceId ?? localStorage.getItem("instanceId") ?? "";
  const [drsData, setDrsData] = useState<RecordValue>({});
  const [editedRemarks, setEditedRemarks] = useState<Record<string, string>>({});
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [remarksErrors, setRemarksErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      if (!applicationNumber) return setError("Application number is missing.");
      try {
        setLoading(true);
        setError("");
        const response = await dispatch(drsThunk({
          applicationNo: applicationNumber,
          userId,
          roleType,
          sections: ["summary", "requirementManagement"],
        })).unwrap();
        const root = record(response);
        setDrsData(record(root.data ?? response));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Failed to load grievance details.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [applicationNumber, dispatch, roleType, userId]);

  const summaries = useMemo<Summary[]>(() => array(drsData.summary).map((value) => {
    const item = record(value);
    return {
      memberType: text(item.memberType),
      proposerName: summaryName(item, "proposer"),
      lifeAssuredName: summaryName(item, "life"),
    };
  }), [drsData.summary]);

  const rows = useMemo<Row[]>(() => {
    return array(drsData.requirementManagement).map(record)
      .filter((item) => ["medical", "medicals"].includes(normalize(item.category)))
      .map((item, index) => {
        const profile = text(
          item.profile ?? item.memberType ?? item.member_type ?? item.lifeMemberType,
        );
        const rowId = `${text(item.requirementId) || "requirement"}-${profile}-${index}`;

        return {
          rowId,
          requirementId: text(item.requirementId) || index,
          memberType: profile,
          fupCode: text(item.fupCode),
          memberName: profile || "-",
          remarksByUser: editedRemarks[rowId] ?? text(item.remarksByUser ?? item.remarksUser),
          remarksByTpa: text(item.remarksByTpa ?? item.remarksTpa),
        };
      });
  }, [drsData.requirementManagement, editedRemarks]);

  const changeRemarks = (rowId: string, remarksByUser: string) => {
    setEditedRemarks((current) => ({
      ...current,
      [rowId]: remarksByUser,
    }));
    if (remarksByUser.trim()) {
      setRemarksErrors((current) => {
        const next = new Set(current);
        next.delete(rowId);
        return next;
      });
    }
  };

  const allSelected = rows.length > 0 && selectedRowIds.size === rows.length;
  const partiallySelected = selectedRowIds.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelectedRowIds(allSelected ? new Set() : new Set(rows.map((row) => row.rowId)));
  };

  const toggleRow = (rowId: string) => {
    setSelectedRowIds((current) => {
      const next = new Set(current);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const submit = async () => {
    const selectedRows = rows.filter((row) => selectedRowIds.has(row.rowId));
    const rowsWithoutRemarks = selectedRows
      .filter((row) => !row.remarksByUser.trim())
      .map((row) => row.rowId);

    if (rowsWithoutRemarks.length > 0) {
      setRemarksErrors(new Set(rowsWithoutRemarks));
      setError("Remarks By User is mandatory for every selected requirement.");
      return;
    }

    setRemarksErrors(new Set());
    setError("");

    const grievanceDetails = selectedRows
      .map((row) => ({
      requirementId: row.requirementId,
      memberType: row.memberType,
      fupCode: row.fupCode,
      memberName: row.memberName,
      remarksByUser: row.remarksByUser.trim(),
      remarksByTpa: "",
    }));
    const payload = { applicationNumber, userId, roleType, taskId, instanceId, grievanceDetails };
    console.log("Raise grievance request payload:", payload);
    try {
      setSubmitLoading(true);
      setError("");
      const response = await dispatch(raiseGrievanceThunk(payload)).unwrap();
      navigate(getInboxPath(businessType), { state: { snackbarMessage: response.message || "Grievance raised successfully." } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to raise grievance.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const lifeAssured = summaries.find((item) => !normalize(item.memberType).includes("proposer"))?.lifeAssuredName ?? "-";
  const proposer = summaries.find((item) => normalize(item.memberType).includes("proposer"))?.proposerName ?? "-";
  const info = [
    { icon: <NoteIcon />, label: "Policy Number", value: applicationNumber || "-" },
    { icon: <UserProfileIcon />, label: "Life Assured Name", value: lifeAssured },
    { icon: <HouseIcon />, label: "Proposer Name", value: proposer },
  ];
  const columns: Column<Row>[] = [
    {
      key: "rowId",
      width: "5%",
      headerRender: () => (
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={partiallySelected}
          onChange={toggleAll}
          sx={{ p: 0 }}
        />
      ),
      render: (_value, row) => (
        <Checkbox
          size="small"
          checked={selectedRowIds.has(row.rowId)}
          onChange={() => toggleRow(row.rowId)}
          sx={{ p: 0 }}
        />
      ),
    },
    { key: "fupCode", header: "FUP Code", width: "20%", render: (value) => <Typography sx={{ fontSize: 12 }}>{text(value) || "-"}</Typography> },
    { key: "memberName", header: "Profile", width: "25%", render: (value) => <Typography sx={{ fontSize: 12 }}>{text(value) || "-"}</Typography> },
    { key: "remarksByUser", header: "Remarks By User *", width: "30%", render: (_value, row) => <TextField fullWidth required error={remarksErrors.has(row.rowId)} helperText={remarksErrors.has(row.rowId) ? "Remarks are mandatory." : ""} size="small" value={row.remarksByUser} placeholder="Enter remarks..." slotProps={{ htmlInput: { maxLength: 1000 } }} onChange={(event) => changeRemarks(row.rowId, event.target.value)} sx={{ "& .MuiInputBase-root": { fontSize: 12, backgroundColor: "#fff" }, "& .MuiFormHelperText-root": { mx: 0, fontSize: 10 } }} /> },
    { key: "remarksByTpa", header: "Remarks By TPA", width: "25%", render: (value) => <Typography sx={{ fontSize: 12 }}>{text(value)}</Typography> },
  ];

  return <Box sx={{ width: "100%", ...columnFlex, backgroundColor: "#F0F3F8", minHeight: "90vh", pb: 2 }}>
    <Container disableGutters><BackButton label="Back to DRS" onClick={() => navigate(getDRSPath(businessType, applicationNumber))} /></Container>
    <Container disableGutters>
      <Typography sx={{ fontSize: 16, fontWeight: 700, ml: 1 }}>Raise Grievance</Typography>
      {error && <Typography sx={{ color: "#DE2C3B", mt: 1, ml: 1, fontSize: 13 }}>{error}</Typography>}
      <Box sx={{ display: "flex", width: "100%", backgroundColor: "#fff", borderRadius: 2, mt: 1 }}>
        {info.map((item, index) => <Box key={item.label} sx={{ flex: 1, display: "flex", gap: 1.5, p: 4, borderRight: index < 2 ? "1px solid #E6E6E6" : "none" }}>
          {item.icon}<Box><Typography sx={{ fontSize: 12 }}>{item.label}</Typography><Typography sx={{ fontWeight: 600 }}>{item.value}</Typography></Box>
        </Box>)}
      </Box>
      <Box sx={{ mt: 4 }}>{loading ? <Typography sx={{ color: "#6B7280" }}>Loading reports...</Typography> : <CustomTable<Row> title="Medical Requirements" columns={columns} data={rows} />}</Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <CustomButton sx={{ minWidth: 180, borderRadius: "50px" }} onClick={submit} disabled={loading || submitLoading || selectedRowIds.size === 0}>
          {submitLoading ? "Submitting..." : "Raise Grievance"}
        </CustomButton>
      </Box>
    </Container>
  </Box>;
};

export default Grievance;
