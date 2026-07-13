import { Box, Container } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import type { AdditionalRequirementRow } from "../../../types/drs.types";
import RequirementManagementTable from "./RequirementManagementTable";
import { OPEN_REQUIREMENT_MANAGEMENT_EVENT } from "./requirementManagementEvents";

interface RequirementManagementProps {
  requirements?: AdditionalRequirementRow[];
}

const RequirementManagement = ({ requirements }: RequirementManagementProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleOpenRequirementManagement = () => {
      setExpanded(true);
      window.requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    window.addEventListener(OPEN_REQUIREMENT_MANAGEMENT_EVENT, handleOpenRequirementManagement);

    return () => {
      window.removeEventListener(OPEN_REQUIREMENT_MANAGEMENT_EVENT, handleOpenRequirementManagement);
    };
  }, []);

  return (
    <Container disableGutters>
      <Box ref={containerRef} sx={{ mt: 2 }}>
        <CustomAccordion
          title="Requirement Management"
          expanded={expanded}
          onChange={setExpanded}
        >
          <RequirementManagementTable requirements={requirements} />
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default RequirementManagement;
