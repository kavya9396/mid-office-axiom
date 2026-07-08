import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import BackButton from "../../components/layout/BackButton";
import type { Column } from "../../components/ui/Table/Table";
import CustomTable from "../../components/ui/Table/Table";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath } from "../../routes/routes";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { auditTrailThunk } from "../../store/thunks/auditTrailThunk";
import type { AuditTrail, AuditTrailResponse, AuditTrailRow } from "../../types/drs.types";

const auditTrailColumns: Column<AuditTrailRow>[] = [
  { key: "dateTime", header: "Date/Time", width: "13%" },
  { key: "fromPool", header: "From Pool", width: "12%" },
  { key: "fromPoolUser", header: "From Pool User", width: "14%" },
  { key: "toPool", header: "To Pool", width: "10%" },
  { key: "toPoolUser", header: "To Pool User", width: "14%" },
  { key: "subPool", header: "Sub Pool", width: "10%" },
  { key: "userId", header: "User ID", width: "10%" },
  { key: "uwDecision", header: "UW Decision", width: "10%" },
   { key: "breDecision", header: "BRE Decision", width: "10%" },
  { key: "remarks", header: "BRE Remarks", width: "10%" },
];

const toDisplay = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const normalizeAuditTrailRows = (rows: unknown): AuditTrail => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => {
    const item = row as Record<string, unknown>;

    return {
      dateTime: toDisplay(item.dateTime),
      fromPool: toDisplay(item.fromPool),
      fromPoolUser: toDisplay(item.fromPoolUser),
      toPool: toDisplay(item.toPool),
      toPoolUser: toDisplay(item.toPoolUser),
      subPool: toDisplay(item.subPool),
      userId: toDisplay(item.userId),
      uwDecision: toDisplay(item.uwDecision ?? item.decision),
      breDecision: toDisplay(item.breDecision),
      remarks: toDisplay(item.remarks),
    };
  });
};

const extractAuditRows = (response: AuditTrailResponse): AuditTrail => {
  return normalizeAuditTrailRows(
    response.auditTrail ?? response.auditTrailData ?? response.data?.auditTrail,
  );
};

const AuditTrailPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessType, applicationNumber } = useAppContext();
  const [rows, setRows] = useState<AuditTrail>([]);
  const [loading, setLoading] = useState(false);

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationNumber = applicationNumber ?? "";

  useEffect(() => {
    const loadAuditTrail = async () => {
      if (!safeApplicationNumber) {
        setRows([]);
        return;
      }

      try {
        setLoading(true);
        const roleType = localStorage.getItem("roleType") ?? "";

        const response = await dispatch(
          auditTrailThunk({
            applicationId: safeApplicationNumber,
            roleType,
          }),
        ).unwrap();

        setRows(extractAuditRows(response));
      } catch (error) {
        console.error("Failed to load audit trail:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void loadAuditTrail();
  }, [dispatch, safeApplicationNumber]);

  const title = useMemo(
    () => `Audit Trail${loading ? " (Loading...)" : ""}`,
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
          <CustomTable<AuditTrailRow>
            title={title}
            columns={auditTrailColumns}
            data={rows}
          />
        ) : (
          <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
            {loading ? "Loading audit trail..." : "No audit trail records found"}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default AuditTrailPage;
