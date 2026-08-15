import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";

import { useAppSelector } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import type { AdditionalRequirementRow } from "../../../types/drs.types";
import {
  CloseIcon,
  FilterIcon,
} from "../../../icons/Icons";

interface RequirementManagementTableProps {
  requirements: AdditionalRequirementRow[];
  onSave?: (rows: AdditionalRequirementRow[]) => void | Promise<void>;
  onAddRequirement?: () => void;
}

interface MiscMasterItem {
  code?: string;
  description?: string;
  value?: string;
  isActive?: string;
  type?: string;
  miscMastId?: string;
}

interface MasterDataResponse {
  misc?: MiscMasterItem[];
  data?: {
    misc?: MiscMasterItem[];
    data?: {
      misc?: MiscMasterItem[];
    };
  };
}

interface SaveValidationResult {
  isValid: boolean;
  message: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

const ROWS_PER_PAGE = 5;
const COLUMN_HEADINGS = [
  "Actions",
  "Status",
  "OCR Status",
  "Profile",
  "Category",
  "Sub Category",
  "Document",
  "Reason",
  "Special Test",
  "FUP Code",
  "Extra Remarks",
  "Description",
] as const;

const DEFAULT_COLUMN_WIDTHS = [
  60, 130, 105, 100, 115, 125, 130, 160, 110, 95, 105, 90,
];
const MIN_COLUMN_WEIGHT = 30;

type FilterField = "profile" | "category" | "subCategory" | "fupCode";

const FILTERABLE_COLUMNS: Partial<Record<(typeof COLUMN_HEADINGS)[number], FilterField>> = {
  Profile: "profile",
  Category: "category",
  "Sub Category": "subCategory",
  "FUP Code": "fupCode",
};

const EMPTY_FILTERS: Record<FilterField, string[]> = {
  profile: [],
  category: [],
  subCategory: [],
  fupCode: [],
};

const FILTER_LABELS: Array<{ field: FilterField; label: string }> = [
  { field: "category", label: "Category" },
  { field: "subCategory", label: "Sub Category" },
  { field: "profile", label: "Profile" },
  { field: "fupCode", label: "FUP Code" },
];

const normalizeText = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value).trim();

const getExtraRemarks = (row: AdditionalRequirementRow): unknown => {
  const requirementRow = row as unknown as Record<string, unknown>;

  return requirementRow.extraRemarks ?? requirementRow.extraRemark;
};

