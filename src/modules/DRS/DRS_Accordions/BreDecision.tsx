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
import type { BreResponse } from "../../../types/drs.types";
import { title } from "../../../utils/constant";
import { formatDate } from "../../../utils/dataFormat";

type BRERow = {
  bre?: string;
  initialBre?: string;
  finalBre?: string;
};

const BreDecision = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { applicationNumber, businessType } = useAppContext();
  const roleType =
    localStorage.getItem("roleType") ?? "";

  const drsData = useAppSelector(
    (state) => state.drs,
  );

  /*
   * This Redux state is populated when breThunk is
   * dispatched from the main DRS page.
   */
  const finalBreData = useAppSelector(
    (state) => state.bre,
  );

  /*
   * Initial BRE response received from the DRS API.
   */
  const breDecisionData =
    drsData?.data?.breDecision;

  /*
   * Latest BRE response received from the DRS API.
   * This is used until the BRE API response is available.
   */
  const latestBreDecisionData =
    drsData?.data?.latestBreDecision;

  /*
   * This state is used only when the user manually
   * clicks the refresh button.
   */
  const [breResponse, setBreResponse] =
    useState<BreResponse | null>(null);

  const [bredialogOpen, setBreDialogOpen] =
    useState(false);

  /*
   * Response priority:
   *
   * 1. Manual refresh BRE response
   * 2. Redux BRE response loaded from the DRS page
   * 3. latestBreDecision from the DRS response
   */
  const finalBreDecisionData =
    breResponse?.data ??
    finalBreData?.data?.data;

  const hasBreApiResponse = Boolean(
    finalBreDecisionData?.breOutput,
  );

  const storageBusinessType = (
    businessType ||
    localStorage.getItem("businessType") ||
    ""
  ).toLowerCase();

  const eventName =
    storageBusinessType === "retail"
      ? "BRE-RETAIL"
      : "BRE-GROUP";

  const handleRefresh = async () => {
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
        }),
      ).unwrap();

      setBreResponse(response);
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
   * Redux is automatically updated after the DRS page
   * dispatches breThunk, causing this component to render
   * with the latest BRE API values.
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

  const renderDiscrepancy = (
    value?: string,
    compareValue?: string,
  ) => {
    const codes =
      value
        ?.trim()
        .split(/\s+/)
        .filter(Boolean) ?? [];

    const compareCodes = new Set(
      compareValue
        ?.trim()
        .split(/\s+/)
        .filter(Boolean) ?? [],
    );

    return (
      <Box
        sx={{
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        }}
      >
        {codes.map((code, index) => {
          const isUpdated =
            !compareCodes.has(code);

          return (
            <Box
              key={`${code}-${index}`}
              component="span"
              sx={{
                backgroundColor: isUpdated
                  ? "#FFF59D"
                  : "transparent",
              }}
            >
              #{code}{" "}
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
            ? "#FFF59D"
            : "transparent",
          px: isDifferent ? "2px" : 0,
        }}
      >
        {value}
      </Box>
    );
  };

  const showRefreshButton =
    roleType !== "AMR_MEDICAL_TASK" &&
    roleType !== "AMR_NON_MEDICAL_TASK";

  const breColumns: Column<BRERow>[] = [
    {
      key: "bre",
      header: "BRE",
      width: "8%",
    },
    {
      key: "initialBre",
      header: "Initial BRE",
      render: (value, row) => {
        if (
          row.bre === "BRE Discrepancy"
        ) {
          return renderDiscrepancy(
            value,
            row.finalBre,
          );
        }

        if (row.bre === "BRE Decision") {
          return renderDifference(
            value,
            row.finalBre,
          );
        }

        return value;
      },
    },
    {
      key: "finalBre",
      header: "Final BRE",
      render: (value, row) => {
        if (
          row.bre === "BRE Discrepancy"
        ) {
          return renderDiscrepancy(
            value,
            row.initialBre,
          );
        }

        if (row.bre === "BRE Decision") {
          return renderDifference(
            value,
            row.initialBre,
          );
        }

        return value;
      },
      headerRender: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Final BRE
          </Typography>

          {showRefreshButton && (
            <CustomButton
              size="small"
              variant="outlined"
              sx={{
                minWidth: "auto",
                width: 24,
                height: 24,
                p: 0.5,
              }}
              onClick={handleRefresh}
            >
              <RefreshIcon />
            </CustomButton>
          )}
        </Box>
      ),
    },
  ];

  const breTableData: BRERow[] = [
    {
      bre: "BRE Status",
      initialBre: isInitialBreSuccess
        ? "Success"
        : "Failure",
      finalBre: isFinalBreSuccess
        ? "Success"
        : "Failure",
    },
    {
      bre: "BRE Decision",
      initialBre:
        breDecisionData?.decision ?? "",
      finalBre: finalBreDecision,
    },
    {
      bre: "BRE Remarks",
      initialBre:
        breDecisionData?.remarks ?? "",
      finalBre: finalBreRemarks,
    },
    {
      bre: "BRE Discrepancy",
      initialBre:
        breDecisionData?.discrepancy ?? "",
      finalBre: finalBreDiscrepancy,
    },
    {
      bre: "BRE Timestamp",
      initialBre:
        formatDate(
          breDecisionData?.timestamp,
        ) ?? "",
      finalBre:
        formatDate(finalBreTimestamp) ?? "",
    },
  ];

  const referToIT = () => {
    setBreDialogOpen(false);
    navigate(getInboxPath());
  };

  return (
    <Box>
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
        <CustomTable
          title=""
          columns={breColumns}
          data={breTableData}
        />
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