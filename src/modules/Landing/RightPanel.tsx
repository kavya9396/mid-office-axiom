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
import CustomSelect from "../../components/ui/Select/Select";
import CustomTextField from "../../components/ui/TextField/TextField";
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
import { useEffect, useMemo, useState } from "react";
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
type PoolStatusFilter = "All" | "Active" | "Error";
type TaskTimingStatus = "normal" | "atRisk" | "due";
type TaskTimingColumnKey = "start_time" | "at_risk_time" | "due_date";


const IST_TIME_ZONE = "Asia/Kolkata";
const ISO_TIME_ZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i;
const TASK_TIMING_COLUMN_KEYS = new Set<TaskTimingColumnKey>(["start_time", "at_risk_time", "due_date"]);
const EXCLUDED_ROW_COLUMN_KEYS = new Set(["id", "taskid", "instanceid", "state"]);
const taskTimingFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
 
const TASK_TIMING_ROW_STYLES: Record<
  TaskTimingStatus,
  { backgroundColor: string; hoverColor: string; textColor: string }
> = {
  normal: {
    backgroundColor: "inherit",
    hoverColor: "#f5faff",
    textColor: "inherit",
  },
  atRisk: {
    backgroundColor: "#FFF4D6",
    hoverColor: "#FFE9A8",
    textColor: "#7A4E00",
  },
  due: {
    backgroundColor: "#FDE8E8",
    hoverColor: "#FBD5D5",
    textColor: "#9A2529",
  },
};
 
const sanitizeFileNamePart = (value: string) =>
  value.trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "table";
 
const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const isAllowedRowColumnKey = (key: string) => !EXCLUDED_ROW_COLUMN_KEYS.has(key.toLowerCase());

const toColumnLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
 
const getExportValue = (value: unknown) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
 
  return String(value);
};
 
const getExportColumnKeys = (rows: tableData[]) => {
  const rowKeys = new Set<string>();
 
  rows.forEach((row) => {
    Object.keys(row as unknown as Record<string, unknown>).forEach((key) => {
      if (isAllowedRowColumnKey(key)) {
        rowKeys.add(key);
      }
    });
  });
 
  const configuredKeys = allColumns
    .map((column) => String(column.key))
    .filter((key) => rowKeys.has(key));
  const extraKeys = Array.from(rowKeys).filter(
    (key) => !configuredKeys.includes(key),
  );
 
  return [...configuredKeys, ...extraKeys];
};
 
