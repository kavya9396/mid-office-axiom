import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import BackButton from "../../components/layout/BackButton";
import type { Column } from "../../components/ui/Table/Table";
import CustomTable from "../../components/ui/Table/Table";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath } from "../../routes/routes";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../store/hooks";
import { drsThunk } from "../../store/thunks/drsThunk";
import type { RootState } from "../../store/store";
import type { AuditTrail, AuditTrailRow } from "../../types/drs.types";

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
  { key: "userRemarks", header: "User Remarks", width: "10%" },
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
      userRemarks: toDisplay(item.userRemarks),
    };
  });
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const AuditTrailPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);
  const [quickLinksData, setQuickLinksData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationNumber = applicationNumber ?? "";
  const reduxQuickLinks = useMemo(
    () => toRecord((drsData as unknown as Record<string, unknown> | null)?.quickLinks),
    [drsData],
  );
  const hasReduxAuditTrail = Array.isArray(reduxQuickLinks.auditTrail);
  const effectiveQuickLinksData = !safeApplicationNumber
    ? null
    : hasReduxAuditTrail
      ? reduxQuickLinks
      : quickLinksData;
  const rows = useMemo<AuditTrail>(
    () => normalizeAuditTrailRows(effectiveQuickLinksData?.auditTrail),
    [effectiveQuickLinksData],
  );

  useEffect(() => {
    const loadAuditTrail = async () => {
      if (!safeApplicationNumber || hasReduxAuditTrail) {
        return;
      }

      try {
        setLoading(true);
        const roleType = localStorage.getItem("roleType") ?? "";
        const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "System").trim() || "System";

        const response = await dispatch(
          drsThunk({
            applicationNo: safeApplicationNumber,
            userId,
            roleType,
            sections: ["quickLinks"],
          }),
        ).unwrap();

        setQuickLinksData(toRecord((response.data as unknown as Record<string, unknown>)?.quickLinks));
      } catch (error) {
        console.error("Failed to load audit trail:", error);
        setQuickLinksData(null);
      } finally {
        setLoading(false);
      }
    };

    void loadAuditTrail();
  }, [dispatch, hasReduxAuditTrail, safeApplicationNumber]);

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
