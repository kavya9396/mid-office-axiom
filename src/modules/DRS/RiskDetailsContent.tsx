import { Box, Typography } from "@mui/material";

interface RiskDetail {
  key: string;
  label: string;
  value: unknown;
}

const displayValue = (value: unknown) => String(value ?? "").trim() || "-";

/** Matches the field and remarks layout used by the approved DRS prototype. */
const RiskDetailsContent = ({ details }: { details: RiskDetail[] }) => {
  const regularDetails = details.filter((detail) => !/remark/i.test(detail.label));
  const remarkDetails = details.filter((detail) => /remark/i.test(detail.label));

  return (
    <Box
      sx={{
        minWidth: { xs: "auto", md: 760 },
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(6, minmax(0, 1fr))",
        },
        gap: 0.75,
      }}
    >
      {regularDetails.map((detail) => (
        <Box key={detail.key} sx={{ minWidth: 0, p: 0.8 }}>
          <Typography sx={{ color: "#827671", fontSize: 11 }}>
            {detail.label}
          </Typography>
          <Typography sx={{ mt: 0.25, color: "#332D2A", fontSize: 11, fontWeight: 800, overflowWrap: "anywhere" }}>
            {displayValue(detail.value)}
          </Typography>
        </Box>
      ))}

      {remarkDetails.length > 0 && (
        <Box sx={{ gridColumn: "1 / -1", display: "grid", gap: 1, mt: 1, px: 0.75, pt: 1.5, pb: 0.5, borderTop: "1px solid #EADFDA" }}>
          {remarkDetails.map((detail) => (
            <Typography key={detail.key} sx={{ color: "#332D2A", fontSize: 11, fontWeight: 800, overflowWrap: "anywhere" }}>
              <Box component="span" sx={{ color: "#827671", fontWeight: 600 }}>
                {detail.label}:
              </Box>{" "}
              {displayValue(detail.value)}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RiskDetailsContent;
