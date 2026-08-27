import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import BackButton from "../../components/layout/BackButton";
import type { Column } from "../../components/ui/Table/Table";
import CustomTable from "../../components/ui/Table/Table";
import { useAppContext } from "../../hooks/useAppContext";
import {
  getDRSPath,
  getSearchApplicationPath,
} from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";
import type { AuditTrail, AuditTrailRow } from "../../types/drs.types";
import { formatDate } from "../../utils/dataFormat";

const SEARCH_RESULT_STORAGE_KEY = "searchApplicationDrsData";

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

interface SelectedCaseContext {
  applicationNo?: string;
  source?: string;
  readOnly?: boolean;
}

interface StoredSearchResult {
  data?: Record<string, unknown>;
}

const toDisplay = (value: unknown): string =>
  String(value ?? "").trim() || "-";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const formatDateTime = (value: unknown): string => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const formattedValue = formatDate(
    value instanceof Date ? value : String(value),
  );

  return formattedValue || "-";
};

const readSelectedCaseContext = (): SelectedCaseContext => {
  try {
    return JSON.parse(
      localStorage.getItem("selectedCaseContext") ?? "{}",
    ) as SelectedCaseContext;
  } catch {
    return {};
  }
};

const readCachedSearchQuickLinks = (): Record<string, unknown> => {
  try {
    const rawValue = localStorage.getItem(SEARCH_RESULT_STORAGE_KEY);
    if (!rawValue) return {};

    const storedResult = JSON.parse(rawValue) as StoredSearchResult;
    return toRecord(storedResult.data?.quickLinks);
  } catch {
    return {};
  }
};

const normalizeAuditTrailRows = (rows: unknown): AuditTrail => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    const item = toRecord(row);

    return {
      dateTime: formatDateTime(item.dateTime),
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

const AuditTrailPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);

  const [selectedCaseContext] = useState(readSelectedCaseContext);
  const [cachedSearchQuickLinks] = useState(readCachedSearchQuickLinks);
  const [quickLinksData, setQuickLinksData] =
    useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationNumber =
    applicationNumber?.trim() ||
    selectedCaseContext.applicationNo?.trim() ||
    "";
  const isFromSearchApplication =
    selectedCaseContext.source === "searchApplication" &&
    selectedCaseContext.readOnly === true;

  const reduxQuickLinks = useMemo(
    () =>
      toRecord(
        (drsData as unknown as Record<string, unknown> | null)?.quickLinks,
      ),
    [drsData],
  );

  const hasReduxAuditTrail = Array.isArray(reduxQuickLinks.auditTrail);
  const hasCachedSearchAuditTrail =
    isFromSearchApplication &&
    Array.isArray(cachedSearchQuickLinks.auditTrail);

  const effectiveQuickLinksData = !safeApplicationNumber
    ? null
    : hasReduxAuditTrail
      ? reduxQuickLinks
      : hasCachedSearchAuditTrail
        ? cachedSearchQuickLinks
        : quickLinksData;

  const rows = useMemo<AuditTrail>(
    () => normalizeAuditTrailRows(effectiveQuickLinksData?.auditTrail),
    [effectiveQuickLinksData],
  );

  useEffect(() => {
    if (
      !safeApplicationNumber ||
      hasReduxAuditTrail ||
      hasCachedSearchAuditTrail
    ) {
      return;
    }

    const loadAuditTrail = async () => {
      try {
        setLoading(true);

        const roleType = localStorage.getItem("roleType") ?? "";
        const userId =
          (
            localStorage.getItem("userId") ??
            localStorage.getItem("username") ??
            "System"
          ).trim() || "System";

        const response = await dispatch(
          drsThunk({
            applicationNo: safeApplicationNumber,
            userId,
            roleType,
            sections: ["quickLinks"],
          }),
        ).unwrap();

        setQuickLinksData(
          toRecord(
            (response.data as unknown as Record<string, unknown>)?.quickLinks,
          ),
        );
      } catch (error) {
        console.error("Failed to load audit trail:", error);
        setQuickLinksData(null);
      } finally {
        setLoading(false);
      }
    };

    void loadAuditTrail();
  }, [
    dispatch,
    hasCachedSearchAuditTrail,
    hasReduxAuditTrail,
    safeApplicationNumber,
  ]);

  const handleBack = () => {
    if (isFromSearchApplication) {
      navigate(getSearchApplicationPath(), {
        state: {
          restoreSearchResult: true,
          applicationNo: safeApplicationNumber,
        },
      });
      return;
    }

    navigate(getDRSPath(safeBusinessType, safeApplicationNumber));
  };

  const title = `Audit Trail${loading ? " (Loading...)" : ""}`;

  return (
    <Container maxWidth={false} disableGutters>
      <BackButton
        label={
          isFromSearchApplication
            ? "Back to Search Application"
            : "Back to DRS"
        }
        onClick={handleBack}
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
            {loading
              ? "Loading audit trail..."
              : "No audit trail records found"}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default AuditTrailPage;
