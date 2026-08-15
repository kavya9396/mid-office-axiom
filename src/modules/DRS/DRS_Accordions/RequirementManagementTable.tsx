import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

import { useMemo, useState } from "react";

import { useAppSelector } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import type { AdditionalRequirementRow } from "../../../types/drs.types";

interface RequirementManagementTableProps {
  requirements: AdditionalRequirementRow[];
  onSave?: (rows: AdditionalRequirementRow[]) => void;
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

const ROWS_PER_PAGE = 5;

const normalizeText = (value: unknown): string =>
  value === null || value === undefined
    ? ""
    : String(value).trim();

const formatStatus = (status: unknown): string => {
  const value = normalizeText(status);

  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).toLowerCase()
  );
};

const getStatusComparableValue = (
  value: unknown,
): string => normalizeText(value).toUpperCase();

const RequirementManagementTable = ({
  requirements,
  onSave,
//   onAddRequirement,
}: RequirementManagementTableProps) => {
  const masterData = useAppSelector(
    (state: RootState) => state.masterData,
  ) as MasterDataResponse;

  const [rows, setRows] = useState<
    AdditionalRequirementRow[]
  >(requirements);

  const [previousRequirements, setPreviousRequirements] =
    useState(requirements);

  const [page, setPage] = useState(1);

  const [selectedDescription, setSelectedDescription] =
    useState("");

  /*
   * Reset local edits when a new requirements array is received.
   * This guarded render update avoids synchronously setting state
   * inside an effect and React completes the rerender before children
   * are committed.
   */
  if (previousRequirements !== requirements) {
    setPreviousRequirements(requirements);
    setRows(requirements);
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

    if (
      Array.isArray(masterData?.data?.data?.misc)
    ) {
      return masterData.data.data.misc;
    }

    return [];
  }, [masterData]);

  const statusOptions = useMemo(
    () =>
      miscData.filter(
        (item) =>
          normalizeText(item.type).toUpperCase() ===
            "REQT_ST" &&
          normalizeText(item.isActive).toUpperCase() !==
            "N",
      ),
    [miscData],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(rows.length / ROWS_PER_PAGE),
  );

  const visibleRows = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;

    return rows.slice(
      startIndex,
      startIndex + ROWS_PER_PAGE,
    );
  }, [page, rows]);

  const handleStatusChange = (
    requirementId: unknown,
    event: SelectChangeEvent<string>,
  ) => {
    const selectedStatus = event.target.value;

    setRows((currentRows) =>
      currentRows.map((row, rowIndex) => {
        const currentId = normalizeText(
          row.requirementId,
        );

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
              visibleRows.findIndex(
                (visibleRow) => visibleRow === row,
              );

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
        (row) =>
          normalizeText(row.requirementId) !==
          targetId,
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

  const handleSave = () => {
    onSave?.(rows);
  };

  const cellTextStyles = {
    width: "60%",
    minWidth: 0,
    fontSize: "11px",
    color: "#4f4f4f",
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  /*
   * minmax(0, ...) lets every column shrink inside the parent.
   * The table therefore keeps all 11 columns without horizontal scrolling.
   */
  const gridTemplateColumns =
    "36px minmax(0, 1.15fr) minmax(0, 0.85fr) minmax(0, 0.8fr) minmax(0, 0.9fr) minmax(0, 0.95fr) minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 0.8fr) minmax(0, 0.7fr) 40px";

  const renderCompactCell = (value: unknown) => {
    const text = normalizeText(value);

    return (
      <Tooltip title={text} arrow disableHoverListener={!text}>
        <Typography sx={cellTextStyles}>
          {text || "-"}
        </Typography>
      </Tooltip>
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
      {/* <Box
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
      </Box> */}

      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          border: "1px solid #d5dbe1",
          borderRadius: "10px",
          overflow: "hidden",
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
            color:"#FFF",
            borderBottom: "1px solid #d5dbe1",
            minHeight: 36,
            px: 0.75,
            py: 0.45,
            boxSizing: "border-box",
          }}
        >
          {[
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
            "Description",
          ].map((heading) => (
            <Typography
              key={heading}
              sx={{
                fontSize: "10.5px",
                fontWeight: 700,
                color: "#FFF",
                lineHeight: 1.15,
                whiteSpace: "normal",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              {heading}
            </Typography>
          ))}
        </Box>

        {visibleRows.length > 0 ? (
          visibleRows.map((row, visibleIndex) => {
            const absoluteIndex =
              (page - 1) * ROWS_PER_PAGE +
              visibleIndex;

            const rowKey =
              normalizeText(row.requirementId) ||
              `${normalizeText(row.fupCode)}-${absoluteIndex}`;

            const currentStatus =
              normalizeText(row.status);

            const matchingStatusOption =
              statusOptions.find((option) => {
                const optionValues = [
                  option.code,
                  option.value,
                  option.description,
                ].map(getStatusComparableValue);

                return optionValues.includes(
                  getStatusComparableValue(
                    currentStatus,
                  ),
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
                  minHeight: "42px",
                  px: 0.75,
                  py: 0.35,
                  boxSizing: "border-box",
                  bgcolor:
                    absoluteIndex % 2 === 0
                      ? "#ffffff"
                      : "#fafbfc",
                  borderBottom:
                    visibleIndex ===
                    visibleRows.length - 1
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
                      onClick={() =>
                        handleRemove(
                          row.requirementId,
                        )
                      }
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
                      ×
                    </IconButton>
                  </Tooltip>
                </Box>

                <Select
                  size="small"
                  value={selectedStatus}
                  onChange={(event) =>
                    handleStatusChange(
                      row.requirementId,
                      event,
                    )
                  }
                  displayEmpty
                  sx={{
                    width: "60%",
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

                  {selectedStatus &&
                    !matchingStatusOption && (
                      <MenuItem value={selectedStatus}>
                        {selectedStatus}
                      </MenuItem>
                    )}

                  {statusOptions.map((option) => {
                    const optionValue =
                      normalizeText(option.value) ||
                      normalizeText(
                        option.description,
                      ) ||
                      normalizeText(option.code);

                    return (
                      <MenuItem
                        key={
                          option.miscMastId ||
                          `${option.code}-${optionValue}`
                        }
                        value={optionValue}
                      >
                        {option.description ||
                          option.value ||
                          option.code}
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

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title="View description">
                    <span>
                      <IconButton
                        size="small"
                        disabled={
                          !normalizeText(
                            row.description,
                          )
                        }
                        onClick={() =>
                          setSelectedDescription(
                            normalizeText(
                              row.description,
                            ),
                          )
                        }
                        sx={{
                          width: 24,
                          height: 24,
                          p: 0,
                          color: "#27323a",
                          fontSize: "10px",
                          fontWeight: 700,
                          "&:hover": {
                            bgcolor: "#edf4f8",
                          },
                        }}
                      >
                        {/* <VisibilityOutlined /> */}
                        View
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
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

      {rows.length > ROWS_PER_PAGE && (
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
            onChange={(_, nextPage) =>
              setPage(nextPage)
            }
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 1,
          mb: 0.5,
        }}
      >
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

      <Dialog
        open={Boolean(selectedDescription)}
        onClose={() => setSelectedDescription("")}
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
          Requirement Description
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
            {selectedDescription}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSelectedDescription("")
            }
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
