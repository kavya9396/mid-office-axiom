import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import BackButton from "../../components/layout/BackButton";
import CustomTable from "../../components/ui/Table/Table";
import type { Column } from "../../components/ui/Table/Table";
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
import { formatDateForUI } from "../../utils/helpers";

const SEARCH_RESULT_STORAGE_KEY = "searchApplicationDrsData";

type DecisionStage = "hoCmo" | "hod" | "srUw" | "uw";

type DecisionHistoryRow = {
  dateTime: string;
  fromRole: string;
  toRole: string;
  decision: string;
  decisionCode: string;
  decisionBy: string;
  remarks: string;
  stage: DecisionStage;
};

interface SelectedCaseContext {
  applicationNo?: string;
  businessType?: string;
  source?: string;
  readOnly?: boolean;
}

interface StoredSearchResult {
  data?: Record<string, unknown>;
}

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

const decisionHistoryColumns: Column<DecisionHistoryRow>[] = [
  { key: "dateTime", header: "Date", width: "20%" },
  { key: "decision", header: "Decision", width: "20%" },
  { key: "decisionBy", header: "Pool/User", width: "20%" },
  { key: "remarks", header: "Remarks", width: "40%" },
];

const stageDisplayLabel: Record<DecisionStage, string> = {
  hoCmo: "HO CMO",
  hod: "HoD",
  srUw: "Sr UW",
  uw: "UW",
};

const toDisplay = (value: unknown): string =>
  String(value ?? "").trim() || "-";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toOptionalRecord = (
  value: unknown,
): Record<string, unknown> | null => {
  const record = toRecord(value);
  return Object.keys(record).length > 0 ? record : null;
};

const toText = (value: unknown, fallback = "-"): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

