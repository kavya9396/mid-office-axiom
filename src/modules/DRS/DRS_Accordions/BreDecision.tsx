import { Box, Container, Typography, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import Badge from "../../../components/ui/Badge/Badge";
import {
  centerFlex,
  modalTitleStyles,
} from "../../../utils/styles";
import { RefreshIcon } from "../../../icons/Icons";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import CustomButton from "../../../components/ui/Button/Button";
import type { RootState } from "../../../store/store";
import { useSelector } from "react-redux";
import type {
  BreDecisionResponse,
  DRSBreOutput,
} from "../../../types/drs.types";
import { formatDateForUI } from "../../../utils/helpers";
import { useAppContext } from "../../../hooks/useAppContext";
import { useAppDispatch } from "../../../store/hooks";
import { breRetriggerThunk } from "../../../store/thunks/breRetriggerThunk";
import { referToItThunk } from "../../../store/thunks/referToItThunk";
import { setBreExternalApiOutputs } from "../../../store/slices/drsSlice";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";

type BreDecisionExtraField = {
  label: string;
  value?: string | null;
  visibleWhen?: "always" | "success" | "failure";
};

interface BreDecisionProps {
  extraFields?: BreDecisionExtraField[];
  breDecisionOverride?: BreDecisionResponse | null;
}

const mapBreOutputToDecision = (
  breOutput: DRSBreOutput,
  initialBreOutput?: DRSBreOutput | null,
): BreDecisionResponse => ({
  decision: breOutput.decisionTypes?.breDecision ?? null,
  status: "Success",
  remarks: breOutput.breRemarks ?? null,
  discrepancy: breOutput.decisionTypes?.breRequirement?.replace(/ /g, "#") ?? null,
  timestamp: breOutput.systemDecisionDateTime ?? null,
  initialDecision:
    initialBreOutput?.decisionTypes?.breDecision ??
    breOutput.decisionTypes?.initialDecision ??
    breOutput.decisionTypes?.breInitialDecision ??
    null,
  retrigger:
    // Some BRE retrigger responses include a reTriggerCount or retriggerCount
    // when they come from the retrigger API. Treat any positive count as true.
    ((breOutput.reTriggerCount ?? (breOutput as any).retriggerCount) as number) > 0
      ? true
      : null,
});

const toText = (value: unknown) => String(value ?? "").trim();

const formatMaybeDate = (value: unknown): string => {
  const text = String(value ?? "").trim();
  if (!text) return "-";

  // Try native parse first (ISO and common formats)
  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) {
    return `${formatDateForUI(new Date(parsed))}`;
  }

  // Handle legacy formats like '01/04/2026, 1300hrs' or '01/04/2026 1300hrs'
  const legacyMatch = text.match(/^\s*(\d{2})\/(\d{2})\/(\d{4})(?:[,\s]+(\d{3,4})hrs)?\s*$/i);
  if (legacyMatch) {
    const day = Number(legacyMatch[1]);
    const month = Number(legacyMatch[2]);
    const year = Number(legacyMatch[3]);
    const hm = legacyMatch[4] ? legacyMatch[4].padStart(4, "0") : "0000";
    const hour = Number(hm.slice(0, hm.length - 2));
    const minute = Number(hm.slice(-2));

    // Construct a UTC timestamp that corresponds to the given IST local time.
    // IST = UTC+5:30, so subtract the offset to get UTC milliseconds.
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const utcMillis = Date.UTC(year, month - 1, day, hour, minute) - istOffsetMs;
    return `${formatDateForUI(new Date(utcMillis))}`;
  }

  return text;
};

const getFirstText = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = toText(record[key]);
    if (value) {
      return value;
    }
  }

  return "";
};

const mapLegacyBreDecisionToOutput = (value: unknown): DRSBreOutput | null => {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

  if (!record) {
    return null;
  }

  const decision = getFirstText(record, ["decision", "breDecision", "finalDecision"]);
  const initialDecision = getFirstText(record, [
    "initialDecision",
    "initialBreDecision",
    "breInitialDecision",
    "initialBREDecision",
    "initial_decision",
    "previousDecision",
    "preDecision",
  ]);
  const remarks = getFirstText(record, ["remarks", "breRemarks"]);
  const discrepancy = getFirstText(record, ["discrepancy", "breRequirement"]);

  if (!decision && !initialDecision && !remarks && !discrepancy) {
    return null;
  }

  return {
    systemDecision: decision,
    decisionTypes: {
      breDecision: decision,
      breAction: toText(record.action),
      breRequirement: discrepancy,
      initialDecision,
    },
    requirements: [],
    systemDecisionDateTime: toText(record.timestamp),
    errorResp: "",
    breRemarks: remarks,
  };
};

