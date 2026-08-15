import { Box, Container, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { title } from "../../../utils/constant";
import { useAppSelector } from "../../../store/hooks";
import Badge from "../../../components/ui/Badge/Badge";
import CustomTable, {
  type Column,
} from "../../../components/ui/Table/Table";
import CustomButton from "../../../components/ui/Button/Button";
import { RefreshIcon } from "../../../icons/Icons";
import { breThunk } from "../../../store/thunks/breThunk";
import type { AppDispatch } from "../../../store/store";
import { useAppContext } from "../../../hooks/useAppContext";
import type { BreResponse } from "../../../types/drs.types";
import { formatDate } from "../../../utils/dataFormat";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import { getInboxPath } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";

type BRERow = {
  bre?: string;
  initialBre?: string;
  finalBre?: string;
};

const BreDecision = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { applicationNumber, businessType } = useAppContext();
  const roleType = localStorage.getItem("roleType");
  console.log('roleType', roleType)

  const drsData = useAppSelector((state) => state.drs);
  const finalBreData = useAppSelector((state) => state.bre);

  // Initial BRE response
  const breDecisionData = drsData?.data?.breDecision;

  const isInitialBreSuccess = !!breDecisionData;

  // Latest BRE decision from DRS.
  // This should be displayed initially in Final BRE.
  const latestBreDecisionData = drsData?.data?.latestBreDecision;

  // Local API response.
  // Once refresh API is called successfully, this becomes the source
  // for Final BRE.
  const [breResponse, setBreResponse] = useState<BreResponse | null>(null);
  const [isBreApiCalled, setIsBreApiCalled] = useState(false);
  const [bredialogOpen, setBreDialogOpen] = useState(false);

  /**
   * Final BRE API data
   *
   * Before refresh:
   *   latestBreDecisionData is used.
   *
   * After refresh:
   *   breResponse / Redux BRE response is used.
   */
  const finalBreDecisionData = isBreApiCalled
    ? breResponse?.data ?? finalBreData?.data?.data
    : null;

  const storageBusiness =
    businessType || localStorage.getItem("businessType");

  const eventName =
    storageBusiness === "retail" ? "BRE-RETAIL" : "BRE-GROUP";

  /**
   * Refresh BRE API
   */
  const handleRefresh = async () => {
    const count = latestBreDecisionData?.reTriggerCount || 0;
    if (count > 3) {
      console.log('Refer to IT');
      setBreDialogOpen(true);

    } else {
      try {
        const response = await dispatch(
          breThunk({
            eventName,
            applicationNumber,
          })
        ).unwrap();

        setBreResponse(response);
        setIsBreApiCalled(true);
      } catch (error) {
        console.error("BRE API failed:", error);
      }
    }

  };

  /**
   * Final BRE values
   *
   * Initially -> latestBreDecisionData
   * After API -> BRE API response
   */
  const finalBreDecision = isBreApiCalled
    ? finalBreDecisionData?.breOutput?.decisionTypes?.breDecision ?? ""
    : latestBreDecisionData?.decision ?? "";

  const finalBreRemarks = isBreApiCalled
    ? finalBreDecisionData?.breOutput?.breRemarks ?? ""
    : latestBreDecisionData?.remarks ?? "";

  const finalBreDiscrepancy = isBreApiCalled
    ? finalBreDecisionData?.breOutput?.decisionTypes?.breRequirement ?? ""
    : latestBreDecisionData?.discrepancy ?? "";

  const finalBreTimestamp = isBreApiCalled
    ? finalBreDecisionData?.breOutput?.systemDecisionDateTime
    : latestBreDecisionData?.timestamp;

  /**
   * Final BRE status
   */
  const finalBreStatus = isBreApiCalled
    ? finalBreDecision
    : latestBreDecisionData?.decision ?? "";

  const isFinalBreSuccess = !!finalBreStatus;

  /**
   * Highlight discrepancy values which are different
   */
  const renderDiscrepancy = (
    value?: string,
    compareValue?: string
  ) => {
    const codes = value?.trim().split(/\s+/).filter(Boolean) ?? [];

    const compareCodes = new Set(
      compareValue?.trim().split(/\s+/).filter(Boolean) ?? []
    );

    return (
      <Box
        sx={{
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        }}
      >
        {codes.map((code, index) => {
          const isUpdated = !compareCodes.has(code);

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

  /**
   * Highlight changed decision values
   */
  const renderDifference = (
    value?: string,
    compareValue?: string
  ) => {
    const isDifferent = value !== compareValue;

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

  /**
   * BRE table columns
   */
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
          {(roleType !== "AMR_MEDICAL_TASK" && roleType !== "AMR_NON_MEDICAL_TASK") && (
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
          )}
        </Box>
      ),
    },
  ];

  /**
   * BRE table data
   */
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
      initialBre: breDecisionData?.decision ?? "",
      finalBre: finalBreDecision,
    },
    {
      bre: "BRE Remarks",
      initialBre: breDecisionData?.remarks ?? "",
      finalBre: finalBreRemarks,
    },
    {
      bre: "BRE Discrepancy",
      initialBre: breDecisionData?.discrepancy ?? "",
      finalBre: finalBreDiscrepancy,
    },
    {
      bre: "BRE Timestamp",
      initialBre: formatDate(breDecisionData?.timestamp) ?? "",
      finalBre: formatDate(finalBreTimestamp) ?? "",
    },
  ];
  const referToIT = () => {
    navigate(getInboxPath())
  }
  return (
    <Container disableGutters>
      <CustomAccordion
        title={title.breDecision}
        chip={
          <Badge
            label={finalBreStatus ?? ""}
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
      <CustomDialog open={bredialogOpen}
        showCloseIcon={true}
        onClose={() => setBreDialogOpen(false)} title={"BRE Retriggered"}><Typography
          sx={{
            fontSize: "14px",
            color: "#161616",
          }}
        >
          You have exhausted the retriggered of BRE. Kindly refer this ticket
          to IT Team.
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2,
          }}
        ><CustomButton
          onClick={() => referToIT()}
          sx={{
            borderRadius: "50px", paddingX: "40px", justifyContent: "center",
          }}
        >
            Refer to IT
          </CustomButton>
        </Box>
      </CustomDialog>
    </Container>
  );
};

export default BreDecision;