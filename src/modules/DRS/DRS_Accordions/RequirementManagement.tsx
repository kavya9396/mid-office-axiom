import { Box, Container } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import type { AdditionalRequirementRow } from "../../../types/drs.types";
import RequirementManagementTable from "./RequirementManagementTable";

interface RequirementManagementProps {
  requirements?: AdditionalRequirementRow[];
}

const RequirementManagement = ({ requirements }: RequirementManagementProps) => {
  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Requirement Management">
          <RequirementManagementTable requirements={requirements} />
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default RequirementManagement;
