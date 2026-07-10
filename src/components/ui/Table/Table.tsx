import {
  Paper,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import CustomButton from "../Button/Button";

export type Column<T> = {
  key: keyof T;
  header?: string;
  width?: string;
  sticky?: "left" | "right";
  render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  renderSelectAll?: () => void;
};

type CustomTableProps<T> = {
  title?: string;
  columns: Column<T>[];
  data: T[];
  headerAction?: React.ReactNode;
};

export default function CustomTable<T extends object>({
  title,
  columns,
  data,
  headerAction
}: CustomTableProps<T>) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #D8D8D8",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      {title && (
        <Box
          sx={{
            backgroundColor: "#004A80",
            color: "#FFFFFF",
            px: 3,
            py: 1.2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
            {title}
          </Typography>
           {headerAction && <Box>{headerAction}</Box>}
        </Box>
      )}

      {/* TABLE */}
      <TableContainer>
        <Table
          size="small"
          sx={{
            width: "100%",
            "& th": {
              backgroundColor: "#E9EEF3",
              color: "#4A4A4A",
              fontSize: "14px",
              fontWeight: 600,
              py: 1,
              px: 2,
              borderBottom: "1px solid #D6D6D6",
            },

            "& td": {
              color: "#4A4A4A",
              fontSize: "14px",
              py: 1.1,
              px: 2,
              borderBottom: "1px solid #E1E1E1",
            },

            "& tr:last-child td": {
              borderBottom: "none",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  sx={{
                    width: col.width,
                    ...(col.sticky
                      ? {
                          position: "sticky",
                          [col.sticky]: 0,
                          zIndex: 3,
                          backgroundColor: "#E9EEF3",
                        }
                      : {}),
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      lineHeight: 1.2,
                    }}
                  >
                    {/* HEADER TITLE */}
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#4A4A4A",
                      }}
                    >
                      {col.headerRender ? col.headerRender() : col.header}
                    </Typography>

                    {/* SUB ACTION (Select All) */}
                    {col.renderSelectAll && (
                      <CustomButton
                        variant="text"
                        sx={{
                          color: "#063E6F",
                          fontSize: "12px",
                          p: 0,
                          textDecoration: "underline",
                          "&:hover": {
                            textDecoration: "underline",
                            backgroundColor: "transparent",
                          },
                        }}
                        onClick={col.renderSelectAll}
                      >
                        (Select All)
                      </CustomButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => {
                  const value = row[col.key];
                  const content = col.render
                    ? col.render(value, row, rowIndex)
                    : (value as React.ReactNode);

                  return (
                    <TableCell
                      key={String(col.key)}
                      sx={{
                        fontSize: "12px",
                        ...(col.sticky
                          ? {
                              position: "sticky",
                              [col.sticky]: 0,
                              zIndex: 2,
                              backgroundColor: "#FFFFFF",
                            }
                          : {}),
                      }}
                    >
                      {col.render ? (
                        content
                      ) : (
                        <Typography
                          sx={{
                            fontSize: "12px",
                          }}
                        >
                          {content}
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}