import {
  Alert,
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";

import {
  DangerIcon,
  FilterIcon,
  KeyDownArrowIcon,
  KeyLeftArrowIcon,
  KeyRightArrowIcon,
  KeyUpArrowIcon,
  SearchIcon,
  SettingsIcon,
  
} from "../../icons/Icons";
import CustomButton from "../../components/ui/Button/Button";
import CustomCheckbox from "../../components/ui/Checkbox/Checkbox";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import { centerFlex, columnFlex } from "../../utils/styles";
import { useAppDispatch } from "../../store/hooks";
import { columnConfigSaveThunk } from "../../store/thunks/columnConfigSaveThunk";
import { columnConfigFetchThunk } from "../../store/thunks/columnConfigFetchThunk";

interface DynamicRoleTableProps {
  title: string;
  data: Record<string, unknown>[];
  poolKey?: string;

  onApplicationClick?: (
    application: Record<string, unknown>,
  ) => void;

  storageKey?: string;

  showAddButton?: boolean;
}

type SortDirection = "asc" | "desc";

const MAX_VISIBLE_COLUMNS = 9;
const SELECTED_TASK_POOL_KEY = "selectedTaskPoolKey";
const ALL_CASES_POOL_KEY = "ALL_CASES";
const EXCLUDED_COLUMNS = [
  "id",
  "taskId",
  "roleType",
  "instanceId",
  "createdBy",
  "updatedBy",
  "role",
  "businessType",
  "startTime",
  "atRiskTime",
  "poolName",
  "pool_name",
  "poolKey",
];

/* ============================================================
 * COLUMN NAME FORMATTER
 * ============================================================
 */
const getApplicationNumberColumn = (
  columns: string[],
): string | null => {
  return (
    columns.find((column) =>
      isApplicationNumberColumn(column),
    ) ?? null
  );
};

const formatColumnName = (key: string): string => {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const sanitizeFileNamePart = (
  value: string,
): string => {
  return value
    .replace(/[<>:"/\\|?*]+/g, "_")
    .trim() || "Export";
};

const getExportValue = (
  value: unknown,
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};


const downloadRowsAsExcel = ({
  rows,
  columnKeys,
  title,
}: {
  rows: Record<string, unknown>[];
  columnKeys: string[];
  title: string;
}) => {
  const headerCells = columnKeys
    .map(
      (key) =>
        `<th>${escapeHtml(
          formatColumnName(key),
        )}</th>`,
    )
    .join("");

  const bodyRows = rows
    .map((row) => {
      const cells = columnKeys
        .map((key) => {
          const value = getExportValue(
            row[key],
          );

          return `
            <td style="mso-number-format:'\\@';">
              ${escapeHtml(value)}
            </td>
          `;
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  const worksheetName = escapeHtml(
    sanitizeFileNamePart(title).slice(0, 31),
  );

  const workbook = `
    <html
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40"
    >
      <head>
        <meta charset="UTF-8" />

        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>
                  ${worksheetName}
                </x:Name>

                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
      </head>

      <body>
        <table>
          <thead>
            <tr>
              ${headerCells}
            </tr>
          </thead>

          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(
    [workbook],
    {
      type: "application/vnd.ms-excel",
    },
  );

  const objectUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = objectUrl;

  link.download = `${sanitizeFileNamePart(
    title,
  )}_${new Date()
    .toISOString()
    .slice(0, 10)}.xls`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
};


/* ============================================================
 * CELL VALUE FORMATTER
 * ============================================================
 */

const formatCellValue = (
  value: unknown,
): string => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(
      value,
    )
  ) {
    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB");
    }
  }

  return String(value);
};

/* ============================================================
 * APPLICATION NUMBER COLUMN
 * ============================================================
 */

const isApplicationNumberColumn = (
  column: string,
): boolean => {
  const normalizedColumn = column
    .replace(/_/g, "")
    .replace(/\s/g, "")
    .toLowerCase();

  return (
    normalizedColumn === "applicationnumber" ||
    normalizedColumn === "applicationno"
  );
};

/* ============================================================
 * READ SAVED COLUMNS
 * ============================================================
 */

const getSavedColumns = (
  storageKey: string,
  columns: string[],
): string[] => {
  try {
    const saved = localStorage.getItem(
      storageKey,
    );

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (column): column is string =>
          typeof column === "string" &&
          columns.includes(column),
      )
      .slice(0, MAX_VISIBLE_COLUMNS);
  } catch (error) {
    console.error(
      "Unable to load column configuration:",
      error,
    );

    return [];
  }
};


type TimingStatus = "overdue" | "atRisk" | null;

const getRowTimingStatus = (
  row: Record<string, unknown>,
): TimingStatus => {
  const now = Date.now();

  const dueDateValue = row.dueDate ?? row.due_date;
  const atRiskTimeValue =
    row.atRiskTime ?? row.at_risk_time;

  const dueDate = dueDateValue
    ? new Date(String(dueDateValue)).getTime()
    : null;

  const atRiskTime = atRiskTimeValue
    ? new Date(String(atRiskTimeValue)).getTime()
    : null;

  // Due date has highest priority
  if (
    dueDate !== null &&
    !Number.isNaN(dueDate) &&
    now > dueDate
  ) {
    return "overdue";
  }

  // At-risk time
  if (
    atRiskTime !== null &&
    !Number.isNaN(atRiskTime) &&
    now > atRiskTime
  ) {
    return "atRisk";
  }

  return null;
};

const getPriorityRank = (
  row: Record<string, unknown>,
): number => {
  const status = getRowTimingStatus(row);

  if (status === "overdue") return 0;
  if (status === "atRisk") return 1;
  return 2;
};

/* ============================================================
 * COMPONENT
 * ============================================================
 */

const DynamicRoleTable = ({
  title,
  data,
  poolKey,
  onApplicationClick,
  storageKey,
  showAddButton = false,
}: DynamicRoleTableProps) => {
  const dispatch = useAppDispatch();

  const resolvedPoolKey =
    poolKey ?? localStorage.getItem(SELECTED_TASK_POOL_KEY) ?? "";
  const canConfigureColumns =
    Boolean(resolvedPoolKey) && resolvedPoolKey !== ALL_CASES_POOL_KEY;

  const [isSavingColumns, setIsSavingColumns] =
    useState(false);

  /* ============================================================
   * BASIC TABLE STATE
   * ============================================================
   */

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(25);

  const [priorityValidationOpen, setPriorityValidationOpen] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [showSearch, setShowSearch] =
    useState(false);

  /* ============================================================
   * SORTING
   * ============================================================
   */

  const [sortColumn, setSortColumn] =
    useState<string | null>(null);

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  /* ============================================================
   * ALL BACKEND COLUMNS
   * ============================================================
   */

  const columns = useMemo(() => {
    const allColumns = Array.from(
      new Set(data.flatMap((row) => Object.keys(row)))
    );

    return allColumns.filter(
      (column) => !EXCLUDED_COLUMNS.includes(column)
    );
  }, [data]);

  /* ============================================================
   * STORAGE KEY
   * ============================================================
   */

  const finalStorageKey =
    storageKey ||
    `dynamic-role-table-${title
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  /* ============================================================
   * COLUMN CONFIGURATION
   *
   * The server configuration is refreshed whenever the selected
   * task/pool changes.
   * ============================================================
   */

  const [columnConfig, setColumnConfig] =
    useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!canConfigureColumns || columns.length === 0) {
      return;
    }

    const username = localStorage.getItem("username") ?? "";
    if (!username) {
      return;
    }

    let isCurrentRequest = true;

    void dispatch(
      columnConfigFetchThunk({
        username,
        poolKey: resolvedPoolKey,
      }),
    )
      .unwrap()
      .then((response) => {
        if (!isCurrentRequest) return;

        const result = response as {
          availableFields?: string[];
          selectedFields?: string[];
        };
        const fetchedFields =
          result.selectedFields ?? result.availableFields ?? [];
        const fetchedColumns = fetchedFields
          .filter(
            (column) =>
              columns.includes(column) &&
              !EXCLUDED_COLUMNS.includes(column),
          )
          .slice(0, MAX_VISIBLE_COLUMNS);

        if (fetchedColumns.length === 0) return;

        setColumnConfig((previous) => ({
          ...previous,
          [finalStorageKey]: fetchedColumns,
        }));
        localStorage.setItem(
          finalStorageKey,
          JSON.stringify(fetchedColumns),
        );
      })
      .catch((error) => {
        console.error("Unable to fetch column configuration:", error);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [
    canConfigureColumns,
    columns,
    dispatch,
    finalStorageKey,
    resolvedPoolKey,
  ]);

  /**
 * Columns currently checked in the Available Columns list.
 *
 * These columns are only marked for transfer and are not moved
 * immediately when the checkbox is clicked. They are moved from
 * Available to Selected only when the user clicks the right-arrow
 * transfer button.
 */
  const [
    selectedAvailableColumns,
    setSelectedAvailableColumns,
  ] = useState<string[]>([]);

  /**
   * Columns currently checked in the Selected Columns list.
   *
   * These columns are only marked for transfer and are not moved
   * immediately when the checkbox is clicked. They are moved from
   * Selected to Available only when the user clicks the left-arrow
   * transfer button.
   *
   * The Application Number column is excluded from this selection
   * because it must always remain in the Selected Columns list.
   */
  const [
    selectedConfiguredColumns,
    setSelectedConfiguredColumns,
  ] = useState<string[]>([]);

  const selectedColumns = useMemo(() => {
    const applicationColumn =
      getApplicationNumberColumn(columns);

    const configured =
      columnConfig[finalStorageKey];

    const savedColumns = configured
      ? configured
      : getSavedColumns(
        finalStorageKey,
        columns,
      );

    const validSavedColumns = savedColumns.filter(
      (column) => columns.includes(column),
    );

    // No Application Number found in API
    if (!applicationColumn) {
      return (
        validSavedColumns.length > 0
          ? validSavedColumns
          : columns
      ).slice(0, MAX_VISIBLE_COLUMNS);
    }

    // Remove Application Number first
    const otherColumns = validSavedColumns.filter(
      (column) => column !== applicationColumn,
    );

    // If Application Number is already configured,
    // preserve the user's column order.
    const orderedColumns = validSavedColumns.includes(
      applicationColumn,
    )
      ? validSavedColumns
      : [
        applicationColumn,
        ...validSavedColumns,
      ];

    // If there is no saved configuration,
    // Application Number + first 8 columns.
    if (validSavedColumns.length === 0) {
      return [
        applicationColumn,
        ...columns
          .filter(
            (column) =>
              column !== applicationColumn,
          )
          .slice(0, MAX_VISIBLE_COLUMNS - 1),
      ];
    }

    // Ensure Application Number is always present.
    if (orderedColumns.includes(applicationColumn)) {
      return orderedColumns.slice(
        0,
        MAX_VISIBLE_COLUMNS,
      );
    }

    return [
      applicationColumn,
      ...otherColumns,
    ].slice(0, MAX_VISIBLE_COLUMNS);
  }, [
    columnConfig,
    finalStorageKey,
    columns,
  ]);

  const availableColumns = useMemo(() => {
    const applicationColumn =
      getApplicationNumberColumn(columns);

    return columns.filter(
      (column) =>
        column !== applicationColumn &&
        !selectedColumns.includes(column),
    );
  }, [
    columns,
    selectedColumns,
  ]);

  /* ============================================================
   * SETTINGS DIALOG
   * ============================================================
   */

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [
    tempSelectedColumns,
    setTempSelectedColumns,
  ] = useState<string[]>([]);

  const [
    tempAvailableColumns,
    setTempAvailableColumns,
  ] = useState<string[]>([]);

  /* ============================================================
   * SEARCH
   * ============================================================
   */

  const filteredData = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return data;
    }

    return data.filter((row) =>
      columns.some((column) =>
        String(row[column] ?? "")
          .toLowerCase()
          .includes(search),
      ),
    );
  }, [
    data,
    columns,
    searchText,
  ]);

  /* ============================================================
   * SORT
   * ============================================================
   */
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const priorityComparison =
        getPriorityRank(a) - getPriorityRank(b);

      if (priorityComparison !== 0) {
        return priorityComparison;
      }

      // Column sorting applies only inside the same priority group.
      if (!sortColumn) return 0;

      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      const aEmpty =
        aValue === null ||
        aValue === undefined ||
        aValue === "";

      const bEmpty =
        bValue === null ||
        bValue === undefined ||
        bValue === "";

      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;

      let comparison: number;

      const aNumber = Number(aValue);
      const bNumber = Number(bValue);

      if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
        comparison = aNumber - bNumber;
      } else {
        comparison = String(aValue)
          .toLowerCase()
          .localeCompare(
            String(bValue).toLowerCase(),
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            },
          );
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleApplicationClick = (
    row: Record<string, unknown>,
  ) => {
    const highestInboxPriority = data.reduce(
      (highestPriority, inboxRow) =>
        Math.min(highestPriority, getPriorityRank(inboxRow)),
      2,
    );

    if (getPriorityRank(row) > highestInboxPriority) {
      setPriorityValidationOpen(true);
      return;
    }

    onApplicationClick?.(row);
  };

  /* ============================================================
   * PAGINATION
   * ============================================================
   */

  const paginatedData = useMemo(() => {
    const start =
      page * rowsPerPage;

    return sortedData.slice(
      start,
      start + rowsPerPage,
    );
  }, [
    sortedData,
    page,
    rowsPerPage,
  ]);

  /* ============================================================
   * SORT HANDLER
   * ============================================================
   */

  const handleSort = (
    column: string,
  ) => {
    if (sortColumn === column) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc",
      );
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

    setPage(0);
  };

  /* ============================================================
   * OPEN SETTINGS
   * ============================================================
   */

  /**
 * Opens the column configuration dialog.
 *
 * Initializes the temporary Available and Selected column lists
 * using the currently displayed column configuration. Any previous
 * checkbox selections are cleared when the dialog is opened.
 *
 * Checkbox selections are intentionally kept separate from the
 * temporary column lists so that clicking a checkbox only marks a
 * column for transfer. Columns are moved only after the user clicks
 * the corresponding transfer button.
 *
 * @returns {void}
 */
  const handleOpenSettings = () => {
    setTempSelectedColumns([
      ...selectedColumns,
    ]);

    setTempAvailableColumns([
      ...availableColumns,
    ]);

    setSelectedAvailableColumns([]);
    setSelectedConfiguredColumns([]);

    setSettingsOpen(true);
  };

  /**
   * Toggles the transfer-selection state of an Available column.
   *
   * Checking a column marks it for transfer to the Selected Columns
   * list. Unchecking it removes it from the pending transfer selection.
   *
   * The column is not moved immediately. The actual transfer occurs
   * only when the user clicks the right-arrow button.
   *
   * @param {string} column - Column key to toggle.
   * @returns {void}
   */
  const toggleAvailableColumn = (
    column: string,
  ) => {
    setSelectedAvailableColumns(
      (previous) =>
        previous.includes(column)
          ? previous.filter(
            (item) => item !== column,
          )
          : [...previous, column],
    );
  };

  /**
   * Toggles the transfer-selection state of a Selected column.
   *
   * Checking a column marks it for transfer back to the Available
   * Columns list. Unchecking it removes it from the pending transfer
   * selection.
   *
   * The Application Number column is protected and cannot be selected
   * for removal because it must always remain visible in the table.
   *
   * The column is not moved immediately. The actual transfer occurs
   * only when the user clicks the left-arrow button.
   *
   * @param {string} column - Column key to toggle.
   * @returns {void}
   */
  const toggleSelectedColumn = (
    column: string,
  ) => {
    // Application Number cannot be moved out
    if (isApplicationNumberColumn(column)) {
      return;
    }

    setSelectedConfiguredColumns(
      (previous) =>
        previous.includes(column)
          ? previous.filter(
            (item) => item !== column,
          )
          : [...previous, column],
    );
  };

  /* ============================================================
   * CLOSE SETTINGS
   * ============================================================
   */

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  /* ============================================================
   * MOVE ALL -> SELECTED
   * ============================================================
   * Moves the currently checked Available columns to the Selected
   * Columns list.
   *
   * Only columns explicitly checked by the user are transferred.
   * Unchecked Available columns remain untouched.
   *
   * The transfer is limited by MAX_VISIBLE_COLUMNS so that the table
   * never displays more than the configured maximum number of columns.
   *
   * After the transfer is completed, the Available-side checkbox
   * selections are cleared.
   *
   * @returns {void}
   */
  const moveSelectedToSelected = () => {
    const remainingSlots =
      MAX_VISIBLE_COLUMNS -
      tempSelectedColumns.length;

    if (
      remainingSlots <= 0 ||
      selectedAvailableColumns.length === 0
    ) {
      return;
    }

    const columnsToMove =
      selectedAvailableColumns.slice(
        0,
        remainingSlots,
      );

    setTempSelectedColumns(
      (previous) => [
        ...previous,
        ...columnsToMove,
      ],
    );

    setTempAvailableColumns(
      (previous) =>
        previous.filter(
          (column) =>
            !columnsToMove.includes(column),
        ),
    );

    setSelectedAvailableColumns([]);
  };

  /* ============================================================
   * MOVE ALL -> AVAILABLE
   * ============================================================
   */
  /**
   * Moves the currently checked Selected columns back to the Available
   * Columns list.
   *
   * Only columns explicitly checked by the user are transferred.
   * Unchecked Selected columns remain untouched.
   *
   * The Application Number column is always protected and will never
   * be moved to the Available Columns list.
   *
   * After the transfer is completed, the Selected-side checkbox
   * selections are cleared.
   *
   * @returns {void}
   */
  const moveSelectedToAvailable = () => {
    if (
      selectedConfiguredColumns.length === 0
    ) {
      return;
    }

    const columnsToMove =
      selectedConfiguredColumns.filter(
        (column) =>
          !isApplicationNumberColumn(column),
      );

    setTempSelectedColumns(
      (previous) =>
        previous.filter(
          (column) =>
            !columnsToMove.includes(column),
        ),
    );

    setTempAvailableColumns(
      (previous) => [
        ...previous,
        ...columnsToMove.filter(
          (column) =>
            !previous.includes(column),
        ),
      ],
    );

    setSelectedConfiguredColumns([]);
  };

  /* ============================================================
   * MOVE COLUMN UP
   * ============================================================
   */

  const moveColumnUp = (
    index: number,
  ) => {
    if (index === 0) {
      return;
    }

    setTempSelectedColumns(
      (previous) => {
        const updated = [
          ...previous,
        ];

        [
          updated[index - 1],
          updated[index],
        ] = [
            updated[index],
            updated[index - 1],
          ];

        return updated;
      },
    );
  };

  /* ============================================================
   * MOVE COLUMN DOWN
   * ============================================================
   */

  const moveColumnDown = (
    index: number,
  ) => {
    if (
      index ===
      tempSelectedColumns.length - 1
    ) {
      return;
    }

    setTempSelectedColumns(
      (previous) => {
        const updated = [
          ...previous,
        ];

        [
          updated[index],
          updated[index + 1],
        ] = [
            updated[index + 1],
            updated[index],
          ];

        return updated;
      },
    );
  };

  /* ============================================================
   * SAVE SETTINGS
   * ============================================================
   */

  const handleSaveSettings = async () => {
    if (
      tempSelectedColumns.length === 0 ||
      isSavingColumns
    ) {
      return;
    }

    const updatedColumns =
      tempSelectedColumns.slice(
        0,
        MAX_VISIBLE_COLUMNS,
      );

    const username = localStorage.getItem("username") ?? "";

    if (!username || !resolvedPoolKey) {
      console.error(
        "Username or poolKey is unavailable.",
      );
      return;
    }

    const payload = {
      username,
      poolKey: resolvedPoolKey,
      selectedFields: updatedColumns,
    };
console.log('payload',payload)
    try {
      setIsSavingColumns(true);

      await dispatch(
        columnConfigSaveThunk(payload),
      ).unwrap();

      const fetchedConfig = await dispatch(
        columnConfigFetchThunk({
          username,
          poolKey: resolvedPoolKey,
        }),
      ).unwrap();

      const fetchedFields = (
        fetchedConfig as {
          availableFields?: string[];
          selectedFields?: string[];
        }
      ).availableFields ?? [];

      const fetchedColumns = fetchedFields
        .filter(
          (column) =>
            columns.includes(column) &&
            !EXCLUDED_COLUMNS.includes(column),
        )
        .slice(0, MAX_VISIBLE_COLUMNS);

      const refreshedColumns =
        fetchedColumns.length > 0
          ? fetchedColumns
          : updatedColumns;

      setColumnConfig((previous) => ({
        ...previous,
        [finalStorageKey]: refreshedColumns,
      }));

      localStorage.setItem(
        finalStorageKey,
        JSON.stringify(refreshedColumns),
      );

      setSettingsOpen(false);
      setPage(0);
    } catch (error) {
      console.error(
        "Unable to save column configuration:",
        error,
      );
    } finally {
      setIsSavingColumns(false);
    }
  };

  /* ============================================================
   * RESET SETTINGS
   * ============================================================
   */

  const handleResetColumns = () => {
    const defaultSelected =
      columns.slice(
        0,
        MAX_VISIBLE_COLUMNS,
      );

    const defaultAvailable =
      columns.slice(
        MAX_VISIBLE_COLUMNS,
      );

    setTempSelectedColumns(
      defaultSelected,
    );

    setTempAvailableColumns(
      defaultAvailable,
    );
  };


  const handleDownloadExcel = () => {
    if (
      !sortedData.length ||
      !columns.length
    ) {
      return;
    }

    downloadRowsAsExcel({
      rows: sortedData,
      // Export every available backend column, not only the columns
      // currently selected and visible in the table.
      columnKeys: columns,
      title,
    });
  };


  /* ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/* <Paper
        elevation={0}
        sx={{
          mt: 0,
          width: "100%",
          height: "calc(100dvh - 64px)",
          maxHeight: "calc(100dvh - 64px)",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          border:
            "1px solid #d9dfe4",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04)",
          boxSizing: "border-box",
        }}
      > */}
      <Box
        sx={{
          ...columnFlex,
          margin: 2,
          maxHeight: "calc(100vh - 100px)",
          boxShadow: 5,
          borderRadius: "10px"
        }}
      >
        {/* ======================================================
            TITLE HEADER
            ======================================================
        */}

        <Box
          sx={{
            height: "38px",
            minHeight: "38px",
            flexShrink: 0,
            px: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            backgroundColor:
              "#E45F14",
            color: "#fff",
            boxSizing: "border-box",
            borderRadius: "10px 10px 0 0",
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          {showAddButton && (
            <CustomButton
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "white",
                color: "#063E6F",
                fontSize: "10px",
                "&:hover": {
                  backgroundColor:
                    "white",
                },
              }}
            >
              Add
            </CustomButton>
          )}
        </Box>

        {/* ======================================================
            TOOLBAR
            ======================================================
        */}

        <Box
          sx={{
            height: "36px",
            minHeight: "36px",
            flexShrink: 0,
            px: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#fff",
            borderBottom: "1px solid #e3e6e8",
            boxSizing: "border-box",
          }}
        >
          {/* ======================================================
              DOWNLOAD EXCEL
              ======================================================
          */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minWidth: 0,
            }}
          >
            <CustomButton
              size="small"
              variant="outlined"
              onClick={
                handleDownloadExcel
              }
              sx={{
                fontSize: "10px",
                flexShrink: 0,
              }}
            >
              Download Excel
            </CustomButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                whiteSpace: "nowrap",
              }}
            >
              {[
                {
                  label: "High Priority",
                  color: "#D32F2F",
                },
                {
                  label: "At Risk",
                  color: "#C05600",
                },
                {
                  label: "Normal",
                  color: "#155a87",
                },
              ].map((indicator) => (
                <Box
                  key={indicator.label}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: indicator.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "10px",
                      lineHeight: 1,
                      color: "#4b5055",
                    }}
                  >
                    {indicator.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ======================================================
              RIGHT SIDE TOOLBAR
              ======================================================
          */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {showSearch && (
              <TextField
                size="small"
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setPage(0);
                }}
                placeholder="Search..."
                autoFocus
                sx={{
                  width: "200px",

                  "& .MuiInputBase-root": {
                    height: "28px",
                    fontSize: "11px",
                    borderRadius: "5px",
                  },

                  "& .MuiOutlinedInput-input": {
                    padding: "5px 8px",
                  },
                }}
              />
            )}

            {/* <IconButton
              size="small"
              onClick={() =>
                setShowSearch((previous) => !previous)
              }
              sx={{
                width: "30px",
                height: "28px",
                border: "1px solid #dfe3e6",
                borderRadius: "5px",
                color: "#454b50",

                "&:hover": {
                  backgroundColor: "#f4f6f7",
                },
              }}
            >
            </IconButton> */}
            <Box sx={{ cursor: "pointer", mt: 0.5 }} onClick={() =>
              setShowSearch((previous) => !previous)
            }>
              <SearchIcon width={32} height={32} />
            </Box>
            <Box sx={{ cursor: "pointer", mt: 0.5 }}>
              <FilterIcon width={32} />
            </Box>

            {canConfigureColumns && (
              <Box sx={{ cursor: "pointer", mt: 0.5 }} onClick={handleOpenSettings}>
                <SettingsIcon width={32} />
              </Box>
            )}

            {/* <IconButton
              size="small"
              sx={{
                width: "30px",
                height: "28px",
                border: "1px solid #dfe3e6",
                borderRadius: "5px",
                color: "#454b50",

                "&:hover": {
                  backgroundColor: "#f4f6f7",
                },
              }}
            >
              <FilterIcon />
            </IconButton> */}

            {/* <IconButton
              size="small"
              onClick={handleOpenSettings}
              sx={{
                width: "30px",
                height: "28px",
                border: "1px solid #dfe3e6",
                borderRadius: "5px",
                color: "#454b50",

                "&:hover": {
                  backgroundColor: "#f4f6f7",
                },
              }}
            >
              <SettingsIcon />
            </IconButton> */}
          </Box>
        </Box>

        {/* ======================================================
            TABLE
            ======================================================
        */}

        <TableContainer
          sx={{
            width: "100%",
            flex: 1,
            height: "calc(100vh - 180px)",
            // minHeight: 0,
            // maxHeight: "none",
            // overflowX: "auto",
            // overflowY: "auto",
            boxSizing: "border-box",

            "&::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c7cdd3",
              borderRadius: "10px",
            },

            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f7f8f9",
            },
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              width: "100%",
              tableLayout: "fixed",

              "& .MuiTableCell-root": {
                boxSizing:
                  "border-box",
              },
            }}
          >
            {/* ==================================================
                TABLE HEADER
                ==================================================
            */}

            <TableHead>
              <TableRow>
                {selectedColumns.map((column) => {
                  const isSorted = sortColumn === column;

                  return (
                    <TableCell
                      key={column}
                      onClick={() => handleSort(column)}
                      sx={{
                        height: "30px",
                        // Application-number rows reserve 14px for the
                        // warning icon plus a 4px gap. Offset this header by
                        // the same 18px so it starts above the number text,
                        // not above the icon slot.
                        padding: isApplicationNumberColumn(column)
                          ? "0 10px 0 28px"
                          : "0 10px",
                        backgroundColor: "#eef1f4",
                        color: "#20252a",
                        fontSize: "11px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        borderBottom: "1px solid #d9dde1",
                        cursor: "pointer",
                        userSelect: "none",

                        "&:hover": {
                          backgroundColor: "#e7ebee",
                        },
                      }}
                    >
                      <Tooltip
  title={formatColumnName(column)}
  placement="top"
  arrow
  enterDelay={300}
>
  <TableSortLabel
    active={isSorted}
    direction={isSorted ? sortDirection : "asc"}
    hideSortIcon={false}
    sx={{
      maxWidth: "100%",
      minWidth: 0,
      color: "#20252a",

      "&:hover": {
        color: "#20252a",
      },

      "&.Mui-active": {
        color: "#0D4C7D",
      },

      "& .MuiTableSortLabel-icon": {
        width: "14px",
        height: "14px",
        marginLeft: "3px",
        color: "#8a8f94 !important",
        opacity: 0.65,
        flexShrink: 0,
      },

      "&.Mui-active .MuiTableSortLabel-icon": {
        color: "#0D4C7D !important",
        opacity: 1,
      },
    }}
  >
    <Typography
      component="span"
      sx={{
        minWidth: 0,
        fontSize: "11px",
        fontWeight: 600,
        lineHeight: 1.2,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {formatColumnName(column)}
    </Typography>
  </TableSortLabel>
</Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            {/* ==================================================
                TABLE BODY
                ==================================================
            */}

            <TableBody>
              {paginatedData.length >
                0 ? (
                paginatedData.map(
                  (
                    row,
                    rowIndex,
                  ) => (
                    <TableRow
                      key={`${String(
                        row.id ?? "row",
                      )}-${rowIndex}`}
                      hover
                      sx={{
                        height: "30px",

                        "&:nth-of-type(even)": {
                          backgroundColor: "#fafafa",
                        },

                        "&:hover": {
                          backgroundColor: "#f3f7fa",
                        },

                        "&:last-child td": {
                          borderBottom: 0,
                        },
                      }}
                    >

                      {selectedColumns.map(
                        (
                          column,
                        ) => {
                          const isApplicationNumber =
                            isApplicationNumberColumn(
                              column,
                            );

                          const timingStatus =
                            getRowTimingStatus(row);

                          const hasTimingWarning =
                            timingStatus !== null;

                          const timingWarningColor =
                            timingStatus === "overdue"
                              ? "#D32F2F"
                              : timingStatus === "atRisk"
                                ? "#C05600"
                                : "#155a87";

                          const cellValue =
                            formatCellValue(
                              row[
                              column
                              ],
                            );

                          return (
                            <TableCell
                              key={
                                column
                              }
                              title={
                                cellValue
                              }
                              sx={{
                                height:
                                  "30px",
                                padding:
                                  "0 10px",
                                fontSize:
                                  "11px",
                                lineHeight:
                                  1.1,
                                color:
                                  isApplicationNumber
                                    ? hasTimingWarning
                                      ? timingWarningColor
                                      : "#155a87"
                                    : "#4b5055",
                                whiteSpace:
                                  "nowrap",
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                borderBottom:
                                  "1px solid #eeeeee",
                              }}
                            >
                              {isApplicationNumber ? (
                                <Box
                                  component="span"
                                  onClick={() => handleApplicationClick(row)}
                                  sx={{
                                    cursor:
                                      "pointer",
                                    display:
                                      "inline-flex",
                                    alignItems:
                                      "center",
                                    gap: "4px",
                                    color:
                                      hasTimingWarning
                                        ? timingWarningColor
                                        : "#155a87",
                                    fontWeight:
                                      500,
                                    textDecoration:
                                      "underline",
                                    textUnderlineOffset:
                                      "2px",

                                    "&:hover":
                                    {
                                      color:
                                        hasTimingWarning
                                          ? timingWarningColor
                                          : "#9A2529",
                                    },
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      width: "14px",
                                      height: "14px",
                                      flexShrink: 0,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {hasTimingWarning && (
                                      <DangerIcon
                                        aria-label={
                                          timingStatus === "overdue"
                                            ? "Due date crossed"
                                            : "At-risk time crossed"
                                        }
                                        titleAccess={
                                          timingStatus === "overdue"
                                            ? "Due date crossed"
                                            : "At-risk time crossed"
                                        }
                                        sx={{
                                          width: "14px",
                                          height: "14px",
                                          color: timingWarningColor,
                                        }}
                                      />
                                    )}
                                  </Box>
                                  {
                                    cellValue
                                  }
                                </Box>
                              ) : (
                                cellValue
                              )}
                            </TableCell>
                          );
                        },
                      )}
                    </TableRow>
                  ),
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      selectedColumns.length ||
                      1
                    }
                    align="center"
                    sx={{
                      height:
                        "80px",
                      color:
                        "#8a8f94",
                      fontSize:
                        "11px",
                      borderBottom: 0,
                    }}
                  >
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ======================================================
            PAGINATION
            ======================================================
        */}

        <TablePagination
          component="div"
          count={
            sortedData.length
          }
          page={page}
          onPageChange={(
            _event,
            newPage,
          ) => {
            setPage(newPage);
          }}
          rowsPerPage={
            rowsPerPage
          }
          onRowsPerPageChange={(
            event,
          ) => {
            setRowsPerPage(
              parseInt(
                event.target.value,
                10,
              ),
            );
            setPage(0);
          }}
          rowsPerPageOptions={[
            10,
            25,
            50,
            100,
          ]}
          labelRowsPerPage="Show"
          sx={{
            minHeight: "34px",
            height: "34px",
            maxHeight: "34px",
            flexShrink: 0,
            overflow: "hidden",
            boxSizing: "border-box",
            backgroundColor: "#fff",
            borderTop:
              "1px solid #e3e6e8",
            borderRadius: "0 0 10px 10px",


            "& .MuiTablePagination-toolbar":
            {
              minHeight:
                "34px",
              height:
                "34px",
              padding:
                "0 8px 0 16px",
            },

            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              fontSize:
                "11px",
              color:
                "#555",
            },

            "& .MuiTablePagination-select":
            {
              fontSize:
                "11px",
            },

            "& .MuiTablePagination-actions":
            {
              marginLeft:
                "8px",
            },

            "& .MuiIconButton-root":
            {
              padding:
                "3px",
            },
          }}
        />
      </Box>
      {/* </Paper> */}

      {/* ========================================================
          COLUMN SETTINGS DIALOG
          ========================================================
      */}
      <Snackbar
        open={priorityValidationOpen}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setPriorityValidationOpen(false)}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setPriorityValidationOpen(false)}
        >
          Please complete the priority task first before claiming this task.
        </Alert>
      </Snackbar>

      {canConfigureColumns && <CustomDialog
        open={settingsOpen}
        onClose={handleCloseSettings}
        maxWidth="md"
        fullWidth
        title={
          <Typography
            sx={{
              color: "#9A2529",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase"
            }}
          >
            Configure Columns
          </Typography>
        }
        actionsSx={{ justifyContent: "center", pb: 2 }}
        // contentSx={{
        //   p: 2.5,
        //   backgroundColor: "#f7f8fa",
        // }}
        actions={
          <Box
            sx={{
              ...centerFlex,
              gap: 1,
              width: "100%",
            }}
          >
            <CustomButton
              size="small"
              variant="outlined"
              onClick={handleResetColumns}
              sx={{
                fontSize: "12px",
                borderRadius: "8px",
                px: 2,
              }}
            >
              Reset
            </CustomButton>

            <CustomButton
              size="small"
              variant="contained"
              onClick={handleSaveSettings}
              disabled={
                tempSelectedColumns.length === 0 ||
                isSavingColumns
              }
              sx={{
                fontSize: "12px",
                borderRadius: "8px",
                px: 2,
              }}
            >
              {isSavingColumns ? "Saving..." : "Save"}
            </CustomButton>
          </Box>
        }
      >
        {/* YOUR EXISTING DIALOG CONTENT GOES HERE */}
        <Box
          sx={{
            display: "flex",
            alignItems:
              "center",
            gap: 1.5,
            width: "100%",
            mt: 2
          }}
        >
          {/* AVAILABLE */}

          <Box
            sx={{
              flex: 1,
              backgroundColor:
                "#fff",
              border:
                "1px solid #dfe3e8",
              borderRadius:
                "8px",
              overflow:
                "hidden",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom:
                  "1px solid #e5e7eb",
                backgroundColor:
                  "#f3f5f7",
              }}
            >
              <Typography
                sx={{
                  fontSize:
                    "12px",
                  fontWeight:
                    600,
                  color:
                    "#333",
                }}
              >
                Available Columns
              </Typography>

              <Typography
                sx={{
                  fontSize:
                    "10px",
                  color:
                    "#777",
                  mt: 0.2,
                }}
              >
                {
                  tempAvailableColumns.length
                }{" "}
                columns
              </Typography>
            </Box>

            <List
              dense
              sx={{
                height:
                  "300px",
                overflowY:
                  "auto",
                p: 1,
              }}
            >
              {tempAvailableColumns.map(
                (column) => (
                  <ListItem
                    key={column}
                    disablePadding
                  >
                    <ListItemButton
                      disabled={
                        tempSelectedColumns.length >=
                        MAX_VISIBLE_COLUMNS
                      }
                      sx={{
                        minHeight:
                          "32px",
                        py: 0,
                        px: 1,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth:
                            "30px",
                        }}
                      >

                        <CustomCheckbox
                          edge="start"
                          checked={selectedAvailableColumns.includes(column)}
                          onChange={() => toggleAvailableColumn(column)}
                          onClick={(event) => event.stopPropagation()}
                          tabIndex={-1}
                        />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontSize:
                                "11px",
                              color:
                                "#444",
                            }}
                          >
                            {formatColumnName(
                              column,
                            )}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ),
              )}

              {tempAvailableColumns.length ===
                0 && (
                  <Box
                    sx={{
                      py: 5,
                      textAlign:
                        "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          "11px",
                        color:
                          "#999",
                      }}
                    >
                      No available
                      columns
                    </Typography>
                  </Box>
                )}
            </List>
          </Box>

          {/* TRANSFER BUTTONS */}
          <Box
            sx={{
              display:
                "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
              gap: 1,
            }}
          >
            <CustomButton
              sx={{
                my: 1,
              }}
              variant="outlined"
              size="small"
              onClick={moveSelectedToSelected}
              disabled={
                selectedAvailableColumns.length === 0 ||
                tempSelectedColumns.length >=
                MAX_VISIBLE_COLUMNS
              }
            >
              <KeyRightArrowIcon />
            </CustomButton>

            <CustomButton
              sx={{
                my: 1,
              }}
              variant="outlined"
              size="small"
              onClick={moveSelectedToAvailable}
              disabled={
                selectedConfiguredColumns.length === 0
              }
            >
              <KeyLeftArrowIcon />
            </CustomButton>
          </Box>

          {/* SELECTED */}

          <Box
            sx={{
              flex: 1,
              backgroundColor:
                "#fff",
              border:
                "1px solid #dfe3e8",
              borderRadius:
                "8px",
              overflow:
                "hidden",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom:
                  "1px solid #e5e7eb",
                backgroundColor:
                  "#f3f5f7",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize:
                      "12px",
                    fontWeight:
                      600,
                    color:
                      "#333",
                  }}
                >
                  Selected Columns
                </Typography>

                <Typography
                  sx={{
                    fontSize:
                      "10px",
                    color:
                      tempSelectedColumns.length >=
                        MAX_VISIBLE_COLUMNS
                        ? "#9A2529"
                        : "#777",
                    mt: 0.2,
                  }}
                >
                  {
                    tempSelectedColumns.length
                  }{" "}
                  /{" "}
                  {
                    MAX_VISIBLE_COLUMNS
                  }
                </Typography>
              </Box>
            </Box>

            <List
              dense
              sx={{
                height:
                  "300px",
                overflowY:
                  "auto",
                p: 1,
              }}
            >
              {tempSelectedColumns.map(
                (
                  column,
                  index,
                ) => (
                  <ListItem
                    key={column}
                    disablePadding
                  >
                    <ListItemButton
                      sx={{
                        minHeight: "32px",
                        py: 0,
                        px: 1,
                        pr: 0.5,
                        cursor: isApplicationNumberColumn(column)
                          ? "default"
                          : "pointer",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth:
                            "30px",
                        }}
                      >
                        <CustomCheckbox
                          edge="start"
                          checked={
                            isApplicationNumberColumn(column) ||
                            selectedConfiguredColumns.includes(column)
                          }
                          onChange={() => toggleSelectedColumn(column)}
                          onClick={(event) => event.stopPropagation()}
                          disabled={isApplicationNumberColumn(column)}
                          tabIndex={-1}
                        />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontSize:
                                "11px",
                              color:
                                "#333",
                              fontWeight:
                                500,
                            }}
                          >
                            {formatColumnName(
                              column,
                            )}
                          </Typography>
                        }
                      />
                      <Box
                        sx={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            0.25,
                          ml: 1,
                        }}
                      >
                        <Button
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();
                            moveColumnUp(
                              index,
                            );
                          }}
                          disabled={
                            index ===
                            0
                          }
                          sx={{
                            minWidth:
                              "24px",
                            width:
                              "24px",
                            height:
                              "24px",
                            padding: 0,
                            border:
                              "1px solid #e1e4e7",
                            borderRadius:
                              "4px",
                            color:
                              "#555",
                            fontSize:
                              "13px",
                          }}
                        >
                          <KeyUpArrowIcon/>
                        </Button>

                        <Button
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();
                            moveColumnDown(
                              index,
                            );
                          }}
                          disabled={
                            index ===
                            tempSelectedColumns.length -
                            1
                          }
                          sx={{
                            minWidth:
                              "24px",
                            width:
                              "24px",
                            height:
                              "24px",
                            padding: 0,
                            border:
                              "1px solid #e1e4e7",
                            borderRadius:
                              "4px",
                            color:
                              "#555",
                            fontSize:
                              "13px",
                          }}
                        >
                          <KeyDownArrowIcon/>
                        </Button>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ),
              )}

              {tempSelectedColumns.length ===
                0 && (
                  <Box
                    sx={{
                      py: 5,
                      textAlign:
                        "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          "11px",
                        color:
                          "#999",
                      }}
                    >
                      Select columns
                      from the left
                    </Typography>
                  </Box>
                )}
            </List>
          </Box>
        </Box>

        {/* INFORMATION */}

        {/* <Box
          sx={{
            mt: 1.5,
            px: 1.5,
            py: 1,
            backgroundColor:
              "#eef5fa",
            borderRadius:
              "6px",
            border:
              "1px solid #d8e7f2",
          }}
        >
          <Typography
            sx={{
              fontSize:
                "10.5px",
              color:
                "#456",
            }}
          >
            <strong>Tip:</strong>{" "}
            The Selected Columns
            order determines the
            table column order. Use
            ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œ and ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ to rearrange
            columns.
          </Typography>
        </Box> */}
      </CustomDialog>}
    </>
  );
};

export default DynamicRoleTable;