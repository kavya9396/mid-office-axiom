import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import Badge from "../../../components/ui/Badge/Badge";
import CustomButton from "../../../components/ui/Button/Button";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import CustomTable, {
  type Column,
} from "../../../components/ui/Table/Table";

import { RefreshIcon } from "../../../icons/Icons";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath } from "../../../routes/routes";
import { useAppSelector } from "../../../store/hooks";
import type { AppDispatch } from "../../../store/store";
import { breThunk } from "../../../store/thunks/breThunk";
import { drsThunk } from "../../../store/thunks/drsThunk";
import type { BreResponse } from "../../../types/drs.types";
import { title } from "../../../utils/constant";
import { formatDate } from "../../../utils/dataFormat";

interface BreDecisionProps {
  readOnly?: boolean;
}

const BreDecision = ({
  readOnly = false,
}: BreDecisionProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    applicationNumber,
    businessType,
  } = useAppContext();

  const roleType =
    localStorage.getItem("roleType") ?? "";
    const userId = localStorage.getItem("username") ?? "";

  /*
   * Keep the complete DRS slice because the actual
   * DRS response is available under state.drs.data.
   */
  const drsState = useAppSelector(
    (state) => state.drs,
  );

  /*
   * Search API's inner response object.
   */
  const searchData = useAppSelector(
    (state) =>
      state.searchApplication.response?.data,
  );

  /*
   * Do not combine drsState and searchData into one
   * variable because they have different TypeScript types.
   */
  const breDecisionData = readOnly
    ? searchData?.breDecision
    : drsState.data?.breDecision;

  /*
   * Search response might not have latestBreDecision.
   * In that case, show breDecision as both initial and final.
   */
  const latestBreDecisionData = readOnly
    ?
    searchData?.latestBreDecision ??
      searchData?.breDecision
    : drsState.data?.latestBreDecision ??
      drsState.data?.breDecision;

  const [breResponse, setBreResponse] =
    useState<BreResponse | null>(null);

  const [bredialogOpen, setBreDialogOpen] =
    useState(false);

  /*
   * Manual BRE response must never be used while viewing
   * the searched application in read-only mode.
   */
  const finalBreDecisionData = readOnly
    ? undefined
    : breResponse?.data;

  const hasBreApiResponse =
    !readOnly &&
    Boolean(
      finalBreDecisionData?.breOutput,
    );

  const storageBusinessType = (
    businessType ||
    localStorage.getItem("businessType") ||
    "retail"
  ).trim()
    .toLowerCase();

  const eventName =
    storageBusinessType === "group"
      ? "BRE-GROUP"
      : "BRE-RETAIL";

  const handleRefresh = async () => {
    /*
     * Additional protection in case this function
     * is invoked programmatically.
     */
    if (readOnly) {
      return;
    }

    const reTriggerCount =
      latestBreDecisionData?.reTriggerCount ?? 0;

    if (reTriggerCount > 3) {
      setBreDialogOpen(true);
      return;
    }

    if (!applicationNumber) {
      console.error(
        "Application number is missing.",
      );
      return;
    }

    try {
      const response = await dispatch(
        breThunk({
          eventName,
          applicationNumber,
          businessType: storageBusinessType,
        }),
      ).unwrap();

      setBreResponse(response);

      await dispatch(
        drsThunk({
          applicationNo: applicationNumber,
          userId,
          roleType,
          sections: ["latestBreDecision"],
          businessType: storageBusinessType,
        }),
      ).unwrap();
    } catch (error) {
      console.error(
        "BRE API failed:",
        error,
      );
    }
  };

  /*
   * Final BRE values.
   *
   * A manual refresh uses the immediate BRE response.
   * A normal page load uses DRS latestBreDecision.
   */
  const finalBreDecision = hasBreApiResponse
    ? finalBreDecisionData?.breOutput
      ?.decisionTypes?.breDecision ?? ""
    : latestBreDecisionData?.decision ?? "";

  const finalBreRemarks = hasBreApiResponse
    ? finalBreDecisionData?.breOutput
      ?.breRemarks ?? ""
    : latestBreDecisionData?.remarks ?? "";

  const finalBreDiscrepancy =
    hasBreApiResponse
      ? finalBreDecisionData?.breOutput
        ?.decisionTypes?.breRequirement ?? ""
      : latestBreDecisionData?.discrepancy ??
      "";

  const finalBreTimestamp =
    hasBreApiResponse
      ? finalBreDecisionData?.breOutput
        ?.systemDecisionDateTime
      : latestBreDecisionData?.timestamp;

  const finalBreStatus = finalBreDecision;

  const isInitialBreSuccess =
    Boolean(breDecisionData);

  const isFinalBreSuccess =
    Boolean(finalBreStatus);

 const splitDiscrepancyCodes = (value?: string): string[] =>
  String(value ?? "")
    .split("#")
    .map((code) => code.trim())
    .filter(Boolean);

