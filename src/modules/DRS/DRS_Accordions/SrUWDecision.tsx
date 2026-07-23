import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import type { AppDispatch, RootState } from "../../../store/store";
import { referralUsersThunk } from "../../../store/thunks/referralUsersThunk";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";
import { normalizeMasterOptions } from "../../../utils/masterOptions";

type DecisionOption = {
  label: string;
  value: string;
};

const fallbackSrUwDecisionOptions: DecisionOption[] = [
  { label: "Agree", value: "Agree" },
  { label: "Disagree", value: "Disagree" },
  { label: "Refer to CMO", value: "Refer to CMO" },
  { label: "Refer back to last UW", value: "Refer back to last UW" },
  { label: "Refer to HoD", value: "Refer to HoD" },
];

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

const formatDateTime = (value: Date): string => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(value);
};

const SrUWDecision = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { businessType } = useAppContext();

  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";

  const currentUserId = useMemo(
    () =>
      (
        localStorage.getItem("userId") ??
        localStorage.getItem("username") ??
        localStorage.getItem("userName") ??
        ""
      ).trim() || "-",
    [],
  );

  const dateTimeStamp = useMemo(() => formatDateTime(new Date()), []);

  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedHoD, setSelectedHoD] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const users = useSelector((state: RootState) => state.referralUsers.users);
  const drsData = useSelector((state: RootState) => state.drs.data as unknown as Record<string, unknown> | null);
  const masters = useSelector((state: RootState) => state.drs.masters);

  const srUwDecisionOptions = useMemo(() => {
    const masterOptions = normalizeMasterOptions(masters.srUwDecision);
    return masterOptions.length > 0 ? masterOptions : fallbackSrUwDecisionOptions;
  }, [masters.srUwDecision]);

  const hoDOptions = useMemo(
    () =>
      users.map((user) => ({
        label: user.userName,
        value: user.userId,
      })),
    [users],
  );

  const lastRoleRef = useRef<string | null>(null);

  useEffect(() => {
    if (decision !== "Refer to HoD") {
      return;
    }

    const role = "HoD";
    if (lastRoleRef.current === role) {
      return;
    }

    lastRoleRef.current = role;
    dispatch(referralUsersThunk({ role }));
  }, [decision, dispatch]);

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
      return "Please select a Sr.UW decision.";
    }

    if (decision === "Refer back to last UW" && lastUwUser) {
      return `Kindly reconfirm if you want to proceed with the case as "${decision}" for ${lastUwUser}`;
    }

    if (decision === "Refer to HoD") {
      const selectedName = hoDOptions.find((item) => item.value === selectedHoD)?.label;
      if (selectedName) {
        return `Kindly reconfirm if you want to proceed with the case as "${decision}" for ${selectedName}`;
      }
    }

    return `Kindly reconfirm if you want to proceed with the case as "${decision}"`;
  }, [decision, hoDOptions, lastUwUser, selectedHoD]);

  const isSubmitDisabled =
    !decision ||
    remarks.trim() === "" ||
    (decision === "Refer to HoD" && !selectedHoD);

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
        <CustomAccordion title="Sr.UW Decision" defaultExpanded>
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
                label="Sr.UW Decision"
                value={decision}
                onChange={(value: string) => {
                  setDecision(value);
                  if (value !== "Refer to HoD") {
                    setSelectedHoD("");
                  }
                }}
                options={srUwDecisionOptions}
              />

              {decision === "Refer to HoD" && (
                <CustomSelect
                  label="Name of HoD"
                  value={selectedHoD}
                  onChange={setSelectedHoD}
                  options={hoDOptions}
                />
              )}

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
                  <CustomTextField fullWidth value={lastUwUser || "-"} disabled size="small" />
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
                Sr.UW Remarks
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

            <Box
              sx={{
                mt: 2,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#444",
                    mb: 1,
                  }}
                >
                  User ID
                </Typography>
                <CustomTextField fullWidth size="small" value={currentUserId} disabled />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#444",
                    mb: 1,
                  }}
                >
                  Date/Time stamp
                </Typography>
                <CustomTextField fullWidth size="small" value={dateTimeStamp} disabled />
              </Box>
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

export default SrUWDecision;
