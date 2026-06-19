import { Box, TextField, Typography } from "@mui/material";
import { fieldStyles, labelStyles } from "../../utils/styles";

interface LastUWRemarksProps {
  risk?: boolean;
  title?: string;
  date?: string;
  remarks?: string;
  firstFieldLabel?: string;
  firstFieldValue?: string;
  secondFieldLabel?: string;
  secondFieldValue?: string;
  thirdFieldLabel?: string;
  thirdFieldValue?: string;
  riskReferralReason?: string;
}

const LastUWRemarks = ({
  title = "Last UW Remarks",
  date = "27th April 2025, 1:15 PM",
  remarks = "Applicant remarks",
  firstFieldLabel,
  firstFieldValue,
  secondFieldLabel,
  secondFieldValue,
  thirdFieldLabel,
  thirdFieldValue,
}: LastUWRemarksProps) => {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography sx={labelStyles}>{title}</Typography>
        <Typography sx={labelStyles}>{date}</Typography>
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={3}
        value={remarks}
        disabled
        size="small"
        sx={fieldStyles}
      />

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: thirdFieldLabel
            ? "repeat(3, 1fr)"
            : "repeat(2, 1fr)",

          gap: 2,
          mt: 2,
        }}
      >
        {/* First Field */}
        {
          firstFieldLabel && firstFieldValue && (
            <Box>
              <Typography sx={labelStyles}>
                {firstFieldLabel}
              </Typography>

              <TextField
                fullWidth
                value={firstFieldValue}
                disabled
                size="small"
                sx={fieldStyles}
              />
            </Box>
          )
        }

        {/* Second Field */}
        {
          secondFieldLabel && secondFieldValue && (
            <Box>
              <Typography sx={labelStyles}>
                {secondFieldLabel}
              </Typography>

              <TextField
                fullWidth
                value={secondFieldValue}
                disabled
                size="small"
                sx={fieldStyles}
              />
            </Box>
          )}

        {thirdFieldLabel && thirdFieldValue && (
          <Box>
            <Typography sx={labelStyles}>
              {thirdFieldLabel}
            </Typography>

            <TextField
              fullWidth
              value={thirdFieldValue}
              disabled
              size="small"
              sx={fieldStyles}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LastUWRemarks;