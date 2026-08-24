import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTextField from "../../../components/ui/TextField/TextField";
import type { RootState } from "../../../store/store";

type AccuityRule = {
  status: string;
};

const ACCUITY_RULES: Record<string, AccuityRule> = {
  C: {
    status: "Open",
  },
  "3": {
    status: "Open",
  },
  G: {
    status: "Closed no further check required",
  },
  R: {
    status: "Closed no further check required",
  },
  B: {
    status: "Status is closed but to process further HOD approval will be required",
  },
  O: {
    status: "Open",
  },
};

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

const pickText = (source: Record<string, unknown> | null, keys: string[]): string => {
  if (!source) return "";

  for (const key of keys) {
    const value = toText(source[key]);
    if (value) {
      return value;
    }
  }

  return "";
};

const AccuityDecision = () => {
  const dataRecord = useSelector(
    (state: RootState) => state.drs.data as unknown as Record<string, unknown> | null,
  );

  const resolved = useMemo(() => {
    const root = dataRecord ?? {};
    const accuity = toRecord(root.accuityDecision) ?? toRecord(root.accuity);
    const quickLinks = toRecord(root.quickLinks);
    const externalApis = toRecord(root.externalAPIs);

    const revisedStatusCodeRaw =
      pickText(accuity, ["revisedStatusCode", "statusCode", "fircoStatusCode"]) ||
      pickText(quickLinks, ["revisedStatusCode", "fircoStatusCode"]) ||
      pickText(externalApis, ["revisedStatusCode", "fircoStatusCode"]);

    const revisedStatusCode = revisedStatusCodeRaw.toUpperCase() || "C";
    const rule = ACCUITY_RULES[revisedStatusCode] ?? ACCUITY_RULES.C;

    const status =
      pickText(accuity, ["status", "currentStatus"]) ||
      rule.status;

    const fircoAcsUrl =
      pickText(accuity, ["fircoAcsUrl", "fircoUrl", "acsLink"]) ||
      pickText(quickLinks, ["fircoAcsUrl", "fircoUrl", "acsLink"]);

    return {
      revisedStatusCode,
      status,
      fircoAcsUrl,
    };
  }, [dataRecord]);

  const handleOpenFircoAcs = () => {
    const targetUrl = resolved.fircoAcsUrl || "https://firco.example.com";
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion
        title="UW Decision"
        defaultExpanded
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.6 }}>
          <CustomButton
            variant="outlined"
            onClick={handleOpenFircoAcs}
            sx={{
              borderRadius: "8px",
              borderColor: "#C43B40",
              color: "#C43B40",
              fontSize: "11px",
              fontWeight: 600,
              px: 1.5,
              minWidth: "90px",
              height: "24px",
              textTransform: "uppercase",
              "&:hover": {
                borderColor: "#A83337",
                backgroundColor: "#fff5f5",
              },
            }}
          >
            FIRCO ACS
          </CustomButton>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: "6px", backgroundColor: "#f6f6f6" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
              gap: 1,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "11.5px", color: "#6A6A6A", mb: 0.35 }}>
                Revised Status Code
              </Typography>
              <CustomTextField fullWidth value={resolved.revisedStatusCode} disabled size="small" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "11.5px", color: "#6A6A6A", mb: 0.35 }}>
                Status
              </Typography>
              <CustomTextField fullWidth value={resolved.status} disabled size="small" />
            </Box>
          </Box>
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default AccuityDecision;