const pickValue = (
  record: Record<string, unknown>,
  keys: string[],
): unknown => {
  for (const key of keys) {
    if (
      record[key] !== undefined &&
      record[key] !== null &&
      record[key] !== ""
    ) {
      return record[key];
    }
  }

  return undefined;
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

const formatDecisionDateTime = (value: unknown): string => {
  const valueText = toText(value);
  if (valueText === "-") return valueText;

  const parsed = Date.parse(valueText);
  return Number.isNaN(parsed)
    ? valueText
    : formatDateForUI(new Date(parsed));
};

const detectStage = (value: unknown): DecisionStage | undefined => {
  const valueText = String(value ?? "").toUpperCase();

  if (valueText.includes("HO CMO") || valueText.includes("HOCMO")) {
    return "hoCmo";
  }

  if (valueText.includes("HOD") || valueText.includes("HO D")) {
    return "hod";
  }

  if (
    ["SR UW", "SR.UW", "SR_UW", "SRUW", "SENIOR UW"].some((item) =>
      valueText.includes(item),
    )
  ) {
    return "srUw";
  }

  if (
    ["UW", "CUW", "UNDERWRITER"].some((item) =>
      valueText.includes(item),
    )
  ) {
    return "uw";
  }

  return undefined;
};

const mapDecisionHistoryRecord = (
  record: Record<string, unknown>,
  forcedStage?: DecisionStage,
): DecisionHistoryRow => {
  const decisionRaw = pickValue(record, [
    "decision",
    "uwDecision",
    "caseUWDecision",
    "action",
  ]);
  const toRoleRaw = pickValue(record, [
    "toRole",
    "toPool",
    "referredTo",
    "targetRole",
  ]);
  const fromRoleRaw = pickValue(record, [
    "fromRole",
    "fromPool",
    "sourceRole",
  ]);
  const decisionByRaw = pickValue(record, [
    "decisionBy",
    "fromPoolUser",
    "updatedBy",
    "userId",
  ]);
  const stage =
    forcedStage ??
    detectStage(pickValue(record, ["stage", "decisionStage"])) ??
    detectStage(decisionByRaw) ??
    detectStage(fromRoleRaw) ??
    detectStage(toRoleRaw) ??
    detectStage(decisionRaw) ??
    "uw";
  const fromRole = toText(fromRoleRaw);
  const decisionBy = toText(decisionByRaw);

  return {
    stage,
    dateTime: formatDecisionDateTime(
      pickValue(record, [
        "dateTime",
        "timestamp",
        "decisionDate",
        "createdAt",
        "updatedAt",
      ]),
    ),
    fromRole,
    toRole: toText(toRoleRaw),
    decision: toText(decisionRaw),
    decisionCode: toText(
      pickValue(record, ["decisionCode", "code", "decisionCd"]),
    ),
    decisionBy:
      decisionBy !== "-"
        ? decisionBy
        : fromRole !== "-"
          ? fromRole
          : stageDisplayLabel[stage],
    remarks: toText(
      pickValue(record, [
        "remarks",
        "userRemarks",
        "uwDecisionRemarks",
        "comment",
        "notes",
      ]),
    ),
  };
};

const toDecisionRows = (
  value: unknown,
  forcedStage?: DecisionStage,
): DecisionHistoryRow[] =>
  Array.isArray(value)
    ? value
        .map(toOptionalRecord)
        .filter((item): item is Record<string, unknown> => Boolean(item))
        .map((record) => mapDecisionHistoryRecord(record, forcedStage))
        .filter((row) => row.decision !== "-" || row.remarks !== "-")
    : [];

const normalizeDecisionHistoryRows = (
  source: Record<string, unknown>,
): DecisionHistoryRow[] => {
  const historyRoot = source.decisionHistory;

  if (Array.isArray(historyRoot)) {
    const rows = toDecisionRows(historyRoot);
    if (rows.length > 0) return rows;
  }

  const historyRecord = toOptionalRecord(historyRoot);

  if (historyRecord) {
    const rows = Object.entries(historyRecord).flatMap(([key, value]) =>
      toDecisionRows(value, detectStage(key)),
    );

    if (rows.length > 0) return rows;
  }

  const quickLinks = toRecord(source.quickLinks);
  return toDecisionRows(quickLinks.auditTrail ?? source.auditTrail);
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

const readSelectedCaseContext = (): SelectedCaseContext => {
  try {
    return JSON.parse(
      localStorage.getItem("selectedCaseContext") ?? "{}",
    ) as SelectedCaseContext;
  } catch {
    return {};
  }
};

const readCachedSearchData = (): Record<string, unknown> => {
  try {
    const rawValue = localStorage.getItem(SEARCH_RESULT_STORAGE_KEY);
    if (!rawValue) return {};

    const storedResult = JSON.parse(rawValue) as StoredSearchResult;
    return toRecord(storedResult.data);
  } catch {
    return {};
  }
};

const EmptyTableMessage = ({
  loading,
  message,
}: {
  loading?: boolean;
  message: string;
}) => (
  <Box
    sx={{
      border: "1px dashed #D9D9D9",
      borderRadius: "12px",
      p: 2,
      bgcolor: "#FFFFFF",
      textAlign: "center",
    }}
  >
    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#6F6F6F" }}>
      {loading ? "Loading records..." : message}
    </Typography>
  </Box>
);

const AuditTrailPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);

  const [selectedCaseContext] = useState(readSelectedCaseContext);
  const [cachedSearchData] = useState(readCachedSearchData);
  const [quickLinksData, setQuickLinksData] =
    useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const safeBusinessType =
    String(
      businessType ??
        selectedCaseContext.businessType ??
        localStorage.getItem("businessType") ??
        "retail",
    )
      .trim()
      .toLowerCase() || "retail";

  const safeApplicationNumber =
    applicationNumber?.trim() ||
    selectedCaseContext.applicationNo?.trim() ||
    "";
  const isFromSearchApplication =
    selectedCaseContext.source === "searchApplication" &&
    selectedCaseContext.readOnly === true;

  const drsRecord = useMemo(() => toRecord(drsData), [drsData]);
  const reduxQuickLinks = useMemo(
    () => toRecord(drsRecord.quickLinks),
    [drsRecord],
  );
  const cachedSearchQuickLinks = useMemo(
    () => toRecord(cachedSearchData.quickLinks),
    [cachedSearchData],
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

  const auditTrailRows = useMemo<AuditTrail>(
    () => normalizeAuditTrailRows(effectiveQuickLinksData?.auditTrail),
    [effectiveQuickLinksData],
  );

  const decisionHistorySource = useMemo(() => {
    const baseSource =
      isFromSearchApplication && Object.keys(cachedSearchData).length > 0
        ? cachedSearchData
        : drsRecord;

    return {
      ...baseSource,
      quickLinks: effectiveQuickLinksData ?? toRecord(baseSource.quickLinks),
    };
  }, [
    cachedSearchData,
    drsRecord,
    effectiveQuickLinksData,
    isFromSearchApplication,
  ]);

  const decisionHistoryRows = useMemo(
    () =>
      normalizeDecisionHistoryRows(decisionHistorySource).sort(
        (left, right) =>
          Date.parse(right.dateTime) - Date.parse(left.dateTime),
      ),
    [decisionHistorySource],
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
            businessType: safeBusinessType,
            sections: ["quickLinks", "decisionHistory"],
          }),
        ).unwrap();

        setQuickLinksData(
          toRecord(
            (response.data as unknown as Record<string, unknown>)?.quickLinks,
          ),
        );
      } catch (error) {
        console.error("Failed to load audit trail and decision history:", error);
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
    safeBusinessType,
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

      <Box sx={{ mt: 1, display: "grid", gap: 1.5 }}>
        {auditTrailRows.length > 0 ? (
          <CustomTable<AuditTrailRow>
            title={`Audit Trail${loading ? " (Loading...)" : ""}`}
            columns={auditTrailColumns}
            data={auditTrailRows}
          />
        ) : (
          <EmptyTableMessage
            loading={loading}
            message="No audit trail records found"
          />
        )}

        {decisionHistoryRows.length > 0 ? (
          <CustomTable<DecisionHistoryRow>
            title="Decision History"
            columns={decisionHistoryColumns}
            data={decisionHistoryRows}
          />
        ) : (
          <EmptyTableMessage
            loading={loading}
            message="No decision history records found"
          />
        )}
      </Box>
    </Container>
  );
};

export default AuditTrailPage;