const downloadRowsAsExcel = ({
  rows,
  columnKeys,
  columnLabels,
  selectedPool,
}: {
  rows: tableData[];
  columnKeys: string[];
  columnLabels: Map<string, string>;
  selectedPool: string;
}) => {
  const headerCells = columnKeys
    .map((key) => `<th>${escapeHtml(columnLabels.get(key) ?? key)}</th>`)
    .join("");
  const bodyRows = rows
    .map((row) => {
      const rowData = row as unknown as Record<string, unknown>;
      const cells = columnKeys
        .map(
          (key) =>
            `<td style="mso-number-format:'\\@';">${escapeHtml(getExportValue(rowData[key]))}</td>`,
        )
        .join("");
 
      return `<tr>${cells}</tr>`;
    })
    .join("");
  const worksheetName = escapeHtml(sanitizeFileNamePart(selectedPool).slice(0, 31));
  const workbook = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${worksheetName}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body>
</html>`;
  const blob = new Blob([workbook], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
 
  link.href = url;
  link.download = `${sanitizeFileNamePart(selectedPool)}_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
 
const getTimestamp = (value?: string) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return null;

  const utcValue = ISO_TIME_ZONE_PATTERN.test(trimmedValue) ? trimmedValue : `${trimmedValue}Z`;
  const timestamp = Date.parse(utcValue);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const formatTaskTimingValue = (value: unknown) => {
  if (typeof value !== "string") {
    return String(value ?? "");
  }

  const timestamp = getTimestamp(value);
  return timestamp === null ? value : `${taskTimingFormatter.format(new Date(timestamp))} IST`;
};
 
const getTaskTimingStatus = (row: tableData, now: number): TaskTimingStatus => {
  const startTime = getTimestamp(row.start_time);
  const atRiskTime = getTimestamp(row.at_risk_time);
  const dueDate = getTimestamp(row.due_date);
 
  if (startTime !== null && now < startTime) {
    return "normal";
  }
 
  if (dueDate !== null && now >= dueDate) {
    return "due";
  }
 
  if (atRiskTime !== null && now >= atRiskTime) {
    return "atRisk";
  }
 
  return "normal";
};
 
const roleMapper = {
  "CUW_TASK": "CUW Pool",
  "UW_TASK": "CUW Pool",
  "CMO_TASK": "CMO Pool",
  "CVT_TASK": "CVT Pool",
  "CPT_TASK": "CPT_TASK",
  "CPT_DATA_ENTRY_NMR_TASK": "CPT_TASK",
  "CPT_DATA_ENTRY_MR_TASK": "CPT_TASK",
  "DVT_TASK": "DVT Pool",
  "PIVV_TASK": "PIVV Pool",
  "PRE_ISSUANCE_SERVICING_TASK": "Pre Issuance Servicing Pool",
  "EXCEPTIONAL_TASK": "Exceptional Pool",
  "GUW_TASK": "GUW Pool",
  "HOD_TASK": "HOD Pool",
  "MMT_TASK": "MMT Pool",
  "SR_UW_TASK": "Sr UW Pool",
  "SUW_TASK": "SUW Pool",
  "VENDOR_CMO_TASK": "Vendor CMO Pool",
  "COPS_TASK": "COPS Pool",
  "IT_TASK": "IT Pool",
  "RI_TASK": "RI Pool",
  "SYSTEM_WAIT_POOL_AMR_MEDICAL": "System Wait Pool - Medical",
  "SYSTEM_WAIT_POOL_AMR_NON_MEDICAL": "System Wait Pool - Non Medical",
  "REQUIREMENT_POOL": "Requirement Pool",
  "CUW_CLAIM_AUDIT_TASK": "Claim Audit Pool",
  "ACCUITY_TASK": "Accuity Pool",
  "AMR_MEDICAL_TASK":"AMR_MEDICAL_TASK",
  "AMR_NON_MEDICAL_TASK":"AMR_NON_MEDICAL_TASK",
  "NON_MEDICAL_POOL":"AMR_NON_MEDICAL_TASK",
 
  "ECG_TASK": "ECG Pool",
  "TMT_TASK": "TMT Pool",
  "GRIEVANCE_TASK": "Grievance Pool",
  "RECONSIDERATION_TASK": "Reconsideration Pool",
  "REJECT_TASK": "Reject Pool",
  "READY_FOR_ISSUANCE_TASK": "Ready For Issuance Pool",
  "ISSUANCE_TASK":"ISSUANCE_TASK",
 
  "GUW_FORMAL_TASK": "GUW_FORMAL_TASK",
  "DVT_FORMAL_TASK": "DVT_FORMAL_TASK",
  "RISK_TASK":"RISK_TASK",
  "ACUITY_TASK":"ACUITY_TASK"
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
  const {
    config,
    updateConfig,
    allowedColumns,
    maxVisibleColumns,
  } = useColumnConfig(username, selectedPool, rows);
 
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
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [poolStatusFilter] =
    useState<PoolStatusFilter>("All");
  const [claimError, setClaimError] = useState("");
  const [addLeavesFormPool, setAddLeavesFormPool] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>(
    {},
  );
  const isLeaveManagementPool = selectedPool === "LEAVE_MANAGEMENT_POOL";
  const showAddLeavesForm = isLeaveManagementPool && addLeavesFormPool === selectedPool;
  console.log(showAddLeavesForm)
 
  // const hasPoolStatus = rows.some((row) => {
  //   const rowData = row as unknown as Record<string, unknown>;
  //   const poolStatus = rowData.poolStatus;
  //   return typeof poolStatus === "string" && poolStatus.trim().length > 0;
  // });
 
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 30000);
 
    return () => window.clearInterval(intervalId);
  }, []);

  const renderLeaveField = ({ label, disabled = false }: { label: string; disabled?: boolean }) => (
    <Box>
      <Typography sx={{ fontSize: "11px", color: "#555", mb: 0.7 }}>{label}</Typography>
      <CustomTextField
        placeholder="Select"
        disabled={disabled}
        fullWidth
        sx={{
          backgroundColor: disabled ? "#E9E9E9" : "#FFFFFF",
          borderRadius: "6px",
          "& .MuiOutlinedInput-root": {
            height: 31,
            borderRadius: "6px",
            fontSize: "12px",
          },
        }}
      />
    </Box>
  );

  const renderAddLeavesForm = () => (
    <Paper
      sx={{
        flexGrow: 1,
        p: 3,
        borderRadius: "0 0 6px 6px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#222", mb: 3 }}>
        Add Leaves
      </Typography>
      <Box
        sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "6px",
          p: 1.5,
          maxWidth: 960,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
            columnGap: 3,
            rowGap: 2,
            "@media (max-width: 900px)": {
              gridTemplateColumns: "repeat(2, minmax(180px, 1fr))",
            },
            "@media (max-width: 640px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {renderLeaveField({ label: "UW Name" })}
          {renderLeaveField({ label: "User ID", disabled: true })}
          <Box />
          {renderLeaveField({ label: "Leave Date From" })}
          {renderLeaveField({ label: "Leave Date Till" })}
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#555", mb: 0.7 }}>Leave Reason</Typography>
            <CustomSelect value="" options={[]} placeholder="Select" />
          </Box>
          {renderLeaveField({ label: "Case To Reassign To UW" })}
          {renderLeaveField({ label: "User ID", disabled: true })}
        </Box>
      </Box>
      <CustomButton
        variant="contained"
        sx={{
          mt: 4,
          minWidth: 164,
          height: 38,
          borderRadius: "22px",
          backgroundColor: "#A72A2F",
          color: "#FFFFFF",
          fontWeight: 700,
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#8F2428",
          },
        }}
      >
        Submit
      </CustomButton>
      <CustomButton
        variant="contained"
        sx={{
          mt: 4,
          ml:1,
          minWidth: 164,
          height: 38,
          borderRadius: "22px",
          backgroundColor: "#A72A2F",
          color: "#FFFFFF",
          fontWeight: 700,
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#8F2428",
          },
        }}
        onClick={() => setAddLeavesFormPool("")}
      >
        Close
      </CustomButton>
    </Paper>
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
          roleType: String(row.roleType ?? "").trim(),
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
 
  const columnByKey = useMemo(() => {
    const configuredColumns = new Map(allColumns.map((column) => [String(column.key), column]));

    allowedColumns.forEach((columnKey) => {
      if (!configuredColumns.has(columnKey)) {
        configuredColumns.set(columnKey, {
          key: columnKey as keyof tableData,
          label: toColumnLabel(columnKey),
        });
      }
    });

    return configuredColumns;
  }, [allowedColumns]);
  const visibleColumns = config.visible
    .map((columnKey) => columnByKey.get(columnKey))
    .filter((column): column is TableColumn<tableData> => Boolean(column));
  const exportColumnKeys = useMemo(() => getExportColumnKeys(rows), [rows]);
  const exportColumnLabels = useMemo(() => {
    const labels = new Map(allColumns.map((column) => [String(column.key), column.label]));
    exportColumnKeys.forEach((columnKey) => {
      if (!labels.has(columnKey)) {
        labels.set(columnKey, toColumnLabel(columnKey));
      }
    });

    return labels;
  }, [exportColumnKeys]);
  const hasTableData = rows.length > 0;
  // ---------------- OPEN DIALOG ----------------
  const openColumnDialog = () => {
    setLeft(config.hidden);
    setRight(config.visible);
    setChecked([]);
    setOpenTransferDialog(true);
  };
 
  // ---------------- MOVE LOGIC ----------------
  const handleToggle = (item: string) => () => {
    setChecked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };
 
  const moveRight = () => {
    const checkedFromAvailable = checked.filter((item) => left.includes(item));
    const availableSlots = maxVisibleColumns - right.length;
 
    if (availableSlots <= 0) {
      setClaimError(`Only ${maxVisibleColumns} columns can be visible at a time.`);
      return;
    }
 
    const itemsToMove = checkedFromAvailable.slice(0, availableSlots);
 
    if (checkedFromAvailable.length > availableSlots) {
      setClaimError(`Only ${maxVisibleColumns} columns can be visible at a time.`);
    }
 
    setLeft((prev) => prev.filter((item) => !itemsToMove.includes(item)));
    setRight((prev) => [...prev, ...itemsToMove]);
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
  const handleApply = async () => {
    try {
      await updateConfig({
        visible: right,
        hidden: left,
      });
 
      setOpenTransferDialog(false);
    } catch (error) {
      setClaimError(
        error instanceof Error
          ? error.message
          : "Failed to save column sequence.",
      );
    }
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
            fontWeight: "bold",
            fontSize: "12px",
            width: column.width,
            padding: "7px",
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
  const customList = (title: string, items: string[]) => {
    const isAvailableList = title === "Available";
 
    return (
      <Paper
        sx={{
          width: 300,
          height: 400,
          overflow: "hidden",
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
                  label={columnByKey.get(item)?.label ?? item}
                  checked={checked.includes(item)}
                  disabled={
                    isAvailableList &&
                    right.length >= maxVisibleColumns &&
                    !checked.includes(item)
                  }
                  onChange={handleToggle(item)}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };
 
  const filteredRows = rows
    .filter((row) => {
      if (poolStatusFilter === "All") return true;
 
      const rowData = row as unknown as Record<string, unknown>;
      const poolStatus = String(rowData.poolStatus ?? "").trim().toLowerCase();
 
      return poolStatus === poolStatusFilter.toLowerCase();
    })
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
 
  const handleDownloadExcel = () => {
    if (!sortedRows.length || !exportColumnKeys.length) return;
 
    downloadRowsAsExcel({
      rows: sortedRows,
      columnKeys: exportColumnKeys,
      columnLabels: exportColumnLabels,
      selectedPool,
    });
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
          margin: 1,
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
          {(isLeaveManagementPool || selectedPool == "UW Details") && (
              <CustomButton
                variant="contained"
                size="small"
                onClick={() => {
                  if (isLeaveManagementPool) {
                    setAddLeavesFormPool(selectedPool);
                  }
                }}
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
                {isLeaveManagementPool ? "Add Leaves" : "+ Add"}
              </CustomButton>
            )}
        </Box>
        {selectedPool != "Search Applications" && (
          <>
            {isLeaveManagementPool && showAddLeavesForm ? (
              renderAddLeavesForm()
            ) : (
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
                px: 2,
              }}
            >
              {/* {hasPoolStatus && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CustomButton
                    variant={poolStatusFilter === "Active" ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setPoolStatusFilter((prev) =>
                        prev === "Active" ? "All" : "Active",
                      );
                      setPage(0);
                    }}
                    sx={{
                      borderRadius: "999px",
                      textTransform: "none",
                      minWidth: "100px",
                    }}
                  >
                    Active Pool
                  </CustomButton>
                  <CustomButton
                    variant={poolStatusFilter === "Error" ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setPoolStatusFilter((prev) =>
                        prev === "Error" ? "All" : "Error",
                      );
                      setPage(0);
                    }}
                    sx={{
                      borderRadius: "999px",
                      textTransform: "none",
                      minWidth: "100px",
                    }}
                  >
                    Error Pool
                  </CustomButton>
                </Box>
              )} */}
              {/* Search bar , Filter Icon , Settings Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <CustomButton
                  size="small"
                  variant="outlined"
                  onClick={handleDownloadExcel}
                  disabled={!sortedRows.length}
                  sx={{
                    mr: 1,
                    whiteSpace: "nowrap",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  Download Excel
                </CustomButton>
                {/* Search container */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flex: 1,
                  }}
                >
                  {/* Search input */}
                  <Box
                    sx={{
                      width: isSearchOpen ? 280 : 0,
                      opacity: isSearchOpen ? 1 : 0,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      transition: "width 300ms ease-in-out, opacity 200ms ease-in-out",
                      ml: isSearchOpen ? 1 : 0,
                      mr: isSearchOpen ? 2 : 0,
                      pointerEvents: isSearchOpen ? "auto" : "none",
                      willChange: "width, opacity",
                    }}
                  >
                    <SearchBar onSearch={setSearchText} />
                  </Box>
 
                  {/* Search icon */}
                  <Box
                    sx={{
                      width: 40,
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
                <Box
                  sx={{
                    cursor: hasTableData ? "pointer" : "not-allowed",
                    opacity: hasTableData ? 1 : 0.4,
                    mt: 0.7
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
                    mt: 0.7
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
                      const taskTimingStatus = getTaskTimingStatus(row, currentTimeMs);
                      const taskTimingRowStyle = TASK_TIMING_ROW_STYLES[taskTimingStatus];
 
                      return (
                        <TableRow
                          key={`${selectedPool}-${row.applicationNo ?? ""}-${row.taskId ?? ""}-${row.id ?? ""}`}
                          hover
                          sx={{
                            cursor: "pointer",
                            backgroundColor: taskTimingRowStyle.backgroundColor,
                            "& td": {
                              color: taskTimingRowStyle.textColor,
                            },
                            "&:hover": {
                              backgroundColor: taskTimingRowStyle.hoverColor,
                            },
                          }}
                        >
                          {visibleColumns.map((col) => {
                            const cellValue = row[col.key];
                            const displayValue = TASK_TIMING_COLUMN_KEYS.has(col.key as TaskTimingColumnKey)
                              ? formatTaskTimingValue(cellValue)
                              : String(cellValue ?? "");

                            return (
                              <TableCell
                                key={String(col.key)}
                                sx={{  padding:"7px", fontSize: "11px" }}
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
                                      fontSize: "11px",
                                      color: taskTimingStatus === "normal" ? "#0E3762" : taskTimingRowStyle.textColor,
                                      "&:hover": { textDecoration: "underline" },
                                    }}
                                    onClick={(e) => {
                                      void handleApplicationClick(e, row);
                                    }}
                                  >
                                    {row.applicationNo}
                                  </Typography>
                                ) : (
                                  displayValue
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
              {paginatedRows.length > 0 && (<Box
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
                      checked.filter((c) => left.includes(c)).length === 0 ||
                      right.length >= maxVisibleColumns
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
 
 