import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/layout/BackButton";
import type { Column } from "../../components/ui/Table/Table";
import CustomTable from "../../components/ui/Table/Table";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { openOtherTasksThunk } from "../../store/thunks/openOtherTasksThunk";
import type { OpenOtherTaskRow, OpenOtherTasks, OpenOtherTasksResponse } from "../../types/drs.types";

const openTaskColumns: Column<OpenOtherTaskRow>[] = [
  {
    key: "serviceID",
    header: "Service ID",
    width: "13%",
    render: (value) => (
      <Typography
        component="span"
        sx={{ color: "#0B4F8C", textDecoration: "underline", cursor: "pointer" }}
      >
        {String(value ?? "-")}
      </Typography>
    ),
  },
  { key: "ct", header: "CT", width: "8%" },
  { key: "st", header: "ST", width: "8%" },
  { key: "breDate", header: "BRE Date", width: "14%" },
  { key: "breDecision", header: "BRE Decision", width: "14%" },
  { key: "breDiscrepancy", header: "BRE Discrepancy", width: "16%" },
  { key: "breRemarks", header: "BRE Remarks", width: "16%" },
  { key: "userPool", header: "User Pool", width: "11%" },
];

const toDisplay = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const normalizeOpenTaskRows = (rows: unknown): OpenOtherTasks => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => {
    const item = row as Record<string, unknown>;

    return {
      serviceID: toDisplay(item.serviceID),
      ct: toDisplay(item.ct),
      st: toDisplay(item.st),
      breDate: toDisplay(item.breDate),
      breDecision: toDisplay(item.breDecision ?? item.status),
      breDiscrepancy: toDisplay(item.breDiscrepancy),
      breRemarks: toDisplay(item.breRemarks),
      userPool: toDisplay(item.userPool ?? item.userName),
    };
  });
};

const extractOpenTaskRows = (response: OpenOtherTasksResponse): OpenOtherTasks => {
  return normalizeOpenTaskRows(
    response.openOtherTasks ??
      response.quickLinks?.openOtherTasks ??
      response.data?.openOtherTasks ??
      response.data?.quickLinks?.openOtherTasks,
  );
};

const OpenTasksPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessType, applicationNumber } = useAppContext();
  const [rows, setRows] = useState<OpenOtherTasks>([]);
  const [loading, setLoading] = useState(false);

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationNumber = applicationNumber ?? "";

  useEffect(() => {
    const loadOpenTasks = async () => {
      if (!safeApplicationNumber) {
        setRows([]);
        return;
      }

      try {
        setLoading(true);
        const roleType = localStorage.getItem("roleType") ?? "";

        const response = await dispatch(
          openOtherTasksThunk({
            applicationId: safeApplicationNumber,
            roleType,
          }),
        ).unwrap();

        setRows(extractOpenTaskRows(response));
      } catch (error) {
        console.error("Failed to load open tasks:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void loadOpenTasks();
  }, [dispatch, safeApplicationNumber]);

  const title = useMemo(
    () => `Pre Issuance Servicing${loading ? " (Loading...)" : ""}`,
    [loading],
  );

  return (
    <Container disableGutters>
      <BackButton
        label="Back to DRS"
        onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationNumber))}
      />

      <Box sx={{ mt: 1 }}>
        {rows.length > 0 ? (
          <CustomTable<OpenOtherTaskRow>
            title={title}
            columns={openTaskColumns}
            data={rows}
          />
        ) : (
          <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
            {loading ? "Loading open tasks..." : "No open tasks found"}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default OpenTasksPage;
