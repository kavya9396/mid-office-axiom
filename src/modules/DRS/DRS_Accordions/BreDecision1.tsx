import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { title } from "../../../utils/constant";
import { useAppSelector } from "../../../store/hooks";
import Badge from "../../../components/ui/Badge/Badge";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import CustomButton from "../../../components/ui/Button/Button";
import { RefreshIcon } from "../../../icons/Icons";
import { Box, Typography } from "@mui/material";
import { breThunk } from "../../../store/thunks/breThunk";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { useAppContext } from "../../../hooks/useAppContext";
import { useState } from "react";
import type { BreResponse } from "../../../types/drs.types";
import { formatDate } from "../../../utils/dataFormat";

type BRERow = {
  bre?: string;
  initialBre?: string;
  finalBre?: string;
}

const BreDecision1 = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { applicationNumber, businessType } = useAppContext();
  const drsData = useAppSelector((state) => state.drs);
  const breDecisionData = drsData?.data?.breDecision;
  const isinitialBreSuccess =
    breDecisionData
      ? true
      : false;
  const [breResponse, setBreResponse] = useState<BreResponse | null>(null);
  const finalBreData = useAppSelector((state) => state.bre);
  const finalBreDecisionData =
    breResponse?.data ?? finalBreData?.data?.data;

  const finalBreStatus = finalBreDecisionData?.breOutput?.decisionTypes?.breDecision;
  const isfinalBreSuccess =
    finalBreStatus
      ? true
      : false;
  const eventName = businessType == 'retail' ? 'BRE-RETAIL' : 'BRE_GROUP';
  const handleRefresh = async () => {
    const response = await dispatch(
      breThunk({
        eventName: eventName,
        applicationNumber: applicationNumber
      }),
    ).unwrap();
    setBreResponse(response);
  }

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
        if (row.bre === "BRE Discrepancy") {
          return renderDiscrepancy(value, row.finalBre);
        }

        if (row.bre === "BRE Decision") {
          return renderDifference(value, row.finalBre);
        }

        return value;
      },
    },
    {
      key: "finalBre",
      header: "Final BRE",
      render: (value, row) => {
        if (row.bre === "BRE Discrepancy") {
          return renderDiscrepancy(value, row.initialBre);
        }

        if (row.bre === "BRE Decision") {
          return renderDifference(value, row.initialBre);
        }

        return value;
      },
      headerRender: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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

          <CustomButton
            size="small"
            variant="outlined"
            sx={{
              minWidth: "auto",
              p: 0.5,
              width: 24,
              height: 24,
            }}
            onClick={handleRefresh}
          >
            <RefreshIcon />
          </CustomButton>
        </Box>
      ),
    },
  ];

  const breTableData: BRERow[] = [
    {
      bre: "BRE Status",
      initialBre: isinitialBreSuccess ? "Success" : "Failure",
      finalBre: isfinalBreSuccess ? "Success" : "Failure",
    },
    {
      bre: "BRE Decision",
      initialBre: breDecisionData?.decision ?? "",
      finalBre:
        finalBreDecisionData?.breOutput?.decisionTypes?.breDecision ?? "",
    },
    {
      bre: "BRE Remarks",
      initialBre: breDecisionData?.remarks ?? "",
      finalBre:
        finalBreDecisionData?.breOutput?.breRemarks ?? "",
    },
    {
      bre: "BRE Discrepancy",
      initialBre: breDecisionData?.discrepancy ?? "",
      finalBre:
        finalBreDecisionData?.breOutput?.decisionTypes?.breRequirement ?? "",
    },

    {
      bre: "BRE Timestamp",
      initialBre: formatDate(breDecisionData?.timestamp) ?? "",
      finalBre:
        formatDate(finalBreDecisionData?.breOutput?.systemDecisionDateTime) ?? "",
    },
  ];

  const renderDiscrepancy = (
    value?: string,
    compareValue?: string
  ) => {
    const codes = value?.trim().split(/\s+/) ?? [];
    const compareCodes = new Set(
      compareValue?.trim().split(/\s+/) ?? []
    );

    return (
      <Box
        sx={{
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        }}
      >
        {codes.map((code) => {
          const isUpdated = !compareCodes.has(code);

          return (
            <Box
              key={code}
              component="span"
              sx={{
                backgroundColor: isUpdated ? "#FFF59D" : "transparent",
              }}
            >
              #{code}
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderDifference = (
    value?: string,
    compareValue?: string
  ) => {
    const isDifferent = value !== compareValue;

    return (
      <Box
        component="span"
        sx={{
          backgroundColor: isDifferent ? "#FFF59D" : "transparent",
          px: isDifferent ? "2px" : 0,
        }}
      >
        {value}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      <CustomAccordion title={title.breDecision} chip={<Badge label={finalBreStatus ?? ""} variant="Low" />} defaultExpanded>
        <CustomTable title={""} columns={breColumns} data={breTableData} />
      </CustomAccordion>
    </Box>
  )
}
export default BreDecision1;