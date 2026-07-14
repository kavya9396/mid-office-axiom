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
import type { RiskDetails, RiskDetailsRow } from "../../types/drs.types";

const riskDetailsColumns: Column<RiskDetailsRow>[] = [
  { key: "riskReferralDate", header: "Risk Referral date", width: "18%" },
  { key: "riskRevertDate", header: "Risk Revert date", width: "18%" },
  { key: "riskDecision", header: "Risk Decision", width: "16%" },
  { key: "riskReportValues", header: "Risk Report values", width: "48%" },
];

const toDisplay = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const normalizeRiskRows = (rows: unknown): RiskDetails => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => {
    const item = row as Record<string, unknown>;

    return {
      riskReferralDate: toDisplay(item.riskReferralDate),
      riskRevertDate: toDisplay(item.riskRevertDate),
      riskDecision: toDisplay(item.riskDecision),
      riskReportValues: toDisplay(item.riskReportValues),
    };
  });
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const RiskDetailsPage = () => {
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
  const hasReduxRiskDetails = Array.isArray(reduxQuickLinks.riskDetails);
  const effectiveQuickLinksData = !safeApplicationNumber
    ? null
    : hasReduxRiskDetails
      ? reduxQuickLinks
      : quickLinksData;
  const rows = useMemo<RiskDetails>(
    () => normalizeRiskRows(effectiveQuickLinksData?.riskDetails),
    [effectiveQuickLinksData],
  );

  useEffect(() => {
    const loadRiskDetails = async () => {
      if (!safeApplicationNumber || hasReduxRiskDetails) {
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
        console.error("Failed to load risk details:", error);
        setQuickLinksData(null);
      } finally {
        setLoading(false);
      }
    };

    void loadRiskDetails();
  }, [dispatch, hasReduxRiskDetails, safeApplicationNumber]);

  const title = useMemo(
    () => `Risk Details${loading ? " (Loading...)" : ""}`,
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
          <CustomTable<RiskDetailsRow>
            title={title}
            columns={riskDetailsColumns}
            data={rows}
          />
        ) : (
          <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
            {loading ? "Loading risk details..." : "No risk detail records found"}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default RiskDetailsPage;