const renderDiscrepancy = (
  value?: string,
  compareValue?: string,
) => {
  const codes = splitDiscrepancyCodes(value);

  const compareCodes = new Set(
    splitDiscrepancyCodes(compareValue).map((code) =>
      code.toUpperCase(),
    ),
  );

  return (
    <Box
      sx={{
        whiteSpace: "normal",
        overflowWrap: "anywhere",
      }}
    >
      {codes.map((code, index) => {
        const isUpdated = !compareCodes.has(
          code.toUpperCase(),
        );

        return (
          <Box
            key={`${code}-${index}`}
            component="span"
          >
            {index > 0 && "#"}

            <Box
              component="span"
              sx={{
                backgroundColor: isUpdated
                  ? "#FFEAD7"
                  : "transparent",
              }}
            >
              {code}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

  const renderDifference = (
    value?: string,
    compareValue?: string,
  ) => {
    const isDifferent =
      value !== compareValue;

    return (
      <Box
        component="span"
        sx={{
          backgroundColor: isDifferent
            ? "#FFEAD7"
            : "transparent",
          px: isDifferent ? "2px" : 0,
        }}
      >
        {value}
      </Box>
    );
  };

  const showRefreshButton = !readOnly &&
    roleType !== "AMR_MEDICAL_TASK" &&
    roleType !== "AMR_NON_MEDICAL_TASK" && roleType !== "CPT_DATA_ENTRY_NMR_TASK" && roleType !== "CPT_DATA_ENTRY_MR_TASK";

  const breComparisonRows = [
    {
      label: "Status",
      initial: isInitialBreSuccess ? "Success" : "-",
      final: isFinalBreSuccess ? "Success" : "-",
    },
    {
      label: "Decision",
      initial: breDecisionData?.decision ?? "-",
      final: finalBreDecision || "-",
      renderInitial: () => renderDifference(breDecisionData?.decision ?? "-", finalBreDecision || "-"),
      renderFinal: () => renderDifference(finalBreDecision || "-", breDecisionData?.decision ?? "-"),
    },
    {
      label: "Remarks",
      initial: breDecisionData?.remarks ?? "-",
      final: finalBreRemarks || "-",
    },
    {
      label: "Discrepancy",
      initial: breDecisionData?.discrepancy ?? "-",
      final: finalBreDiscrepancy || "-",
      renderInitial: () => renderDiscrepancy(breDecisionData?.discrepancy ?? undefined, finalBreDiscrepancy ?? undefined),
      renderFinal: () => renderDiscrepancy(finalBreDiscrepancy ?? undefined, breDecisionData?.discrepancy ?? undefined),
    },
    {
      label: "Timestamp",
      initial: formatDate(breDecisionData?.timestamp) ?? "-",
      final: formatDate(finalBreTimestamp) ?? "-",
    },
  ];

  const referToIT = () => {
    setBreDialogOpen(false);
    navigate(getInboxPath());
  };

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion
        title={title.breDecision}
        chip={
          <Badge
            label={finalBreStatus}
            variant="Low"
          />
        }
        defaultExpanded
      >
        <Box
          sx={{
            border: "1px solid #E3E7EB",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(120px, 0.85fr) minmax(0, 1fr) minmax(0, 1fr)",
              backgroundColor: "#FFF0E2",
              borderBottom: "1px solid #E3E7EB",
            }}
          >
            <Typography sx={{ p: 1, fontSize: 11, fontWeight: 700, color: "#5C2B1A" }}>
              BRE CHECK
            </Typography>
            <Typography sx={{ p: 1, fontSize: 11, fontWeight: 700, color: "#5C2B1A" }}>
              Initial BRE
            </Typography>
            <Box sx={{ p: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography sx={{ p: 0.5, fontSize: 11, fontWeight: 700, color: "#5C2B1A" }}>
                Final BRE
              </Typography>
              {showRefreshButton && (
                <CustomButton
                  aria-label="Refresh BRE"
                  size="small"
                  variant="outlined"
                  onClick={handleRefresh}
                  sx={{ minWidth: 30, width: 30, height: 30, p: 0, borderRadius: "6px", borderColor: "#A92129", color: "#A92129", backgroundColor: "#FFFFFF" }}
                >
                  <RefreshIcon />
                </CustomButton>
              )}
            </Box>
          </Box>
          {breComparisonRows.map((row) => (
            <Box
              key={row.label}
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(120px, 0.85fr) minmax(0, 1fr) minmax(0, 1fr)",
                borderBottom: "1px solid #E3E7EB",
                "&:last-child": { borderBottom: 0 },
              }}
            >
              <Typography sx={{ p: 1, fontSize: 11, fontWeight: 700, color: "#25313C", backgroundColor: "#F7F9FA" }}>
                {row.label}
              </Typography>
              <Box sx={{ p: 1, minWidth: 0, fontSize: 11, color: "#46515B", overflowWrap: "anywhere" }}>
                {row.renderInitial ? row.renderInitial() : row.initial}
              </Box>
              <Box sx={{ p: 1, minWidth: 0, fontSize: 11, color: "#46515B", overflowWrap: "anywhere" }}>
                {row.renderFinal ? row.renderFinal() : row.final}
              </Box>
            </Box>
          ))}
        </Box>
      </CustomAccordion>

      <CustomDialog
        open={bredialogOpen}
        showCloseIcon
        onClose={() =>
          setBreDialogOpen(false)
        }
        title="BRE Retriggered"
      >
        <Typography
          sx={{
            fontSize: "14px",
            color: "#161616",
          }}
        >
          You have exhausted the BRE
          retrigger limit. Kindly refer this
          ticket to the IT Team.
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2,
          }}
        >
          <CustomButton
            onClick={referToIT}
            sx={{
              borderRadius: "50px",
              px: "40px",
            }}
          >
            Refer to IT
          </CustomButton>
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default BreDecision;