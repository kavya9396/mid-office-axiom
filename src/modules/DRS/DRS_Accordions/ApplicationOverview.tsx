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

  const applicationOverview = (data as unknown as Record<string, unknown> | null)?.applicationOverview as
    | Record<string, unknown>
    | undefined;

  const sourcingDetail = (applicationOverview?.sourcingDetail as Record<string, unknown> | undefined)
    ?? (data?.sourcingDetail as unknown as Record<string, unknown> | undefined);
  const groupDetails = (applicationOverview?.groupDetails as Record<string, unknown> | undefined)
    ?? (data?.groupDetails as unknown as Record<string, unknown> | undefined);

  const productDetails = Array.isArray(applicationOverview?.productDetail)
    ? (applicationOverview.productDetail as Array<Record<string, unknown>>)
    : ((data?.productDetail as unknown as Array<Record<string, unknown>> | undefined) ?? []);
  const firstProduct = productDetails[0];

  const riderDetails = Array.isArray(applicationOverview?.riderDetails)
    ? (applicationOverview.riderDetails as Array<Record<string, unknown>>)
    : ((data?.riderDetails as unknown as Array<Record<string, unknown>> | undefined) ?? []);

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
      value: String(firstProduct?.name ?? "-"),
    },
    {
      label: "Product Code",
      value: String(firstProduct?.code ?? "-")
    },
    {
      label: "Sum Assured",
      value: formatNumberOrDash(firstProduct?.sumAssured),
    },
    {
      label: "Channel",
      value: String(sourcingDetail?.channelCode ?? "-"),
    },
    {
      label: "Sub Channel",
      value: String(sourcingDetail?.drcChannelCode ?? sourcingDetail?.subChannelCode ?? "-"),
    },
    {
      label: "Agent Code",
      value: String(sourcingDetail?.agentCode ?? "-"),
    },
    {
      label: "Agent Name",
      value: String(sourcingDetail?.agentName ?? "-"),
    },
    {
      label: "Customer Type",
      value: String(data?.applicationInfo?.proposerType ?? "-"),
    },
    {
      label: "Policy Type",
      value: String(groupDetails?.coverageStatus ?? "-"),
    },
    {
      label: "Modal Premium",
      value: formatNumberOrDash(firstProduct?.paymentAmount),
    },
    {
      label: "PT",
      value: toDisplayValue(firstProduct?.term),
    },
    {
      label: "PPT",
      value: toDisplayValue(firstProduct?.premiumCessationTerm ?? firstProduct?.premiumPaymentTerm),
    },
    {
      label: "Payment Mode",
      value: String(firstProduct?.premiumModeFpd ?? "-"),
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
