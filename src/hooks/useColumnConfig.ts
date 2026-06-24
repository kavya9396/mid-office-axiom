import {  useMemo, useState } from "react";
import {
  loadColumnConfig,
  saveColumnConfig,
  getConfigKey,
  type ColumnConfig,
} from "../utils/columnStorage";

import { allColumns } from "../store/inbox.columns";
import { poolAllowedColumns } from "../store/pool.columns.config";

const getDefaultConfig = (pool: string): ColumnConfig => {
  const allowed = poolAllowedColumns[pool] ?? allColumns.map((c) => c.key);
  return {
    visible: allowed.slice(0, 8),
    hidden: allowed.slice(8),
  };
};

export const useColumnConfig = (userId: string, selectedPool: string) => {

  const key = getConfigKey(userId, selectedPool);

const [configMap, setConfigMap] = useState(() => {
  const stored = loadColumnConfig();

  const key = getConfigKey(userId, selectedPool);

  if (!stored[key]) {
    stored[key] = getDefaultConfig(selectedPool);
    saveColumnConfig(stored);
  }

  return stored;
});
  // ✅ always derive current config
  const config: ColumnConfig = useMemo(() => {
    return configMap[key] ?? getDefaultConfig(selectedPool);
  }, [configMap, key, selectedPool]);

  // ✅ update config safely
  const updateConfig = (newConfig: ColumnConfig) => {
    setConfigMap((prev) => {
      const updated = {
        ...prev,
        [key]: newConfig,
      };

      saveColumnConfig(updated);
      return updated;
    });
  };

  return { config, updateConfig };
};