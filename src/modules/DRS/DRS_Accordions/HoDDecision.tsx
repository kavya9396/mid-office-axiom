import { Box, Container, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import type { RootState } from "../../../store/store";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";
import { normalizeDecisionOptions, toMasterLabel } from "../../../utils/masterOptions";

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const toText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const parseDateTime = (value: unknown): number => {
  const parsed = Date.parse(toText(value));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const isUwLike = (value: unknown): boolean => {
  const text = String(value ?? "").toUpperCase();
  return text.includes("UW") || text.includes("CUW") || text.includes("UNDERWRITER");
};

const HoDDecision = () => {
  const navigate = useNavigate();
  const { businessType } = useAppContext();

  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const drsData = useSelector((state: RootState) => state.drs.data as unknown as Record<string, unknown> | null);
  const masters = useSelector((state: RootState) => state.drs.masters);

  const hodDecisionOptions = useMemo(() => normalizeDecisionOptions(masters, "hodDecision", true, true), [masters]);

  const lastUwUser = useSelector((state: RootState) => {
    const drsData = state.drs.data as unknown as Record<string, unknown> | null;
    if (!drsData) return "";

    const historyRoot = drsData.decisionHistory;
    let historyRows: Array<Record<string, unknown>> = [];

    if (Array.isArray(historyRoot)) {
      historyRows = historyRoot
        .map((item) => toRecord(item))
        .filter((item): item is Record<string, unknown> => Boolean(item));
    } else {
      const historyRecord = toRecord(historyRoot);
      if (historyRecord) {
        historyRows = Object.values(historyRecord)
          .flatMap((item) => (Array.isArray(item) ? item : []))
          .map((item) => toRecord(item))
          .filter((item): item is Record<string, unknown> => Boolean(item));
      }
    }

    if (historyRows.length === 0) {
      const quickLinks = toRecord(drsData.quickLinks);
      const auditTrail = quickLinks?.auditTrail ?? drsData.auditTrail;

      if (Array.isArray(auditTrail)) {
        historyRows = auditTrail
          .map((item) => toRecord(item))
          .filter((item): item is Record<string, unknown> => Boolean(item));
      }
    }

    const sorted = [...historyRows].sort(
      (left, right) =>
        parseDateTime(right.dateTime ?? right.timestamp ?? right.createdAt) -
        parseDateTime(left.dateTime ?? left.timestamp ?? left.createdAt),
    );

    const uwEntry = sorted.find((row) => {
      return (
        isUwLike(row.fromRole) ||
        isUwLike(row.fromPool) ||
        isUwLike(row.decisionBy) ||
        isUwLike(row.userId)
      );
    });

    return toText(uwEntry?.decisionBy ?? uwEntry?.fromPoolUser ?? uwEntry?.userId);
  });

  const dialogMessage = useMemo(() => {
    if (!decision) {
      return "Please select a HoD decision.";
    }

    const label = toMasterLabel(decision, hodDecisionOptions);
    if (label === "Refer back to last UW" && lastUwUser) {
      return `Kindly reconfirm if you want to proceed with the case as "${label}" for ${lastUwUser}`;
    }

    return `Kindly reconfirm if you want to proceed with the case as "${label}"`;
  }, [decision, lastUwUser]);

  const isSubmitDisabled = !decision || remarks.trim() === "";

  const handleSubmitIntent = () => {
    const requirementValidation = validateRequirementDecision(drsData, decision);
    if (!requirementValidation.isValid) {
      setSubmitMessage(requirementValidation.message);
      return;
    }

    setSubmitMessage(null);
    setIsConfirmOpen(true);
  };

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="HoD Decision" defaultExpanded>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: "12px",
              backgroundColor: "#f6f6f6",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
                gap: 2,
              }}
            >
              <CustomSelect
                label="HoD Decision"
                value={decision}
                onChange={setDecision}
                options={hodDecisionOptions}
              />

              {decision === "Refer back to last UW" && (
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#444",
                      mb: 1,
                    }}
                  >
                    Last UW User
                  </Typography>
                  <CustomTextField
                    fullWidth
                    value={lastUwUser || "-"}
                    disabled
                    size="small"
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#444",
                  mb: 1,
                }}
              >
                HoD Remarks
              </Typography>
              <CustomTextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Enter remarks..."
                value={remarks}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.length <= 10000) {
                    setRemarks(value);
                  }
                }}
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                }}
              />
              <Typography
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: "12px",
                  color: "#888",
                  mt: 0.5,
                }}
              >
                {remarks.length}/10000
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
            }}
          >
            <CustomButton
              variant="contained"
              disabled={isSubmitDisabled}
              onClick={handleSubmitIntent}
              sx={{
                minWidth: 200,
                height: 44,
                borderRadius: "50px",
                fontWeight: 600,
                px: 3,
                whiteSpace: "nowrap",
              }}
            >
              Submit
            </CustomButton>
          </Box>
          {submitMessage && (
            <Typography sx={{ mt: 1, fontSize: 12, color: "#DE2C3B" }}>
              {submitMessage}
            </Typography>
          )}
        </CustomAccordion>

        <ConfirmationDialog
          open={isConfirmOpen}
          message={dialogMessage}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => navigate(getInboxPath(safeBusinessType))}
        />
      </Box>
    </Container>
  );
};

export default HoDDecision;
