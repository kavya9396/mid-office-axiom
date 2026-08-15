import { Box, Button } from "@mui/material";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { useAppSelector } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import type { AdditionalRequirementRow } from "../../../types/drs.types";
import { title } from "../../../utils/constant";
import RequirementManagementTable from "./RequirementManagementTable";

interface RequirementManagementProps {
  requirements?: AdditionalRequirementRow[];
}

interface DrsRequirementData {
  requirementManagement?: AdditionalRequirementRow[];
}

const RequirementManagement = ({
  requirements,
}: RequirementManagementProps) => {
  const drsData = useAppSelector(
    (state: RootState) => state.drs.data,
  ) as DrsRequirementData | undefined;

  /*
   * Explicitly passed requirements get priority.
   * Otherwise, rows are taken from the DRS API response.
   */
  const requirementRows =
    requirements ??
    drsData?.requirementManagement ??
    [];

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
                  // roleType === "CVT_TASK" ? (
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      sx={{
                        minWidth: "20px",
                        height: "25px",
                        px: 3,
                        border: "1px solid #A92129",
                        borderRadius: "22px",
                        borderColor: "#A92129",
                        backgroundColor: "#FFFFFF",
                        color: "#A92129",
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: 1,
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: "#A92129",
                          backgroundColor: "#FFF5F5",
                          boxShadow: "none",
                        },
                      }}
                    >
                      Add
                    </Button>
                  // ) : null
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
          />
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default RequirementManagement;