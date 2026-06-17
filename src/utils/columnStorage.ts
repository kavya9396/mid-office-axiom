const STORAGE_KEY = "column_config_v1";

export type ColumnConfig = {
  visible: string[];
  hidden: string[];
};

type ConfigMap = Record<string, ColumnConfig>;

/**
 * Load all saved configs
 */
export const loadColumnConfig = (): ConfigMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Save entire config map
 */
export const saveColumnConfig = (config: ConfigMap) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

/**
 * Build unique key per user + pool
 */
export const getConfigKey = (userId: string, poolId: string) => {
  return `${userId}:${poolId}`;
};