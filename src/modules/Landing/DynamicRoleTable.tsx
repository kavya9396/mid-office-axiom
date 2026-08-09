import {
  Box,
  Button,
  IconButton,
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
import { useMemo, useState } from "react";
import { FilterIcon, SearchIcon, SettingsIcon } from "../../icons/Icons";

interface DynamicRoleTableProps {
  title: string;
  data: Record<string, unknown>[];
  onApplicationClick?: (
    application: Record<string, unknown>
  ) => void;
}

// const formatColumnName = (key: string) => {
//   return key
//     .replace(/_/g, " ")
//     .replace(/([a-z])([A-Z])/g, "$1 $2")
//     .replace(/\b\w/g, (char) => char.toUpperCase());
// };

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  // Format ISO dates
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
  ) {
    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB");
    }
  }

  return String(value);
};

const DynamicRoleTable = ({
  title,
  data,
  onApplicationClick,
}: DynamicRoleTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  /**
   * Get all columns from all records.
   *
   * This is better than Object.keys(data[0]) because another
   * record might contain an additional property.
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

  /**
   * Search across every column.
   */
  const filteredData = useMemo(() => {
    if (!searchText.trim()) {
      return data;
    }

    const search = searchText.toLowerCase();

    return data.filter((row) =>
      columns.some((column) =>
        String(row[column] ?? "")
          .toLowerCase()
          .includes(search),
      ),
    );
  }, [data, columns, searchText]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;

    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchText(event.target.value);
    setPage(0);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        border: "1px solid #e5e7eb",
        borderRadius: "0 0 14px 14px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: "44px",
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0D4C7D",
          color: "#fff",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        <Button
          size="small"
          sx={{
            color: "#0D4C7D",
            backgroundColor: "#fff",
            textTransform: "none",
            fontSize: "11px",
            minWidth: "60px",
            height: "28px",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Add
        </Button>
      </Box>

      {/* Search / Filter toolbar */}
      <Box
        sx={{
          height: "44px",
          px: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {showSearch && (
          <TextField
            size="small"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search..."
            autoFocus
            sx={{
              width: "220px",
              "& .MuiInputBase-root": {
                height: "32px",
                fontSize: "12px",
              },
            }}
          />
        )}

        <IconButton
          size="small"
          onClick={() => setShowSearch((prev) => !prev)}
          sx={{
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <SearchIcon/>
        </IconButton>

        <IconButton
          size="small"
          sx={{
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <FilterIcon/>
        </IconButton>

        <IconButton
          size="small"
          sx={{
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* Table */}
      <TableContainer
        sx={{
          maxHeight: "calc(90vh - 180px)",
          overflowX: "auto",
          overflowY: "auto",

          "&::-webkit-scrollbar": {
            width: "7px",
            height: "7px",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c5c5c5",
            borderRadius: "10px",
          },

          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            minWidth: "1200px",
            tableLayout: "auto",
          }}
        >
          {/* Dynamic Header */}
        <TableHead>
  <TableRow>
    {columns.map((column) => (
      <TableCell
        key={column}
        sx={{
          backgroundColor: "#e9eef3",
          color: "#222",
          fontSize: "12px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          padding: "8px 16px",
          borderBottom: "1px solid #ddd",
        }}
      >
        {column}
      </TableCell>
    ))}
  </TableRow>
</TableHead>



          {/* Dynamic Rows */}
          <TableBody>
  {paginatedData.length > 0 ? (
    paginatedData.map((row, rowIndex) => (
      <TableRow
        key={String(row.id ?? rowIndex)}
        hover
        sx={{
          "&:nth-of-type(even)": {
            backgroundColor: "#f7f7f7",
          },

          "&:hover": {
            backgroundColor: "#f1f6fa",
          },
        }}
      >
        {columns.map((column) => {
          const normalizedColumn = column
            .replace(/_/g, "")
            .replace(/\s/g, "")
            .toLowerCase();

          const isApplicationNumber =
  normalizedColumn === "applicationnumber" ||
  normalizedColumn === "applicationno";

          return (
            <TableCell
              key={column}
              sx={{
                fontSize: "12px",
                color: isApplicationNumber
                  ? "#0D4C7D"
                  : "#4b4b4b",
                whiteSpace: "nowrap",
                padding: "10px 16px",
                borderBottom:
                  "1px solid #eeeeee",
              }}
            >
              {isApplicationNumber ? (
                <Box
                  component="span"
                  onClick={() =>
                    onApplicationClick?.(row)
                  }
                  sx={{
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#0D4C7D",
                    textDecoration: "underline",

                    "&:hover": {
                      color: "#9A2529",
                    },
                  }}
                >
                  {formatCellValue(row[column])}
                </Box>
              ) : (
                formatCellValue(row[column])
              )}
            </TableCell>
          );
        })}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell
        colSpan={columns.length || 1}
        align="center"
        sx={{
          py: 5,
          color: "#777",
          fontSize: "13px",
        }}
      >
        No data available
      </TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Show"
        sx={{
          borderTop: "1px solid #e5e7eb",
          minHeight: "40px",

          "& .MuiTablePagination-toolbar": {
            minHeight: "40px",
            fontSize: "11px",
          },

          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              fontSize: "11px",
            },

          "& .MuiTablePagination-select": {
            fontSize: "11px",
          },
        }}
      />
    </Paper>
  );
};

export default DynamicRoleTable;
