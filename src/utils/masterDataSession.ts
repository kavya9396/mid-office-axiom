import type { MastersData } from "../types/drs.types";

const LEGACY_MASTER_DATA_SESSION_KEYS = ["drsMasterData", "drsMasterData:v2"];
const MASTER_DATA_SESSION_KEY = "drsMasterData:v3";

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

  return normalized as MastersData;
};

export const getSessionMasters = (): MastersData | null => {
  const storage = getSessionStorage();
  LEGACY_MASTER_DATA_SESSION_KEYS.forEach((key) => storage?.removeItem(key));
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
  LEGACY_MASTER_DATA_SESSION_KEYS.forEach((key) => storage?.removeItem(key));
  storage?.removeItem(MASTER_DATA_SESSION_KEY);
};

export const hasSessionMasters = (): boolean => {
  const masters = getSessionMasters();
  return Boolean(masters && Object.keys(masters).length > 0);
};