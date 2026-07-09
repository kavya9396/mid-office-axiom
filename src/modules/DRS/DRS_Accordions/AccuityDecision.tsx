import { Box, Container, Typography } from "@mui/material";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTextField from "../../../components/ui/TextField/TextField";
import type { RootState } from "../../../store/store";

type AccuityRule = {
  description: string;
  status: string;
  workflowPoolAction: string;
  finalActionInWorkflow: string;
};

const ACCUITY_RULES: Record<string, AccuityRule> = {
  C: {
    description: "Changed",
    status: "Open",
    workflowPoolAction: "Will be seen in Accuity Pool",
    finalActionInWorkflow: "Terminal decision not allowed, except Dec/ Post/ AMR",
  },
  "3": {
    description: "Escalate to CUW Manager",
    status: "Open",
    workflowPoolAction: "Will be seen in Accuity Pool",
    finalActionInWorkflow: "Terminal decision not allowed, except Dec/ Post/ AMR",
  },
  G: {
    description: "False Positive",
    status: "Closed no further check required",
    workflowPoolAction: "Will NOT be seen in Accuity Pool",
    finalActionInWorkflow: "CUW Pool, no control required",
  },
  R: {
    description: "Passed by Rules",
    status: "Closed no further check required",
    workflowPoolAction: "Will NOT be seen in Accuity Pool",
    finalActionInWorkflow: "CUW Pool, no control required",
  },
  B: {
    description: "True Match",
    status: "Status is closed but to process further HOD approval will be required",
    workflowPoolAction: "Will NOT be seen in Accuity Pool",
    finalActionInWorkflow: "CUW HOD approval mandatory",
  },
  O: {
    description: "Open",
    status: "Open",
    workflowPoolAction: "Will be seen in Accuity Pool",
    finalActionInWorkflow: "Terminal decision not allowed, except Dec/ Post/ AMR",
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
      description: rule.description,
      workflowPoolAction: rule.workflowPoolAction,
      finalActionInWorkflow: rule.finalActionInWorkflow,
      fircoAcsUrl,
    };
  }, [dataRecord]);

  const handleOpenFircoAcs = () => {
    const targetUrl = resolved.fircoAcsUrl || "https://firco.example.com";
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion
          title="UW Decision"
          defaultExpanded
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.2 }}>
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

          <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#f6f6f6" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "12px", color: "#6A6A6A", mb: 0.6 }}>
                  Revised Status Code
                </Typography>
                <CustomTextField fullWidth value={resolved.revisedStatusCode} disabled size="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: "12px", color: "#6A6A6A", mb: 0.6 }}>
                  Status
                </Typography>
                <CustomTextField fullWidth value={resolved.status} disabled size="small" />
              </Box>
            </Box>

            <Box sx={{ mt: 1.5, display: "grid", gap: 0.8 }}>
              <Typography sx={{ fontSize: "12px", color: "#3F3F3F" }}>
                Description: {resolved.description}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#3F3F3F" }}>
                Workflow Pool Action: {resolved.workflowPoolAction}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#3F3F3F" }}>
                Final Action in Workflow: {resolved.finalActionInWorkflow}
              </Typography>
            </Box>
          </Box>
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default AccuityDecision;
