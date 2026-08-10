import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";

import {
  FilterIcon,
  SearchIcon,
  SettingsIcon,
} from "../../icons/Icons";

interface DynamicRoleTableProps {
  title: string;
  data: Record<string, unknown>[];

  onApplicationClick?: (
    application: Record<string, unknown>,
  ) => void;

  /**
   * Use a unique storage key for each table/user.
   *
   * Example:
   *
   * storageKey={`cvt-task-columns-${userId}`}
   *
   * If not provided, table title will be used.
   */
  storageKey?: string;
}

type SortDirection = "asc" | "desc";

const MAX_VISIBLE_COLUMNS = 9;

/**
 * Convert backend column names into readable labels.
 *
 * Example:
 *
 * applicationNo -> Application No
 * annualPremium -> Annual Premium
 * application_no -> Application No
 */
const formatColumnName = (key: string): string => {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
};

/**
 * Format cell values.
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

  /**
   * Format ISO date.
   */
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

/**
 * Check Application Number column.
 */
const isApplicationNumberColumn = (
  column: string,
): boolean => {
  const normalizedColumn = column
    .replace(/_/g, "")
    .replace(/\s/g, "")
    .toLowerCase();

  return (
    normalizedColumn ===
      "applicationnumber" ||
    normalizedColumn === "applicationno"
  );
};