const formatStatus = (status: unknown): string => {
  const value = normalizeText(status);

  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const getStatusComparableValue = (value: unknown): string =>
  normalizeText(value).toUpperCase();

const validateRequirementsForSave = (
  rows: AdditionalRequirementRow[],
  roleType: string,
): SaveValidationResult => {
  switch (roleType) {
    case "PIVV_TASK": {
      const hasPendingRequirement = rows.some(
        (row) => getStatusComparableValue(row.status) === "PENDING",
      );

      if (hasPendingRequirement) {
        return {
          isValid: false,
          message:
            "Please take action on all pending requirements before saving.",
        };
      }

      return { isValid: true, message: "" };
    }

    case "CVT_TASK":
      /*
       * Saving is mandatory for CVT even when no status was changed.
       * Therefore this role intentionally has no change-comparison check.
       */
      return { isValid: true, message: "" };

    default:
      return { isValid: true, message: "" };
  }
};

const EyeDetailIcon = () => (
  <Box
    component="span"
    sx={{
      position: "relative",
      display: "inline-flex",
      width: 14,
      height: 14,
      alignItems: "center",
      justifyContent: "center",
      border: "1.6px solid currentColor",
      borderRadius: "70% 15%",
      transform: "rotate(45deg)",
      boxSizing: "border-box",
    }}
  >
    <Box
      component="span"
      sx={{
        width: 4.5,
        height: 4.5,
        borderRadius: "50%",
        bgcolor: "currentColor",
      }}
    />
  </Box>
);

const filterRequirementsByRole = (
  requirements: AdditionalRequirementRow[],
  roleType: string,
): AdditionalRequirementRow[] => {
  const normalizedRoleType = normalizeText(roleType).toUpperCase();

  if (normalizedRoleType === "CPT_DATA_ENTRY_NMR_TASK") {
    return requirements.filter(
      (row) => normalizeText(row.category).toUpperCase() === "FINANCIAL",
    );
  }
    if (normalizedRoleType === "CPT_DATA_ENTRY_MR_TASK") {
    return requirements.filter(
      (row) => normalizeText(row.category).toUpperCase() === "MEDICAL",
    );
  }

  if (normalizedRoleType === "PIVV_TASK") {
    return requirements.filter(
      (row) => normalizeText(row.fupCode).toUpperCase() === "PIV",
    );
  }

  return requirements;
};

const RequirementManagementTable = ({
  requirements,
  onSave,
  onAddRequirement,
}: RequirementManagementTableProps) => {
  const roleType = localStorage.getItem("roleType") ?? "";
  const normalizedRoleType = normalizeText(roleType).toUpperCase();
  const isNonEditable = [
    "AMR_MEDICAL_TASK",
    "AMR_NON_MEDICAL_TASK",
    "RECONSIDERATION_TASK",
  ].includes(normalizedRoleType);
  const isAddRequirementEnabled =
    Boolean(onAddRequirement) && !isNonEditable;
  const isSaveButtonVisible = normalizedRoleType !== "AMR_MEDICAL_TASK";

  const roleBasedRequirements = useMemo(
    () => filterRequirementsByRole(requirements, roleType),
    [requirements, roleType],
  );

  const masterData = useAppSelector(
    (state: RootState) => state.masterData,
  ) as MasterDataResponse;

  const [rows, setRows] = useState<AdditionalRequirementRow[]>(
    roleBasedRequirements,
  );

  const [previousRequirements, setPreviousRequirements] =
    useState(roleBasedRequirements);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilterField, setSelectedFilterField] =
    useState<FilterField>("category");
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);

  const [selectedDetail, setSelectedDetail] = useState<{
    title: string;
    value: string;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  /*
   * Reset local edits when a new requirements array is received.
   * This guarded render update avoids synchronously setting state
   * inside an effect and React completes the rerender before children
   * are committed.
   */
  if (previousRequirements !== roleBasedRequirements) {
    setPreviousRequirements(roleBasedRequirements);
    setRows(roleBasedRequirements);
    setPage(1);
  }

  /*
   * Supports common master API response structures:
   *
   * state.masterData.misc
   * state.masterData.data.misc
   * state.masterData.data.data.misc
   */
  const miscData = useMemo<MiscMasterItem[]>(() => {
    if (Array.isArray(masterData?.misc)) {
      return masterData.misc;
    }

    if (Array.isArray(masterData?.data?.misc)) {
      return masterData.data.misc;
    }

    if (Array.isArray(masterData?.data?.data?.misc)) {
      return masterData.data.data.misc;
    }

    return [];
  }, [masterData]);

  const statusOptions = useMemo(
    () =>
      miscData.filter(
        (item) =>
          normalizeText(item.type).toUpperCase() === "REQT_ST" &&
          normalizeText(item.isActive).toUpperCase() !== "N",
      ),
    [miscData],
  );

  const filterOptions = useMemo(() => {
    const fields = Object.values(FILTERABLE_COLUMNS) as FilterField[];

    return fields.reduce<Record<FilterField, string[]>>(
      (options, field) => {
        options[field] = Array.from(
          new Set(rows.map((row) => normalizeText(row[field])).filter(Boolean)),
        ).sort((first, second) =>
          first.localeCompare(second, undefined, { sensitivity: "base" }),
        );
        return options;
      },
      { ...EMPTY_FILTERS },
    );
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        (Object.keys(filters) as FilterField[]).every((field) => {
          const selectedValues = filters[field];

          return (
            selectedValues.length === 0 ||
            selectedValues.some(
              (value) =>
                normalizeText(value).toUpperCase() ===
                normalizeText(row[field]).toUpperCase(),
            )
          );
        }),
      ),
    [filters, rows],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRows.length / ROWS_PER_PAGE),
  );

  const visibleRows = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;

    return filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredRows, page]);

  const gridTemplateColumns = columnWidths
    .map((width) => `minmax(0, ${width}fr)`)
    .join(" ");

  const handleColumnResizeStart = (
    columnIndex: number,
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = columnWidths[columnIndex];
    const adjacentIndex =
      columnIndex === columnWidths.length - 1
        ? columnIndex - 1
        : columnIndex + 1;
    const startAdjacentWidth = columnWidths[adjacentIndex];
    const combinedWidth = startWidth + startAdjacentWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const direction =
        columnIndex === columnWidths.length - 1 ? -1 : 1;
      const widthChange =
        ((moveEvent.clientX - startX) / 6) * direction;
      const nextWidth = Math.min(
        combinedWidth - MIN_COLUMN_WEIGHT,
        Math.max(MIN_COLUMN_WEIGHT, startWidth + widthChange),
      );
      const nextAdjacentWidth = combinedWidth - nextWidth;

      setColumnWidths((currentWidths) =>
        currentWidths.map((width, index) =>
          index === columnIndex
            ? nextWidth
            : index === adjacentIndex
              ? nextAdjacentWidth
              : width,
        ),
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleOpenFilterDialog = () => {
    setDraftFilters({
      profile: [...filters.profile],
      category: [...filters.category],
      subCategory: [...filters.subCategory],
      fupCode: [...filters.fupCode],
    });
    setFilterDialogOpen(true);
  };

  const handleDraftFilterToggle = (field: FilterField, value: string) => {
    setDraftFilters((currentFilters) => {
      const selectedValues = currentFilters[field];

      return {
        ...currentFilters,
        [field]: selectedValues.includes(value)
          ? selectedValues.filter((item) => item !== value)
          : [...selectedValues, value],
      };
    });
  };

  const handleClearAllFilters = () => {
    setDraftFilters({ ...EMPTY_FILTERS });
  };

  const handleApplyFilters = () => {
    setFilters({
      profile: [...draftFilters.profile],
      category: [...draftFilters.category],
      subCategory: [...draftFilters.subCategory],
      fupCode: [...draftFilters.fupCode],
    });
    setPage(1);
    setFilterDialogOpen(false);
  };

  const handleClearAppliedFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
    setDraftFilters({ ...EMPTY_FILTERS });
    setPage(1);
  };

  const handleStatusChange = (
    requirementId: unknown,
    event: SelectChangeEvent<string>,
  ) => {
    const selectedStatus = event.target.value;

    setRows((currentRows) =>
      currentRows.map((row, rowIndex) => {
        const currentId = normalizeText(row.requirementId);

        const targetId = normalizeText(requirementId);

        /*
         * requirementId should be the unique identifier.
         * Index fallback prevents rows without an ID from
         * all being updated together.
         */
        const isMatchingRow = targetId
          ? currentId === targetId
          : rowIndex ===
            (page - 1) * ROWS_PER_PAGE +
              visibleRows.findIndex((visibleRow) => visibleRow === row);

        return isMatchingRow
          ? {
              ...row,
              status: selectedStatus,
            }
          : row;
      }),
    );
  };

  const handleRemove = (requirementId: unknown) => {
    const targetId = normalizeText(requirementId);

    if (!targetId) {
      return;
    }

    setRows((currentRows) =>
      currentRows.filter(
        (row) => normalizeText(row.requirementId) !== targetId,
      ),
    );

    const remainingRows = rows.length - 1;
    const updatedPageCount = Math.max(
      1,
      Math.ceil(remainingRows / ROWS_PER_PAGE),
    );

    if (page > updatedPageCount) {
      setPage(updatedPageCount);
    }
  };

  const handleSave = async () => {
    const validation = validateRequirementsForSave(rows, normalizedRoleType);

    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: validation.message,
        severity: "error",
      });
      return;
    }

    try {
      await onSave?.(rows);
      setSnackbar({
        open: true,
        message: "Requirements saved successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to save requirements. Please try again.",
        severity: "error",
      });
    }
  };

  const cellTextStyles = {
    width: "100%",
    minWidth: 0,
    fontSize: "11px",
    color: "#4f4f4f",
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const renderCompactCell = (value: unknown) => {
    const text = normalizeText(value);

    return (
      <Tooltip title={text} arrow disableHoverListener={!text}>
        <Typography sx={cellTextStyles}>{text || "-"}</Typography>
      </Tooltip>
    );
  };

  const renderDetailAction = (title: string, value: unknown) => {
    const text = normalizeText(value);

    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tooltip title={text || `No ${title.toLowerCase()} available`} arrow>
          <span>
            <IconButton
              size="small"
              disabled={!text}
              aria-label={`View ${title}`}
              onClick={() => setSelectedDetail({ title, value: text })}
              sx={{
                width: 24,
                height: 24,
                p: 0,
                color: "#075184",
                border: "1px solid transparent",
                "&:hover": {
                  borderColor: "#b9d1e0",
                  bgcolor: "#edf5fa",
                },
                "&.Mui-disabled": {
                  color: "#b8c0c5",
                },
              }}
            >
              <EyeDetailIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {isAddRequirementEnabled && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onAddRequirement}
            sx={{
              borderColor: "#0a5285",
              color: "#0a5285",
              bgcolor: "#ffffff",
              minHeight: 30,
              borderRadius: "6px",
              px: 1.5,
              py: 0.35,
              fontSize: "12px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#073f68",
                bgcolor: "#f4f8fb",
              },
            }}
          >
            Add Requirement
          </Button>
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          border: "1px solid #d5dbe1",
          borderRadius: "10px",
          overflow: "hidden",
          overflowX: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns,
            alignItems: "center",
            columnGap: "4px",
            bgcolor: "#E45F14",
            color: "#FFF",
            borderBottom: "1px solid #d5dbe1",
            minHeight: 36,
            px: 0.75,
            py: 0.45,
            boxSizing: "border-box",
          }}
        >
          {COLUMN_HEADINGS.map((heading, columnIndex) => (
            <Box
              key={heading}
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Typography
                component="span"
                sx={{
                  appearance: "none",
                  border: 0,
                  p: 0,
                  bgcolor: "transparent",
                  fontFamily: "inherit",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  color: "#FFF",
                  lineHeight: 1.15,
                  whiteSpace: "normal",
                  overflow: "hidden",
                  minWidth: 0,
                  cursor: "default",
                }}
              >
                {heading}
              </Typography>

              <Box
                onMouseDown={(event) =>
                  handleColumnResizeStart(columnIndex, event)
                }
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "7px",
                  height: "100%",
                  cursor: "col-resize",
                  borderRight: "1px solid rgba(255,255,255,0.3)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.22)",
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 0.6,
            minHeight: 36,
            px: 0.75,
            py: 0.3,
            bgcolor: "#fafbfc",
            borderBottom: "1px solid #e1e5e8",
            boxSizing: "border-box",
          }}
        >
          {Object.values(filters).some((values) => values.length > 0) && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearAppliedFilters}
              sx={{
                minWidth: 0,
                height: 28,
                px: 1,
                borderColor: "#c73434",
                borderRadius: "7px",
                color: "#c73434",
                bgcolor: "#ffffff",
                fontSize: "10.5px",
                fontWeight: 600,
                lineHeight: 1,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#a52227",
                  bgcolor: "#fff5f5",
                },
              }}
            >
              Clear filters
            </Button>
          )}

          <Tooltip title="Filter requirements">
            <IconButton
              size="small"
              onClick={handleOpenFilterDialog}
              sx={{
                width: 30,
                height: 28,
                border: "1px solid #dfe3e7",
                borderRadius: "7px",
                color: Object.values(filters).some(
                  (values) => values.length > 0,
                )
                  ? "#E45F14"
                  : "#555555",
                bgcolor: Object.values(filters).some(
                  (values) => values.length > 0,
                )
                  ? "#fff1e6"
                  : "#ffffff",
                "&:hover": {
                  borderColor: "#E45F14",
                  bgcolor: "#fff5ee",
                },
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {visibleRows.length > 0 ? (
          visibleRows.map((row, visibleIndex) => {
            const absoluteIndex = (page - 1) * ROWS_PER_PAGE + visibleIndex;

            const rowKey =
              normalizeText(row.requirementId) ||
              `${normalizeText(row.fupCode)}-${absoluteIndex}`;

            const currentStatus = normalizeText(row.status);

            const matchingStatusOption = statusOptions.find((option) => {
              const optionValues = [
                option.code,
                option.value,
                option.description,
              ].map(getStatusComparableValue);

              return optionValues.includes(
                getStatusComparableValue(currentStatus),
              );
            });

            /*
             * Keep the API status value when it already
             * matches a master record. Otherwise show the
             * formatted API value.
             */
            const selectedStatus =
              matchingStatusOption?.value ||
              matchingStatusOption?.description ||
              matchingStatusOption?.code ||
              formatStatus(currentStatus);

            return (
              <Box
                key={rowKey}
                sx={{
                  display: "grid",
                  gridTemplateColumns,
                  alignItems: "center",
                  columnGap: "4px",
                  position: "relative",
                  minHeight: 36,
                  px: 0.75,
                  py: 0.15,
                  boxSizing: "border-box",
                  bgcolor: absoluteIndex % 2 === 0 ? "#ffffff" : "#fafbfc",
                  borderBottom:
                    visibleIndex === visibleRows.length - 1
                      ? "none"
                      : "1px solid #e0e0e0",
                  "&:hover": {
                    bgcolor: "#f3f7fa",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title="Remove requirement">
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(row.requirementId)}
                      sx={{
                        width: 24,
                        height: 24,
                        p: 0,
                        border: "1px solid #d9e2ea",
                        color: "#78909c",
                        fontSize: "16px",
                        "&:hover": {
                          borderColor: "#d32f2f",
                          color: "#d32f2f",
                          bgcolor: "#fff5f5",
                        },
                      }}
                    >
                      <CloseIcon/>
                    </IconButton>
                  </Tooltip>
                </Box>

                <Select
                  size="small"
                  value={selectedStatus}
                  disabled={
                    isNonEditable ||
                    ["ACCEPT", "ACCEPTED"].includes(
                      getStatusComparableValue(currentStatus),
                    )
                  }
                  onChange={(event) =>
                    handleStatusChange(row.requirementId, event)
                  }
                  displayEmpty
                  sx={{
                    width: "70%",
                    minWidth: 0,
                    height: 25,
                    borderRadius: "6px",
                    bgcolor: "#ffffff",
                    fontSize: "11px",
                    "& .MuiSelect-select": {
                      minWidth: "0 !important",
                      px: 0.6,
                      py: 0.35,
                      pr: "20px !important",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    },
                    "& .MuiSelect-icon": {
                      right: 1,
                      fontSize: 17,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cfd8e1",
                    },
                  }}
                >
                  {!selectedStatus && (
                    <MenuItem value="" disabled>
                      Select
                    </MenuItem>
                  )}

                  {selectedStatus && !matchingStatusOption && (
                    <MenuItem value={selectedStatus}>{selectedStatus}</MenuItem>
                  )}

                  {statusOptions.map((option) => {
                    const optionValue =
                      normalizeText(option.value) ||
                      normalizeText(option.description) ||
                      normalizeText(option.code);

                    return (
                      <MenuItem
                        key={
                          option.miscMastId || `${option.code}-${optionValue}`
                        }
                        value={optionValue}
                      >
                        {option.description || option.value || option.code}
                      </MenuItem>
                    );
                  })}
                </Select>

                {renderCompactCell(row.ocrStatus)}

                {renderCompactCell(row.profile)}

                {renderCompactCell(row.category)}

                {renderCompactCell(row.subCategory)}

                {renderCompactCell(row.document)}

                {renderCompactCell(row.reason)}

                {renderCompactCell(row.specialTest)}

                {renderCompactCell(row.fupCode)}

                {renderDetailAction("Extra Remarks", getExtraRemarks(row))}

                {renderDetailAction("Description", row.description)}

              </Box>
            );
          })
        ) : (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                color: "#757575",
              }}
            >
              No requirements available
            </Typography>
          </Box>
        )}
      </Box>

      {filteredRows.length > ROWS_PER_PAGE && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 1,
          }}
        >
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#555555",
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                color: "#ffffff",
                bgcolor: "#E45F14",
                "&:hover": {
                  bgcolor: "#E45F14",
                },
              },
            }}
            size="small"
          />
        </Box>
      )}

      {isSaveButtonVisible && (
        <Box sx={{ mt: 1, mb: 0.5, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={rows.length === 0}
            sx={{
              minWidth: 170,
              borderRadius: "28px",
              bgcolor: "#ad252a",
              py: 0.65,
              textTransform: "none",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#941f24",
                boxShadow: "none",
              },
            }}
          >
            Save
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={(_, reason) => {
          if (reason !== "clickaway") {
            setSnackbar((currentSnackbar) => ({
              ...currentSnackbar,
              open: false,
            }));
          }
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((currentSnackbar) => ({
              ...currentSnackbar,
              open: false,
            }))
          }
          sx={{ width: "100%", fontSize: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              width: "620px",
              maxWidth: "calc(100% - 24px)",
              minHeight: 430,
              borderRadius: "18px",
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 64,
            px: 2.25,
            py: 1,
            borderBottom: "1px solid #e1e4e7",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#075184" }}>
            FILTER
          </Typography>
          <IconButton
            size="small"
            onClick={() => setFilterDialogOpen(false)}
            sx={{
              width: 28,
              height: 28,
              border: "2px solid #075184",
              color: "#075184",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", p: "0 !important", minHeight: 290 }}>
          <Box
            sx={{
              width: "35%",
              flexShrink: 0,
              borderRight: "1px solid #e1e4e7",
              bgcolor: "#ffffff",
            }}
          >
            {FILTER_LABELS.map(({ field, label }) => {
              const isSelected = selectedFilterField === field;
              const selectedCount = draftFilters[field].length;

              return (
                <Button
                  key={field}
                  fullWidth
                  onClick={() => setSelectedFilterField(field)}
                  sx={{
                    minHeight: 54,
                    justifyContent: "space-between",
                    px: 1.5,
                    borderRadius: 0,
                    borderBottom: "1px solid #e1e4e7",
                    borderLeft: isSelected ? "4px solid #E45F14" : "4px solid transparent",
                    bgcolor: isSelected ? "#fff5ee" : "#ffffff",
                    color: isSelected ? "#E45F14" : "#4f4f4f",
                    fontSize: "13px",
                    fontWeight: isSelected ? 700 : 500,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#fff8f3" },
                  }}
                >
                  <span>{label}</span>
                  {selectedCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        minWidth: 20,
                        height: 20,
                        px: 0.5,
                        borderRadius: "10px",
                        bgcolor: "#E45F14",
                        color: "#ffffff",
                        fontSize: "10px",
                        lineHeight: "20px",
                      }}
                    >
                      {selectedCount}
                    </Box>
                  )}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ flex: 1, p: 1.75, overflowY: "auto", maxHeight: 290 }}>
            {filterOptions[selectedFilterField].length > 0 ? (
              filterOptions[selectedFilterField].map((option) => (
                <Box
                  key={option}
                  component="label"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 40,
                    px: 0.5,
                    borderRadius: "6px",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#fafafa" },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={draftFilters[selectedFilterField].includes(option)}
                    onChange={() =>
                      handleDraftFilterToggle(selectedFilterField, option)
                    }
                    sx={{
                      mr: 0.75,
                      color: "#b8b8b8",
                      "&.Mui-checked": { color: "#E45F14" },
                    }}
                  />
                  <Typography sx={{ fontSize: "13px", color: "#4f4f4f" }}>
                    {option}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ py: 2, textAlign: "center", fontSize: "13px", color: "#777" }}>
                No filter values available
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 1.5,
            minHeight: 78,
            px: 2,
            py: 1.25,
            borderTop: "1px solid #e1e4e7",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClearAllFilters}
            sx={{
              minWidth: 160,
              height: 42,
              borderRadius: "24px",
              borderColor: "#bd292f",
              color: "#bd292f",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              minWidth: 160,
              height: 42,
              borderRadius: "24px",
              bgcolor: "#bd292f",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#a52227", boxShadow: "none" },
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#0a5285",
          }}
        >
          {selectedDetail?.title}
        </DialogTitle>

        <DialogContent dividers>
          <Typography
            sx={{
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#404040",
              overflowWrap: "anywhere",
            }}
          >
            {selectedDetail?.value}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setSelectedDetail(null)}
            sx={{
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequirementManagementTable;