const normalizeValue = (value: string | null | undefined) =>
  String(value ?? "").trim().toLowerCase();

const normalizeDiscrepancy = (value: string | null | undefined) =>
  normalizeValue(value).replace(/#/g, " ").replace(/\s+/g, " ").trim();

const BreDecision = ({
  extraFields = [],
  breDecisionOverride = null,
}: BreDecisionProps) => {
  const dispatch = useAppDispatch();
  const { applicationNumber, businessType } = useAppContext();
  const { data } = useSelector((state: RootState) => state.drs);

  const initialBreOutput = data?.externalAPIs?.initialBreOutput;
  const breOutput = data?.externalAPIs?.breOutput;
  const isBreRetriggerFailure = data?.externalAPIs?.breRetriggerStatus === "failure";
  const legacyBreOutput = mapLegacyBreDecisionToOutput(
    (data as unknown as Record<string, unknown> | null)?.breDecision,
  );
  const legacyBreDecisionRecord = (data as unknown as Record<string, unknown> | null)?.breDecision;
  const legacyBreDecisionText = legacyBreDecisionRecord && typeof legacyBreDecisionRecord === "object" && !Array.isArray(legacyBreDecisionRecord)
    ? getFirstText(legacyBreDecisionRecord as Record<string, unknown>, [
      "initialDecision",
      "initialBreDecision",
      "breInitialDecision",
      "initialBREDecision",
      "initial_decision",
      "previousDecision",
      "preDecision",
    ])
    : "";

  const drsBreDecision: BreDecisionResponse | null = breOutput
    ? mapBreOutputToDecision(breOutput, initialBreOutput)
    : null;

  const breDecision =
    drsBreDecision || breDecisionOverride
      ? {
          ...(drsBreDecision ?? {}),
          ...(breDecisionOverride ?? {}),
        }
      : null;
  const navigate = useNavigate();
  const safeBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType")) ??
    "retail";
  const roleType = localStorage.getItem("roleType") ?? "";
  const applicationId = applicationNumber ?? "";

  const [bredialogOpen, setBreDialogOpen] = useState(false);
  const retriggerCount = 0;
  const [retriggeredBreDecision, setRetriggeredBreDecision] =
    useState<BreDecisionResponse | null>(null);
  const [breRetriggerLoading, setBreRetriggerLoading] = useState(false);
  const [breRetriggerError, setBreRetriggerError] = useState<string | null>(
    null,
  );
  const [referToItLoading, setReferToItLoading] = useState(false);
  const [referToItError, setReferToItError] = useState<string | null>(null);

  const currentBreDecision = retriggeredBreDecision ?? breDecision;
  const resolvedRemarks =
    isBreRetriggerFailure ? "-" : currentBreDecision?.remarks ?? drsBreDecision?.remarks ?? "-";
  const resolvedDiscrepancy =
    isBreRetriggerFailure ? "-" : currentBreDecision?.discrepancy ?? drsBreDecision?.discrepancy ?? "-";
  const initialBreSource = initialBreOutput ?? legacyBreOutput;
  const finalBreSource = isBreRetriggerFailure ? undefined : breOutput;
  const initialBreDecisionRaw =
    initialBreSource?.decisionTypes?.initialDecision ??
    initialBreSource?.decisionTypes?.breInitialDecision ??
    legacyBreDecisionText ??
    currentBreDecision?.initialDecision ??
    initialBreSource?.decisionTypes?.breDecision ??
    "";

  const hasValue = (value: unknown) =>
    value !== null && value !== undefined && String(value).trim() !== "";

  const hasFinalBreResponse =
    !isBreRetriggerFailure &&
    !!currentBreDecision &&
    Object.values(currentBreDecision).some((value) => hasValue(value));

  const resolvedFinalBreStatus = hasFinalBreResponse ? "Success" : "Failure";
  const resolvedInitialBreStatus = initialBreSource ? "Success" : "Failure";

  const isBreSuccess = resolvedFinalBreStatus.toLowerCase() === "success";

  // This count should come from backend.
  // const isRetriggerDisabled =
  //   isBreSuccess || retriggerCount >= 3 || breRetriggerLoading;

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

  const breDecisionParams = currentBreDecision as Record<
    string,
    unknown
  > | null;

  const getBreDecisionValue = (keys: string[]) => {
    if (!breDecisionParams) return undefined;
    return keys
      .map((key) => breDecisionParams[key])
      .find((value) => hasValue(value));
  };

  const conditionalBreDecisionParams = [
    {
      label: "Decision",
      value: getBreDecisionValue(["medicalDecision", "financialDecision"]),
    },
    {
      label: "Decision Date",
      value: getBreDecisionValue([
        "medicalDecisionDate",
        "financialDecisionDate",
      ]),
    },
    {
      label: "Discrepancy",
      value: getBreDecisionValue([
        "medicalDiscrepancy",
        "financialDiscrepancy",
      ]),
    },
    {
      label: "Remarks",
      value: getBreDecisionValue(["medicalRemarks", "financialRemarks"]),
    },
  ]
    .filter((item) => hasValue(item.value))
    .map((item) => ({
      label: item.label,
      value: item.label.toLowerCase().includes("date") ? formatMaybeDate(item.value) : String(item.value),
    }));

  const initialBreDecisionValue = initialBreDecisionRaw || "-";
  const finalBreDecisionValue =
    finalBreSource?.decisionTypes?.breDecision ?? currentBreDecision?.decision ?? "-";
  const initialBreRemarksValue = initialBreSource?.breRemarks ?? "-";
  const finalBreRemarksValue = finalBreSource?.breRemarks ?? resolvedRemarks;
  const initialBreDiscrepancyValue =
    initialBreSource?.decisionTypes?.breRequirement?.replace(/ /g, "#") ??
    "-";
  const finalBreDiscrepancyValue =
    finalBreSource?.decisionTypes?.breRequirement?.replace(/ /g, "#") ??
    resolvedDiscrepancy;
  const initialBreTimestampValue =
    initialBreSource?.systemDecisionDateTime ?? "-";
  const finalBreTimestampValue =
    finalBreSource?.systemDecisionDateTime ?? currentBreDecision?.timestamp ?? "-";

  const normalizedInitialBreDecision = normalizeValue(
    initialBreDecisionRaw,
  );
  const normalizedFinalBreDecision = normalizeValue(
    finalBreSource?.decisionTypes?.breDecision ?? currentBreDecision?.decision ?? "",
  );
  const normalizedInitialRemarks = normalizeValue(
    initialBreSource?.breRemarks ?? "",
  );
  const normalizedFinalRemarks = normalizeValue(finalBreRemarksValue);
  const normalizedInitialDiscrepancy = normalizeDiscrepancy(
    initialBreSource?.decisionTypes?.breRequirement ?? "",
  );
  const normalizedFinalDiscrepancy = normalizeDiscrepancy(
    finalBreSource?.decisionTypes?.breRequirement ?? resolvedDiscrepancy,
  );

  // Extract all alphanumeric discrepancy codes (tokens) from a requirement string.
  const extractDiscrepancyCodes = (value: string | null | undefined): string[] => {
    const text = String(value ?? "").toUpperCase();
    if (!text.trim()) return [];
    const cleaned = text.replace(/[^A-Z0-9]+/gi, " ").trim();
    if (!cleaned) return [];
    return Array.from(new Set(cleaned.split(/\s+/).filter(Boolean)));
  };

  const initialDiscrepancyCodes = extractDiscrepancyCodes(initialBreSource?.decisionTypes?.breRequirement ?? "");
  const finalDiscrepancyCodes = extractDiscrepancyCodes(finalBreSource?.decisionTypes?.breRequirement ?? resolvedDiscrepancy);

  const hasDecisionChanged =
    normalizedInitialBreDecision !== "" &&
    normalizedFinalBreDecision !== "" &&
    normalizedInitialBreDecision !== normalizedFinalBreDecision;
  const hasRemarksChanged =
    normalizedInitialRemarks !== "" &&
    normalizedFinalRemarks !== "" &&
    normalizedInitialRemarks !== normalizedFinalRemarks;

  // Compare sets of codes: highlight when sets differ or when one side has codes and the other doesn't.
  const hasDiscrepancyChanged = (() => {
    if (initialDiscrepancyCodes.length === 0 && finalDiscrepancyCodes.length === 0) return false;
    if (initialDiscrepancyCodes.length === 0 || finalDiscrepancyCodes.length === 0) return true;

    const a = new Set(initialDiscrepancyCodes);
    const b = new Set(finalDiscrepancyCodes);

    if (a.size !== b.size) return true;

    for (const code of a) {
      if (!b.has(code)) return true;
    }

    return false;
  })();

  const shouldShowInitialBreSection =
    Boolean(initialBreSource) &&
    (isBreRetriggerFailure || hasDecisionChanged || normalizedInitialBreDecision !== "");

  const additionalBreDetails = [
    ...conditionalBreDecisionParams,
    ...conditionalFields,
  ];

  const breTableRows = [
    {
      label: "BRE Status",
      initialValue: shouldShowInitialBreSection ? resolvedInitialBreStatus : "-",
      finalValue: resolvedFinalBreStatus,
    },
    {
      label: "BRE Decision",
      initialValue: shouldShowInitialBreSection ? initialBreDecisionValue : "-",
      finalValue: finalBreDecisionValue,
    },
    {
      label: "BRE Remarks",
      initialValue: shouldShowInitialBreSection ? initialBreRemarksValue : "-",
      finalValue: finalBreRemarksValue,
      highlight: false,
    },
    {
      label: "BRE Discrepancy",
      initialValue: shouldShowInitialBreSection ? initialBreDiscrepancyValue : "-",
      finalValue: finalBreDiscrepancyValue,
      highlight: shouldShowInitialBreSection && hasDiscrepancyChanged,
    },
    {
      label: "BRE Timestamp",
      initialValue: shouldShowInitialBreSection ? formatMaybeDate(initialBreTimestampValue) : "-",
      finalValue: shouldShowInitialBreSection ? formatMaybeDate(finalBreTimestampValue) : "-",
    },
    ...additionalBreDetails.map((item) => ({
      label: item.label,
      initialValue: "-",
      finalValue: item.value,
    })),
  ];

  const handleRetrigger = async () => {
    if (retriggerCount >= 3) {
      setReferToItError(null);
      setBreDialogOpen(true);
      return;
    }

    if (!data) {
      setBreRetriggerError("Missing DRS response. Unable to retrigger BRE.");
      return;
    }

    try {
      setBreRetriggerLoading(true);
      setBreRetriggerError(null);

      const response = await dispatch(
        breRetriggerThunk({
           eventName: "BRE-RETAIL",
                            applicationNumber:applicationId
        }),
      ).unwrap();

      const updatedBreOutput = response.data?.breOutput;
      if (!updatedBreOutput) {
        setBreRetriggerError("BRE retrigger did not return updated data.");
        return;
      }
      const updatedInitialBreOutput = response.data?.initialBreOutput;
      const preservedInitialBreOutput = initialBreOutput ?? breOutput;

      dispatch(
        setBreExternalApiOutputs({
          breOutput: updatedBreOutput,
          initialBreOutput: preservedInitialBreOutput ?? updatedInitialBreOutput,
          breRetriggerStatus: "success",
        }),
      );
      setRetriggeredBreDecision(
        mapBreOutputToDecision(
          updatedBreOutput,
          preservedInitialBreOutput ?? updatedInitialBreOutput,
        ),
      );
    } catch (error) {
      dispatch(
        setBreExternalApiOutputs({
          initialBreOutput: initialBreOutput ?? breOutput ?? legacyBreOutput ?? undefined,
          breRetriggerStatus: "failure",
        }),
      );
      setBreRetriggerError(
        error instanceof Error ? error.message : "Failed to retrigger BRE.",
      );
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
      navigate(getInboxPath(safeBusinessType), {
        state: {
          snackbarMessage: "Case has been referred to IT successfully",
        },
      });
    } catch (error) {
      setReferToItError(
        error instanceof Error ? error.message : "Failed to refer to IT.",
      );
    } finally {
      setReferToItLoading(false);
    }
  };

  const breGridTemplate = "minmax(132px, 0.7fr) minmax(0, 1fr) minmax(0, 1fr)";
  const breHeaderCellStyles = {
    px: 1.25,
    py: 0.75,
    minHeight: 36,
    display: "flex",
    alignItems: "center",
    color: "#161616",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0,
    borderRight: "1px solid #D8DDE3",
  };

 const renderBreTableCell = (
  value: string,
  key: string,
  highlight = false,
  ) => (
    <Box
      key={key}
      sx={{
        px: 1.25,
        py: 0.75,
        minHeight: 36,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          color: "#161616",
          fontWeight: 600,
          fontSize: "12.5px",
          lineHeight: "17px",
          overflowWrap: "anywhere",
          whiteSpace: "pre-wrap",
        }}
      >
        <Box
          component="span"
          sx={
            highlight
              ? {
                  backgroundColor: "#FFF59D",
                  px: 0.4,
                  borderRadius: "2px",
                }
              : undefined
          }
        >
          {value}
        </Box>
      </Typography>
    </Box>
  );
const breTitle = roleType === 'GUW_FORMAL_TASK' || roleType === 'DVT_FORMAL_TASK' ? "WegaPlus BRE Decision" : "BRE Decision";
  return (
    <Container disableGutters>
      <CustomAccordion
      defaultExpanded
        title={breTitle}
        chip={
          currentBreDecision?.decision ? (
            <Badge label={currentBreDecision.decision} variant="Low" />
          ) : null
        }
      >
        <Box
          sx={{
            mt: 1,
          }}
        >
          <Box
            sx={{
              border: "1px solid #D8DDE3",
              borderRadius: "6px",
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: breGridTemplate,
                bgcolor: "#F7F8FA",
                borderBottom: "1px solid #D8DDE3",
              }}
            >
              {["BRE", "Initial BRE"].map((header) => (
                <Typography
                  key={header}
                  sx={breHeaderCellStyles}
                >
                  {header}
                </Typography>
              ))}

              <Box
                sx={{
                  px: 1.25,
                  py: 0.5,
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    color: "#161616",
                    fontSize: "12px",
                    lineHeight: "16px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  Final BRE
                </Typography>
                <Button
                  data-drs-bre-retrigger="true"
                  // disabled={isRetriggerDisabled}
                  aria-label={breRetriggerLoading ? "Retriggering BRE" : "Retrigger BRE"}
                  onClick={() => {
                    handleRetrigger();
                  }}
                  sx={{
                    color: "#9A2529",
                    border: "1px solid #9A2529",
                    minWidth: 0,
                    width: 28,
                    height: 28,
                    p: 0,
                    borderRadius: "6px",
                    cursor: "pointer",
                    opacity: 1,
                    flexShrink: 0,
                    ...centerFlex,
                  }}
                >
                  {breRetriggerLoading ? (
                    <CircularProgress size={18} thickness={5} sx={{ color: "#9A2529" }} />
                  ) : (
                    <RefreshIcon />
                  )}
                </Button>
              </Box>
            </Box>
            {breTableRows.map((row, index) => (
              <Box
                key={`${row.label}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: breGridTemplate,
                  borderTop: index === 0 ? 0 : "1px solid #E6E8EC",
                  backgroundColor: index % 2 === 0 ? "#fff" : "#FCFCFD",
                }}
              >
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.75,
                    minHeight: 36,
                    display: "flex",
                    alignItems: "center",
                    borderRight: "1px solid #E6E8EC",
                    backgroundColor: "rgba(247, 248, 250, 0.7)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#444444",
                      fontSize: "12px",
                      lineHeight: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {row.label}
                  </Typography>
                </Box>

                <Box sx={{ borderRight: "1px solid #E6E8EC" }}>
                  {renderBreTableCell(
                    row.initialValue,
                    `initial-${row.label}-${index}`,
                    row.highlight,
                  )}
                </Box>

                {renderBreTableCell(
                  row.finalValue,
                  `final-${row.label}-${index}`,
                  row.highlight,
                )}
              </Box>
            ))}
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
        </Box>

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
            You have exhausted the retriggered of BRE. Kindly refer this ticket
            to IT Team.
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
