import {
  Box,
  List,
  ListItem,
  MenuItem,
  Paper,
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
//import { poolAllowedColumns } from "../../store/pool.columns.config";
import { useColumnConfig } from "../../hooks/useColumnConfig";
import Badge from "../../components/ui/Badge/Badge";
import { useNavigate } from "react-router-dom";
import FilterTable from "./FilterTable";
import { getDRSPath } from "../../routes/routes";
import SearchApplication from "./SearchApplication";
import { toFilterComparableValue } from "../../utils/filter.ts";

type SortDirection = "asc" | "desc";

const RightPanel = ({
  selectedPool,
  rows,
}: {
  selectedPool: string;
  rows: tableData[];
}) => {
  const navigate = useNavigate();
  const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);

  // ---------------- STATES ----------------

  const userId = "abc";
  const { config, updateConfig } = useColumnConfig(userId, selectedPool);

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
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>(
    {},
  );

  const visibleColumns = allColumns.filter((col) =>
    config.visible.includes(col.key),
  );
  // ---------------- OPEN DIALOG ----------------
  const openColumnDialog = () => {
    setLeft(config.hidden);
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
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: column.numeric ? "flex-end" : "flex-start",
              gap: 0.5,
            }}
          >
            <Typography
              component="span"
              sx={{ fontSize: "13px", fontWeight: "bold" }}
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
                label={item}
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
        height: "250vh",
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
            {selectedPool ? selectedPool : ""}
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
                      cursor: "pointer",
                    }}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                  >
                    <SearchIcon />
                  </Box>
                </Box>
              </Box>
              {/* Right icons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
                  sx={{ cursor: "pointer" }}
                  onClick={() => setOpenFilterDialog(true)}
                >
                  <FilterIcon />
                </Box>
                <Box
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    openColumnDialog();
                    setOpenTransferDialog(true);
                  }}
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
                  overflowX: "hidden",
                }}
              >
                <Table sx={{ tableLayout: "auto" }} stickyHeader>
                  <TableHead sx={{ backgroundColor: "#E9EEF3" }}>
                    {headerContent()}
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#f5faff" },
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
                                    color: "#0E3762",
                                    "&:hover": { textDecoration: "underline" },
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    localStorage.setItem(
                                      "roleType",
                                      row.roleType,
                                    );
                                    navigate(
                                      getDRSPath("retail", row.applicationNo),
                                    );
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
                    ))}
                    {paginatedRows.length <= 0 && (
                      <Typography
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        No Data Found!
                      </Typography>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Footer Pagination */}
              <Box
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
              </Box>
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
    </Box>
  );
};
export default RightPanel;
