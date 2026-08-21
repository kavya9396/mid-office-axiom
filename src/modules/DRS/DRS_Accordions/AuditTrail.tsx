import { Box } from "@mui/material";
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
  readOnly?: boolean;
}

const toRecord = (
  value: unknown,
): Record<string, unknown> =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getAuditTrail = (
  source: unknown,
): AuditTrail => {
  const root = toRecord(source);
  const quickLinks = toRecord(root.quickLinks);

  const value =
    quickLinks.auditTrail ??
    root.auditTrail;

  return Array.isArray(value)
    ? (value as AuditTrail)
    : [];
};

const AuditTrailAccordion = ({
  auditTrail,
  readOnly = false,
}: AuditTrailProps) => {
  const reduxAuditTrail = useSelector(
    (state: RootState): AuditTrail => {
      const drsAuditTrail =
        getAuditTrail(state.drs.data);

      const searchAuditTrail =
        getAuditTrail(
          state.searchApplication.response?.data,
        );

      /*
       * Search mode must prioritize the current search
       * response instead of possibly stale DRS data.
       */
      if (readOnly) {
        return searchAuditTrail;
      }

      return drsAuditTrail.length > 0
        ? drsAuditTrail
        : searchAuditTrail;
    },
  );

  const finalAuditTrail = auditTrail ?? reduxAuditTrail;

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion title="Audit Trail" defaultExpanded>
        <CustomTable<AuditTrailRow>
          title="Audit Trail"
          columns={auditTrailColumns}
          data={finalAuditTrail}
        />
      </CustomAccordion>
    </Box>
  );
};

export default AuditTrailAccordion;
