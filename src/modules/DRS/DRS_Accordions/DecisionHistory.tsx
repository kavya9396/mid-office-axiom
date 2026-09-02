import { Box } from "@mui/material";
import { useMemo } from "react";
import { useSelector } from "react-redux";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable from "../../../components/ui/Table/Table";
import type { Column } from "../../../components/ui/Table/Table";
import type { RootState } from "../../../store/store";
import { formatDateForUI } from "../../../utils/helpers";

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

interface DecisionHistoryProps {
  embedded?: boolean;
}

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

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toText = (value: unknown, fallback = "-"): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
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
  const valueText = String(value ?? "").toUpperCase();
  if (valueText.includes("HO CMO") || valueText.includes("HOCMO")) return "hoCmo";
  if (valueText.includes("HOD") || valueText.includes("HO D")) return "hod";
  if (["SR UW", "SR.UW", "SR_UW", "SRUW", "SENIOR UW"].some((item) => valueText.includes(item))) {
    return "srUw";
  }
  if (["UW", "CUW", "UNDERWRITER"].some((item) => valueText.includes(item))) return "uw";
  return undefined;
};

const parseDateTime = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDateTime = (value: unknown): string => {
  const valueText = toText(value);
  if (valueText === "-") return valueText;
  const parsed = Date.parse(valueText);
  return Number.isNaN(parsed) ? valueText : formatDateForUI(new Date(parsed));
};

const mapHistoryRecord = (
  record: Record<string, unknown>,
  forcedStage?: DecisionStage,
): DecisionHistoryRow => {
  const decisionRaw = pickValue(record, ["decision", "uwDecision", "caseUWDecision", "action"]);
  const toRoleRaw = pickValue(record, ["toRole", "toPool", "referredTo", "targetRole"]);
  const fromRoleRaw = pickValue(record, ["fromRole", "fromPool", "sourceRole"]);
  const decisionByRaw = pickValue(record, ["decisionBy", "fromPoolUser", "updatedBy", "userId"]);
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
    dateTime: formatDateTime(pickValue(record, ["dateTime", "timestamp", "decisionDate", "createdAt", "updatedAt"])),
    fromRole,
    toRole: toText(toRoleRaw),
    decision: toText(decisionRaw),
    decisionCode: toText(pickValue(record, ["decisionCode", "code", "decisionCd"])),
    decisionBy: fromRole !== "-" ? fromRole : decisionBy !== "-" ? decisionBy : stageDisplayLabel[stage],
    remarks: toText(pickValue(record, ["remarks", "userRemarks", "uwDecisionRemarks", "comment", "notes"])),
  };
};

const toRows = (value: unknown, forcedStage?: DecisionStage): DecisionHistoryRow[] =>
  Array.isArray(value)
    ? value
        .map(toRecord)
        .filter((item): item is Record<string, unknown> => Boolean(item))
        .map((record) => mapHistoryRecord(record, forcedStage))
        .filter((row) => row.decision !== "-" || row.remarks !== "-")
    : [];

const DecisionHistory = ({ embedded = false }: DecisionHistoryProps) => {
  const historyRows = useSelector((state: RootState) => {
    const drsData = state.drs.data as unknown as Record<string, unknown> | null;
    if (!drsData) return [] as DecisionHistoryRow[];

    const historyRoot = drsData.decisionHistory;
    if (Array.isArray(historyRoot)) {
      const rows = toRows(historyRoot);
      if (rows.length) return rows;
    }

    const historyRecord = toRecord(historyRoot);
    if (historyRecord) {
      const rows = Object.entries(historyRecord).flatMap(([key, value]) =>
        toRows(value, detectStage(key)),
      );
      if (rows.length) return rows;
    }

    const quickLinks = toRecord(drsData.quickLinks);
    return toRows(quickLinks?.auditTrail ?? drsData.auditTrail);
  });

  const sortedRows = useMemo(
    () => [...historyRows].sort((left, right) => parseDateTime(right.dateTime) - parseDateTime(left.dateTime)),
    [historyRows],
  );

  const content = (
    <Box sx={{ width: "100%", minWidth: 0, overflowX: "auto", p: embedded ? 0 : 1 }}>
      {sortedRows.length ? (
        <CustomTable<DecisionHistoryRow>
          title="Decision History Table"
          columns={decisionHistoryColumns}
          data={sortedRows}
        />
      ) : (
        <Box sx={{ border: "1px dashed #d9d9d9", borderRadius: "12px", p: 2, textAlign: "center", color: "#6F6F6F", fontSize: "13px" }}>
          No decision records available.
        </Box>
      )}
    </Box>
  );

  if (embedded) return content;

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion title="Decision History" defaultExpanded={false}>
        {content}
      </CustomAccordion>
    </Box>
  );
};

export default DecisionHistory;
