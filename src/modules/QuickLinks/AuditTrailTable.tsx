import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import type { Column } from "../../components/ui/Table/Table";
import CustomTable from "../../components/ui/Table/Table";
import { useAppContext } from "../../hooks/useAppContext";
import { useAppDispatch } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";
import { formatDate } from "../../utils/dataFormat";

const SEARCH_RESULT_STORAGE_KEY = "searchApplicationDrsData";

interface AuditTrailRow {
  srNo: string;
  status: string;
  subStatus: string;
  assignedTo: string;
  claimedOn: string;
  completionOn: string;
  createdOn: string;
}

export interface AuditTrailTableProps {
  readOnly?: boolean;
  applicationNumber?: string;
  businessType?: string;
  title?: string;
}

interface SelectedCaseContext {
  applicationNo?: string;
  businessType?: string;
}

interface StoredSearchResult {
  data?: Record<string, unknown>;
}

const auditTrailColumns: Column<AuditTrailRow>[] = [
  { key: "srNo", header: "Sr. No.", width: "7%" },
  { key: "status", header: "Status", width: "14%" },
  { key: "subStatus", header: "Sub Status", width: "14%" },
  { key: "assignedTo", header: "Assigned To", width: "17%" },
  { key: "claimedOn", header: "Claimed On", width: "16%" },
  { key: "completionOn", header: "Completion On", width: "16%" },
  { key: "createdOn", header: "Created On", width: "16%" },
];

const toDisplay = (value: unknown): string =>
  String(value ?? "").trim() || "-";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getQuickLinksData = (source: unknown): Record<string, unknown> => {
  const root = toRecord(source);
  const quickLinks = toRecord(root.quickLinks);

  if (Array.isArray(quickLinks.auditTrail)) {
    return quickLinks;
  }

  if (Array.isArray(root.auditTrail)) {
    return {
      ...quickLinks,
      auditTrail: root.auditTrail,
    };
  }

  return quickLinks;
};

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
    return getQuickLinksData(storedResult.data);
  } catch {
    return {};
  }
};

const normalizeAuditTrailRows = (rows: unknown): AuditTrailRow[] => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    const item = toRecord(row);

    return {
      srNo: String(index + 1),
      status: toDisplay(item.statusValue),
      subStatus: toDisplay(item.status),
      assignedTo: toDisplay(item.assignedTo),
      claimedOn: formatDateTime(item.claimedDate),
      completionOn: formatDateTime(item.completionDate),
      createdOn: formatDateTime(item.createdOn),
    };
  });
};

const AuditTrailTable = ({
  readOnly = false,
  applicationNumber,
  businessType,
  title = "Audit Trail",
}: AuditTrailTableProps) => {
  const dispatch = useAppDispatch();
  const appContext = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);
  const searchApplicationData = useSelector(
    (state: RootState) => state.searchApplication.response?.data,
  );

  const [selectedCaseContext] = useState(readSelectedCaseContext);
  const [cachedSearchQuickLinks] = useState(readCachedSearchQuickLinks);
  const [fetchedQuickLinks, setFetchedQuickLinks] =
    useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const safeApplicationNumber =
    applicationNumber?.trim() ||
    appContext.applicationNumber?.trim() ||
    selectedCaseContext.applicationNo?.trim() ||
    "";

  const safeBusinessType =
    String(
      businessType ??
        appContext.businessType ??
        selectedCaseContext.businessType ??
        localStorage.getItem("businessType") ??
        "retail",
    )
      .trim()
      .toLowerCase() || "retail";

  const reduxQuickLinks = useMemo(
    () => getQuickLinksData(drsData),
    [drsData],
  );

  const searchQuickLinks = useMemo(
    () => getQuickLinksData(searchApplicationData),
    [searchApplicationData],
  );

  const hasReduxAuditTrail = Array.isArray(reduxQuickLinks.auditTrail);
  const hasSearchResponse = searchApplicationData != null;
  const hasSearchAuditTrail = Array.isArray(searchQuickLinks.auditTrail);
  const hasCachedSearchAuditTrail = Array.isArray(
    cachedSearchQuickLinks.auditTrail,
  );

  const effectiveQuickLinksData = readOnly
    ? hasSearchResponse
      ? hasSearchAuditTrail
        ? searchQuickLinks
        : null
      : hasCachedSearchAuditTrail
        ? cachedSearchQuickLinks
        : null
    : !safeApplicationNumber
      ? null
      : hasReduxAuditTrail
        ? reduxQuickLinks
        : fetchedQuickLinks;

  const rows = useMemo<AuditTrailRow[]>(
    () => normalizeAuditTrailRows(effectiveQuickLinksData?.auditTrail),
    [effectiveQuickLinksData],
  );

  useEffect(() => {
    if (readOnly || !safeApplicationNumber || hasReduxAuditTrail) {
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
            businessType: safeBusinessType,
            sections: ["quickLinks"],
          }),
        ).unwrap();

        setFetchedQuickLinks(getQuickLinksData(response.data));
      } catch (error) {
        console.error("Failed to load audit trail:", error);
        setFetchedQuickLinks(null);
      } finally {
        setLoading(false);
      }
    };

    void loadAuditTrail();
  }, [
    dispatch,
    hasReduxAuditTrail,
    readOnly,
    safeApplicationNumber,
    safeBusinessType,
  ]);

  const tableTitle = `${title}${loading ? " (Loading...)" : ""}`;

  return (
    <>
      {rows.length > 0 ? (
        <CustomTable<AuditTrailRow>
          title={tableTitle}
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
    </>
  );
};

export default AuditTrailTable;
