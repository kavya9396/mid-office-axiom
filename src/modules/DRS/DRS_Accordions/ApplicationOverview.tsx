import { Box, Container } from "@mui/material";
import type { Column } from "../../../components/ui/Table/Table";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable from "../../../components/ui/Table/Table";
import { GridSection } from "../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { RiderRow } from "../../../types/drs.types";

const riderColumns: Column<RiderRow>[] = [
  { key: "riderName", header: "Name", width: "30%" },
  { key: "riderOption", header: "Option", width: "20%" },
  { key: "riderPT", header: "PT", width: "5%" },
  { key: "riderSumAssured", header: "Sum Assured", width: "15%" },
  { key: "riderModalPremium", header: "Modal Premium", width: "15%" },
  { key: "riderPPT", header: "PPT", width: "10%" },
];

const ApplicationOverview = () => {
  const { applicationOverview, riderDetails } = useSelector((state: RootState) => state.drs);

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
      value: applicationOverview?.product?.name ?? "-",
    },
    {
      label: "Product Code",
      value: applicationOverview?.product?.productCode ?? "-"
    },
    {
      label: "Face Value",
      value: applicationOverview?.product?.faceValue ?? "-"
    },
    {
      label: "Sum Assured",
      value: applicationOverview?.product?.sumAssured?.toLocaleString("en-IN") ?? "-",
    },
    {
      label: "Channel",
      value: applicationOverview?.distribution?.channel ?? "-",
    },
    {
      label: "Sub Channel",
      value: applicationOverview?.distribution?.subChannel ?? "-",
    },
    {
      label: "Agent Code",
      value: applicationOverview?.agent?.agentCode ?? "-",
    },
    {
      label: "Agent Name",
      value: applicationOverview?.agent?.agentName ?? "-",
    },
    {
      label: "Customer Type",
      value: applicationOverview?.customer?.customerType ?? "-",
    },
    {
      label: "Policy Type",
      value: applicationOverview?.customer?.policyType ?? "-",
    },
    {
      label: "Modal Premium",
      value:
        applicationOverview?.policyDetails?.modalPremium?.toLocaleString(
          "en-IN"
        ) ?? "-",
    },
    {
      label: "PT",
      value: applicationOverview?.policyDetails?.policyTerm ?? "-",
    },
    {
      label: "PPT",
      value:
        applicationOverview?.policyDetails?.premiumPaymentTerm ?? "-",
    },
    {
      label: "Payment Mode",
      value: applicationOverview?.policyDetails?.paymentMode ?? "-",
    },
  ];

  const riderRows: RiderRow[] =
    riderDetails?.map((rider) => ({
      riderName: rider.riderName,
      riderOption: rider.option,
      riderPT: rider.policyTerm,
      riderSumAssured: rider.sumAssured,
      riderModalPremium: rider.modalPremium,
      riderPPT: rider.premiumPaymentTerm,
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
