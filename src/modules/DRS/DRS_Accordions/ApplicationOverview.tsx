import { Box, Container } from "@mui/material";
import type { Column } from "../../../components/ui/Table/Table";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable from "../../../components/ui/Table/Table";
import { GridSection } from "../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { RiderRow } from "../../../types/drs.types";
import { toDisplayValue } from "../../../utils/helpers";

const riderColumns: Column<RiderRow>[] = [
  { key: "name", header: "Name", width: "30%" },
  { key: "type", header: "Option", width: "20%" },
  { key: "term", header: "PT", width: "5%" },
  { key: "sumAssured", header: "Sum Assured", width: "15%" },
  { key: "paymentAmount", header: "Modal Premium", width: "15%" },
  { key: "ppt", header: "PPT", width: "10%" },
];

const formatNumberOrDash = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("en-IN") : "-";
};

const ApplicationOverview = () => {
  const { data } = useSelector((state: RootState) => state.drs);

  const firstProduct = data?.productDetail?.[0];
  const riderDetails = data?.riderDetails ?? [];

  const roleType = localStorage.getItem("roleType") ?? "";
  const expandedRoles = [
    'Ready For Issuance Pool',
    'System Wait Pool - Non medical',
    'AMR - Non medical',
    'CPT Pool'
  ];

  const isExpanded = expandedRoles.includes(roleType);

  const applicationDetails = [
    {
      label: "Product Name",
      value: firstProduct?.name ?? "-",
    },
    {
      label: "Product Code",
      value: firstProduct?.code ?? "-"
    },
    {
      label: "Sum Assured",
      value: formatNumberOrDash(firstProduct?.sumAssured),
    },
    {
      label: "Channel",
      value: data?.sourcingDetail?.channelCode ?? "-",
    },
    {
      label: "Sub Channel",
      value: data?.sourcingDetail?.drcChannelCode ?? "-",
    },
    {
      label: "Agent Code",
      value: data?.sourcingDetail?.agentCode ?? "-",
    },
    {
      label: "Agent Name",
      value: "-",
    },
    {
      label: "Customer Type",
      value: data?.applicationInfo?.proposerType ?? "-",
    },
    {
      label: "Policy Type",
      value: data?.groupDetails?.coverageStatus ?? "-",
    },
    {
      label: "Modal Premium",
      value: formatNumberOrDash(firstProduct?.paymentAmount),
    },
    {
      label: "PT",
      value: toDisplayValue(firstProduct?.PT),
    },
    {
      label: "PPT",
      value: toDisplayValue(firstProduct?.PPT),
    },
    {
      label: "Payment Mode",
      value: firstProduct?.premiumModeFpd ?? "-",
    },
  ];

  const riderRows: RiderRow[] =
    riderDetails.map((rider) => ({
      name: toDisplayValue(rider.name ?? rider.riderName),
      type: toDisplayValue(rider.type ?? rider.option),
      term: formatNumberOrDash(rider.term ?? rider.policyTerm),
      sumAssured: formatNumberOrDash(rider.sumAssured),
      paymentAmount: formatNumberOrDash(rider.paymentAmount ?? rider.modalPremium),
      ppt: formatNumberOrDash(rider.ppt ?? rider.premiumPaymentTerm),
    })) ?? [];

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        {/* <CustomAccordion title="Application Overview" defaultExpanded={userRole ==='CPT'?true:false}> */}
        <CustomAccordion title="Application Overview" defaultExpanded={isExpanded}>
          <Box sx={{ p: 2, backgroundColor: "#f6f6f6", borderRadius: "8px" }}>
            <GridSection columns={6} items={applicationDetails} />
          </Box>
          {riderRows.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <CustomTable<RiderRow>
                title="Rider Details"
                columns={riderColumns}
                data={riderRows}
              />
            </Box>
          )}
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default ApplicationOverview;
