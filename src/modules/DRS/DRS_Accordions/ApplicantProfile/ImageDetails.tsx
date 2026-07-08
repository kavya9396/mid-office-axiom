import { Box, Typography } from "@mui/material";
import { useState } from "react";
import type { SummaryResponse } from "../../../../types/drs.types";
import defaultUserProfileImage from "../../../../assets/user-profile.svg";
import CustomDialog from "../../../../components/ui/Dialog/Dialog";
import { modalTitleStyles } from "../../../../utils/styles";

type ImageDetailsProps = {
  profile?: Partial<SummaryResponse>;
  isAccordionOpen?: boolean;
};

const toDisplay = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const ImageDetails = ({ profile }: ImageDetailsProps) => {
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [openRemarksDialog, setOpenRemarksDialog] = useState(false);

  const imageUrl =
    toDisplay(profile?.applicantDetails?.udsLink) !== "-"
      ? String(profile?.applicantDetails?.udsLink)
      : toDisplay(profile?.proposerSummary?.profileImage) !== "-"
        ? String(profile?.proposerSummary?.profileImage)
        : defaultUserProfileImage;

  const rawRemarks = toDisplay(profile?.proposerSummary?.documentRemarks);

  const getTruncatedRemarks = (value: string, maxLength: number) => {
    if (value.length <= maxLength) {
      return {
        text: value,
        truncated: false,
      };
    }

    return {
      text: `${value.slice(0, maxLength)}...`,
      truncated: true,
    };
  };

  const remarksDisplay = getTruncatedRemarks(rawRemarks, 60);

  const fields = [
    { label: "Document", value: toDisplay(profile?.proposerSummary?.document) },
    { label: "Face Match Score", value: toDisplay(profile?.proposerSummary?.faceMatchPercentage) },
    { label: "Image Quality", value: toDisplay(profile?.proposerSummary?.imageQuality) },
    { label: "Remarks", value: toDisplay(profile?.proposerSummary?.documentRemarks) },
  ];

  return (
    <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "#F6F6F6" }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Box
          component="img"
          src={imageUrl}
          alt="Applicant"
          onClick={() => setOpenPhotoDialog(true)}
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            objectFit: "cover",
            border: "1px solid #D4DCE4",
            backgroundColor: "#FFFFFF",
            cursor: "pointer",
            "&:hover": { opacity: 0.85 },
          }}
        />

        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: 1.5 }}>
            {fields.map((item) => (
              <Box key={item.label}>
                <Typography sx={{ fontSize: 12, color: "#444" }}>{item.label}</Typography>
                <Typography sx={{ fontSize: 14, color: "#161616", fontWeight: 600, whiteSpace: "pre-wrap" }}>
                  {item.label === "Remarks" ? remarksDisplay.text : item.value}
                  {item.label === "Remarks" && remarksDisplay.truncated && (
                    <Box
                      component="span"
                      sx={{
                        color: "#063E6F",
                        cursor: "pointer",
                        fontWeight: 500,
                        textDecoration: "underline",
                        ml: 0.5,
                      }}
                      onClick={() => setOpenRemarksDialog(true)}
                    >
                      show more
                    </Box>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <CustomDialog
        open={openPhotoDialog}
        onClose={() => setOpenPhotoDialog(false)}
        showCloseIcon={false}
        maxWidth="sm"
        fullWidth
        paperSx={{
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
        backdropSx={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        contentSx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0,
          backgroundColor: "transparent",
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt="Expanded Photo"
          sx={{
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </CustomDialog>

      <CustomDialog
        open={openRemarksDialog}
        onClose={() => setOpenRemarksDialog(false)}
        title={<Typography sx={{ ...modalTitleStyles }}>Remarks</Typography>}
        maxWidth="sm"
        fullWidth
      >
        <Typography
          sx={{
            fontSize: "14px",
            color: "#20242c",
            fontWeight: 500,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {rawRemarks}
        </Typography>
      </CustomDialog>
    </Box>
  );
};

export default ImageDetails;
