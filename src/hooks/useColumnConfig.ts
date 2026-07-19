import { useEffect, useMemo, useState } from "react";
import {
  loadColumnConfig,
  saveColumnConfig,
  getConfigKey,
  type ColumnConfig,
} from "../utils/columnStorage";

import { allColumns } from "../store/inbox.columns";
import { apiRequest } from "../services/api";
import { url } from "../services/apiConfig";

const MAX_VISIBLE_COLUMNS = 8;
const allColumnKeys = allColumns.map((column) => String(column.key));
const allColumnKeySet = new Set(allColumnKeys);

type RoleColumnSource = object[];

type ColumnConfigApiRequest = {
  userId: string;
  roleType: string;
  action: "GET" | "SAVE";
  visibleColumns?: string[];
  hiddenColumns?: string[];
  columnSequence?: string[];
};

type ColumnConfigApiResponse = {
  success?: boolean;
  message?: string;
  visibleColumns?: string[];
  hiddenColumns?: string[];
  columnSequence?: string[];
  config?: Partial<ColumnConfig>;
};

const getDefaultConfig = (allowed: string[]): ColumnConfig => {
  return {
    visible: allowed.slice(0, MAX_VISIBLE_COLUMNS),
    hidden: allowed.slice(MAX_VISIBLE_COLUMNS),
  };
};

const getRoleRowsSignature = (roleRows: RoleColumnSource) => {
  return roleRows
    .map((row) => Object.keys(row).filter((key) => allColumnKeySet.has(key)).join(","))
    .join("|");
};

const getRoleAllowedColumns = (roleRowsSignature: string) => {
  const keysFromRoleList = Array.from(
    new Set(roleRowsSignature.split(/[|,]/).filter(Boolean)),
  ).filter((key) => allColumnKeySet.has(key));

  if (keysFromRoleList.length > 0) {
    return keysFromRoleList;
  }

  return allColumnKeys;
};

const normalizeConfig = (
  config: ColumnConfig | undefined,
  allowedColumns: string[],
) => {
  if (!config) {
    return getDefaultConfig(allowedColumns);
  }

  const visible = config.visible
    .filter((key) => allowedColumns.includes(key))
    .slice(0, MAX_VISIBLE_COLUMNS);

  if (visible.length === 0) {
    return getDefaultConfig(allowedColumns);
  }

  const visibleSet = new Set(visible);
  const hidden = [
    ...config.hidden.filter(
      (key) => allowedColumns.includes(key) && !visibleSet.has(key),
    ),
    ...allowedColumns.filter(
      (key) => !visibleSet.has(key) && !config.hidden.includes(key),
    ),
  ];

  return {
    visible,
    hidden,
  };
};

const getApiConfig = (
  response: ColumnConfigApiResponse,
  allowedColumns: string[],
): ColumnConfig | null => {
  const sequence = response.columnSequence ?? response.visibleColumns ?? response.config?.visible;

  if (!sequence?.length) {
    return null;
  }

  const visible = sequence.filter((key) => allowedColumns.includes(key));
  const hiddenFromApi = response.hiddenColumns ?? response.config?.hidden ?? [];
  const visibleSet = new Set(visible);
  const hidden = [
    ...hiddenFromApi.filter(
      (key) => allowedColumns.includes(key) && !visibleSet.has(key),
    ),
    ...allowedColumns.filter(
      (key) => !visibleSet.has(key) && !hiddenFromApi.includes(key),
    ),
  ];

  return {
    visible,
    hidden,
  };
};

export const useColumnConfig = (
  userId: string,
  selectedPool: string,
  roleRows: RoleColumnSource = [],
) => {
  const roleRowsSignature = getRoleRowsSignature(roleRows);
  const allowedColumns = useMemo(
    () => getRoleAllowedColumns(roleRowsSignature),
    [roleRowsSignature],
  );

  const key = getConfigKey(userId, selectedPool);

  const [configMap, setConfigMap] = useState(() => loadColumnConfig());

  const config: ColumnConfig = useMemo(() => {
    return normalizeConfig(configMap[key], allowedColumns);
  }, [allowedColumns, configMap, key]);

  useEffect(() => {
    if (!userId || !selectedPool) {
      return;
    }

    let isMounted = true;

    const loadSavedConfig = async () => {
      try {
        const response = await apiRequest<ColumnConfigApiResponse, ColumnConfigApiRequest>({
          url: url("columnConfigSave"),
          method: "POST",
          body: {
            userId,
            roleType: selectedPool,
            action: "GET",
          },
        });

        const apiConfig = getApiConfig(response, allowedColumns);
        if (!apiConfig || !isMounted) {
          return;
        }

        const normalizedConfig = normalizeConfig(apiConfig, allowedColumns);
        setConfigMap((prev) => {
          const updated = {
            ...prev,
            [key]: normalizedConfig,
          };

          saveColumnConfig(updated);
          return updated;
        });
      } catch {
        // Local storage remains the fallback if the API has no saved sequence yet.
      }
    };

    void loadSavedConfig();

    return () => {
      isMounted = false;
    };
  }, [allowedColumns, key, selectedPool, userId]);

  const updateConfig = async (newConfig: ColumnConfig) => {
    const normalizedConfig = normalizeConfig(newConfig, allowedColumns);

    setConfigMap((prev) => {
      const updated = {
        ...prev,
        [key]: normalizedConfig,
      };

      saveColumnConfig(updated);
      return updated;
    });

    await apiRequest<ColumnConfigApiResponse, ColumnConfigApiRequest>({
      url: url("columnConfigSave"),
      method: "POST",
      body: {
        userId,
        roleType: selectedPool,
        action: "SAVE",
        visibleColumns: normalizedConfig.visible,
        hiddenColumns: normalizedConfig.hidden,
        columnSequence: normalizedConfig.visible,
      },
    });
  };

  return {
    config,
    updateConfig,
    allowedColumns,
    maxVisibleColumns: MAX_VISIBLE_COLUMNS,
  };
};