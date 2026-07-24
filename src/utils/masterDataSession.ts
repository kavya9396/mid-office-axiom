import type { MastersData } from "../types/drs.types";

const LEGACY_MASTER_DATA_SESSION_KEY = "drsMasterData";
const MASTER_DATA_SESSION_KEY = "drsMasterData:v2";

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
  storage?.removeItem(LEGACY_MASTER_DATA_SESSION_KEY);
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
  const storage = getSessionStorage();
  storage?.removeItem(LEGACY_MASTER_DATA_SESSION_KEY);
  storage?.removeItem(MASTER_DATA_SESSION_KEY);
};

export const hasSessionMasters = (): boolean => {
  const masters = getSessionMasters();
  return Boolean(masters && Object.keys(masters).length > 0);
};