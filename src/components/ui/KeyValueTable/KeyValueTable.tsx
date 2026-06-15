import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

export type KeyValueRow = {
  leftLabel: string;
  leftValue: React.ReactNode;
  rightLabel: string;
  rightValue: React.ReactNode;
};

type KeyValueTableProps = {
  title: string;
  rows: KeyValueRow[];
};

export default function KeyValueTable({
  title,
  rows,
}: KeyValueTableProps) {
  return (
    <Box
      sx={{
        backgroundColor: "#F1F1F1",
        borderRadius: 5,
        overflow: "hidden",
        border: "1px solid #E3E3E3",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          backgroundColor: "#0D4F81",
        }}
      >
        <Typography
          sx={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* TABLE */}
      <TableContainer>
        <Table
          size="small"
          sx={{
            "& td": {
              borderColor: "#D4D7DB",
              fontFamily: "Mulish, sans-serif",
              fontSize: "14px",
              color: "#4B5563",
              py: 1.1,
            },
          }}
        >
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {/* LEFT LABEL */}
                <TableCell
                  sx={{
                    backgroundColor: "#D2D7DE",
                    width: "25%",
                    borderBottom: "1px solid #C9CDD3",
                    fontWeight: 600,
                  }}
                >
                  {row.leftLabel}
                </TableCell>

                {/* LEFT VALUE */}
                <TableCell sx={{ width: "25%" }}>
                  {row.leftValue}
                </TableCell>

                {/* RIGHT LABEL */}
                <TableCell
                  sx={{
                    backgroundColor: "#D2D7DE",
                    width: "25%",
                    borderBottom: "1px solid #C9CDD3",
                    fontWeight: 600,
                  }}
                >
                  {row.rightLabel}
                </TableCell>

                {/* RIGHT VALUE */}
                <TableCell sx={{ width: "25%" }}>
                  {row.rightValue}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}