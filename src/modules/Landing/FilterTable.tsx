import { useState } from "react";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import { Box } from "@mui/material";
import CustomCheckbox from "../../components/ui/Checkbox/Checkbox";
import CustomButton from "../../components/ui/Button/Button";
import { modalTitleStyles } from "../../utils/styles";

type FilterTableProps = {
  openFilterDialog: boolean;
  setOpenFilterDialog: React.Dispatch<React.SetStateAction<boolean>>;
  filterValues: Record<string, string[]>;
  setFilterValues: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
   onApply: () => void;
};
const filterConfig = {
  productType: ["Medical", "Non-Medical"],
  drc: ["High", "Medium", "Low"],
  hniFlag: ["Yes", "No"],
  medicalType: ["Medical", "Non-Medical"],
  caseFlag: ["Open", "Closed"],
} as const;
type FilterKey = keyof typeof filterConfig;
const FilterTable = ({
  openFilterDialog,
  setOpenFilterDialog,
  filterValues,
  setFilterValues,
  onApply
}: FilterTableProps) => {
  const [selectedFilter, setSelectedFilter] =
  useState<FilterKey>("productType");

  
  const toggleFilterValue = (value: string) => {
    setFilterValues((prev) => {
      const current = prev[selectedFilter] || [];

      return {
        ...prev,
        [selectedFilter]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };
  const clearAllFilters = () => {
    setFilterValues({});
  };

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
          {(Object.keys(filterConfig) as FilterKey[]).map((key) => (
            <Box
              key={key}
              onClick={() => setSelectedFilter(key)}
              sx={{
                padding: "12px",
                cursor: "pointer",
                backgroundColor:
                  selectedFilter === key ? "#f0f3f8" : "transparent",
                borderLeft:
                  selectedFilter === key
                    ? "4px solid #004A80"
                    : "4px solid transparent",
              }}
            >
              {key}
            </Box>
          ))}
        </Box>

        {/* RIGHT SIDE - Options */}
        <Box sx={{ width: "60%", p: 2 }}>
          {filterConfig[selectedFilter].map((item) => (
            <Box
              key={item}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <CustomCheckbox
                label={item}
                checked={(filterValues[selectedFilter] || []).includes(item)}
                onChange={() => toggleFilterValue(item)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </CustomDialog>
  );
};
export default FilterTable;