const DynamicRoleTable = ({
  title,
  data,
  onApplicationClick,
  storageKey,
}: DynamicRoleTableProps) => {
  /* ============================================================
   * BASIC TABLE STATE
   * ============================================================
   */

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(25);

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
   * SETTINGS / COLUMN STATE
   * ============================================================
   */

  /**
   * Columns currently visible in table.
   *
   * IMPORTANT:
   * The order of this array is the order
   * of columns in the table.
   */
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>([]);

  /**
   * Columns not currently displayed.
   */
  const [availableColumns, setAvailableColumns] =
    useState<string[]>([]);

  /**
   * Settings dialog.
   */
  const [settingsOpen, setSettingsOpen] =
    useState(false);

  /**
   * Temporary settings.
   *
   * Changes are applied only after clicking Save.
   */
  const [
    tempSelectedColumns,
    setTempSelectedColumns,
  ] = useState<string[]>([]);

  const [
    tempAvailableColumns,
    setTempAvailableColumns,
  ] = useState<string[]>([]);

  /* ============================================================
   * ALL BACKEND COLUMNS
   * ============================================================
   */

  const columns = useMemo(() => {
    const columnSet = new Set<string>();

    data.forEach((row) => {
      Object.keys(row).forEach((key) => {
        columnSet.add(key);
      });
    });

    return Array.from(columnSet);
  }, [data]);

  /* ============================================================
   * LOCAL STORAGE KEY
   * ============================================================
   */

  const finalStorageKey =
    storageKey ||
    `dynamic-role-table-${title
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  /* ============================================================
   * LOAD SAVED COLUMN CONFIGURATION
   * ============================================================
   */

  useEffect(() => {
    if (columns.length === 0) {
      setSelectedColumns([]);
      setAvailableColumns([]);
      return;
    }

    let savedColumns: string[] = [];

    try {
      const saved =
        localStorage.getItem(
          finalStorageKey,
        );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          savedColumns = parsed.filter(
            (column): column is string =>
              typeof column === "string" &&
              columns.includes(column),
          );
        }
      }
    } catch (error) {
      console.error(
        "Unable to load column configuration:",
        error,
      );
    }

    /**
     * First time:
     * Select first 9 columns.
     */
    if (savedColumns.length === 0) {
      const defaultSelected =
        columns.slice(
          0,
          MAX_VISIBLE_COLUMNS,
        );

      const defaultAvailable =
        columns.slice(
          MAX_VISIBLE_COLUMNS,
        );

      setSelectedColumns(
        defaultSelected,
      );

      setAvailableColumns(
        defaultAvailable,
      );

      return;
    }

    /**
     * Restore saved sequence.
     *
     * Also protect against more than 9
     * columns being stored.
     */
    const selected =
      savedColumns.slice(
        0,
        MAX_VISIBLE_COLUMNS,
      );

    /**
     * New backend columns automatically
     * become available columns.
     */
    const available = columns.filter(
      (column) =>
        !selected.includes(column),
    );

    setSelectedColumns(selected);
    setAvailableColumns(available);
  }, [
    columns,
    finalStorageKey,
  ]);

  /* ============================================================
   * SAVE COLUMN CONFIGURATION
   * ============================================================
   */

  useEffect(() => {
    if (selectedColumns.length === 0) {
      return;
    }

    try {
      localStorage.setItem(
        finalStorageKey,
        JSON.stringify(
          selectedColumns,
        ),
      );
    } catch (error) {
      console.error(
        "Unable to save column configuration:",
        error,
      );
    }
  }, [
    selectedColumns,
    finalStorageKey,
  ]);

  /* ============================================================
   * SEARCH
   * ============================================================
   */

  const filteredData = useMemo(() => {
    if (!searchText.trim()) {
      return data;
    }

    const search =
      searchText.toLowerCase();

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
    if (!sortColumn) {
      return filteredData;
    }

    return [...filteredData].sort(
      (a, b) => {
        const aValue =
          a[sortColumn];

        const bValue =
          b[sortColumn];

        /**
         * Empty values at bottom.
         */
        if (
          aValue === null ||
          aValue === undefined ||
          aValue === ""
        ) {
          return 1;
        }

        if (
          bValue === null ||
          bValue === undefined ||
          bValue === ""
        ) {
          return -1;
        }

        const aNumber = Number(aValue);
        const bNumber = Number(bValue);

        let result = 0;

        /**
         * Numeric sorting.
         */
        if (
          !isNaN(aNumber) &&
          !isNaN(bNumber)
        ) {
          result =
            aNumber - bNumber;
        } else {
          /**
           * String sorting.
           */
          result = String(aValue)
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

        return sortDirection ===
          "asc"
          ? result
          : -result;
      },
    );
  }, [
    filteredData,
    sortColumn,
    sortDirection,
  ]);

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
   * SETTINGS OPEN
   * ============================================================
   */

  const handleOpenSettings = () => {
    setTempSelectedColumns([
      ...selectedColumns,
    ]);

    setTempAvailableColumns([
      ...availableColumns,
    ]);

    setSettingsOpen(true);
  };

  /* ============================================================
   * SETTINGS CLOSE
   * ============================================================
   */

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  /* ============================================================
   * MOVE AVAILABLE -> SELECTED
   * ============================================================
   */

  const moveToSelected = (
    column: string,
  ) => {
    /**
     * Maximum 9 columns.
     */
    if (
      tempSelectedColumns.length >=
      MAX_VISIBLE_COLUMNS
    ) {
      return;
    }

    setTempAvailableColumns(
      (previous) =>
        previous.filter(
          (item) =>
            item !== column,
        ),
    );

    setTempSelectedColumns(
      (previous) => [
        ...previous,
        column,
      ],
    );
  };

  /* ============================================================
   * MOVE SELECTED -> AVAILABLE
   * ============================================================
   */

  const moveToAvailable = (
    column: string,
  ) => {
    setTempSelectedColumns(
      (previous) =>
        previous.filter(
          (item) =>
            item !== column,
        ),
    );

    setTempAvailableColumns(
      (previous) => [
        ...previous,
        column,
      ],
    );
  };

  /* ============================================================
   * MOVE ALL -> SELECTED
   * ============================================================
   */

  const moveAllToSelected = () => {
    const remainingSlots =
      MAX_VISIBLE_COLUMNS -
      tempSelectedColumns.length;

    if (remainingSlots <= 0) {
      return;
    }

    const columnsToMove =
      tempAvailableColumns.slice(
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
        previous.slice(
          columnsToMove.length,
        ),
    );
  };

  /* ============================================================
   * MOVE ALL -> AVAILABLE
   * ============================================================
   */

  const moveAllToAvailable =
    () => {
      setTempAvailableColumns(
        (previous) => [
          ...previous,
          ...tempSelectedColumns,
        ],
      );

      setTempSelectedColumns([]);
    };

  /* ============================================================
   * MOVE SELECTED COLUMN UP
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

        const current =
          updated[index];

        const previousItem =
          updated[index - 1];

        updated[index - 1] =
          current;

        updated[index] =
          previousItem;

        return updated;
      },
    );
  };

  /* ============================================================
   * MOVE SELECTED COLUMN DOWN
   * ============================================================
   */

  const moveColumnDown = (
    index: number,
  ) => {
    if (
      index ===
      tempSelectedColumns.length -
        1
    ) {
      return;
    }

    setTempSelectedColumns(
      (previous) => {
        const updated = [
          ...previous,
        ];

        const current =
          updated[index];

        const next =
          updated[index + 1];

        updated[index] = next;

        updated[index + 1] =
          current;

        return updated;
      },
    );
  };

  /* ============================================================
   * SAVE SETTINGS
   * ============================================================
   */

  const handleSaveSettings =
    () => {
      if (
        tempSelectedColumns.length ===
        0
      ) {
        return;
      }

      setSelectedColumns([
        ...tempSelectedColumns,
      ]);

      setAvailableColumns([
        ...tempAvailableColumns,
      ]);

      setSettingsOpen(false);

      setPage(0);
    };

  /* ============================================================
   * RESET SETTINGS
   * ============================================================
   */

  const handleResetColumns =
    () => {
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

  /* ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/* ========================================================
          MAIN TABLE
          ======================================================== */}

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          width: "100%",

          border:
            "1px solid #d9dfe4",

          borderRadius: "10px",

          overflow: "hidden",

          backgroundColor: "#fff",

          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* ======================================================
            BLUE TITLE HEADER
            ====================================================== */}

        <Box
          sx={{
            height: "38px",

            px: 1.75,

            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",

            backgroundColor:
              "#0D4C7D",

            color: "#fff",
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing:
                "0.1px",
            }}
          >
            {title}
          </Typography>

          <Button
            size="small"
            sx={{
              minWidth: "52px",
              height: "26px",

              px: 1.5,

              color: "#0D4C7D",

              backgroundColor:
                "#fff",

              borderRadius: "5px",

              textTransform:
                "none",

              fontSize: "11px",

              fontWeight: 500,

              "&:hover": {
                backgroundColor:
                  "#f3f5f6",
              },
            }}
          >
            Add
          </Button>
        </Box>

        {/* ======================================================
            TOOLBAR
            ====================================================== */}

        <Box
          sx={{
            height: "42px",

            px: 1.25,

            display: "flex",
            alignItems: "center",
            justifyContent:
              "flex-end",

            gap: 0.75,

            backgroundColor:
              "#fff",

            borderBottom:
              "1px solid #e3e6e8",
          }}
        >
          {/* Search Input */}

          {showSearch && (
            <TextField
              size="small"
              value={searchText}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement>,
              ) => {
                setSearchText(
                  event.target.value,
                );

                setPage(0);
              }}
              placeholder="Search..."
              autoFocus
              sx={{
                width: "210px",

                "& .MuiInputBase-root":
                  {
                    height:
                      "30px",
                    fontSize:
                      "11px",
                    borderRadius:
                      "6px",
                  },

                "& .MuiOutlinedInput-input":
                  {
                    padding:
                      "6px 9px",
                  },
              }}
            />
          )}

          {/* Search */}

          <IconButton
            size="small"
            onClick={() =>
              setShowSearch(
                (previous) =>
                  !previous,
              )
            }
            sx={{
              width: "32px",
              height: "30px",

              border:
                "1px solid #dfe3e6",

              borderRadius:
                "6px",

              color: "#454b50",

              "&:hover": {
                backgroundColor:
                  "#f4f6f7",
              },
            }}
          >
            <SearchIcon />
          </IconButton>

          {/* Filter */}

          <IconButton
            size="small"
            sx={{
              width: "32px",
              height: "30px",

              border:
                "1px solid #dfe3e6",

              borderRadius:
                "6px",

              color: "#454b50",

              "&:hover": {
                backgroundColor:
                  "#f4f6f7",
              },
            }}
          >
            <FilterIcon />
          </IconButton>

          {/* Settings */}

          <IconButton
            size="small"
            onClick={
              handleOpenSettings
            }
            sx={{
              width: "32px",
              height: "30px",

              border:
                "1px solid #dfe3e6",

              borderRadius:
                "6px",

              color: "#454b50",

              "&:hover": {
                backgroundColor:
                  "#f4f6f7",
              },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>

        {/* ======================================================
            TABLE
            ====================================================== */}

        <TableContainer
          sx={{
            width: "100%",

            overflowX:
              "hidden",

            overflowY: "auto",

            maxHeight:
              "calc(90vh - 185px)",

            "&::-webkit-scrollbar":
              {
                width: "6px",
              },

            "&::-webkit-scrollbar-thumb":
              {
                backgroundColor:
                  "#c7cdd3",

                borderRadius:
                  "10px",
              },

            "&::-webkit-scrollbar-track":
              {
                backgroundColor:
                  "#f7f8f9",
              },
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              width: "100%",

              tableLayout:
                "fixed",

              "& .MuiTableCell-root":
                {
                  boxSizing:
                    "border-box",
                },
            }}
          >
            {/* ==================================================
                TABLE HEADER
                ================================================== */}

            <TableHead>
              <TableRow>
                {selectedColumns.map(
                  (column) => {
                    const isSorted =
                      sortColumn ===
                      column;

                    return (
                      <TableCell
                        key={column}
                        onClick={() =>
                          handleSort(
                            column,
                          )
                        }
                        sx={{
                          height:
                            "34px",

                          padding:
                            "0 10px",

                          backgroundColor:
                            "#eef1f4",

                          color:
                            "#20252a",

                          fontSize:
                            "11.5px",

                          fontWeight: 600,

                          whiteSpace:
                            "nowrap",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",

                          borderBottom:
                            "1px solid #d9dde1",

                          cursor:
                            "pointer",

                          userSelect:
                            "none",

                          "&:hover":
                            {
                              backgroundColor:
                                "#e7ebee",
                            },
                        }}
                      >
                        <Box
                          sx={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "space-between",

                            width:
                              "100%",

                            minWidth:
                              0,
                          }}
                        >
                          {/* Column Name */}

                          <Typography
                            component="span"
                            sx={{
                              fontSize:
                                "11.5px",

                              fontWeight:
                                600,

                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatColumnName(
                              column,
                            )}
                          </Typography>

                          {/* Sort Icon */}

                          <Box
                            sx={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              ml: 0.5,

                              flexShrink:
                                0,

                              width:
                                "14px",

                              fontSize:
                                "13px",

                              color:
                                isSorted
                                  ? "#0D4C7D"
                                  : "#777",
                            }}
                          >
                            {!isSorted && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize:
                                    "13px",

                                  lineHeight:
                                    1,

                                  color:
                                    "#73797e",
                                }}
                              >
                                ↕
                              </Typography>
                            )}

                            {isSorted &&
                              sortDirection ===
                                "asc" && (
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize:
                                      "13px",

                                    lineHeight:
                                      1,

                                    fontWeight:
                                      700,

                                    color:
                                      "#0D4C7D",
                                  }}
                                >
                                  ↑
                                </Typography>
                              )}

                            {isSorted &&
                              sortDirection ===
                                "desc" && (
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize:
                                      "13px",

                                    lineHeight:
                                      1,

                                    fontWeight:
                                      700,

                                    color:
                                      "#0D4C7D",
                                  }}
                                >
                                  ↓
                                </Typography>
                              )}
                          </Box>
                        </Box>
                      </TableCell>
                    );
                  },
                )}
              </TableRow>
            </TableHead>

            {/* ==================================================
                TABLE BODY
                ================================================== */}

            <TableBody>
              {paginatedData.length >
              0 ? (
                paginatedData.map(
                  (
                    row,
                    rowIndex,
                  ) => (
                    <TableRow
                      key={String(
                        row.id ??
                          rowIndex,
                      )}
                      hover
                      sx={{
                        height:
                          "38px",

                        "&:nth-of-type(even)":
                          {
                            backgroundColor:
                              "#fafafa",
                          },

                        "&:hover":
                          {
                            backgroundColor:
                              "#f3f7fa",
                          },

                        "&:last-child td":
                          {
                            borderBottom:
                              0,
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
                                  "38px",

                                padding:
                                  "0 10px",

                                fontSize:
                                  "11.5px",

                                lineHeight:
                                  1.2,

                                color:
                                  isApplicationNumber
                                    ? "#155a87"
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
                                  onClick={() =>
                                    onApplicationClick?.(
                                      row,
                                    )
                                  }
                                  sx={{
                                    cursor:
                                      "pointer",

                                    color:
                                      "#155a87",

                                    fontWeight:
                                      500,

                                    textDecoration:
                                      "underline",

                                    textUnderlineOffset:
                                      "2px",

                                    "&:hover":
                                      {
                                        color:
                                          "#9A2529",
                                      },
                                  }}
                                >
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
                        "100px",

                      color:
                        "#8a8f94",

                      fontSize:
                        "12px",

                      borderBottom:
                        0,
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
            ====================================================== */}

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
            minHeight:
              "38px",

            borderTop:
              "1px solid #e3e6e8",

            "& .MuiTablePagination-toolbar":
              {
                minHeight:
                  "38px",

                height:
                  "38px",

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
                  "4px",
              },
          }}
        />
      </Paper>

      {/* ========================================================
          COLUMN SETTINGS DIALOG
          ======================================================== */}

      <Dialog
        open={settingsOpen}
        onClose={
          handleCloseSettings
        }
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius:
              "10px",

            overflow:
              "hidden",
          },
        }}
      >
        {/* ======================================================
            DIALOG HEADER
            ====================================================== */}

        <DialogTitle
          sx={{
            px: 2.5,
            py: 1.5,

            backgroundColor:
              "#0D4C7D",

            color: "#fff",

            display: "flex",

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
                  "14px",

                fontWeight:
                  600,
              }}
            >
              Configure Columns
            </Typography>

            <Typography
              sx={{
                fontSize:
                  "10.5px",

                opacity:
                  0.85,

                mt: 0.25,
              }}
            >
              Select up to{" "}
              {MAX_VISIBLE_COLUMNS}{" "}
              columns
            </Typography>
          </Box>

          {/* Using text X instead of MUI Close icon */}

          <IconButton
            onClick={
              handleCloseSettings
            }
            sx={{
              width: "28px",
              height: "28px",
              color: "#fff",

              "&:hover": {
                backgroundColor:
                  "rgba(255,255,255,0.1)",
              },
            }}
          >
            <Typography
              sx={{
                fontSize:
                  "18px",
                lineHeight: 1,
                color: "#fff",
              }}
            >
              ×
            </Typography>
          </IconButton>
        </DialogTitle>

        {/* ======================================================
            DIALOG CONTENT
            ====================================================== */}

        <DialogContent
          sx={{
            p: 2.5,

            backgroundColor:
              "#f7f8fa",
          }}
        >
          <Box
            sx={{
              display: "flex",

              alignItems:
                "center",

              gap: 1.5,

              width: "100%",
            }}
          >
            {/* ==================================================
                AVAILABLE COLUMNS
                ================================================== */}

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
              {/* Header */}

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

              {/* List */}

              <List
                dense
                sx={{
                  height:
                    "300px",

                  overflowY:
                    "auto",

                  p: 0,

                  "&::-webkit-scrollbar":
                    {
                      width:
                        "5px",
                    },

                  "&::-webkit-scrollbar-thumb":
                    {
                      backgroundColor:
                        "#c5c5c5",

                      borderRadius:
                        "10px",
                    },
                }}
              >
                {tempAvailableColumns.map(
                  (
                    column,
                  ) => (
                    <ListItem
                      key={
                        column
                      }
                      disablePadding
                    >
                      <ListItemButton
                        onClick={() =>
                          moveToSelected(
                            column,
                          )
                        }
                        disabled={
                          tempSelectedColumns.length >=
                          MAX_VISIBLE_COLUMNS
                        }
                        sx={{
                          minHeight:
                            "34px",

                          py:
                            0.25,

                          px:
                            1,

                          "&:hover":
                            {
                              backgroundColor:
                                "#f1f6fa",
                            },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth:
                              "30px",
                          }}
                        >
                          <Checkbox
                            edge="start"
                            checked={
                              false
                            }
                            tabIndex={
                              -1
                            }
                            disableRipple
                            size="small"
                            sx={{
                              p:
                                "3px",
                            }}
                          />
                        </ListItemIcon>

                        <ListItemText
                          primary={formatColumnName(
                            column,
                          )}
                          primaryTypographyProps={{
                            fontSize:
                              "11px",

                            color:
                              "#444",
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ),
                )}

                {tempAvailableColumns.length ===
                  0 && (
                  <Box
                    sx={{
                      py:
                        5,

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

            {/* ==================================================
                TRANSFER BUTTONS
                ================================================== */}

            <Box
              sx={{
                display:
                  "flex",

                flexDirection:
                  "column",

                gap: 0.75,

                alignItems:
                  "center",
              }}
            >
              {/* ALL TO SELECTED */}

              <Button
                onClick={
                  moveAllToSelected
                }
                disabled={
                  tempAvailableColumns.length ===
                    0 ||
                  tempSelectedColumns.length >=
                    MAX_VISIBLE_COLUMNS
                }
                sx={{
                  minWidth:
                    "38px",

                  width:
                    "38px",

                  height:
                    "32px",

                  minHeight:
                    "32px",

                  padding:
                    0,

                  border:
                    "1px solid #d5dbe0",

                  backgroundColor:
                    "#fff",

                  color:
                    "#555",

                  borderRadius:
                    "6px",

                  fontSize:
                    "16px",

                  lineHeight:
                    1,

                  "&:hover":
                    {
                      backgroundColor:
                        "#f1f6fa",
                    },
                }}
              >
                →
              </Button>

              {/* ALL TO AVAILABLE */}

              <Button
                onClick={
                  moveAllToAvailable
                }
                disabled={
                  tempSelectedColumns.length ===
                  0
                }
                sx={{
                  minWidth:
                    "38px",

                  width:
                    "38px",

                  height:
                    "32px",

                  minHeight:
                    "32px",

                  padding:
                    0,

                  border:
                    "1px solid #d5dbe0",

                  backgroundColor:
                    "#fff",

                  color:
                    "#555",

                  borderRadius:
                    "6px",

                  fontSize:
                    "16px",

                  lineHeight:
                    1,

                  "&:hover":
                    {
                      backgroundColor:
                        "#f1f6fa",
                    },
                }}
              >
                ←
              </Button>
            </Box>

            {/* ==================================================
                SELECTED COLUMNS
                ================================================== */}

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
              {/* Header */}

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

              {/* List */}

              <List
                dense
                sx={{
                  height:
                    "300px",

                  overflowY:
                    "auto",

                  p: 0,

                  "&::-webkit-scrollbar":
                    {
                      width:
                        "5px",
                    },

                  "&::-webkit-scrollbar-thumb":
                    {
                      backgroundColor:
                        "#c5c5c5",

                      borderRadius:
                        "10px",
                    },
                }}
              >
                {tempSelectedColumns.map(
                  (
                    column,
                    index,
                  ) => (
                    <ListItem
                      key={
                        column
                      }
                      disablePadding
                    >
                      <ListItemButton
                        onClick={() =>
                          moveToAvailable(
                            column,
                          )
                        }
                        sx={{
                          minHeight:
                            "34px",

                          py:
                            0.25,

                          px:
                            1,

                          pr:
                            0.5,

                          "&:hover":
                            {
                              backgroundColor:
                                "#f1f6fa",
                            },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth:
                              "30px",
                          }}
                        >
                          <Checkbox
                            edge="start"
                            checked
                            tabIndex={
                              -1
                            }
                            disableRipple
                            size="small"
                            sx={{
                              p:
                                "3px",
                            }}
                          />
                        </ListItemIcon>

                        <ListItemText
                          primary={formatColumnName(
                            column,
                          )}
                          primaryTypographyProps={{
                            fontSize:
                              "11px",

                            color:
                              "#333",

                            fontWeight:
                              500,
                          }}
                        />

                        {/* Reorder buttons */}

                        <Box
                          sx={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              0.25,

                            ml:
                              1,
                          }}
                        >
                          {/* UP */}

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

                              minHeight:
                                "24px",

                              padding:
                                0,

                              border:
                                "1px solid #e1e4e7",

                              borderRadius:
                                "4px",

                              color:
                                "#555",

                              fontSize:
                                "13px",

                              lineHeight:
                                1,

                              "&:hover":
                                {
                                  backgroundColor:
                                    "#edf3f7",
                                },
                            }}
                          >
                            ↑
                          </Button>

                          {/* DOWN */}

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

                              minHeight:
                                "24px",

                              padding:
                                0,

                              border:
                                "1px solid #e1e4e7",

                              borderRadius:
                                "4px",

                              color:
                                "#555",

                              fontSize:
                                "13px",

                              lineHeight:
                                1,

                              "&:hover":
                                {
                                  backgroundColor:
                                    "#edf3f7",
                                },
                            }}
                          >
                            ↓
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
                      py:
                        5,

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

          {/* ==================================================
              INFORMATION
              ================================================== */}

          <Box
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
              ↑ and ↓ to rearrange
              columns.
            </Typography>
          </Box>
        </DialogContent>

        {/* ======================================================
            DIALOG FOOTER
            ====================================================== */}

        <DialogActions
          sx={{
            px: 2.5,
            py: 1.25,

            borderTop:
              "1px solid #e5e7eb",

            justifyContent:
              "space-between",
          }}
        >
          {/* Reset */}

          <Button
            onClick={
              handleResetColumns
            }
            sx={{
              textTransform:
                "none",

              fontSize:
                "11px",

              color:
                "#555",

              minHeight:
                "30px",
            }}
          >
            Reset to Default
          </Button>

          <Box
            sx={{
              display:
                "flex",

              gap: 0.75,
            }}
          >
            {/* Cancel */}

            <Button
              onClick={
                handleCloseSettings
              }
              sx={{
                textTransform:
                  "none",

                fontSize:
                  "11px",

                color:
                  "#555",

                minHeight:
                  "30px",

                px: 1.5,
              }}
            >
              Cancel
            </Button>

            {/* Save */}

            <Button
              variant="contained"
              onClick={
                handleSaveSettings
              }
              disabled={
                tempSelectedColumns.length ===
                0
              }
              sx={{
                textTransform:
                  "none",

                fontSize:
                  "11px",

                minHeight:
                  "30px",

                minWidth:
                  "70px",

                px: 1.5,

                backgroundColor:
                  "#0D4C7D",

                borderRadius:
                  "5px",

                "&:hover":
                  {
                    backgroundColor:
                      "#093d65",
                  },
              }}
            >
              Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DynamicRoleTable;