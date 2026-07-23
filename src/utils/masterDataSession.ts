import type { MastersData } from "../types/drs.types";

const MASTER_DATA_SESSION_KEY = "drsMasterData";

const getSessionStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
};

const getMasterSource = (masters: unknown): Record<string, unknown> => {
  if (!masters || typeof masters !== "object") {
    return {};
  }

  const masterRecord = masters as Record<string, unknown>;
  const data = masterRecord.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }

  return masterRecord;
};

const firstAvailable = (source: Record<string, unknown>, keys: string[]) =>
  keys.map((key) => source[key]).find((value) => value != null);

const toText = (value: unknown): string => String(value ?? "").trim();

const toRequirementManagementRows = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const row = item as Record<string, unknown>;
      const team = toText(row.team) || toText(row.raisingAuthority) || "UW";
      const normalizedTeam = team.toLowerCase().includes("ops") ? "Gops" : "UW";

      return {
        team: normalizedTeam,
        specialTest: toText(row.specialTest ?? row.special),
        profile: toText(row.profile),
        category: toText(row.category ?? row.requirementCategory),
        subCategory: toText(row.subCategory ?? row.requirementSubCategory),
        document: toText(row.document ?? row.description),
        reason: toText(row.reason ?? row.requirementType),
        fupCode: toText(row.fupCode ?? row.code),
        description: toText(row.description),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row?.category || row?.subCategory || row?.document));
};

export const normalizeMastersData = (masters: unknown): MastersData => {
  const source = getMasterSource(masters);
  const normalized: Record<string, unknown> = { ...source };

  const aliases: Record<string, string[]> = {
    maritalStatus: ["maritalStatus", "marital_status"],
    idProof: ["idProof", "id_proof_type"],
    addressProof: ["addressProof", "address_proof_type", "id_proof_type"],
    caseUWDecision: ["caseUWDecision", "policy_decision", "uw_decision"],
    firstUWDecision: ["firstUWDecision", "policy_decision", "uw_decision"],
    parallelUWDecision: ["parallelUWDecision", "policy_decision", "uw_decision"],
    reconsiderationDecision: ["reconsiderationDecision", "policy_decision", "uw_decision"],
    cvtDecision: ["cvtDecision", "policy_decision", "uw_decision"],
    dvtDecision: ["dvtDecision", "policy_decision", "uw_decision"],
    riskDecision: ["riskDecision", "policy_decision", "uw_decision"],
    exceptionDecision: ["exceptionDecision", "policy_decision", "uw_decision"],
    srUwDecision: ["srUwDecision", "policy_decision", "uw_decision"],
    hodDecision: ["hodDecision", "policy_decision", "uw_decision"],
    hoCmoDecision: ["hoCmoDecision", "policy_decision", "uw_decision"],
    reinsurerDecision: ["reinsurerDecision", "policy_decision", "uw_decision"],
    pivvDecision: ["pivvDecision", "policy_decision", "uw_decision"],
  };

  Object.entries(aliases).forEach(([targetKey, sourceKeys]) => {
    if (normalized[targetKey] == null) {
      const value = firstAvailable(source, sourceKeys);
      if (value != null) {
        normalized[targetKey] = value;
      }
    }
  });

  if (normalized.requirementManagement == null) {
    const requirementManagement = toRequirementManagementRows(source.requirement_mst);
    if (requirementManagement.length > 0) {
      normalized.requirementManagement = requirementManagement;
    }
  }

  return normalized as MastersData;
};

export const getSessionMasters = (): MastersData | null => {
  const storage = getSessionStorage();
  const rawMasters = storage?.getItem(MASTER_DATA_SESSION_KEY);

  if (!rawMasters) {
    return null;
  }

  try {
    return normalizeMastersData(JSON.parse(rawMasters));
  } catch {
    storage?.removeItem(MASTER_DATA_SESSION_KEY);
    return null;
  }
};

export const saveSessionMasters = (masters: MastersData) => {
  getSessionStorage()?.setItem(MASTER_DATA_SESSION_KEY, JSON.stringify(normalizeMastersData(masters)));
};

export const clearSessionMasters = () => {
  getSessionStorage()?.removeItem(MASTER_DATA_SESSION_KEY);
};

export const hasSessionMasters = (): boolean => {
  const masters = getSessionMasters();
  return Boolean(masters && Object.keys(masters).length > 0);
};