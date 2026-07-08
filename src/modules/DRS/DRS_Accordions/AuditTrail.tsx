import { Box, Container } from "@mui/material";
import type { Column } from "../../../components/ui/Table/Table";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable from "../../../components/ui/Table/Table";
import type { AuditTrailRow, AuditTrail } from "../../../types/drs.types";
import type { RootState } from "../../../store/store";
import { useSelector } from "react-redux";

const auditTrailColumns: Column<AuditTrailRow>[] = [
  { key: "dateTime", header: "Date/Time", width: "12%" },
  { key: "fromPool", header: "From Pool", width: "12%" },
  { key: "fromPoolUser", header: "From Pool User", width: "12%" },
  { key: "toPool", header: "To Pool", width: "12%" },
  { key: "toPoolUser", header: "To Pool User", width: "12%" },
  { key: "subPool", header: "Sub Pool", width: "10%" },
  { key: "userId", header: "User ID", width: "10%" },
  { key: "uwDecision", header: "UW Decision", width: "10%" },
  { key: "breDecision", header: "BRE Decision", width: "10%" },
  { key: "remarks", header: "BRE Remarks", width: "10%" },
  { key: "userRemarks", header: "User Remarks", width: "10%" },
];

interface AuditTrailProps {
  auditTrail?: AuditTrail;
}

const AuditTrailAccordion = ({ auditTrail }: AuditTrailProps) => {
  const reduxAuditTrail = useSelector((state: RootState) => {
    const drsData = state.drs.data as unknown as Record<string, unknown> | null;
    const quickLinks = (drsData?.quickLinks as Record<string, unknown> | undefined) ?? undefined;
    const value = quickLinks?.auditTrail ?? drsData?.auditTrail;
    return Array.isArray(value) ? (value as AuditTrail) : [];
  });

  const finalAuditTrail = auditTrail ?? reduxAuditTrail ?? [];

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Audit Trail">
          <CustomTable<AuditTrailRow>
            title="Audit Trail"
            columns={auditTrailColumns}
            data={finalAuditTrail}
          />
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default AuditTrailAccordion;
