import { Box, Divider, Typography } from "@mui/material";

export type GridItem = {
  label: string;
  value?: string | number | boolean;
};

type GridSectionProps = {
  title?: string;
  columns?: number;
  items: GridItem[];
  showDivider?: boolean;
    backgroundColor?: string;
};

export const GridSection = ({
  title,
  columns = 3,
  items,
  showDivider = false,
  backgroundColor = "#f6f6f6",
}: GridSectionProps) => {
  return (
    <Box>
      {title && (
        <Typography sx={{ fontWeight: 700, mb: 2 }}>{title}</Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 2,
          backgroundColor,
          borderRadius: 2,
        }}
      >
        {items.map((item) => (
          <Box key={item.label}>
            <Typography sx={{ color: "#444", fontSize: 14, fontWeight: 400 }}>
              {item.label}
            </Typography>
            <Typography sx={{ color: "#161616", fontWeight: 600, fontSize: 12 }}>
              {item.value ?? "-"}
            </Typography>
          </Box>
        ))}
      </Box>

      {showDivider && <Divider sx={{ my: 2, bgcolor: "#737373" }} />}
    </Box>
  );
};