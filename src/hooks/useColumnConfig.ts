import {  useState } from "react";
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
    visible: allowed.slice(0, 7),
    hidden: allowed.slice(7),
  };
};

export const useColumnConfig = (userId: string, selectedPool: string) => {
  const [configMap, setConfigMap] = useState(() => loadColumnConfig());

  const key = getConfigKey(userId, selectedPool);

  // current active config
const config: ColumnConfig = (() => {
  const existing = configMap[key];

  if (existing) {
    return existing;
  }

  return getDefaultConfig(selectedPool);
})();



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

  return {
    config,
    updateConfig,
  };
};