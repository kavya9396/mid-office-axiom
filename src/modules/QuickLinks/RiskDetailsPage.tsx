import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import BackButton from "../../components/layout/BackButton";
import type { Column } from "../../components/ui/Table/Table";
import CustomTable from "../../components/ui/Table/Table";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath, getSearchApplicationPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { drsThunk } from "../../store/thunks/drsThunk";
import type { RootState } from "../../store/store";
import type { RiskDetails, RiskDetailsRow } from "../../types/drs.types";

const SEARCH_RESULT_STORAGE_KEY = "searchApplicationDrsData";

const riskDetailsColumns: Column<RiskDetailsRow>[] = [
  { key: "riskReferralDate", header: "Risk Referral date", width: "18%" },
  { key: "riskRevertDate", header: "Risk Revert date", width: "18%" },
  { key: "riskDecision", header: "Risk Decision", width: "16%" },
  { key: "riskReportValues", header: "Risk Report values", width: "48%" },
];

interface SelectedCaseContext {
  applicationNo?: string;
  source?: string;
  readOnly?: boolean;
}

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const readSelectedCaseContext = (): SelectedCaseContext => {
  try {
    return JSON.parse(localStorage.getItem("selectedCaseContext") ?? "{}") as SelectedCaseContext;
  } catch {
    return {};
  }
};

const readCachedSearchQuickLinks = (): Record<string, unknown> => {
  try {
    const rawValue = localStorage.getItem(SEARCH_RESULT_STORAGE_KEY);
    if (!rawValue) return {};
    const storedResult = toRecord(JSON.parse(rawValue));
    return toRecord(toRecord(storedResult.data).quickLinks);
  } catch {
    return {};
  }
};

const toDisplay = (value: unknown) => String(value ?? "").trim() || "-";

const normalizeRiskRows = (rows: unknown): RiskDetails => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    const item = toRecord(row);
    return {
      riskReferralDate: toDisplay(item.riskReferralDate),
      riskRevertDate: toDisplay(item.riskRevertDate),
      riskDecision: toDisplay(item.riskDecision),
      riskReportValues: toDisplay(item.riskReportValues),
    };
  });
};

const RiskDetailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);

  const [selectedCaseContext] = useState(readSelectedCaseContext);
  const [cachedSearchQuickLinks] = useState(readCachedSearchQuickLinks);
  const [quickLinksData, setQuickLinksData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationNumber = applicationNumber?.trim() || selectedCaseContext.applicationNo?.trim() || "";
  const isFromSearchApplication = selectedCaseContext.source === "searchApplication" && selectedCaseContext.readOnly === true;

  const reduxQuickLinks = useMemo(
    () => toRecord((drsData as unknown as Record<string, unknown> | null)?.quickLinks),
    [drsData],
  );
  const hasReduxRiskDetails = Array.isArray(reduxQuickLinks.riskDetails);
  const hasCachedSearchRiskDetails = isFromSearchApplication && Array.isArray(cachedSearchQuickLinks.riskDetails);
  const effectiveQuickLinksData = !safeApplicationNumber
    ? null
    : hasReduxRiskDetails
      ? reduxQuickLinks
      : hasCachedSearchRiskDetails
        ? cachedSearchQuickLinks
        : quickLinksData;
  const rows = useMemo<RiskDetails>(
    () => normalizeRiskRows(effectiveQuickLinksData?.riskDetails),
    [effectiveQuickLinksData],
  );

  useEffect(() => {
    if (!safeApplicationNumber || hasReduxRiskDetails || hasCachedSearchRiskDetails) return;

    const loadRiskDetails = async () => {
      try {
        setLoading(true);
        const roleType = localStorage.getItem("roleType") ?? "";
        const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "System").trim() || "System";
        const response = await dispatch(
          drsThunk({ applicationNo: safeApplicationNumber, userId, roleType, sections: ["quickLinks"] }),
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
  }, [dispatch, hasCachedSearchRiskDetails, hasReduxRiskDetails, safeApplicationNumber]);

  const handleBack = () => {
    if (isFromSearchApplication) {
      navigate(getSearchApplicationPath(), {
        state: { restoreSearchResult: true, applicationNo: safeApplicationNumber },
      });
      return;
    }
    navigate(getDRSPath(safeBusinessType, safeApplicationNumber));
  };

  const title = `Risk Details${loading ? " (Loading...)" : ""}`;

  return (
    <Container maxWidth={false} disableGutters>
      <BackButton
        label={isFromSearchApplication ? "Back to Search Application" : "Back to DRS"}
        onClick={handleBack}
      />
      <Box sx={{ mt: 1 }}>
        {rows.length > 0 ? (
          <CustomTable<RiskDetailsRow> title={title} columns={riskDetailsColumns} data={rows} />
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
