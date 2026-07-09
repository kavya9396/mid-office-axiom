import {
  Alert,
  Box,
  List,
  ListItem,
  MenuItem,
  Paper,
  Snackbar,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { columnFlex, modalTitleStyles } from "../../utils/styles";
import CustomButton from "../../components/ui/Button/Button";
import type { TableColumn, tableData } from "../../types/inbox";
import { allColumns } from "../../store/inbox.columns";
import {
  FilterIcon,
  KeyLeftArrowIcon,
  KeyRightArrowIcon,
  SearchIcon,
  SettingsIcon,
} from "../../icons/Icons";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import { useMemo, useState } from "react";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import CustomCheckbox from "../../components/ui/Checkbox/Checkbox";
import { useColumnConfig } from "../../hooks/useColumnConfig";
import Badge from "../../components/ui/Badge/Badge";
import { useNavigate } from "react-router-dom";
import FilterTable from "./FilterTable";
import {
  getDRSPath,
  getGrievanceApplicationPath,
  normalizeBusinessType,
} from "../../routes/routes";
import SearchApplication from "./SearchApplication";
import { toFilterComparableValue } from "../../utils/filter";
import { useAppDispatch } from "../../store/hooks";
import { claimTaskThunk } from "../../store/thunks/claimTaskThunk";
import { useAppContext } from "../../hooks/useAppContext";

type SortDirection = "asc" | "desc";

const roleMapper = {
  "CUW_TASK": "CUW Pool",
  "CMO_TASK": "CMO Pool",
  "CVT_TASK": "CVT Pool",
  "CPT_TASK": "CPT Pool",
  "DVT_TASK": "DVT Pool",
  "PIVV_TASK":"PIVV Pool",
  "PRE_ISSUANCE_SERVICING_TASK":"Pre Issuance Servicing Pool",
  "EXCEPTIONAL_TASK":"Exceptional Pool",
  "GUW_TASK":"GUW Pool",
  "HOD_TASK":"HOD Pool",
  "MMT_TASK":"MMT Pool",
  "SR_UW_TASK":"Sr UW Pool",
  "SUW_TASK":"SUW Pool",
  "VENDOR_CMO_TASK":"Vendor CMO Pool",
  "COPS_TASK":"COPS Pool",
  "IT_TASK":"IT Pool",
  "RI_TASK":"RI Pool",
  "SYSTEM_WAIT_POOL_AMR_MEDICAL":"System Wait Pool - Medical",
  "SYSTEM_WAIT_POOL_AMR_NON_MEDICAL":"System Wait Pool - Non Medical",
  "REQUIREMENT_POOL":"Requirement Pool",
  "CUW_CLAIM_AUDIT_TASK":"Claim Audit Pool",
  "ACCUITY_TASK":"Accuity Pool"
}

const RightPanel = ({
  selectedPool,
  rows,
}: {
  selectedPool: string;
  rows: tableData[];
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { businessType } = useAppContext();
  const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);

  // ---------------- STATES ----------------

  const username = localStorage.getItem("username") ?? "";
  const password = localStorage.getItem("password") ?? "";
  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";
  const { config, updateConfig } = useColumnConfig(username, selectedPool);

  const [left, setLeft] = useState<string[]>([]);
  const [right, setRight] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);

  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortKey, setSortKey] = useState<keyof tableData | "">("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [claimError, setClaimError] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>(
    {},
  );

  const handleApplicationClick = async (
    e: React.MouseEvent,
    row: tableData,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rawTaskId = String(row.taskId ?? "").trim();
    const [instanceFromTaskId = "", taskFromTaskId = ""] = rawTaskId.includes(".")
      ? rawTaskId.split(".")
      : ["", rawTaskId];
    const claimTaskId = taskFromTaskId;
    const rowData = row as unknown as Record<string, unknown>;
    const instanceId = String(rowData.instanceId ?? rowData.instanceID ?? instanceFromTaskId).trim();
    if (!claimTaskId) {
      setClaimError("Task id is missing. Unable to claim this case.");
      return;
    }

    try {
      const claimResponse = await dispatch(
        claimTaskThunk({ username, password, taskId: claimTaskId }),
      ).unwrap();

      const isClaimed =
        claimResponse.success === true ||
        claimResponse.state?.toLowerCase() === "claimed";

      if (!isClaimed) {
        setClaimError(claimResponse.message || "Failed to claim task.");
        return;
      }

      const mappedRoleType =
        roleMapper[row.roleType as keyof typeof roleMapper] ?? row.roleType;

      localStorage.setItem("roleType", mappedRoleType);
      localStorage.setItem("taskCompositeId", rawTaskId);
      localStorage.setItem("taskId", claimTaskId);
      if (instanceId) {
        localStorage.setItem("instanceId", instanceId);
      }
      localStorage.setItem(
        "selectedCaseContext",
        JSON.stringify({
          applicationNo: String(row.applicationNo ?? "").trim(),
          taskId: claimTaskId,
          instanceId,
          taskCompositeId: rawTaskId,
        }),
      );

      const targetBusinessType =
        normalizeBusinessType(row.businessType) ?? safeBusinessType;

      const targetPath =
        row.roleType === "Grievance Pool"
          ? getGrievanceApplicationPath(targetBusinessType, row.applicationNo)
          : getDRSPath(targetBusinessType, row.applicationNo);

      navigate(targetPath);
    } catch (error) {
      setClaimError(
        error instanceof Error ? error.message : "Failed to claim task.",
      );
    }
  };

  const visibleColumns = allColumns.filter((col) =>
    config.visible.includes(col.key),
  );
  const hasTableData = rows.length > 0;
  // ---------------- OPEN DIALOG ----------------
  const openColumnDialog = () => {
    const leftColumns = allColumns.filter((col) =>
    config.hidden.includes(col.key),
  ).map((col) => String(col.key));
    setLeft(leftColumns);
    setRight(config.visible);
    setOpenTransferDialog(true);
  };

  // ---------------- MOVE LOGIC ----------------
  const handleToggle = (item: string) => () => {
    setChecked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const moveRight = () => {
    setLeft((prev) => prev.filter((i) => !checked.includes(i)));
    setRight((prev) => [...prev, ...checked]);
    setChecked([]);
  };

  const moveLeft = () => {
    setRight((prev) => prev.filter((i) => !checked.includes(i)));
    setLeft((prev) => [...prev, ...checked]);
    setChecked([]);
  };

  const handleSort = (columnKey: keyof tableData) => {
    setPage(0);

    if (sortKey === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(columnKey);
    setSortDirection("asc");
  };

  const getSortIndicator = (columnKey: keyof tableData) => {
    if (sortKey !== columnKey) return "⇅";
    return sortDirection === "asc" ? "▲" : "▼";
  };

  const compareByColumn = (
    a: tableData,
    b: tableData,
    column: TableColumn<tableData>,
  ) => {
    const aRaw = a[column.key];
    const bRaw = b[column.key];

    const aText = toFilterComparableValue(aRaw).trim();
    const bText = toFilterComparableValue(bRaw).trim();

    if (!aText && !bText) return 0;
    if (!aText) return 1;
    if (!bText) return -1;

    if (column.numeric) {
      const aNum = Number(aText.toString().replace(/,/g, ""));
      const bNum = Number(bText.toString().replace(/,/g, ""));

      if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
        return aNum - bNum;
      }
    }

    const aDate = Date.parse(aText);
    const bDate = Date.parse(bText);
    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      return aDate - bDate;
    }

    return aText.localeCompare(bText, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const getPoolTatHours = (row: tableData) => {
    const rowData = row as unknown as Record<string, unknown>;
    const rawPoolTat = rowData.poolTAT;

    if (rawPoolTat === null || rawPoolTat === undefined) {
      return null;
    }

    const tatText = String(rawPoolTat).trim();
    if (!tatText) {
      return null;
    }

    const tatMatch = tatText.match(/-?\d+(\.\d+)?/);
    if (!tatMatch) {
      return null;
    }

    const tatHours = Number(tatMatch[0]);
    return Number.isFinite(tatHours) ? tatHours : null;
  };

  // ---------------- APPLY ----------------
  const handleApply = () => {
    updateConfig({
      visible: right,
      hidden: left,
    });

    setOpenTransferDialog(false);
  };
  // -------------- Header content -----------------
  const headerContent = () => (
    <TableRow
      sx={{
        "&:hover": {
          backgroundColor: "#f5faff",
          cursor: "pointer",
        },
      }}
    >
      {visibleColumns.map((column: TableColumn<tableData>) => (
        <TableCell
          key={String(column.key)}
          variant="head"
          align={column.numeric ? "right" : "left"}
          onClick={() => handleSort(column.key)}
          sx={{
            backgroundColor: "#E9EEF3",
            px: 1,
            fontWeight: "bold",
            fontSize: "13px",
            width: column.width,
            padding: 0.5,
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: column.numeric ? "flex-end" : "flex-start",
              gap: 0.5,
              flexWrap: "nowrap",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: "13px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {column.label}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: "11px", color: "#4A4A4A" }}
            >
              {getSortIndicator(column.key)}
            </Typography>
          </Box>
        </TableCell>
      ))}
    </TableRow>
  );
  // ---------------- RENDER LIST ----------------
  const customList = (title: string, items: string[]) => (
    <Paper
      sx={{
        width: 300,
        height: 400, // 👈 same fixed height for both boxes
        overflow: "hidden", // 👈 prevents outer scroll
      }}
    >
      <Box sx={{ px: 2, py: 1, backgroundColor: "#f5f5f5" }}>
        <Typography variant="subtitle1">{title}</Typography>
      </Box>

      <List dense>
        {items.map((item) => (
          <ListItem key={item} disablePadding>
            <Box sx={{ px: 2 }}>
              <CustomCheckbox
                label={
                  allColumns.find((col) => String(col.key) === item)?.label ??
                  item
                }
                checked={checked.includes(item)}
                onChange={handleToggle(item)}
              />
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
  const filteredRows = rows
    .filter((row) => {
      const activeFilters = Object.entries(filterValues);

      if (!activeFilters.length) return true;

      return activeFilters.every(([key, values]) => {
        if (!values.length) return true;

        const rowValue = toFilterComparableValue(row[key as keyof typeof row]);

        return values.includes(rowValue);
      });
    })
    .filter((row) => {
      if (!searchText.trim()) return true;

      const search = searchText.toLowerCase();

      return visibleColumns.some((col) => {
        const value = row[col.key];

        return String(value ?? "")
          .toLowerCase()
          .includes(search);
      });
    });
  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;

    const sortColumn = visibleColumns.find((column) => column.key === sortKey);
    if (!sortColumn) return filteredRows;

    const sorted = [...filteredRows].sort((a, b) =>
      compareByColumn(a, b, sortColumn),
    );

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [filteredRows, sortDirection, sortKey, visibleColumns]);

  const paginatedRows =
    rowsPerPage === -1
      ? sortedRows
      : sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalCount = sortedRows.length;

  const totalPages =
    rowsPerPage === -1 ? 1 : Math.ceil(totalCount / rowsPerPage);

  const startRecord = rowsPerPage === -1 ? 1 : page * rowsPerPage + 1;

  const endRecord =
    rowsPerPage === -1
      ? totalCount
      : Math.min((page + 1) * rowsPerPage, totalCount);
  const handleChangeRowsPerPage = (e: SelectChangeEvent<number>) => {
    const value = Number(e.target.value);
    setRowsPerPage(value);
    setPage(0);
  };
  const renderPageButtons = () => {
    const pages: Array<number | string> = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else if (page <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages - 1, totalPages);
    } else if (page >= totalPages - 4) {
      pages.push(
        1,
        2,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(1, 2, "...", page + 1, "...", totalPages - 1, totalPages);
    }

    return pages.map((item, index) =>
      typeof item === "number" ? (
        <CustomButton
          key={item}
          size="small"
          variant={item === page + 1 ? "outlined" : "text"}
          onClick={() => setPage(item - 1)}
          sx={{
            minWidth: 32,
            borderRadius: "134px",
            px: "10px",
            py: "6px",
            fontWeight: item === page + 1 ? 600 : 400,
            ...(item !== page + 1 && {
              color: "#444444",
            }),
          }}
        >
          {item}
        </CustomButton>
      ) : (
        <Typography
          key={`${item}-${index}`}
          sx={{ mx: 1, color: "text.secondary" }}
        >
          {item}
        </Typography>
      ),
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#F0F3F8",
        height: "90vh",
      }}
    >
      <Box
        sx={{
          // height:"100%",
          width: "100%",
          backgroundColor: "transparent",
          ...columnFlex,
          margin: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 0.7,
            pl: 2,
            borderRadius: "20px 20px 0 0",
            backgroundColor: "#004A80",
            color: "#FFFFFF",
          }}
        >
          <Typography component="span" className="gap-1">
            {selectedPool ? selectedPool.replace(/_/g, " ") : ""}
          </Typography>
          {(selectedPool == "Leave Management" ||
            selectedPool == "UW Details") && (
              <CustomButton
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "white",
                  color: "#063E6F",
                  fontWeight: 700,
                  fontSize: "14px",
                  "&:hover": {
                    backgroundColor: "white",
                  },
                  mr: 2,
                }}
              >
                + Add
              </CustomButton>
            )}
        </Box>
        {selectedPool != "Search Applications" && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                top: 8,
                right: 24,
                gap: 1,
                backgroundColor: "#fff",
              }}
            >
              {/* Search bar , Filter Icon , Settings Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                {/* Search container */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flex: 1,
                  }}
                >
                  {/* Search input (expands to left) */}
                  <Box
                    sx={{
                      overflow: isSearchOpen ? "" : "hidden",
                      width: isSearchOpen ? 240 : 0,
                      transition: "width 0.3s ease",
                      ml: isSearchOpen ? 1 : 0,
                      mr: isSearchOpen ? 8 : 0,
                    }}
                  >
                    <SearchBar onSearch={setSearchText} focusColor="#004A80" />
                  </Box>

                  {/* Search icon */}
                  <Box
                    sx={{
                      width: 40, // 👈 important
                      display: "flex",
                      justifyContent: "center",
                      flexShrink: 0,
                      cursor: hasTableData ? "pointer" : "not-allowed",
                      opacity: hasTableData ? 1 : 0.4,
                    }}
                    onClick={() => {
                      if (!hasTableData) return;
                      setIsSearchOpen((prev) => !prev);
                    }}
                    aria-disabled={!hasTableData}
                    data-testid="search-toggle"
                  >
                    <SearchIcon />
                  </Box>
                </Box>
              </Box>
              {/* Right icons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
                  sx={{
                    cursor: hasTableData ? "pointer" : "not-allowed",
                    opacity: hasTableData ? 1 : 0.4,
                  }}
                  onClick={() => {
                    if (!hasTableData) return;
                    setOpenFilterDialog(true);
                  }}
                  aria-disabled={!hasTableData}
                  data-testid="filter-toggle"
                >
                  <FilterIcon />
                </Box>
                <Box
                  sx={{
                    cursor: hasTableData ? "pointer" : "not-allowed",
                    opacity: hasTableData ? 1 : 0.4,
                  }}
                  onClick={() => {
                    if (!hasTableData) return;
                    openColumnDialog();
                    setOpenTransferDialog(true);
                  }}
                  aria-disabled={!hasTableData}
                  data-testid="settings-toggle"
                >
                  <SettingsIcon />
                </Box>
              </Box>
            </Box>

            <Paper
              sx={{
                height: "100%",
                width: "100%",
                ...columnFlex,
                borderRadius: "0 0 20px 20px",
              }}
            >
              <TableContainer
                component={Paper}
                sx={{
                  flexGrow: 1,
                  overflowX: "auto",
                }}
              >
                <Table sx={{ tableLayout: "auto", minWidth: "max-content" }} stickyHeader>
                  {hasTableData && (
                    <TableHead sx={{ backgroundColor: "#E9EEF3" }}>
                      {headerContent()}
                    </TableHead>
                  )}
                  <TableBody>
                    {paginatedRows.map((row) => {
                      const poolTatHours = getPoolTatHours(row);
                      const isPoolTatCritical =
                        poolTatHours !== null && poolTatHours <= 1;

                      return (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            cursor: "pointer",
                            backgroundColor: isPoolTatCritical ? "#FDE8E8" : "inherit",
                            "& td": {
                              color: isPoolTatCritical ? "#9A2529" : "inherit",
                            },
                            "&:hover": {
                              backgroundColor: isPoolTatCritical ? "#FDE8E8" : "#f5faff",
                            },
                          }}
                        >
                          {visibleColumns.map((col) => {
                            const cellValue = row[col.key];
                            return (
                              <TableCell
                                key={String(col.key)}
                                sx={{ p: 1.5, pl: 2, fontSize: "13px" }}
                              >
                                {col.key === "drc" ? (
                                  <Badge
                                    label={row.drc}
                                    variant={
                                      row.drc === "Medium"
                                        ? "Medium"
                                        : row.drc === "Low"
                                          ? "Low"
                                          : "High"
                                    }
                                  />
                                ) : col.key === "applicationNo" ? (
                                  <Typography
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: 600,
                                      fontSize: "13px",
                                      color: isPoolTatCritical ? "#9A2529" : "#0E3762",
                                      "&:hover": { textDecoration: "underline" },
                                    }}
                                    onClick={(e) => {
                                      void handleApplicationClick(e, row);
                                    }}
                                  >
                                    {row.applicationNo}
                                  </Typography>
                                ) : (
                                  String(cellValue ?? "")
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                    {paginatedRows.length <= 0 && (
                     <TableRow>
                        <TableCell
                          colSpan={visibleColumns.length}
                          sx={{
                            height: "60vh",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          No Data Found!
                        </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Footer Pagination */}
              {paginatedRows.length > 0 && ( <Box
                sx={{
                  borderTop: "1px solid #e0e0e0",
                  px: 2,
                  py: 1.5,
                  borderRadius: "0 0 20px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 14, color: "#444444" }}>
                      Show
                    </Typography>
                    <Select
                      value={rowsPerPage}
                      size="small"
                      onChange={handleChangeRowsPerPage}
                      sx={{
                        minWidth: 80,
                        height: 34,
                        fontSize: 14,
                      }}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={-1}>All</MenuItem>
                    </Select>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <CustomButton
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      <KeyLeftArrowIcon />
                      Previous
                    </CustomButton>

                    {renderPageButtons()}

                    <CustomButton
                      onClick={() =>
                        setPage(Math.min(totalPages - 1, page + 1))
                      }
                      disabled={page >= totalPages - 1}
                    >
                      Next
                      <KeyRightArrowIcon />
                    </CustomButton>
                  </Box>

                  <Typography sx={{ fontSize: 14, color: "#444444" }}>
                    Showing {startRecord}-{endRecord} of {totalCount}
                  </Typography>
                </Box>
              </Box>)}
             
            </Paper>
            {/*  ------- Filter table ------------ */}

            <FilterTable
              openFilterDialog={openFilterDialog}
              setOpenFilterDialog={setOpenFilterDialog}
              filterValues={filterValues}
              setFilterValues={setFilterValues}
              visibleColumns={visibleColumns}
              rows={rows}
              onApply={() => setPage(0)}
            />
            {/*  ------- Custom table ------------ */}
            <CustomDialog
              open={openTransferDialog}
              onClose={() => setOpenTransferDialog(false)}
              title="Customize Columns"
              maxWidth="md"
              fullWidth
              titleSx={{ ...modalTitleStyles }}
              contentSx={{ p: 3 }}
              actionsSx={{ justifyContent: "center", pb: 3 }}
              actions={
                <CustomButton
                  variant="contained"
                  onClick={handleApply}
                  sx={{ width: "150px", borderRadius: "50px" }}
                >
                  Apply
                </CustomButton>
              }
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {customList("Available", left)}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <CustomButton
                    sx={{ my: 1 }}
                    variant="outlined"
                    size="small"
                    onClick={moveRight}
                    disabled={
                      checked.filter((c) => left.includes(c)).length === 0
                    }
                  >
                    <Box component="span">›</Box>
                  </CustomButton>
                  <CustomButton
                    sx={{ my: 1 }}
                    variant="outlined"
                    size="small"
                    disabled={
                      checked.filter((c) => right.includes(c)).length === 0
                    }
                    onClick={moveLeft}
                  >
                    {" "}
                    <Box component="span">‹</Box>
                  </CustomButton>
                </Box>

                {customList("Visible", right)}
              </Box>
            </CustomDialog>
          </>
        )}
        {selectedPool == "Search Applications" && (
          <>
            <SearchApplication />
          </>
        )}
      </Box>
      <Snackbar
        open={Boolean(claimError)}
        autoHideDuration={3000}
        onClose={() => setClaimError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setClaimError("")}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {claimError}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default RightPanel;
