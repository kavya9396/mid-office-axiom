import { Box, Container } from "@mui/material";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { Column } from "../../../components/ui/Table/Table";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable from "../../../components/ui/Table/Table";
import type { RootState } from "../../../store/store";

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

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const toText = (value: unknown, fallback = "-"): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? fallback : trimmed;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const pickValue = (record: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") {
      return record[key];
    }
  }

  return undefined;
};

const detectStage = (value: unknown): DecisionStage | undefined => {
  const text = String(value ?? "").toUpperCase();

  if (text.includes("HO CMO") || text.includes("HOCMO")) {
    return "hoCmo";
  }

  if (text.includes("HOD") || text.includes("HO D")) {
    return "hod";
  }

  if (
    text.includes("SR UW") ||
    text.includes("SR.UW") ||
    text.includes("SR_UW") ||
    text.includes("SRUW") ||
    text.includes("SENIOR UW")
  ) {
    return "srUw";
  }

  if (text.includes("UW") || text.includes("CUW") || text.includes("SR UW") || text.includes("UNDERWRITER")) {
    return "uw";
  }

  return undefined;
};

const parseDateTime = (value: string): number => {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
};

const formatDateTime = (value: unknown): string => {
  const text = toText(value, "-");
  if (text === "-") return text;

  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) {
    return text;
  }

  return new Date(parsed).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapHistoryRecord = (
  record: Record<string, unknown>,
  forcedStage?: DecisionStage,
): DecisionHistoryRow => {
  const decisionRaw = pickValue(record, ["decision", "uwDecision", "caseUWDecision", "action"]);
  const toRoleRaw = pickValue(record, ["toRole", "toPool", "referredTo", "targetRole"]);
  const fromRoleRaw = pickValue(record, ["fromRole", "fromPool", "sourceRole"]);

  const stage =
    forcedStage ??
    detectStage(pickValue(record, ["stage", "decisionStage"])) ??
    detectStage(pickValue(record, ["decisionBy", "fromPoolUser", "updatedBy", "userId"])) ??
    detectStage(fromRoleRaw) ??
    detectStage(toRoleRaw) ??
    detectStage(decisionRaw) ??
    "uw";

  const decisionByRaw = toText(
    pickValue(record, ["decisionBy", "fromPoolUser", "updatedBy", "userId"]),
  );
  const fromRoleText = toText(fromRoleRaw);
  const resolvedDecisionBy =
    fromRoleText !== "-"
      ? fromRoleText
      : decisionByRaw !== "-"
        ? decisionByRaw
        : stageDisplayLabel[stage];

  return {
    stage,
    dateTime: formatDateTime(pickValue(record, ["dateTime", "timestamp", "decisionDate", "createdAt", "updatedAt"])),
    fromRole: toText(fromRoleRaw),
    toRole: toText(toRoleRaw),
    decision: toText(decisionRaw),
    decisionCode: toText(pickValue(record, ["decisionCode", "code", "decisionCd"])),
    decisionBy: resolvedDecisionBy,
    remarks: toText(pickValue(record, ["remarks", "userRemarks", "uwDecisionRemarks", "comment", "notes"])),
  };
};

const toRows = (value: unknown, forcedStage?: DecisionStage): DecisionHistoryRow[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((record) => mapHistoryRecord(record, forcedStage))
    .filter((row) => row.decision !== "-" || row.remarks !== "-");
};

const DecisionHistory = () => {
  const historyRows = useSelector((state: RootState) => {
    const drsData = state.drs.data as unknown as Record<string, unknown> | null;
    if (!drsData) return [] as DecisionHistoryRow[];

    const historyRoot = drsData.decisionHistory;

    if (Array.isArray(historyRoot)) {
      const rows = toRows(historyRoot);
      if (rows.length > 0) {
        return rows;
      }
    }

    const historyRecord = toRecord(historyRoot);
    if (historyRecord) {
      const objectRows = Object.entries(historyRecord).flatMap(([key, value]) => {
        const stageFromKey = detectStage(key);
        return toRows(value, stageFromKey);
      });

      if (objectRows.length > 0) {
        return objectRows;
      }
    }

    const quickLinks = toRecord(drsData.quickLinks);
    const auditTrail = quickLinks?.auditTrail ?? drsData.auditTrail;

    return toRows(auditTrail);
  });

  const sortedRows = useMemo(() => {
    return [...historyRows].sort(
      (left, right) => parseDateTime(right.dateTime) - parseDateTime(left.dateTime),
    );
  }, [historyRows]);

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Decision History" defaultExpanded={false}>
          <Box sx={{ p: 1 }}>
            {sortedRows.length > 0 ? (
              <CustomTable<DecisionHistoryRow>
                title="Decision History Table"
                columns={decisionHistoryColumns}
                data={sortedRows}
              />
            ) : (
              <Box
                sx={{
                  mt: 2,
                  border: "1px dashed #d9d9d9",
                  borderRadius: "12px",
                  p: 2,
                  textAlign: "center",
                  color: "#6F6F6F",
                  fontSize: "13px",
                }}
              >
                No decision records available.
              </Box>
            )}
          </Box>
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default DecisionHistory;
