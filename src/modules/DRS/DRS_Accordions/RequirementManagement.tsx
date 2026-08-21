import { Box, Button } from "@mui/material";
import { useState } from "react";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import {
  updateDrsThunk,
  type DRSUpdateRequest,
} from "../../../store/thunks/drsThunk";
import type { AdditionalRequirementRow } from "../../../types/drs.types";
import { title } from "../../../utils/constant";
import RequirementManagementTable from "./RequirementManagementTable";

interface RequirementManagementProps {
  requirements?: AdditionalRequirementRow[];
  onAddRequirement?: () => void;
  readOnly?: boolean;
}

type DrsRequirementData = DRSUpdateRequest & {
  applicationNo?: string;
  applicationNumber?: string;
  requirementManagement?: AdditionalRequirementRow[];
  roleType?: string;
  userId?: string;
};

const normalizeText = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value).trim();

const RequirementManagement = ({
  requirements,
  onAddRequirement,
  readOnly = false,
}: RequirementManagementProps) => {
  const dispatch = useAppDispatch();
  const [addRowSignal, setAddRowSignal] = useState(0);

  const drsData = useAppSelector(
    (state: RootState) => state.drs.data,
  ) as DrsRequirementData | undefined;

  const searchData = useAppSelector(
    (state: RootState) =>
      state.searchApplication.response?.data,
  ) as DrsRequirementData | null | undefined;

   /*
   * In Search Application, always use search response.
   * Otherwise, use DRS data and fall back to search data.
   */
  const selectedData = readOnly
    ? searchData
    : drsData ?? searchData;

  const roleType = normalizeText(
    selectedData?.roleType ||
      localStorage.getItem("roleType"),
  ).toUpperCase();

  const requirementRows =
    requirements ??
    selectedData?.requirementManagement ??
    [];

  console.log("requirement rows", requirementRows)

  const isEditable = ![
    "AMR_MEDICAL_TASK",
    "AMR_NON_MEDICAL_TASK",
    "RECONSIDERATION_TASK",
    "ACUITY_TASK"
  ].includes(roleType);

  const handleSaveRequirements = async (
    updatedRows: AdditionalRequirementRow[],
  ): Promise<void> => {
     if (readOnly) {
      return;
    }

    if (!drsData) {
      throw new Error("DRS data is unavailable. Please reopen the case.");
    }

    const applicationNo = normalizeText(
      drsData.applicationNo ||
      drsData.applicationNumber ||
      localStorage.getItem("applicationNumber") ||
      localStorage.getItem("applicationNo"),
    );

    const userId = normalizeText(
      localStorage.getItem("userId") || drsData.userId,
    );

    if (!applicationNo) {
      throw new Error("Application number is unavailable.");
    }

    if (!userId) {
      throw new Error("User ID is unavailable.");
    }

    if (!roleType) {
      throw new Error("Role type is unavailable.");
    }

    /*
     * state.drs.data is already the inner DRS object from the API response.
     * Send the complete object and replace only requirementManagement with
     * the latest rows from the table.
     */
    const updatedDrsPayload: DrsRequirementData = {
      ...drsData,
      requirementManagement: updatedRows,
      roleType,
      userId,
    };

    await dispatch(updateDrsThunk(updatedDrsPayload)).unwrap();
  };

  return (
    <Box sx={{ px: 1}}>
      <CustomAccordion
        title={title.requirementManagement}
        defaultExpanded
        headerActions={
          isEditable && !readOnly ? (
            <Button
              type="button"
              variant="outlined"
              onClick={(event) => {
                event.stopPropagation();
                setAddRowSignal((currentSignal) => currentSignal + 1);
                onAddRequirement?.();
              }}
              sx={{
                minWidth: 20,
                height: 25,
                px: 3,
                border: "1px solid #A92129",
                borderRadius: "22px",
                bgcolor: "#FFFFFF",
                color: "#A92129",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: 1,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#A92129",
                  bgcolor: "#FFF5F5",
                  boxShadow: "none",
                },
              }}
            >
              Add
            </Button>
          ) : null
        }
      >
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <RequirementManagementTable
            requirements={requirementRows}
            onSave={
              readOnly
                ? undefined
                : handleSaveRequirements
            }
            addRowSignal={
              readOnly ? 0 : addRowSignal
            }
            readOnly={readOnly}
          />
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default RequirementManagement;