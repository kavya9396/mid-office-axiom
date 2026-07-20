import type { MastersData } from "../types/drs.types";

const MASTER_DATA_SESSION_KEY = "drsMasterData";

const getSessionStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
};

export const getSessionMasters = (): MastersData | null => {
  const storage = getSessionStorage();
  const rawMasters = storage?.getItem(MASTER_DATA_SESSION_KEY);

  if (!rawMasters) {
    return null;
  }

  try {
    return JSON.parse(rawMasters) as MastersData;
  } catch {
    storage?.removeItem(MASTER_DATA_SESSION_KEY);
    return null;
  }
};

export const saveSessionMasters = (masters: MastersData) => {
  getSessionStorage()?.setItem(MASTER_DATA_SESSION_KEY, JSON.stringify(masters));
};

export const clearSessionMasters = () => {
  getSessionStorage()?.removeItem(MASTER_DATA_SESSION_KEY);
};

export const hasSessionMasters = (): boolean => {
  const masters = getSessionMasters();
  return Boolean(masters && Object.keys(masters).length > 0);
};