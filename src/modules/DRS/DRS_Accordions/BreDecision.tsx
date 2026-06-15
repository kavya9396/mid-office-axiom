import { Box, Container, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import Badge from "../../../components/ui/Badge/Badge";
import { centerFlex, columnFlex, modalTitleStyles } from "../../../utils/styles";
import { RefreshIcon } from "../../../icons/Icons";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import CustomButton from "../../../components/ui/Button/Button";
import type { RootState } from "../../../store/store";
import { useSelector } from "react-redux";

type SelectedItem = {
  label: string;
  value: string;
};

const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  return truncated.slice(0, truncated.lastIndexOf(" "));
};

const BreDecision = () => {
  const { breDecision } = useSelector((state: RootState) => state.drs);
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bredialogOpen, setBreDialogOpen] = useState(false);
  const [retriggerCount, setRetriggerCount] = useState(0);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const isBreSuccess = breDecision?.status?.toLowerCase() === "success";

  //This count should come from backend.
  const isRetriggerDisabled = isBreSuccess || retriggerCount >= 3;

  const breDetails = [
    {
      label: "BRE Status",
      value: breDecision?.status ?? "-",
    },
    {
      label: "BRE Remarks",
      value: isBreSuccess ? "-" : breDecision?.remarks ?? "-",
    },
    {
      label: "BRE Discrepancy",
      value: isBreSuccess ? "-" : breDecision?.discrepancy ?? "-",
    },
    {
      label: "BRE Timestamp",
      value: breDecision?.timestamp ?? "-",
    },
  ];

  const handleRetrigger = () => {
    if (isBreSuccess) return;

    const nextCount = retriggerCount + 1;

    if (nextCount >= 3) {
      setRetriggerCount(nextCount);
      setBreDialogOpen(true);
      return;
    }

    setRetriggerCount(nextCount);

    // Call BRE retrigger API here
  };

  const getDisplayText = (text: string) => {
    return truncateText(text, 80);
  };

  return (
    <Container disableGutters>
      <CustomAccordion
        title="BRE Decision"
        chip={
          breDecision?.decision ? (
            <Badge label={breDecision.decision} variant="Low" />
          ) : null
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "0.8fr 2.5fr 2.5fr 1.5fr 0.5fr",
            gap: "16px",
            backgroundColor: "#f6f6f6",
            padding: "16px",
            marginTop: "8px",
            borderRadius: "8px",
          }}
        >
          {breDetails.map((item, index) => {
            const isLongText = typeof item.value === "string" && item.value.length > 80;

            return (
              <Box key={index} sx={{ ...columnFlex }}>
                <Typography
                  sx={{
                    color: "#444444",
                    fontSize: "12px",
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    color: "#161616",
                    fontWeight: 600,
                    fontSize: "14px",
                    lineHeight: "20px",
                    maxHeight: "40px",
                    overflow: "hidden",
                  }}
                >
                  {getDisplayText(item.value)}

                  {isLongText && "... "}

                  {isLongText && (
                    <Box
                      component="span"
                      onClick={() => {
                        setSelectedItem({
                          label: item.label,
                          value: item.value,
                        });
                        setDialogOpen(true);
                      }}
                      sx={{
                        color: "#063E6F",
                        cursor: "pointer",
                        fontWeight: 500,
                        textDecoration: "underline"
                      }}
                    >
                      show more
                    </Box>
                  )}
                </Typography>
              </Box>
            );
          })}

          <Box
            sx={{
              ...centerFlex,
            }}
          >
            <Box
              component="span"
              onClick={handleRetrigger}
              sx={{
                color: isRetriggerDisabled ? "#BDBDBD" : "#9A2529",
                border: `1px solid ${isRetriggerDisabled ? "#BDBDBD" : "#9A2529"}`,
                padding: 1,
                borderRadius: "8px",
                display: "flex",
                cursor: isRetriggerDisabled ? "not-allowed" : "pointer",
                opacity: isRetriggerDisabled ? 0.5 : 1,
              }}
            >
              <RefreshIcon />
            </Box>
          </Box>
        </Box>

        <CustomDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={
            <Typography
              sx={{
                ...modalTitleStyles
              }}
            >
              {selectedItem?.label?.replace("BRE ", "")}
            </Typography>
          }
          contentSx={{ whiteSpace: "pre-wrap" }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: "#161616",
            }}
          >
            {selectedItem?.value}
          </Typography>
        </CustomDialog>

        <CustomDialog
          open={bredialogOpen}
          showCloseIcon={false}
          onClose={() => setBreDialogOpen(true)}
          title={
            <Typography
              sx={{
                ...modalTitleStyles
              }}
            >
              BRE Retriggered
            </Typography>
          }
          actionsSx={{
            justifyContent: "center",
            pb: 2,
          }}
          actions={
            <CustomButton
              onClick={() => {
                setBreDialogOpen(false)
                navigate("/group/inbox")
              }}
              sx={{ borderRadius: "50px", paddingX: "40px" }}
            >
              Refer to IT
            </CustomButton>
          }
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: "#161616",
            }}
          >
            You have exhausted the retriggered of BRE. Kindly refer this ticket to IT Team.
          </Typography>
        </CustomDialog>
      </CustomAccordion>
    </Container>
  );
};

export default BreDecision;
