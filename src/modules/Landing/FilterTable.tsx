import { useEffect, useMemo, useState } from "react";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import { Box } from "@mui/material";
import CustomCheckbox from "../../components/ui/Checkbox/Checkbox";
import CustomButton from "../../components/ui/Button/Button";
import { modalTitleStyles } from "../../utils/styles";
import type { TableColumn, tableData } from "../../types/inbox";
import { toFilterComparableValue } from "../../utils/filter";

type FilterTableProps = {
  openFilterDialog: boolean;
  setOpenFilterDialog: React.Dispatch<React.SetStateAction<boolean>>;
  filterValues: Record<string, string[]>;
  setFilterValues: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
  visibleColumns: TableColumn<tableData>[];
  rows: tableData[];
  onApply: () => void;
};

const FilterTable = ({
  openFilterDialog,
  setOpenFilterDialog,
  filterValues,
  setFilterValues,
  visibleColumns,
  rows,
  onApply,
}: FilterTableProps) => {
  const visibleFilterKeys = useMemo(
    () => visibleColumns.map((column) => String(column.key)),
    [visibleColumns],
  );

  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const activeFilter = useMemo(() => {
    if (visibleFilterKeys.includes(selectedFilter)) return selectedFilter;
    return visibleFilterKeys[0] ?? "";
  }, [selectedFilter, visibleFilterKeys]);

  const filterOptionsByColumn = useMemo(() => {
    const options: Record<string, string[]> = {};

    visibleColumns.forEach((column) => {
      const key = String(column.key);
      const uniqueValues = new Set<string>();

      rows.forEach((row) => {
        const value = toFilterComparableValue(row[column.key]);
        if (value !== "") uniqueValues.add(value);
      });

      options[key] = Array.from(uniqueValues);
    });

    return options;
  }, [rows, visibleColumns]);

  const filterLabelByKey = useMemo(() => {
    const labels: Record<string, string> = {};
    visibleColumns.forEach((column) => {
      labels[String(column.key)] = column.label;
    });
    return labels;
  }, [visibleColumns]);

  useEffect(() => {
    const visibleSet = new Set(visibleFilterKeys);

    setFilterValues((prev) => {
      const next = Object.fromEntries(
        Object.entries(prev).filter(([key]) => visibleSet.has(key)),
      );

      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [setFilterValues, visibleFilterKeys]);

  const toggleFilterValue = (value: string) => {
    if (!activeFilter) return;

    setFilterValues((prev) => {
      const current = prev[activeFilter] || [];

      return {
        ...prev,
        [activeFilter]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };
  const clearAllFilters = () => {
    setFilterValues({});
  };

  const selectedFilterOptions = filterOptionsByColumn[activeFilter] ?? [];

  return (
    <CustomDialog
      open={openFilterDialog}
      onClose={() => setOpenFilterDialog(false)}
      title="FILTER"
      maxWidth="md"
      fullWidth
      titleSx={{ ...modalTitleStyles }}
      contentSx={{ p: 2 }}
      actionsSx={{
        justifyContent: "center",
        gap: 2,
        pb: 3,
      }}
      actions={
        <>
          <CustomButton
            variant="outlined"
            onClick={clearAllFilters}
            sx={{
              borderRadius: "50px",
              px: 4,
            }}
          >
            Clear All
          </CustomButton>

          <CustomButton
            variant="contained"
             onClick={() => {
    onApply();
    setOpenFilterDialog(false);
  }}
            sx={{
              borderRadius: "50px",
              px: 4,
            }}
          >
            Apply
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: "flex", height: 420, width: "100%" }}>
        {/* LEFT SIDE - Categories */}
        <Box sx={{ width: "40%", borderRight: "1px solid #eee" }}>
          {visibleFilterKeys.map((key) => (
            <Box
              key={key}
              onClick={() => setSelectedFilter(key)}
              sx={{
                padding: "12px",
                cursor: "pointer",
                backgroundColor:
                  activeFilter === key ? "#f0f3f8" : "transparent",
                borderLeft:
                  activeFilter === key
                    ? "4px solid #004A80"
                    : "4px solid transparent",
              }}
            >
              {filterLabelByKey[key] ?? key}
            </Box>
          ))}

          {!visibleFilterKeys.length && (
            <Box sx={{ padding: "12px", color: "#666" }}>
              No visible columns to filter
            </Box>
          )}
        </Box>

        {/* RIGHT SIDE - Options */}
        <Box sx={{ width: "60%", p: 2 }}>
          {selectedFilterOptions.map((item) => (
            <Box
              key={item}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <CustomCheckbox
                label={item}
                checked={(filterValues[activeFilter] || []).includes(item)}
                onChange={() => toggleFilterValue(item)}
              />
            </Box>
          ))}

          {!!activeFilter && selectedFilterOptions.length === 0 && (
            <Box sx={{ color: "#666", fontSize: "14px" }}>
              No values available for this column
            </Box>
          )}
        </Box>
      </Box>
    </CustomDialog>
  );
};
export default FilterTable;
