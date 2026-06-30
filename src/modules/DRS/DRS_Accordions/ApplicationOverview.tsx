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
  { key: "riderName", header: "Name", width: "30%" },
  { key: "riderOption", header: "Option", width: "20%" },
  { key: "riderPT", header: "PT", width: "5%" },
  { key: "riderSumAssured", header: "Sum Assured", width: "15%" },
  { key: "riderModalPremium", header: "Modal Premium", width: "15%" },
  { key: "riderPPT", header: "PPT", width: "10%" },
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
  const riderProducts = (data?.productDetail ?? []).filter(
    (product) => String(product.type ?? "").toLowerCase() !== "base"
  );

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
    riderProducts.map((rider) => ({
      riderName: String(rider.name ?? "-"),
      riderOption: String(rider.type ?? "-"),
      riderPT: Number(rider.term ?? 0),
      riderSumAssured: Number(rider.sumAssured ?? 0),
      riderModalPremium: Number(rider.paymentAmount ?? 0),
      riderPPT: Number(rider.premiumCessationTerm ?? 0),
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
