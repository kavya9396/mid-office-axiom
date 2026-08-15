import { Box, Button } from "@mui/material";

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
import { useLocation } from "react-router-dom";

interface RequirementManagementProps {
  requirements?: AdditionalRequirementRow[];
  onAddRequirement?: () => void;
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
interface ApplicationRow {
  applicationNo?: string;
  businessType?: string;
  roleType?: string;
  userId?: string;
  [key: string]: unknown;
}
const RequirementManagement = ({
  requirements,
  onAddRequirement,
}: RequirementManagementProps) => {
   const location = useLocation();
  const dispatch = useAppDispatch();
 const application = location.state?.application as
    | ApplicationRow
    | undefined;
  const drsData = useAppSelector(
    (state: RootState) => state.drs.data,
  ) as DrsRequirementData | undefined;

  const roleType = normalizeText(
    localStorage.getItem("roleType") || drsData?.roleType,
  ).toUpperCase();

  const requirementRows =
    requirements ?? drsData?.requirementManagement ?? [];

  const isEditable = ![
    "AMR_MEDICAL_TASK",
    "AMR_NON_MEDICAL_TASK",
    "RECONSIDERATION_TASK",
  ].includes(roleType);

  const handleSaveRequirements = async (
    updatedRows: AdditionalRequirementRow[],
  ): Promise<void> => {
    if (!drsData) {
      throw new Error("DRS data is unavailable. Please reopen the case.");
    }

    const applicationNo =application?.applicationNo;
    console.log('applicationNo',applicationNo)
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
      applicationNo
    };
console.log('updatedDrsPayload',updatedDrsPayload)
    await dispatch(updateDrsThunk(updatedDrsPayload)).unwrap();
  };

  return (
    <Box
      sx={{
        p: 1,
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <CustomAccordion
        title={title.requirementManagement}
        defaultExpanded
        headerActions={
          isEditable ? (
            <Button
              type="button"
              variant="outlined"
              onClick={(event) => {
                event.stopPropagation();
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
            onSave={handleSaveRequirements}
          />
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default RequirementManagement;