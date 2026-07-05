import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import BackButton from "../../components/layout/BackButton";
import type { Column } from "../../components/ui/Table/Table";
import CustomTable from "../../components/ui/Table/Table";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath } from "../../routes/routes";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { riskDetailsThunk } from "../../store/thunks/riskDetailsThunk";
import type { RiskDetails, RiskDetailsResponse, RiskDetailsRow } from "../../types/drs.types";

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

const extractRiskRows = (response: RiskDetailsResponse): RiskDetails => {
  return normalizeRiskRows(
    response.riskDetails ??
      response.quickLinks?.riskDetails ??
      response.data?.riskDetails ??
      response.data?.quickLinks?.riskDetails,
  );
};

const RiskDetailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessType, applicationNumber } = useAppContext();
  const [rows, setRows] = useState<RiskDetails>([]);
  const [loading, setLoading] = useState(false);

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationNumber = applicationNumber ?? "";

  useEffect(() => {
    const loadRiskDetails = async () => {
      if (!safeApplicationNumber) {
        setRows([]);
        return;
      }

      try {
        setLoading(true);
        const roleType = localStorage.getItem("roleType") ?? "";

        const response = await dispatch(
          riskDetailsThunk({
            applicationId: safeApplicationNumber,
            roleType,
          }),
        ).unwrap();

        setRows(extractRiskRows(response));
      } catch (error) {
        console.error("Failed to load risk details:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void loadRiskDetails();
  }, [dispatch, safeApplicationNumber]);

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
