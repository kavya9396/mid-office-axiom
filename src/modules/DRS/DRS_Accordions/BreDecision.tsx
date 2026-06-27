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
import type { BreDecisionResponse } from "../../../types/drs.types";
import { useAppContext } from "../../../hooks/useAppContext";
import { useAppDispatch } from "../../../store/hooks";
import { breRetriggerThunk } from "../../../store/thunks/breRetriggerThunk";
import { referToItThunk } from "../../../store/thunks/referToItThunk";

type SelectedItem = {
  label: string;
  value: string;
};

type BreDecisionExtraField = {
  label: string;
  value?: string | null;
  visibleWhen?: "always" | "success" | "failure";
};

interface BreDecisionProps {
  extraFields?: BreDecisionExtraField[];
  breDecisionOverride?: BreDecisionResponse | null;
}

const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  return truncated.slice(0, truncated.lastIndexOf(" "));
};

const BreDecision = ({ extraFields = [], breDecisionOverride = null }: BreDecisionProps) => {
  const dispatch = useAppDispatch();
  const { applicationNumber } = useAppContext();
  const { breDecision: drsBreDecision } = useSelector((state: RootState) => state.drs);
  const breDecision = breDecisionOverride ?? drsBreDecision;
  const navigate = useNavigate();
  const roleType = localStorage.getItem("roleType") ?? "";
  const applicationId = applicationNumber ?? "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bredialogOpen, setBreDialogOpen] = useState(false);
  const [retriggerCount, setRetriggerCount] = useState(0);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [retriggeredBreDecision, setRetriggeredBreDecision] = useState<BreDecisionResponse | null>(null);
  const [breRetriggerLoading, setBreRetriggerLoading] = useState(false);
  const [breRetriggerError, setBreRetriggerError] = useState<string | null>(null);
  const [referToItLoading, setReferToItLoading] = useState(false);
  const [referToItError, setReferToItError] = useState<string | null>(null);

  const currentBreDecision = retriggeredBreDecision ?? breDecision;

  const isBreSuccess = currentBreDecision?.status?.toLowerCase() === "success";

  // This count should come from backend.
  const isRetriggerDisabled = isBreSuccess || retriggerCount >= 3 || breRetriggerLoading;

  const conditionalFields = extraFields
    .filter((item) => {
      if (item.visibleWhen === "success") return isBreSuccess;
      if (item.visibleWhen === "failure") return !isBreSuccess;
      return true;
    })
    .map((item) => ({
      label: item.label,
      value: item.value ?? "-",
    }));

  const hasValue = (value: unknown) =>
    value !== null && value !== undefined && String(value).trim() !== "";

  const breDecisionParams = currentBreDecision as Record<string, unknown> | null;

  const getBreDecisionValue = (keys: string[]) => {
    if (!breDecisionParams) return undefined;
    return keys.map((key) => breDecisionParams[key]).find((value) => hasValue(value));
  };

  const conditionalBreDecisionParams = [
    {
      label: "Decision",
      value: getBreDecisionValue(["medicalDecision", "financialDecision"]),
    },
    {
      label: "Decision Date",
      value: getBreDecisionValue(["medicalDecisionDate", "financialDecisionDate"]),
    },
    {
      label: "Discrepancy",
      value: getBreDecisionValue(["medicalDiscrepancy", "financialDiscrepancy"]),
    },
    {
      label: "Remarks",
      value: getBreDecisionValue(["medicalRemarks", "financialRemarks"]),
    },
  ]
    .filter((item) => hasValue(item.value))
    .map((item) => ({
      label: item.label,
      value: String(item.value),
    }));

  const coreBreDetails = [
    {
      label: "BRE Status",
      value: currentBreDecision?.status ?? "-",
    },
    {
      label: "BRE Remarks",
      value: isBreSuccess ? "-" : currentBreDecision?.remarks ?? "-",
    },
    {
      label: "BRE Discrepancy",
      value: isBreSuccess ? "-" : currentBreDecision?.discrepancy ?? "-",
    },
    {
      label: "BRE Timestamp",
      value: currentBreDecision?.timestamp ?? "-",
    },
  ];

  const additionalBreDetails = [
    ...conditionalBreDecisionParams,
    ...conditionalFields,
  ];

  const handleRetrigger = async () => {
    if (isBreSuccess || breRetriggerLoading) {
      return;
    }

    if (retriggerCount >= 3) {
      setReferToItError(null);
      setBreDialogOpen(true);
      return;
    }

    if (!applicationId || !roleType) {
      setBreRetriggerError("Missing application or role information.");
      return;
    }

    try {
      setBreRetriggerLoading(true);
      setBreRetriggerError(null);

      const response = await dispatch(
        breRetriggerThunk({
          applicationId,
          roleType,
        }),
      ).unwrap();

      setRetriggeredBreDecision(response.breDecision);

      if (response.breDecision.status?.toLowerCase() !== "success") {
        const nextCount = retriggerCount + 1;
        setRetriggerCount(nextCount);

        if (nextCount >= 3) {
          setReferToItError(null);
          setBreDialogOpen(true);
        }
      }
    } catch (error) {
      setBreRetriggerError(error instanceof Error ? error.message : "Failed to retrigger BRE.");
    } finally {
      setBreRetriggerLoading(false);
    }
  };

  const handleReferToIt = async () => {
    if (!applicationId || !roleType) {
      setReferToItError("Missing application or role information.");
      return;
    }

    try {
      setReferToItLoading(true);
      setReferToItError(null);

      await dispatch(
        referToItThunk({
          applicationId,
          roleType,
          decision: "Refer to IT",
        }),
      ).unwrap();

      setBreDialogOpen(false);
      navigate("/retail/inbox", {
        state: {
          snackbarMessage: "Case has been referred to IT successfully",
        },
      });
    } catch (error) {
      setReferToItError(error instanceof Error ? error.message : "Failed to refer to IT.");
    } finally {
      setReferToItLoading(false);
    }
  };

  const getDisplayText = (text: string) => {
    return truncateText(text, 80);
  };

  const renderBreDetail = (item: { label: string; value: string }, key: string) => {
    const isLongText = item.value.length > 80;

    return (
      <Box key={key} sx={{ ...columnFlex }}>
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
                textDecoration: "underline",
              }}
            >
              show more
            </Box>
          )}
        </Typography>
      </Box>
    );
  };

  return (
    <Container disableGutters>
      <CustomAccordion
        title="BRE Decision"
        chip={
          currentBreDecision?.decision ? (
            <Badge label={currentBreDecision.decision} variant="Low" />
          ) : null
        }
      >
        <Box
          sx={{
            backgroundColor: "#f6f6f6",
            padding: "16px",
            marginTop: "8px",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "0.8fr 2.5fr 2.5fr 1.5fr 0.5fr",
              gap: "16px",
            }}
          >
            {coreBreDetails.map((item, index) => renderBreDetail(item, `core-${item.label}-${index}`))}

            <Box
              sx={{
                ...centerFlex,
              }}
            >
              <Box
                component="span"
                onClick={() => {
                  void handleRetrigger();
                }}
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

          {breRetriggerError && (
            <Typography
              sx={{
                mt: 2,
                fontSize: "13px",
                color: "#DE2C3B",
              }}
            >
              {breRetriggerError}
            </Typography>
          )}

          {additionalBreDetails.length > 0 && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: "1px solid #E3E3E3",
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "16px",
              }}
            >
              {additionalBreDetails.map((item, index) => renderBreDetail(item, `extra-${item.label}-${index}`))}
            </Box>
          )}
        </Box>

        <CustomDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={
            <Typography
              sx={{
                ...modalTitleStyles,
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
                ...modalTitleStyles,
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
                void handleReferToIt();
              }}
              disabled={referToItLoading}
              sx={{ borderRadius: "50px", paddingX: "40px" }}
            >
              {referToItLoading ? "Submitting..." : "Refer to IT"}
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
          {referToItError && (
            <Typography
              sx={{
                mt: 1,
                fontSize: "13px",
                color: "#DE2C3B",
              }}
            >
              {referToItError}
            </Typography>
          )}
        </CustomDialog>
      </CustomAccordion>
    </Container>
  );
};

export default BreDecision;
