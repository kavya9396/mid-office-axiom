import {
  Box,
  List,
  ListItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { columnFlex, modalTitleStyles } from "../../utils/styles";
import CustomButton from "../../components/ui/Button/Button";
import type {  TableColumn, tableData } from "../../types/inbox";
import { allColumns } from "../../store/inbox.columns";
import { FilterIcon, SearchIcon, SettingsIcon } from "../../icons/Icons";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import {   useState } from "react";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import CustomCheckbox from "../../components/ui/Checkbox/Checkbox";
//import { poolAllowedColumns } from "../../store/pool.columns.config";
import { useColumnConfig } from "../../hooks/useColumnConfig";

const RightPanel = ({
  selectedPool,
  rows,
}: {
  selectedPool: string;
  rows: tableData[];
}) => {
  console.log("selectedPool", selectedPool);
  const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);
  
    // ---------------- STATES ----------------

const userId = 'abc'
const { config, updateConfig } = useColumnConfig(
  userId,
  selectedPool
);

  const [left, setLeft] = useState<string[]>([]);
  const [right, setRight] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);

  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

console.log(openFilterDialog,searchText)



  const visibleColumns = allColumns.filter((col) =>
  config.visible.includes(col.key)
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
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
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
    <TableRow sx={{
          "&:hover": {
            backgroundColor: "#f5faff",
            cursor: "pointer",
          },
        }}>
      {visibleColumns.map((column: TableColumn<tableData>) => (
        <TableCell key={String(column.key)}
              variant="head"
              align={column.numeric ? "right" : "left"}
              sx={{
                backgroundColor: "#E9EEF3",
                px: 1,
                fontWeight: "bold",
                fontSize: "13px",
                width: column.width,
                padding: 0.5,
              }}>
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
// ---------------- RENDER LIST ----------------
  const customList = (title: string, items: string[]) => (
    <Paper sx={{ width: 300 }}>
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

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#F0F3F8",
        height: "250vh",
      }}
    >
      {selectedPool != "Search Applications" && (
        <>
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
                {rows.map((row) => (
                  <TableRow key={row.id}
        hover
        sx={{
          cursor: "pointer",
          "&:hover": { backgroundColor: "#f5faff" },
        }}>
                    {visibleColumns.map((col) => (
                      <TableCell key={String(col.key)} sx={{ p: 1.5, pl: 2, fontSize: "13px" }}>
                        {row[col.key as keyof tableData] ?? "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <CustomDialog
              open={openTransferDialog}
              onClose={() => setOpenTransferDialog(false)}
              title="Customize Columns"
              maxWidth="lg"
              fullWidth
              titleSx={modalTitleStyles}
              actions={
                <CustomButton
                  onClick={handleApply}
                  variant="contained"
                  sx={{ width: 150 }}
                >
                  Apply
                </CustomButton>
              }
            >
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                {customList("Available", left)}

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <CustomButton onClick={moveRight}>›</CustomButton>
                  <CustomButton onClick={moveLeft}>‹</CustomButton>
                </Box>

                {customList("Visible", right)}
              </Box>
            </CustomDialog>
          </Box>
        </>
      )}
      {/* {selectedPool == "Search Applications" && (
        <>
         <PoolSearchApplication/>
        </>
        
      )} */}
    </Box>
  );
};
export default RightPanel;
